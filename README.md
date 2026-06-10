# AI Career Copilot — Moonshot Project

<div align="center">
  <h3>🚀 A Flagship AI-Powered Career Platform for College Students</h3>
  <p>Built to demonstrate full-stack engineering, AI integration, product thinking, and scale architecture.</p>
</div>

---

## 🎯 Project Vision

Students don't know what skills to learn, whether their resume is competitive, what projects to build, or how to crack placements. **CopilotAI** solves all of this with AI.

This is a **Moonshot Portfolio Project** — not a side project, but a product that a startup could raise money for.

---

## 🏗️ 6-Layer Architecture

```
Layer 1: Product Thinking   → User research, personas, pain points
Layer 2: UX Design          → Figma flows, glassmorphism UI
Layer 3: Engineering        → Next.js + FastAPI + PostgreSQL + Redis + Docker
Layer 4: AI Architecture    → Resume Analysis + RAG + Interview Simulation
Layer 5: Product Metrics    → DAU, Retention, Funnel Analytics
Layer 6: Scale Design       → Load Balancer → FastAPI → Postgres → Redis → VectorDB → LLM
```

---

## ✨ Features

| Feature | Layer | Technology |
|---|---|---|
| Resume Upload & AI Analysis | 3 + 4 | FastAPI, NLP, LLM |
| ATS Score & Keyword Matching | 4 | OpenAI, Instructor |
| Skill Gap Detection | 4 | Vector Similarity |
| Personalized Roadmap Generation | 4 | RAG + LLM |
| AI Mock Interview Simulation | 4 | GPT-4, Stateful Conversations |
| Job Matching | 4 | RAG, Qdrant Vector DB |
| Product Analytics Dashboard | 5 | Recharts, PostHog |
| Scale Architecture Diagram | 6 | Documentation |

---

## 🛠️ Tech Stack

**Frontend:**
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion (animations)
- Recharts (analytics)
- React Dropzone (file uploads)
- Zustand (state management)

**Backend:**
- FastAPI (Python)
- PostgreSQL (primary database)
- Redis (caching, sessions, rate limiting)
- Celery (background task queue)
- Alembic (database migrations)

**AI/ML:**
- OpenAI GPT-4 (resume analysis, interview simulation)
- Instructor (structured LLM outputs)
- LangChain (RAG pipeline)
- Qdrant (vector database)

**Infrastructure:**
- Docker + Docker Compose
- GitHub Actions (CI/CD)
- Load Balancer ready (stateless nodes)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker & Docker Compose

### 1. Clone the Repository
```bash
git clone https://github.com/AbhiSingh109/moonShot.git
cd moonShot
```

### 2. Start Infrastructure
```bash
docker-compose up -d
```

### 3. Run Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
API docs available at: http://localhost:8000/docs

### 4. Run Frontend
```bash
cd frontend
npm install
npm run dev
```
App available at: http://localhost:3000

---

## 📊 System Architecture

```
Web Client (Next.js)
        ↓
  CDN / Cloudflare
        ↓
  Load Balancer
     ↓       ↓
FastAPI   FastAPI
  ↓           ↓
PostgreSQL ← Redis
  ↓
Vector DB (Qdrant)
  ↓
LLM Provider (GPT-4)
```

---

## 📁 Project Structure

```
moonShot/
├── frontend/                   # Next.js App
│   └── src/app/
│       ├── page.tsx            # Landing Page
│       └── dashboard/
│           ├── layout.tsx      # Dashboard Shell
│           ├── page.tsx        # Dashboard Home
│           ├── resume/         # Resume Analysis
│           ├── roadmap/        # Learning Roadmap
│           ├── interview/      # Mock Interview AI
│           ├── analytics/      # Product Metrics
│           └── settings/       # User Settings
├── backend/
│   └── main.py                 # FastAPI Application
├── docs/
│   └── Layer_1_Product_Thinking.md
├── docker-compose.yml
└── README.md
```

---

## 🔑 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check |
| POST | `/api/users/register` | Register new user |
| POST | `/api/resume/analyze` | AI resume analysis |
| GET | `/api/roadmap/{user_id}` | Get personalized roadmap |
| POST | `/api/interview/respond` | AI interview response |
| GET | `/api/jobs/match/{user_id}` | RAG job matching |
| GET | `/api/metrics/platform` | Platform-wide metrics |
| GET | `/api/metrics/user/{user_id}` | User progress metrics |

---

## 📖 Layer Documentation

- [Layer 1: Product Thinking](docs/Layer_1_Product_Thinking.md)
- Layer 2: UX Design (Figma link coming soon)
- Layer 3: System Architecture (see above)
- Layer 4: AI Architecture (see `/docs`)
- Layer 5: Product Analytics (live in dashboard)
- Layer 6: Scale Diagram (see Architecture section)

---

## 🤝 Contributing

This is a Moonshot portfolio project. Star it if you found it valuable!

---

<div align="center">
  Built with ❤️ by <a href="https://github.com/AbhiSingh109">Abhinav Singh</a> — The AI Career Copilot
</div>
