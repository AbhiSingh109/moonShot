# Layer 4: AI Architecture

## Resume Analysis Pipeline

```
User uploads PDF/DOCX
        ↓
Document Parser (PyMuPDF / docx2txt)
        ↓
LLM Extraction (GPT-4 + Instructor)
- Skills, Experience, Education
- Structured JSON output
        ↓
ATS Scoring Engine
- Keyword density analysis
- Section completeness check
- Format & readability score
        ↓
Vector Similarity (Qdrant)
- Embed extracted skills
- Compare vs. target role job embeddings
- Compute skill gap distance
        ↓
Report Generation (LLM)
- Prioritized improvement list
- Section-by-section feedback
```

## RAG Job Matching Architecture

```
Job Description Ingestion (Offline):
  - Scrape/import 10,000+ job descriptions
  - Chunk and embed (text-embedding-3-small)
  - Store in Qdrant vector DB with metadata

User Query (Real-time):
  - Extract user profile embedding
  - Cosine similarity search (top-k=20)
  - Rerank by experience match
  - Return job matches with gap analysis
```

## Mock Interview Simulation

```
User selects target role
        ↓
System Prompt Construction:
  - Role: "You are a senior engineer interviewing for [role]"
  - User profile context injection
  - Question bank selection (5 questions)
        ↓
Stateful Conversation:
  - GPT-4 as interviewer
  - Structured scoring rubric per answer
  - Real-time feedback generation
        ↓
Post-Interview Report:
  - Score per question
  - Dimensional analysis (communication, depth, structure)
  - Improvement suggestions
```

## Skill Roadmap Generation

```
Skill Gap (from Resume Analysis)
        ↓
LLM Prompt:
  "Generate a week-by-week roadmap to fill these gaps:
   [gap_list] targeting [role] in [timeline] weeks."
        ↓
Structured Output (Instructor):
  - Week number
  - Skill focus
  - Free + paid resources
  - Project challenge
  - XP reward
        ↓
Stored in PostgreSQL → served via API
```
