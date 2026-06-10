from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import os
import json
import random
import asyncio
from datetime import datetime, timedelta

app = FastAPI(
    title="AI Career Copilot API",
    description="Backend powering the Moonshot AI Career Copilot for college students.",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ──────────────────────── Models ────────────────────────

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    university: Optional[str] = None
    graduation_year: Optional[int] = None
    target_role: Optional[str] = "SDE-1"

class ResumeAnalysisResult(BaseModel):
    ats_score: int
    overall_score: int
    keyword_match_score: int
    sections: dict
    keywords_present: List[str]
    keywords_missing: List[str]
    improvements: List[dict]

class RoadmapWeek(BaseModel):
    week: str
    title: str
    status: str
    priority: str
    description: str
    skills: List[str]
    resources: List[dict]
    project: str
    xp: int

class InterviewMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[InterviewMessage]
    target_role: str
    question_index: int

class MetricsResponse(BaseModel):
    dau: int
    resume_uploads: int
    interviews_completed: int
    avg_interview_score: float
    d1_retention: float
    d7_retention: float
    d30_retention: float


# ──────────────────────── Interview Questions DB ────────────────────────

INTERVIEW_QUESTIONS = {
    "SDE-1": [
        "Tell me about yourself and why you're interested in this SDE role.",
        "Can you explain the difference between SQL and NoSQL databases and when you'd use each?",
        "Walk me through how you'd design a URL shortener system like bit.ly.",
        "What's the time complexity of binary search, and can you implement it?",
        "Describe a challenging technical problem you solved. What was your approach?",
    ],
    "Frontend Engineer": [
        "Tell me about your experience with React and what makes a component reusable.",
        "How does the Virtual DOM work, and what are its benefits?",
        "What is the difference between useEffect and useLayoutEffect?",
        "How would you optimize a React app that's rendering slowly?",
        "Describe a complex UI feature you built. What were the challenges?",
    ],
    "Backend Developer": [
        "Tell me about yourself and your backend development experience.",
        "How would you design a rate limiting system for an API?",
        "Explain the CAP theorem and how it affects database design choices.",
        "What's the difference between synchronous and asynchronous programming?",
        "How would you handle database migrations in a production system?",
    ],
}

ANSWER_FEEDBACK = [
    {
        "feedback": "Good answer! Structure: current situation → past experiences → why this role. Quantify your technical wins.",
        "score": 72,
    },
    {
        "feedback": "Solid technical depth. Mention specific use cases: PostgreSQL for transactions, MongoDB for flexible schema, Redis for cache.",
        "score": 78,
    },
    {
        "feedback": "Good system design thinking! For scale: mention Redis cache-aside, CDN, DB sharding, and collision handling.",
        "score": 65,
    },
    {
        "feedback": "Correct complexity identification. Always discuss time/space trade-offs explicitly in interviews.",
        "score": 70,
    },
    {
        "feedback": "Excellent STAR format usage! Quantify impact — '40% faster' is stronger than 'significantly improved'.",
        "score": 82,
    },
]


# ──────────────────────── Routes ────────────────────────

@app.get("/")
async def root():
    return {
        "message": "AI Career Copilot API",
        "version": "1.0.0",
        "docs": "/docs",
        "layers": {
            "1": "Product Thinking - User Research Data",
            "3": "Engineering - FastAPI + PostgreSQL + Redis",
            "4": "AI - Resume Analysis + RAG + Interview Simulation",
            "5": "Metrics - DAU, Retention, Funnel Analytics",
            "6": "Scale - Load Balancer Ready, Stateless Nodes",
        },
    }


@app.get("/health")
async def health():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}


# Layer 3 — User Auth (simplified without DB for demo)
@app.post("/api/users/register")
async def register_user(user: UserCreate):
    return {
        "id": "user_" + str(random.randint(10000, 99999)),
        "name": user.name,
        "email": user.email,
        "target_role": user.target_role,
        "created_at": datetime.utcnow().isoformat(),
        "message": "User registered successfully",
    }


# Layer 4 — AI Resume Analysis
@app.post("/api/resume/analyze")
async def analyze_resume(file: UploadFile = File(...)):
    """
    Accepts a resume PDF/DOCX and returns AI analysis.
    In production: parse with PyMuPDF/docx2txt → LLM structured extraction → scoring.
    """
    # Simulate processing time
    await asyncio.sleep(2)

    # Simulated analysis result (production: use OpenAI Instructor + structured output)
    result = {
        "filename": file.filename,
        "ats_score": random.randint(65, 82),
        "overall_score": random.randint(60, 78),
        "keyword_match_score": random.randint(55, 72),
        "sections": {
            "contact": {"score": 95, "feedback": "Contact information is complete and professional."},
            "summary": {"score": 60, "feedback": "Summary is vague. Add quantified achievements and target role keywords."},
            "experience": {"score": 72, "feedback": "Good structure, but missing impact metrics. Use numbers."},
            "skills": {"score": 65, "feedback": "Missing: TypeScript, Docker, System Design, Redis."},
            "education": {"score": 90, "feedback": "Well-structured with CGPA and relevant coursework."},
            "projects": {"score": 55, "feedback": "Projects lack depth. Add GitHub links, tech stack, and measurable impact."},
        },
        "keywords_present": ["React", "JavaScript", "Python", "Node.js", "MongoDB", "Git", "REST API"],
        "keywords_missing": ["TypeScript", "Docker", "Kubernetes", "System Design", "Redis", "GraphQL", "CI/CD"],
        "improvements": [
            {"priority": "critical", "text": "Add quantified impact to all experience bullets"},
            {"priority": "critical", "text": "Include TypeScript — 89% of SDE postings require it"},
            {"priority": "high", "text": "Add a portfolio/GitHub link prominently"},
            {"priority": "high", "text": "Expand project descriptions with architecture decisions"},
            {"priority": "medium", "text": "Add a 3-line professional summary targeting SDE roles"},
        ],
        "analyzed_at": datetime.utcnow().isoformat(),
        "model": "gpt-4o-mini (simulated)",
    }
    return result


# Layer 4 — AI Roadmap Generation
@app.get("/api/roadmap/{user_id}")
async def get_roadmap(user_id: str, target_role: str = "SDE-1"):
    """
    Returns a personalized skill roadmap.
    Production: RAG pipeline → skill gap from vector DB → LLM roadmap generation.
    """
    weeks = [
        {"week": "Week 1–2", "title": "TypeScript Fundamentals", "status": "completed", "priority": "critical", "xp": 150,
         "description": "Master TypeScript — types, interfaces, generics, and decorators.",
         "skills": ["Types & Interfaces", "Generics", "Decorators", "tsconfig"],
         "resources": [{"type": "youtube", "title": "TypeScript Full Course", "duration": "4h"}],
         "project": "Build a typed REST API with Express + TypeScript"},
        {"week": "Week 3–4", "title": "System Design Basics", "status": "in-progress", "priority": "critical", "xp": 200,
         "description": "Learn scalability, load balancers, databases, caching.",
         "skills": ["Load Balancing", "CAP Theorem", "Database Sharding"],
         "resources": [{"type": "youtube", "title": "System Design Primer", "duration": "8h"}],
         "project": "Design a Twitter-like feed system"},
        {"week": "Week 5–6", "title": "Docker & Containerization", "status": "locked", "priority": "high", "xp": 180,
         "description": "Containerize applications with Docker and K8s basics.",
         "skills": ["Dockerfile", "docker-compose", "Kubernetes Basics"],
         "resources": [{"type": "youtube", "title": "Docker Mastery", "duration": "6h"}],
         "project": "Deploy a full-stack app with Docker Compose"},
    ]
    return {"user_id": user_id, "target_role": target_role, "weeks": weeks, "total_xp": 530}


# Layer 4 — AI Mock Interview
@app.post("/api/interview/respond")
async def interview_respond(request: ChatRequest):
    """
    AI interview response engine.
    Production: Stateful conversation with GPT-4, tailored to job description.
    """
    await asyncio.sleep(1.5)  # Simulate LLM latency

    role_questions = INTERVIEW_QUESTIONS.get(request.target_role, INTERVIEW_QUESTIONS["SDE-1"])
    idx = min(request.question_index, len(role_questions) - 1)
    feedback_data = ANSWER_FEEDBACK[idx % len(ANSWER_FEEDBACK)]

    is_last = request.question_index >= len(role_questions) - 1
    next_q = f"\n\nLet's continue. Here's your next question:\n\n{role_questions[idx + 1]}" if not is_last else "\n\n🎉 Interview complete! Check your detailed performance report."

    return {
        "response": f"{feedback_data['feedback']}{next_q}",
        "score": feedback_data["score"],
        "question_index": request.question_index + 1,
        "is_complete": is_last,
        "model": "gpt-4o (simulated)",
    }


# Layer 4 — Job Matching via RAG
@app.get("/api/jobs/match/{user_id}")
async def match_jobs(user_id: str):
    """
    RAG-powered job matching.
    Production: embed user profile → cosine similarity against job vector DB → top-k results.
    """
    jobs = [
        {"title": "SDE-1", "company": "Amazon", "match_score": 87, "missing_skills": ["System Design"], "location": "Bangalore"},
        {"title": "Frontend Engineer", "company": "Swiggy", "match_score": 82, "missing_skills": ["TypeScript", "GraphQL"], "location": "Bangalore"},
        {"title": "Backend Developer", "company": "Razorpay", "match_score": 79, "missing_skills": ["Docker", "Redis"], "location": "Bangalore"},
        {"title": "Full Stack Developer", "company": "CRED", "match_score": 74, "missing_skills": ["CI/CD", "K8s"], "location": "Bangalore"},
    ]
    return {"user_id": user_id, "matched_jobs": jobs, "method": "vector_similarity_rag"}


# Layer 5 — Product Metrics
@app.get("/api/metrics/platform")
async def get_platform_metrics():
    """Returns simulated platform-level product metrics."""
    base_dau = 2847
    return {
        "dau": base_dau + random.randint(-50, 100),
        "mau": base_dau * 12,
        "resume_uploads_today": 1234 + random.randint(-20, 50),
        "interviews_completed_today": 867 + random.randint(-10, 30),
        "avg_interview_score": round(71.4 + random.uniform(-1, 2), 1),
        "d1_retention": 72.3,
        "d7_retention": 48.1,
        "d14_retention": 36.7,
        "d30_retention": 24.2,
        "activation_funnel": {
            "signups": 5000,
            "resume_upload": 3200,
            "roadmap_generated": 2400,
            "interview_started": 1600,
            "interview_completed": 980,
        },
    }


@app.get("/api/metrics/user/{user_id}")
async def get_user_metrics(user_id: str):
    """Returns personal progress metrics for a user."""
    return {
        "user_id": user_id,
        "skill_score": 68,
        "ats_score": 74,
        "avg_interview_score": 71,
        "roadmap_progress": 33,
        "placement_probability": 61,
        "streak_days": 12,
        "total_xp": 350,
        "interviews_completed": 4,
        "weeks_completed": 2,
    }
