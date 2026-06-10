import os
import io
import json
import hashlib
from typing import List, Dict, Any, AsyncGenerator
import pypdf
import docx
from anthropic import AsyncAnthropic

# Initialize Async Anthropic Client
anthropic_key = os.getenv("ANTHROPIC_API_KEY", "")
# Default to mock/fallback if no key is present to prevent startup failure
client = AsyncAnthropic(api_key=anthropic_key) if anthropic_key else None

def parse_pdf(file_bytes: bytes) -> str:
    pdf_file = io.BytesIO(file_bytes)
    reader = pypdf.PdfReader(pdf_file)
    text = ""
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"
    return text

def parse_docx(file_bytes: bytes) -> str:
    docx_file = io.BytesIO(file_bytes)
    doc = docx.Document(docx_file)
    text = ""
    for para in doc.paragraphs:
        text += para.text + "\n"
    return text

# Define the Resume Analysis Tool Schema
RESUME_TOOL = {
    "name": "analyze_resume",
    "description": "Analyze the student's resume text and extract scores, section ratings, keywords, and recommendations.",
    "input_schema": {
        "type": "object",
        "properties": {
            "ats_score": {"type": "integer", "description": "ATS compatibility score from 0 to 100"},
            "overall_score": {"type": "integer", "description": "Overall resume score from 0 to 100"},
            "keyword_match_score": {"type": "integer", "description": "Keyword match score from 0 to 100 based on standard target role"},
            "sections": {
                "type": "object",
                "properties": {
                    "contact": {"type": "object", "properties": {"score": {"type": "integer"}, "feedback": {"type": "string"}}, "required": ["score", "feedback"]},
                    "summary": {"type": "object", "properties": {"score": {"type": "integer"}, "feedback": {"type": "string"}}, "required": ["score", "feedback"]},
                    "experience": {"type": "object", "properties": {"score": {"type": "integer"}, "feedback": {"type": "string"}}, "required": ["score", "feedback"]},
                    "skills": {"type": "object", "properties": {"score": {"type": "integer"}, "feedback": {"type": "string"}}, "required": ["score", "feedback"]},
                    "education": {"type": "object", "properties": {"score": {"type": "integer"}, "feedback": {"type": "string"}}, "required": ["score", "feedback"]},
                    "projects": {"type": "object", "properties": {"score": {"type": "integer"}, "feedback": {"type": "string"}}, "required": ["score", "feedback"]}
                },
                "required": ["contact", "summary", "experience", "skills", "education", "projects"]
            },
            "keywords_present": {"type": "array", "items": {"type": "string"}, "description": "Important relevant industry keywords found in the resume"},
            "keywords_missing": {"type": "array", "items": {"type": "string"}, "description": "Important target role keywords missing in the resume"},
            "improvements": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "priority": {"type": "string", "enum": ["critical", "high", "medium", "low"]},
                        "text": {"type": "string", "description": "Actionable, brutally honest advice"}
                    },
                    "required": ["priority", "text"]
                }
            }
        },
        "required": ["ats_score", "overall_score", "keyword_match_score", "sections", "keywords_present", "keywords_missing", "improvements"]
    }
}

# Define the Roadmap Generation Tool Schema
ROADMAP_TOOL = {
    "name": "generate_roadmap",
    "description": "Generate a week-by-week learning roadmap for a student to address skill gaps.",
    "input_schema": {
        "type": "object",
        "properties": {
            "weeks": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "week": {"type": "string", "description": "e.g., 'Week 1', 'Week 2'"},
                        "title": {"type": "string", "description": "Focus topic of the week"},
                        "description": {"type": "string", "description": "Detailed explanation of what to learn"},
                        "skills": {"type": "array", "items": {"type": "string"}},
                        "resources": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "type": {"type": "string", "enum": ["youtube", "docs", "course", "article"]},
                                    "title": {"type": "string"},
                                    "url": {"type": "string"},
                                    "duration": {"type": "string", "description": "e.g., '2h', 'Self-paced'"}
                                },
                                "required": ["type", "title", "url", "duration"]
                            }
                        },
                        "project": {"type": "string", "description": "Actionable project to practice this week's skills"},
                        "xp": {"type": "integer", "description": "XP reward for completing this week (e.g. 100, 150)"}
                    },
                    "required": ["week", "title", "description", "skills", "resources", "project", "xp"]
                }
            },
            "total_xp": {"type": "integer"}
        },
        "required": ["weeks", "total_xp"]
    }
}

async def analyze_resume_llm(resume_text: str, target_role: str = "SDE-1") -> Dict[str, Any]:
    """Calls Claude to analyze resume text using structured tool calling."""
    if not client:
        return get_mock_resume_analysis(target_role)

    system_prompt = (
        "You are a Senior Technical Recruiter and ATS parser. Analyze the user's resume text "
        f"for a target role of '{target_role}'. Be extremely thorough, objective, and constructive. "
        "Highlight exactly where they excel and where they fall short. "
        "Invoke the analyze_resume tool with your structured feedback."
    )

    try:
        response = await client.beta.prompt_caching.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=4000,
            system=[
                {
                    "type": "text",
                    "text": system_prompt,
                    "cache_control": {"type": "ephemeral"} # Prompt Caching for system instructions
                }
            ],
            messages=[
                {"role": "user", "content": f"Here is my resume:\n\n{resume_text}"}
            ],
            tools=[RESUME_TOOL],
            tool_choice={"type": "tool", "name": "analyze_resume"}
        )

        for content_block in response.content:
            if content_block.type == "tool_use" and content_block.name == "analyze_resume":
                return content_block.input

        raise Exception("Claude did not invoke the resume analysis tool.")
    except Exception as e:
        print(f"Anthropic API Error: {e}")
        # Fallback to mock data on error so application doesn't hard-crash
        return get_mock_resume_analysis(target_role)

async def generate_roadmap_llm(target_role: str, missing_skills: List[str]) -> Dict[str, Any]:
    """Calls Claude to generate a week-by-week learning roadmap."""
    if not client:
        return get_mock_roadmap(target_role)

    skills_str = ", ".join(missing_skills) if missing_skills else "General technical skills"
    system_prompt = (
        "You are an elite Engineering Mentor. Generate an interactive, highly personalized "
        f"8-week roadmap for a student aiming for a '{target_role}' role, who is currently missing these skills: {skills_str}. "
        "Each week must have clear focus, curated high-quality free learning resources (provide realistic documentation links like "
        "react.dev, developer.mozilla.org, and dummy YouTube links), a practical project, and XP points. "
        "Invoke the generate_roadmap tool with your structured roadmap."
    )

    try:
        response = await client.beta.prompt_caching.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=4000,
            system=[
                {
                    "type": "text",
                    "text": system_prompt,
                    "cache_control": {"type": "ephemeral"}
                }
            ],
            messages=[
                {"role": "user", "content": f"Generate my roadmap for target role '{target_role}'."}
            ],
            tools=[ROADMAP_TOOL],
            tool_choice={"type": "tool", "name": "generate_roadmap"}
        )

        for content_block in response.content:
            if content_block.type == "tool_use" and content_block.name == "generate_roadmap":
                return content_block.input

        raise Exception("Claude did not invoke the roadmap tool.")
    except Exception as e:
        print(f"Anthropic API Error: {e}")
        return get_mock_roadmap(target_role)

async def stream_interview_llm(messages: List[Dict[str, str]], target_role: str, question_index: int) -> AsyncGenerator[str, None]:
    """Streams token-by-token interview responses and provides a final answer score block."""
    if not client:
        # Mock streaming simulation
        mock_response = "Here is a mock response from the interviewer. It looks like you've done a solid job. Keep practice!"
        for char in mock_response:
            yield f"data: {json.dumps({'text': char})}\n\n"
            await asyncio.sleep(0.01)
        yield f"data: {json.dumps({'score': 75, 'feedback': 'Good job.', 'is_complete': question_index >= 4})}\n\n"
        return

    # Define the 5 standard questions based on role
    role_questions = {
        "SDE-1 at Amazon": [
            "Tell me about yourself and why you're interested in this SDE role.",
            "Can you explain the difference between SQL and NoSQL databases and when you'd use each?",
            "Walk me through how you'd design a URL shortener system like bit.ly.",
            "What's the time complexity of binary search, and can you implement it?",
            "Describe a challenging technical problem you solved. What was your approach?"
        ],
        "Frontend Engineer at Swiggy": [
            "Tell me about your experience with React and what makes a component reusable.",
            "How does the Virtual DOM work, and what are its benefits?",
            "What is the difference between useEffect and useLayoutEffect?",
            "How would you optimize a React app that's rendering slowly?",
            "Describe a complex UI feature you built. What were the challenges?"
        ],
        "Backend Developer at Razorpay": [
            "Tell me about yourself and your backend development experience.",
            "How would you design a rate limiting system for an API?",
            "Explain the CAP theorem and how it affects database design choices.",
            "What's the difference between synchronous and asynchronous programming?",
            "How would you handle database migrations in a production system?"
        ]
    }
    
    questions = role_questions.get(target_role, role_questions["SDE-1 at Amazon"])
    curr_q = questions[min(question_index, len(questions)-1)]
    next_q = questions[question_index + 1] if question_index < len(questions) - 1 else None

    # Create detailed system prompt instructions
    system_prompt = (
        f"You are a Senior Technical Recruiter conducting a live mock interview for a '{target_role}' position. "
        "The candidate is currently on question number " + str(question_index + 1) + " of 5.\n\n"
        "Here are the rules of the interview:\n"
        "1. Give constructive feedback on their latest answer. Highlight strengths, structure (e.g. STAR method), and technical gaps.\n"
        "2. If this is NOT the last question, present the next question clearly: '" + (next_q or "") + "'.\n"
        "3. If this IS the last question, thank them and state that the interview is complete.\n"
        "4. In your streamed response text, talk in first-person as a supportive yet professional interviewer.\n"
        "5. AT THE VERY END OF YOUR RESPONSE, output a separate, single line in this exact format to specify the score:\n"
        "###SCORE###{\"score\": <0-100>, \"feedback\": \"<1-sentence summary>\"}"
    )

    formatted_msgs = []
    for m in messages:
        # Map user/interviewer to user/assistant for Claude compatibility
        role = "assistant" if m["role"] == "interviewer" else "user"
        formatted_msgs.append({"role": role, "content": m["content"]})

    try:
        stream = await client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1500,
            system=[
                {
                    "type": "text",
                    "text": system_prompt,
                    "cache_control": {"type": "ephemeral"}
                }
            ],
            messages=formatted_msgs,
            stream=True
        )

        buffer = ""
        score_data_sent = False

        async for event in stream:
            if event.type == "content_block_delta" and event.delta.type == "text_delta":
                text = event.delta.text
                buffer += text
                
                # Check if we hit the score marker
                if "###SCORE###" in buffer:
                    parts = buffer.split("###SCORE###")
                    # Send text before marker
                    if parts[0]:
                        yield f"data: {json.dumps({'text': parts[0]})}\n\n"
                        # Clear that part from buffer
                        buffer = buffer[len(parts[0]):]
                    
                    # If we have the full JSON after marker
                    if len(parts) > 1 and "}" in parts[1]:
                        try:
                            score_str = parts[1].strip()
                            score_dict = json.loads(score_str)
                            yield f"data: {json.dumps({'score': score_dict['score'], 'feedback': score_dict['feedback'], 'is_complete': next_q is None})}\n\n"
                            score_data_sent = True
                            break
                        except Exception as e:
                            print(f"Error parsing score json: {e}")
                else:
                    yield f"data: {json.dumps({'text': text})}\n\n"
        
        # If stream finished but no score was sent, generate a default one
        if not score_data_sent:
            yield f"data: {json.dumps({'score': 75, 'feedback': 'Good technical attempt.', 'is_complete': next_q is None})}\n\n"
            
    except Exception as e:
        print(f"Streaming error: {e}")
        yield f"data: {json.dumps({'text': f'Recruiter connection lost: {e}'})}\n\n"
        yield f"data: {json.dumps({'score': 50, 'feedback': 'Error during analysis.', 'is_complete': next_q is None})}\n\n"

# ───────────────────────── Mock Fallbacks ─────────────────────────
def get_mock_resume_analysis(role: str) -> Dict[str, Any]:
    return {
        "ats_score": 75,
        "overall_score": 72,
        "keyword_match_score": 68,
        "sections": {
            "contact": {"score": 90, "feedback": "Contact info is clear and properly placed."},
            "summary": {"score": 50, "feedback": "Summary is too short. Add quantified achievements and target role skills."},
            "experience": {"score": 70, "feedback": "Clean timeline, but needs more strong verbs and numbers (STAR structure)."},
            "skills": {"score": 65, "feedback": "Missing critical libraries and tools for " + role},
            "education": {"score": 95, "feedback": "Strong education section with CGPA and coursework."},
            "projects": {"score": 60, "feedback": "Projects lack architectural descriptions and deployment details."}
        },
        "keywords_present": ["Python", "JavaScript", "React", "Node.js", "Git", "REST APIs"],
        "keywords_missing": ["TypeScript", "Docker", "Redis", "System Design", "CI/CD", "PostgreSQL"],
        "improvements": [
            {"priority": "critical", "text": "Rewrite experience items using the STAR method (e.g., 'Achieved X, as measured by Y, by doing Z')"},
            {"priority": "critical", "text": "Add TypeScript — highly requested for " + role + " roles"},
            {"priority": "high", "text": "Add live deployment links to your project sections"},
            {"priority": "medium", "text": "Write a 3-line professional summary highlighting SDE ambitions"}
        ]
    }

def get_mock_roadmap(role: str) -> Dict[str, Any]:
    return {
        "weeks": [
            {
                "week": "Week 1–2",
                "title": "TypeScript & Core UI Mastery",
                "description": "Learn TypeScript interfaces, generics, and compiler configurations. Align styles with CSS grid and tailwind components.",
                "skills": ["TypeScript", "Generics", "TailwindCSS"],
                "resources": [
                    {"type": "youtube", "title": "TypeScript Beginner to Pro", "url": "https://www.youtube.com/watch?v=dummy1", "duration": "4h"},
                    {"type": "docs", "title": "TS Config Guide", "url": "https://www.typescriptlang.org/docs/handbook/tsconfig-json.html", "duration": "1h"}
                ],
                "project": "Build a fully-typed weather dashboard with React & TypeScript",
                "xp": 100
            },
            {
                "week": "Week 3–4",
                "title": "Relational Databases & ORMs",
                "description": "Understand database schemas, migrations, indices, and connection pooling using PostgreSQL and Prisma.",
                "skills": ["PostgreSQL", "Prisma", "Database Migrations"],
                "resources": [
                    {"type": "docs", "title": "Prisma Schema Reference", "url": "https://www.prisma.io/docs", "duration": "2h"}
                ],
                "project": "Create a robust relational schema for an E-commerce inventory service",
                "xp": 150
            },
            {
                "week": "Week 5–6",
                "title": "Dockerizing Applications & Caching",
                "description": "Learn containerization with Dockerfiles, multi-service setups with Docker Compose, and caching strategies with Redis.",
                "skills": ["Docker", "docker-compose", "Redis"],
                "resources": [
                    {"type": "youtube", "title": "Docker Crash Course", "url": "https://www.youtube.com/watch?v=dummy2", "duration": "3h"}
                ],
                "project": "Dockerize a Next.js + FastAPI + Postgres + Redis application and connect them",
                "xp": 200
            },
            {
                "week": "Week 7–8",
                "title": "System Architecture & Mock Interviews",
                "description": "Prepare for core software engineering interviews, scalability, CAP theorem, load balancing, and rate limiting.",
                "skills": ["System Design", "Mock Interview", "Rate Limiting"],
                "resources": [
                    {"type": "docs", "title": "System Design Primer", "url": "https://github.com/donnemartin/system-design-primer", "duration": "Self-paced"}
                ],
                "project": "Design and document the end-to-end architecture of a high-throughput URL shortener",
                "xp": 250
            }
        ],
        "total_xp": 700
    }


# ───────────────────────── Phase 5: Quick Wins ─────────────────────────

REWRITE_TOOL = {
    "name": "rewrite_bullet_star",
    "description": "Rewrite a resume bullet point into the STAR format.",
    "input_schema": {
        "type": "object",
        "properties": {
            "star_bullet": {"type": "string", "description": "The rewritten bullet point incorporating Situation, Task, Action, and measurable Result."},
            "situation": {"type": "string", "description": "Brief description of the context/situation."},
            "task": {"type": "string", "description": "Brief description of the target task/challenge."},
            "action": {"type": "string", "description": "Brief description of the specific action taken."},
            "result": {"type": "string", "description": "Brief description of the quantified or qualitative result achieved."}
        },
        "required": ["star_bullet", "situation", "task", "action", "result"]
    }
}

JD_MATCH_TOOL = {
    "name": "jd_match",
    "description": "Parse a job description, identify overlap with user skills, calculate score, and perform gap analysis.",
    "input_schema": {
        "type": "object",
        "properties": {
            "match_score": {"type": "integer", "description": "Score from 0 to 100 indicating how well the user's skills match the JD."},
            "matching_skills": {"type": "array", "items": {"type": "string"}, "description": "Skills in user profile matching the JD."},
            "missing_skills": {"type": "array", "items": {"type": "string"}, "description": "Important skills required by the JD that the user lacks."},
            "gap_analysis": {"type": "string", "description": "A detailed 2-3 sentence analysis of the skill gap and advice on what to learn first."}
        },
        "required": ["match_score", "matching_skills", "missing_skills", "gap_analysis"]
    }
}

async def rewrite_bullet_star_llm(bullet: str) -> Dict[str, Any]:
    if not client:
        return {
            "star_bullet": "Led the development of a core feature to address user needs, executing key code modifications that improved user retention by 15% and cut processing latency by 30%.",
            "situation": "The team was experiencing high processing latency and dropping user retention.",
            "task": "Redesign and optimize the feature to increase efficiency and retention.",
            "action": f"Executed custom optimization strategies and refactored code: '{bullet}'",
            "result": "Improved user retention by 15% and cut processing latency by 30%."
        }

    system_prompt = (
        "You are an expert resume writer. Rewrite the user's resume bullet point using the STAR method. "
        "Create a compelling, professional bullet starting with a strong action verb, and make sure it has "
        "a quantified or strong qualitative result. Break down the Situation, Task, Action, and Result as well. "
        "Invoke the rewrite_bullet_star tool."
    )

    try:
        response = await client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1000,
            system=system_prompt,
            messages=[
                {"role": "user", "content": f"Bullet point to rewrite:\n\n{bullet}"}
            ],
            tools=[REWRITE_TOOL],
            tool_choice={"type": "tool", "name": "rewrite_bullet_star"}
        )
        for block in response.content:
            if block.type == "tool_use" and block.name == "rewrite_bullet_star":
                return block.input
        raise Exception("Claude did not use the rewrite bullet tool.")
    except Exception as e:
        print(f"Error in rewrite_bullet_star_llm: {e}")
        return {
            "star_bullet": "Refactored code and redesigned database queries, resulting in 25% faster load times and 10% lower memory usage.",
            "situation": "Slow database queries were causing high page-load times.",
            "task": "Optimize queries and database configuration.",
            "action": f"Analyzed query plans, added indices, and refactored code: '{bullet}'",
            "result": "Reduced page load times by 25% and memory footprint by 10%."
        }

async def generate_cover_letter_llm(company: str, role: str, tone: str, skills: List[str]) -> Dict[str, Any]:
    if not client:
        skills_str = ", ".join(skills) if skills else "software development"
        return {
            "cover_letter": (
                f"# Cover Letter for {role} at {company}\n\n"
                f"Dear Hiring Team,\n\n"
                f"I am writing to express my strong interest in the {role} position at {company}. "
                f"As a student passionate about software engineering, my background in {skills_str} makes me a great fit for this role.\n\n"
                f"I look forward to the possibility of discussing how my experience can benefit {company}.\n\n"
                f"Sincerely,\n[Your Name]"
            )
        }

    skills_str = ", ".join(skills) if skills else "Software Engineering skills"
    system_prompt = (
        f"You are a professional career coach. Write a compelling, highly personalized cover letter "
        f"for a candidate applying for the '{role}' role at '{company}'. "
        f"The candidate's core skills are: {skills_str}. "
        f"Write in a {tone} tone. Keep it structured, engaging, and professional."
    )

    try:
        response = await client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1500,
            system=system_prompt,
            messages=[
                {"role": "user", "content": "Write my cover letter."}
            ]
        )
        cover_letter_text = ""
        for block in response.content:
            if block.type == "text":
                cover_letter_text += block.text
        return {"cover_letter": cover_letter_text.strip()}
    except Exception as e:
        print(f"Error in generate_cover_letter_llm: {e}")
        return {
            "cover_letter": (
                f"# Cover Letter for {role} at {company}\n\n"
                f"Dear Hiring Team at {company},\n\n"
                f"I am thrilled to apply for the {role} position. My skillset matches the requirements, including proficiency in {skills_str}.\n\n"
                f"Best regards,\n[Your Name]"
            )
        }

async def match_job_description_llm(jd_text: str, user_skills: List[str]) -> Dict[str, Any]:
    if not client:
        # Simple programmatic mockup matching
        jd_words = set(jd_text.lower().replace("\n", " ").split())
        matched = [s for s in user_skills if s.lower() in jd_words]
        # Generate some synthetic missing skills from common ones not present
        common_tech = ["TypeScript", "Docker", "Kubernetes", "AWS", "SQL", "Git", "React", "Python"]
        missing = [t for t in common_tech if t not in user_skills and t.lower() in jd_words]
        if not missing:
            missing = [t for t in common_tech if t not in user_skills][:3]
        
        match_percentage = int((len(matched) / max(len(matched) + len(missing), 1)) * 100)
        match_percentage = min(max(match_percentage, 40), 95)
        
        return {
            "match_score": match_percentage,
            "matching_skills": matched or user_skills[:3],
            "missing_skills": missing,
            "gap_analysis": f"Your profile has solid coverage for {', '.join(matched[:3]) if matched else 'basic engineering'}. However, the job description places high importance on {', '.join(missing[:2])}. Focus on building a small project using these missing technologies to close the gap."
        }

    system_prompt = (
        "You are an expert technical resume screening tool. Analyze the pasted Job Description and compare it "
        "against the candidate's list of skills. Calculate a match score (0-100), identify matching skills, "
        "identify missing skills that are core requirements of the job description, and provide a constructive gap analysis. "
        "Invoke the jd_match tool."
    )

    skills_str = ", ".join(user_skills) if user_skills else "No skills recorded"

    try:
        response = await client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1200,
            system=system_prompt,
            messages=[
                {"role": "user", "content": f"Candidate Skills:\n{skills_str}\n\nJob Description:\n{jd_text}"}
            ],
            tools=[JD_MATCH_TOOL],
            tool_choice={"type": "tool", "name": "jd_match"}
        )
        for block in response.content:
            if block.type == "tool_use" and block.name == "jd_match":
                return block.input
        raise Exception("Claude did not use the jd_match tool.")
    except Exception as e:
        print(f"Error in match_job_description_llm: {e}")
        return {
            "match_score": 65,
            "matching_skills": user_skills[:2],
            "missing_skills": ["TypeScript", "Docker"],
            "gap_analysis": "There is a moderate gap. The job description requires TypeScript and containerization, which are currently missing from your resume. We recommend upgrading your roadmap to include these topics."
        }

