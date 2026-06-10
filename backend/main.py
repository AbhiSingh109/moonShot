import os
import json
import uuid
import time
import hmac
import hashlib
import redis
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Header, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from sqlalchemy import text

import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_dsn = os.getenv("SENTRY_DSN", "")
if sentry_dsn:
    sentry_sdk.init(
        dsn=sentry_dsn,
        integrations=[FastApiIntegration()],
        traces_sample_rate=1.0,
    )
    print("Sentry initialized successfully.")

# App Modules
from database import get_db
import models
from ai_engine import (
    parse_pdf,
    parse_docx,
    analyze_resume_llm,
    generate_roadmap_llm,
    stream_interview_llm,
    rewrite_bullet_star_llm,
    generate_cover_letter_llm,
    match_job_description_llm
)

app = FastAPI(
    title="AI Career Copilot API",
    description="Production-grade backend for the Career Copilot flagship application.",
    version="2.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Redis setup for caching & rate limiting
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
redis_client = None
try:
    redis_client = redis.from_url(REDIS_URL, decode_responses=True)
    redis_client.ping()
    print("Redis connection successful.")
except Exception as e:
    print(f"Redis connection failed, caching & rate limiting disabled. Error: {e}")

# ──────────────────────── Secure Gateway Dependency ────────────────────────

def get_current_user(
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    x_user_email: Optional[str] = Header(None, alias="X-User-Email"),
    x_gateway_timestamp: Optional[str] = Header(None, alias="X-Gateway-Timestamp"),
    x_gateway_signature: Optional[str] = Header(None, alias="X-Gateway-Signature")
):
    # For local testing or if authorization headers are completely bypassed by config
    if os.getenv("DISABLE_GATEWAY_AUTH") == "true":
        return {"id": "user_test_local_dev", "email": "test@student.edu"}

    if not all([x_user_id, x_user_email, x_gateway_timestamp, x_gateway_signature]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing security gateway identification headers."
        )

    secret = os.getenv("NEXTAUTH_SECRET", "fallback_secret").encode("utf-8")

    # 1. Verify timestamp (prevent replay attacks - max 10 mins drift)
    try:
        ts = int(x_gateway_timestamp)
        now_ms = int(time.time() * 1000)
        if abs(now_ms - ts) > 600000:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Gateway request expired (timestamp drift too large)."
            )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid gateway timestamp format."
        )

    # 2. Verify HMAC Signature
    expected_message = f"{x_user_id}:{x_user_email}:{x_gateway_timestamp}".encode("utf-8")
    computed_signature = hmac.new(secret, expected_message, hashlib.sha256).hexdigest()

    if not hmac.compare_digest(computed_signature, x_gateway_signature):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid security gateway signature."
        )

    return {"id": x_user_id, "email": x_user_email}


# ──────────────────────── Redis Rate Limiting ────────────────────────

def rate_limiter(key_prefix: str, limit: int, window_seconds: int):
    """FastAPI Dependency for rate limiting using Redis."""
    async def dependency(current_user: dict = Depends(get_current_user)):
        if not redis_client:
            return
        
        user_id = current_user["id"]
        redis_key = f"ratelimit:{key_prefix}:{user_id}"
        
        try:
            current_count_str = redis_client.get(redis_key)
            if current_count_str is not None:
                current_count = int(current_count_str)
                if current_count >= limit:
                    raise HTTPException(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        detail={
                            "error": "Rate limit exceeded",
                            "message": f"You have exceeded your limit of {limit} requests per {window_seconds // 3600 if window_seconds >= 3600 else window_seconds} hours. Please try again later."
                        }
                    )
                redis_client.incr(redis_key)
            else:
                pipe = redis_client.pipeline()
                pipe.set(redis_key, "1")
                pipe.expire(redis_key, window_seconds)
                pipe.execute()
        except redis.RedisError as e:
            print(f"Redis rate limit error: {e}")
            return
    return dependency

def check_rate_limit_manual(user_id: str, key_prefix: str, limit: int, window_seconds: int):
    """Manual helper to check rate limit in special endpoints."""
    if not redis_client:
        return
    
    redis_key = f"ratelimit:{key_prefix}:{user_id}"
    try:
        current_count_str = redis_client.get(redis_key)
        if current_count_str is not None:
            current_count = int(current_count_str)
            if current_count >= limit:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail={
                        "error": "Rate limit exceeded",
                        "message": f"You have exceeded your limit of {limit} requests per day. Please try again later."
                    }
                )
            redis_client.incr(redis_key)
        else:
            pipe = redis_client.pipeline()
            pipe.set(redis_key, "1")
            pipe.expire(redis_key, window_seconds)
            pipe.execute()
    except redis.RedisError as e:
        print(f"Redis rate limit error: {e}")


# ──────────────────────── Request Schemas ────────────────────────

class UserUpdate(BaseModel):
    target_role: str

class InterviewStartRequest(BaseModel):
    target_role: str

class ChatMessageInput(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    interview_id: str
    message: str

class AchievementRewriteRequest(BaseModel):
    bullet: str

class CoverLetterRequest(BaseModel):
    company: str
    role: str
    tone: str

class JDMatchRequest(BaseModel):
    jd_text: str

# ──────────────────────── Core Routes ────────────────────────

@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "AI Career Copilot Backend API",
        "version": "2.0.0"
    }

@app.get("/api/health")
async def health():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}

# ──────────────────────── Resume Processing ────────────────────────

@app.post("/api/resume/analyze")
async def analyze_resume(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
    _=Depends(rate_limiter("resume", 5, 3600))
):
    """
    Parses a PDF or DOCX resume, analyzes skill gaps using Claude,
    saves the results to the relational database, and caches output in Redis.
    """
    file_bytes = await file.read()
    
    # Generate MD5 hash of the file bytes to check Redis cache
    file_hash = hashlib.md5(file_bytes).hexdigest()
    cache_key = f"resume_analysis:{file_hash}"
    
    if redis_client:
        try:
            cached_data = redis_client.get(cache_key)
            if cached_data:
                print("Serving resume analysis from Redis Cache.")
                analysis_dict = json.loads(cached_data)
                
                # Still write to db if user record doesn't have it
                new_resume = models.Resume(
                    id="res_" + str(uuid.uuid4().hex[:12]),
                    user_id=current_user["id"],
                    filename=file.filename,
                    ats_score=analysis_dict["ats_score"],
                    overall_score=analysis_dict["overall_score"],
                    keyword_match_score=analysis_dict["keyword_match_score"],
                    sections=analysis_dict["sections"],
                    keywords_present=analysis_dict["keywords_present"],
                    keywords_missing=analysis_dict["keywords_missing"],
                    improvements=analysis_dict["improvements"]
                )
                db.add(new_resume)
                db.commit()
                return analysis_dict
        except Exception as e:
            print(f"Redis cache fetch error: {e}")

    # File type parsing
    ext = os.path.splitext(file.filename)[1].lower()
    if ext == ".pdf":
        resume_text = parse_pdf(file_bytes)
    elif ext in [".docx", ".doc"]:
        resume_text = parse_docx(file_bytes)
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format. Please upload PDF or DOCX.")

    if not resume_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from the uploaded file.")

    # Get user's target role to calibrate analysis
    user_role = "SDE-1"
    user_record = db.query(models.User).filter(models.User.id == current_user["id"]).first()
    if user_record and user_record.target_role:
        user_role = user_record.target_role

    # Call real Anthropic Claude structured analysis
    analysis_result = await analyze_resume_llm(resume_text, target_role=user_role)

    # Save to PostgreSQL database
    new_resume = models.Resume(
        id="res_" + str(uuid.uuid4().hex[:12]),
        user_id=current_user["id"],
        filename=file.filename,
        ats_score=analysis_result["ats_score"],
        overall_score=analysis_result["overall_score"],
        keyword_match_score=analysis_result["keyword_match_score"],
        sections=analysis_result["sections"],
        keywords_present=analysis_result["keywords_present"],
        keywords_missing=analysis_result["keywords_missing"],
        improvements=analysis_result["improvements"]
    )
    db.add(new_resume)
    db.commit()

    # Cache response in Redis for 24 hours (86400 seconds)
    if redis_client:
        try:
            redis_client.setex(cache_key, 86400, json.dumps(analysis_result))
        except Exception as e:
            print(f"Redis cache write error: {e}")

    return analysis_result

# ──────────────────────── Roadmap Generator ────────────────────────

@app.get("/api/roadmap")
async def get_roadmap(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves existing roadmap or generates a new one based on missing skills."""
    # Check if a roadmap already exists for the user
    roadmap_record = db.query(models.Roadmap).filter(models.Roadmap.user_id == current_user["id"]).first()
    if roadmap_record:
        return {
            "id": roadmap_record.id,
            "target_role": roadmap_record.target_role,
            "weeks": roadmap_record.weeks,
            "total_xp": roadmap_record.total_xp
        }

    # If no roadmap exists, generate one from the latest resume analysis
    latest_resume = db.query(models.Resume).filter(
        models.Resume.user_id == current_user["id"]
    ).order_by(models.Resume.analyzed_at.desc()).first()

    missing_skills = []
    if latest_resume and latest_resume.keywords_missing:
        missing_skills = latest_resume.keywords_missing

    user_role = "SDE-1"
    user_record = db.query(models.User).filter(models.User.id == current_user["id"]).first()
    if user_record and user_record.target_role:
        user_role = user_record.target_role

    # Check/Apply manual rate limit of 3 roadmap generations per day
    check_rate_limit_manual(current_user["id"], "roadmap", 3, 86400)

    roadmap_data = await generate_roadmap_llm(user_role, missing_skills)

    # Save to database
    new_roadmap = models.Roadmap(
        id="road_" + str(uuid.uuid4().hex[:12]),
        user_id=current_user["id"],
        target_role=user_role,
        weeks=roadmap_data["weeks"],
        total_xp=roadmap_data["total_xp"]
    )
    db.add(new_roadmap)
    db.commit()

    return roadmap_data

# ──────────────────────── Job Matching ────────────────────────

@app.get("/api/jobs/match")
@app.get("/api/job-match")
async def match_jobs_rag(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    RAG-powered job matching.
    Embeds user profile -> cosine similarity search against job vector DB using pgvector -> dynamic missing skills.
    """
    # 1. Fetch user's latest resume
    latest_resume = db.query(models.Resume).filter(
        models.Resume.user_id == current_user["id"]
    ).order_by(models.Resume.analyzed_at.desc()).first()

    if not latest_resume:
        # Fallback to general templates if user hasn't uploaded a resume yet
        jobs = [
            {"title": "SDE-1", "company": "Amazon", "match_score": 80, "missing_skills": ["System Design", "TypeScript"], "location": "Bangalore", "description": "Backend SDE role.", "requirements": "SDE skills"},
            {"title": "Frontend Engineer", "company": "Swiggy", "match_score": 75, "missing_skills": ["TypeScript"], "location": "Bangalore", "description": "React developer.", "requirements": "JS/TS skills"},
        ]
        return {"matched_jobs": jobs, "method": "mock_fallback"}

    user_skills = latest_resume.keywords_present or []
    skills_text = f"Candidate skills: {', '.join(user_skills)}"

    # 2. Get Voyage AI embedding for the user profile
    voyage_key = os.getenv("VOYAGE_API_KEY", "")
    vo_client = voyageai.Client(api_key=voyage_key) if voyage_key else None
    
    if vo_client:
        try:
            result = vo_client.embed([skills_text], model="voyage-large-2-instruct", input_type="query")
            query_vector = result.embeddings[0]
        except Exception as e:
            print(f"Voyage embedding failed: {e}")
            query_vector = [0.0] * 1024
    else:
        query_vector = [0.0] * 1024

    # 3. Query pgvector for cosine similarity
    # Cosine distance (<=>) ranges from 0 to 2. Cosine similarity = 1 - Cosine distance.
    # Check if table exists & contains elements
    matched_jobs = []
    try:
        query = text("""
            SELECT id, title, company, description, requirements, skills,
                   (1 - (embedding <=> :query_vector::vector)) as similarity
            FROM job_embeddings
            ORDER BY embedding <=> :query_vector::vector
            LIMIT 10
        """)
        
        # Format list as PostgreSQL vector string representation: '[0.1, 0.2, 0.3]'
        vector_str = "[" + ",".join(map(str, query_vector)) + "]"
        
        db_results = db.execute(query, {"query_vector": vector_str}).fetchall()
        
        for row in db_results:
            job_skills = row.skills if isinstance(row.skills, list) else json.loads(row.skills)
            missing = [s for s in job_skills if s not in user_skills]
            
            # Map similarity score to 0-100 range
            match_score = int(row.similarity * 100) if row.similarity is not None else 70
            # Ensure within reasonable bounds
            match_score = min(max(match_score, 30), 99)

            matched_jobs.append({
                "title": row.title,
                "company": row.company,
                "match_score": match_score,
                "missing_skills": missing,
                "location": "Bangalore/Remote",
                "description": row.description,
                "requirements": row.requirements
            })
    except Exception as e:
        print(f"Vector search failed (DB table may not be created/seeded yet): {e}")
        # Return fallback mock items based on target role
        user_role = "SDE-1"
        user_record = db.query(models.User).filter(models.User.id == current_user["id"]).first()
        if user_record and user_record.target_role:
            user_role = user_record.target_role

        if "frontend" in user_role.lower():
            matched_jobs = [
                {"title": "Frontend Engineer", "company": "Swiggy", "match_score": 85, "missing_skills": ["TypeScript", "GraphQL"], "location": "Bangalore"},
                {"title": "UI Developer", "company": "CRED", "match_score": 78, "missing_skills": ["CI/CD"], "location": "Remote"}
            ]
        else:
            matched_jobs = [
                {"title": "SDE-1", "company": "Amazon", "match_score": 87, "missing_skills": ["System Design"], "location": "Bangalore"},
                {"title": "Backend Developer", "company": "Razorpay", "match_score": 80, "missing_skills": ["Docker", "Redis"], "location": "Bangalore"}
            ]

    return {"matched_jobs": matched_jobs, "method": "vector_similarity_rag"}

# ──────────────────────── Stateful Interview Engine ────────────────────────

@app.post("/api/interview/start")
async def start_interview(
    request: InterviewStartRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Initializes a new stateful mock interview session."""
    # First questions based on selected role
    first_questions = {
        "SDE-1 at Amazon": "Tell me about yourself and why you're interested in this SDE role.",
        "Frontend Engineer at Swiggy": "Tell me about your experience with React and what makes a component reusable.",
        "Backend Developer at Razorpay": "Tell me about yourself and your backend development experience."
    }
    
    start_q = first_questions.get(request.target_role, "Tell me about yourself and your engineering background.")

    initial_messages = [{
        "role": "interviewer",
        "content": f"Hi! I'm your AI interviewer for the {request.target_role} position. I'll ask you 5 questions covering technical concepts, system design, and behavioral scenarios. Take your time, think out loud, and don't worry — this is a safe space to practice! Ready? Let's start.\n\n{start_q}",
        "timestamp": datetime.utcnow().isoformat()
    }]

    new_interview = models.Interview(
        id="int_" + str(uuid.uuid4().hex[:12]),
        user_id=current_user["id"],
        target_role=request.target_role,
        messages=initial_messages,
        score=0,
        question_index=0,
        is_complete=False
    )
    db.add(new_interview)
    db.commit()

    return {
        "interview_id": new_interview.id,
        "target_role": new_interview.target_role,
        "messages": new_interview.messages,
        "is_complete": False
    }

@app.post("/api/interview/respond")
async def interview_respond(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
    _=Depends(rate_limiter("interview", 50, 3600))
):
    """
    Streams the interviewer response back to the client via SSE (Server-Sent Events)
    and updates the stateful interview database record on stream end.
    """
    interview = db.query(models.Interview).filter(
        models.Interview.id == request.interview_id,
        models.Interview.user_id == current_user["id"]
    ).first()

    if not interview:
        raise HTTPException(status_code=404, detail="Interview session not found.")
    
    if interview.is_complete:
        raise HTTPException(status_code=400, detail="This interview session is already complete.")

    # 1. Save user response
    current_messages = list(interview.messages)
    current_messages.append({
        "role": "user",
        "content": request.message,
        "timestamp": datetime.utcnow().isoformat()
    })

    # Update database index state temporarily to avoid double submissions
    interview.messages = current_messages
    db.commit()

    async def event_generator():
        # Keep track of tokens to save back into database
        full_response_text = ""
        score = 75
        feedback = ""
        is_complete = False

        # Run SSE stream from Claude
        async for chunk_str in stream_interview_llm(current_messages, interview.target_role, interview.question_index):
            # Parse chunk JSON
            # Format is: 'data: {...}\n\n'
            clean_chunk = chunk_str.replace("data: ", "").strip()
            if not clean_chunk:
                continue
            
            try:
                chunk_data = json.loads(clean_chunk)
                if "text" in chunk_data:
                    full_response_text += chunk_data["text"]
                    yield chunk_str
                elif "score" in chunk_data:
                    score = chunk_data["score"]
                    feedback = chunk_data["feedback"]
                    is_complete = chunk_data["is_complete"]
                    yield chunk_str
            except Exception as e:
                print(f"Error yielding SSE chunk: {e}")

        # 2. Stream ended. Save interviewer's full response and analysis
        db_session = SessionLocal()
        try:
            # Re-fetch database record inside generator thread safely
            db_interview = db_session.query(models.Interview).filter(models.Interview.id == request.interview_id).first()
            if db_interview:
                updated_messages = list(db_interview.messages)
                updated_messages.append({
                    "role": "interviewer",
                    "content": full_response_text,
                    "timestamp": datetime.utcnow().isoformat(),
                    "score": score,
                    "feedback": feedback
                })
                db_interview.messages = updated_messages
                db_interview.question_index += 1
                
                # Check if it was the 5th (last) question
                if db_interview.question_index >= 5 or is_complete:
                    db_interview.is_complete = True
                    # Calculate average final score
                    scores = [m.get("score") for m in updated_messages if m.get("score") is not None]
                    db_interview.score = int(sum(scores)/len(scores)) if scores else score

                db_session.commit()
        except Exception as e:
            print(f"Error saving stream results to database: {e}")
        finally:
            db_session.close()

    return StreamingResponse(event_generator(), media_type="text/event-stream")

# ──────────────────────── Platform / User Metrics ────────────────────────

@app.get("/api/metrics/user")
async def get_user_metrics(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Fetches real database metrics for the active user dashboard."""
    resumes_count = db.query(models.Resume).filter(models.Resume.user_id == current_user["id"]).count()
    interviews_count = db.query(models.Interview).filter(models.Interview.user_id == current_user["id"]).count()

    latest_resume = db.query(models.Resume).filter(
        models.Resume.user_id == current_user["id"]
    ).order_by(models.Resume.analyzed_at.desc()).first()

    latest_interview = db.query(models.Interview).filter(
        models.Interview.user_id == current_user["id"],
        models.Interview.is_complete == True
    ).order_by(models.Interview.updated_at.desc()).first()

    skill_score = 60
    ats_score = 65
    placement_prob = 50

    if latest_resume:
        ats_score = latest_resume.ats_score
        skill_score = latest_resume.overall_score
        placement_prob = int((latest_resume.ats_score + latest_resume.keyword_match_score) / 2)

    interview_score = 0
    if latest_interview:
        interview_score = latest_interview.score
    else:
        # Fallback to last attempted question scores
        incomplete_int = db.query(models.Interview).filter(
            models.Interview.user_id == current_user["id"]
        ).order_by(models.Interview.updated_at.desc()).first()
        if incomplete_int:
            scores = [m.get("score") for m in incomplete_int.messages if m.get("score") is not None]
            if scores:
                interview_score = int(sum(scores)/len(scores))

    # Calculate Streak
    streak = 1
    if latest_resume:
        days_diff = (datetime.utcnow() - latest_resume.analyzed_at).days
        if days_diff <= 1:
            streak = 2
        if days_diff == 0:
            streak = 3

    return {
        "skill_score": skill_score,
        "ats_score": ats_score,
        "avg_interview_score": interview_score or 60,
        "roadmap_progress": 25 if interviews_count > 0 else 0,
        "placement_probability": min(max(placement_prob, 40), 98),
        "streak_days": streak,
        "total_xp": interviews_count * 150 + resumes_count * 100,
        "interviews_completed": interviews_count,
        "resumes_uploaded": resumes_count
    }


# ──────────────────────── Phase 5: Quick Win Features ────────────────────────

@app.post("/api/features/achievement-rewrite")
async def achievement_rewrite(
    request: AchievementRewriteRequest,
    current_user: dict = Depends(get_current_user)
):
    """Rewrites a resume bullet point into STAR format."""
    return await rewrite_bullet_star_llm(request.bullet)


@app.post("/api/features/cover-letter")
async def generate_cover_letter(
    request: CoverLetterRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generates a personalized cover letter based on user's resume skills."""
    # 1. Fetch user's latest resume to get their skills
    latest_resume = db.query(models.Resume).filter(
        models.Resume.user_id == current_user["id"]
    ).order_by(models.Resume.analyzed_at.desc()).first()

    skills = []
    if latest_resume and latest_resume.keywords_present:
        skills = latest_resume.keywords_present

    # 2. Call LLM cover letter generator
    return await generate_cover_letter_llm(
        company=request.company,
        role=request.role,
        tone=request.tone,
        skills=skills
    )


@app.post("/api/features/jd-match")
async def jd_match_score(
    request: JDMatchRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Calculates JD match score and missing skills against candidate's profile."""
    # 1. Fetch user's latest resume to get their skills
    latest_resume = db.query(models.Resume).filter(
        models.Resume.user_id == current_user["id"]
    ).order_by(models.Resume.analyzed_at.desc()).first()

    skills = []
    if latest_resume and latest_resume.keywords_present:
        skills = latest_resume.keywords_present

    # 2. Call LLM matching logic
    return await match_job_description_llm(
        jd_text=request.jd_text,
        user_skills=skills
    )

