"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Zap, ArrowRight, Brain, FileSearch, Map, MessageSquare,
  BarChart3, Shield, Star, ChevronRight, ExternalLink,
  CheckCircle2, Sparkles, Target, TrendingUp,
  Users, Award
} from "lucide-react";

// ───────────────────────── Navbar ─────────────────────────
function Navbar() {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "16px 0",
      }}
    >
      <div
        style={{
          maxWidth: 1200, margin: "12px auto", padding: "14px 28px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderRadius: "var(--radius-xl)", border: "1px solid var(--border)",
          background: "rgba(8,11,20,0.8)", backdropFilter: "blur(24px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "var(--gradient-primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Zap size={18} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.5px" }}>
            Copilot<span className="gradient-text">AI</span>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {["Features", "How It Works", "Metrics", "Architecture"].map((item) => (
            <a key={item} href={`#${item.toLowerCase().replace(" ", "-")}`} className="nav-link">
              {item}
            </a>
          ))}
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/dashboard">
            <button className="btn-secondary" style={{ padding: "9px 20px", fontSize: 14 }}>
              Sign In
            </button>
          </Link>
          <Link href="/dashboard">
            <button className="btn-primary" style={{ padding: "9px 20px", fontSize: 14 }}>
              Get Started Free
            </button>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}

// ───────────────────────── Hero ─────────────────────────
function Hero() {
  const stats = [
    { value: "94%", label: "Interview Success Rate" },
    { value: "2.3x", label: "Faster Job Placement" },
    { value: "50K+", label: "Students Helped" },
    { value: "4.9★", label: "User Rating" },
  ];
  return (
    <section
      style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "140px 24px 80px", position: "relative", overflow: "hidden",
        maxWidth: 1200, margin: "0 auto",
      }}
    >
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{ marginBottom: 24 }}
      >
        <span className="badge badge-purple">
          <Sparkles size={12} />
          AI-Powered Career Intelligence
        </span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          fontSize: "clamp(40px, 7vw, 80px)", fontWeight: 900,
          lineHeight: 1.05, textAlign: "center", letterSpacing: "-2px",
          maxWidth: 900, marginBottom: 24,
        }}
      >
        Your AI Copilot to
        <br />
        <span className="gradient-text">Land Your Dream Job</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{
          color: "var(--text-secondary)", fontSize: 18, lineHeight: 1.7,
          textAlign: "center", maxWidth: 600, marginBottom: 44,
        }}
      >
        Upload your resume. Our AI analyzes your profile, detects skill gaps against
        real job descriptions, generates a personalized roadmap, and trains you with
        mock interviews — all in one place.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{ display: "flex", gap: 16, marginBottom: 80 }}
      >
        <Link href="/dashboard">
          <button className="btn-primary" style={{ fontSize: 16, padding: "14px 36px", display: "flex", alignItems: "center", gap: 8 }}>
            Analyze My Resume <ArrowRight size={18} />
          </button>
        </Link>
        <Link href="/dashboard">
          <button className="btn-secondary" style={{ fontSize: 16, padding: "14px 36px" }}>
            Watch Demo
          </button>
        </Link>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24,
          width: "100%", maxWidth: 900,
        }}
      >
        {stats.map((s, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -4 }}
            style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)", padding: "20px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 32, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-1px" }}>
              {s.value}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>{s.label}</div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

// ───────────────────────── Features ─────────────────────────
function Features() {
  const features = [
    {
      icon: <FileSearch size={24} />, color: "#6366F1",
      title: "AI Resume Analysis", badge: "Instant",
      desc: "Deep NLP analysis scores your resume against 10,000+ real job descriptions. Get an ATS compatibility score, keyword gaps, and brutally honest feedback.",
      points: ["ATS Score & Keyword Analysis", "Grammar & Impact Scoring", "Industry Benchmark Comparison"],
    },
    {
      icon: <Target size={24} />, color: "#8B5CF6",
      title: "Skill Gap Detection", badge: "Precise",
      desc: "We compare your extracted skills against top job requirements in your target role using semantic vector matching — not just keyword matching.",
      points: ["Semantic Role Matching", "Missing Skills Identification", "Priority Ranking by Demand"],
    },
    {
      icon: <Map size={24} />, color: "#06B6D4",
      title: "Personalized Roadmap", badge: "AI-Generated",
      desc: "Get a week-by-week learning plan with curated resources, project ideas, and milestones tailored to your current level and target role.",
      points: ["Week-by-Week Learning Plan", "Project Suggestions", "Resource Curation (Free & Paid)"],
    },
    {
      icon: <MessageSquare size={24} />, color: "#10B981",
      title: "Mock Interview AI", badge: "Realistic",
      desc: "Practice with an AI recruiter tailored to your target job description. Get real-time feedback on technical accuracy, communication, and confidence.",
      points: ["Role-Specific Questions", "Real-Time Answer Scoring", "Detailed Post-Interview Report"],
    },
    {
      icon: <BarChart3 size={24} />, color: "#F59E0B",
      title: "Product Analytics", badge: "Live Metrics",
      desc: "Track your progress with a comprehensive dashboard showing DAU, skill improvements, interview scores, and placement probability over time.",
      points: ["Progress Heatmaps", "Interview Score Trends", "Placement Probability Score"],
    },
    {
      icon: <Brain size={24} />, color: "#EC4899",
      title: "RAG Job Matching", badge: "Advanced AI",
      desc: "Our Retrieval-Augmented Generation engine matches your profile against a live vector database of job descriptions for hyper-accurate role suggestions.",
      points: ["Vector Similarity Matching", "Live Job Market Data", "Company Culture Fit Analysis"],
    },
  ];

  return (
    <section id="features" style={{ padding: "120px 24px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 72 }}>
        <span className="badge badge-purple" style={{ marginBottom: 16 }}>
          <Sparkles size={12} /> All Features
        </span>
        <h2 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, letterSpacing: "-1.5px", marginBottom: 16 }}>
          Everything you need to
          <br /><span className="gradient-text">crack placements</span>
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 18, maxWidth: 560, margin: "0 auto" }}>
          Six powerful AI features that work together to take you from confused student to job-ready professional.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -6, borderColor: "var(--border-active)" }}
            style={{
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-xl)", padding: 32,
              transition: "all 0.3s ease", cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: `${f.color}20`, border: `1px solid ${f.color}40`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: f.color,
              }}>
                {f.icon}
              </div>
              <span className="badge badge-purple" style={{ fontSize: 11 }}>{f.badge}</span>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, letterSpacing: "-0.5px" }}>{f.title}</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>{f.desc}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {f.points.map((p, j) => (
                <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-secondary)" }}>
                  <CheckCircle2 size={14} style={{ color: f.color, flexShrink: 0 }} />
                  {p}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ───────────────────────── How It Works ─────────────────────────
function HowItWorks() {
  const steps = [
    { num: "01", title: "Upload Your Resume", desc: "Drag and drop your PDF or DOCX resume. Our AI instantly parses and extracts every skill, experience, and education detail.", icon: <FileSearch size={20} /> },
    { num: "02", title: "AI Analyzes Your Profile", desc: "Our LLM rates your resume against ATS systems, benchmark resumes in your field, and extracts a structured profile.", icon: <Brain size={20} /> },
    { num: "03", title: "See Your Skill Gaps", desc: "Compare your skills against real job requirements. We rank the gaps by market demand so you know what to learn first.", icon: <Target size={20} /> },
    { num: "04", title: "Follow Your Roadmap", desc: "Get a custom week-by-week learning plan with resources, project ideas, and milestones built just for you.", icon: <Map size={20} /> },
    { num: "05", title: "Practice Mock Interviews", desc: "Interview with an AI recruiter personalized to your target job. Get feedback on every answer, instantly.", icon: <MessageSquare size={20} /> },
    { num: "06", title: "Track & Improve", desc: "Monitor your progress in the analytics dashboard. Watch your placement probability rise as you level up.", icon: <TrendingUp size={20} /> },
  ];

  return (
    <section id="how-it-works" style={{ padding: "120px 24px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 72 }}>
        <span className="badge badge-cyan" style={{ marginBottom: 16 }}>
          <ChevronRight size={12} /> How It Works
        </span>
        <h2 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, letterSpacing: "-1.5px", marginBottom: 16 }}>
          From resume to
          <br /><span className="gradient-text">offer letter in 6 steps</span>
        </h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, position: "relative" }}>
        {steps.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            style={{
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-xl)", padding: 28, position: "relative", overflow: "hidden",
            }}
          >
            <div style={{
              position: "absolute", top: 16, right: 20,
              fontSize: 48, fontWeight: 900, color: "rgba(99,102,241,0.06)",
              lineHeight: 1, fontFamily: "monospace",
            }}>
              {s.num}
            </div>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--accent-primary)", marginBottom: 16,
            }}>
              {s.icon}
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{s.title}</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.7 }}>{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ───────────────────────── Architecture ─────────────────────────
function Architecture() {
  const layers = [
    { label: "Web Client (Next.js)", icon: "🌐", color: "#6366F1" },
    { label: "CDN / Cloudflare", icon: "☁️", color: "#06B6D4" },
    { label: "Load Balancer", icon: "⚡", color: "#8B5CF6" },
    { label: "FastAPI Cluster", icon: "🐍", color: "#10B981" },
    { label: "PostgreSQL + Read Replicas", icon: "🗄️", color: "#F59E0B" },
    { label: "Redis Cache", icon: "🔴", color: "#EF4444" },
    { label: "Vector DB (Qdrant)", icon: "🧠", color: "#8B5CF6" },
    { label: "LLM Provider (GPT-4)", icon: "✨", color: "#6366F1" },
  ];

  return (
    <section id="architecture" style={{ padding: "120px 24px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 72 }}>
        <span className="badge badge-purple" style={{ marginBottom: 16 }}>
          <Shield size={12} /> Scale Architecture
        </span>
        <h2 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, letterSpacing: "-1.5px", marginBottom: 16 }}>
          Built to handle
          <br /><span className="gradient-text">10,000+ concurrent users</span>
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 18, maxWidth: 560, margin: "0 auto" }}>
          Enterprise-grade infrastructure designed for scale, reliability, and sub-100ms response times.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
        {/* Diagram */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center" }}>
          {layers.map((l, i) => (
            <div key={i} style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.02, borderColor: l.color + "60" }}
                style={{
                  width: "100%", padding: "14px 24px",
                  background: "var(--bg-card)", border: `1px solid var(--border)`,
                  borderRadius: "var(--radius-md)",
                  display: "flex", alignItems: "center", gap: 12,
                  transition: "all 0.3s ease",
                }}
              >
                <span style={{ fontSize: 20 }}>{l.icon}</span>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{l.label}</span>
                <div style={{
                  marginLeft: "auto", width: 8, height: 8, borderRadius: "50%",
                  background: l.color, boxShadow: `0 0 8px ${l.color}`,
                  animation: "pulse-glow 2s infinite",
                }} />
              </motion.div>
              {i < layers.length - 1 && (
                <div style={{ width: 2, height: 12, background: "linear-gradient(to bottom, rgba(99,102,241,0.4), transparent)" }} />
              )}
            </div>
          ))}
        </div>

        {/* Text */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {[
            { title: "Stateless API Cluster", desc: "Multiple FastAPI nodes behind a load balancer. Scales horizontally to 0 or 1000 nodes.", badge: "Layer 3" },
            { title: "Intelligent Caching", desc: "Redis caches session data, rate limits, and frequently-accessed roadmaps for sub-10ms reads.", badge: "Performance" },
            { title: "Vector DB for RAG", desc: "Qdrant stores job description embeddings for semantic similarity matching at millisecond speed.", badge: "Layer 4 AI" },
            { title: "PostgreSQL Read Replicas", desc: "Write to master, read from replicas. Async background workers via Celery handle slow LLM tasks.", badge: "Reliability" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{
                borderLeft: "3px solid var(--accent-primary)",
                paddingLeft: 20,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <h4 style={{ fontSize: 16, fontWeight: 700 }}>{item.title}</h4>
                <span className="badge badge-purple" style={{ fontSize: 10 }}>{item.badge}</span>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.7 }}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ───────────────────────── Testimonials ─────────────────────────
function Testimonials() {
  const testimonials = [
    { name: "Priya Sharma", role: "SDE-1 @ Amazon", avatar: "PS", quote: "CopilotAI's resume analysis showed me exactly what I was missing. Got an Amazon offer in 3 months after following the roadmap.", rating: 5 },
    { name: "Rahul Verma", role: "Data Analyst @ Flipkart", avatar: "RV", quote: "The mock interview feature is insane. It asked me the exact same questions Flipkart asked in my real interview. Passed first attempt.", rating: 5 },
    { name: "Ananya Singh", role: "Frontend Dev @ Swiggy", avatar: "AS", quote: "I went from 0 callbacks to 5 interviews in 6 weeks. The skill gap detection literally showed me what was wrong with my profile.", rating: 5 },
    { name: "Karan Mehta", role: "ML Engineer @ Uber", avatar: "KM", quote: "The RAG job matching found roles I never knew existed that perfectly matched my skills. Incredible product for students.", rating: 5 },
    { name: "Sneha Gupta", role: "PM @ Razorpay", avatar: "SG", quote: "Even for a PM role, the profile analysis and interview prep was spot-on. The AI asked product sense questions perfectly calibrated to my level.", rating: 5 },
    { name: "Arjun Nair", role: "Backend Dev @ CRED", avatar: "AN", quote: "Best career tool I've ever used. Period. The roadmap had exactly what I needed — no fluff, just the right resources in the right order.", rating: 5 },
  ];

  return (
    <section style={{ padding: "120px 24px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 72 }}>
        <span className="badge badge-green" style={{ marginBottom: 16 }}>
          <Star size={12} /> Student Stories
        </span>
        <h2 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, letterSpacing: "-1.5px" }}>
          Trusted by <span className="gradient-text">50,000+ students</span>
        </h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            style={{
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-xl)", padding: 28,
            }}
          >
            <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
              {Array(t.rating).fill(0).map((_, j) => (
                <Star key={j} size={14} style={{ color: "#F59E0B", fill: "#F59E0B" }} />
              ))}
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.8, marginBottom: 20 }}>
              "{t.quote}"
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "var(--gradient-primary)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 700, color: "white",
              }}>
                {t.avatar}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{t.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{t.role}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ───────────────────────── CTA ─────────────────────────
function CTA() {
  return (
    <section style={{ padding: "80px 24px 120px", maxWidth: 1200, margin: "0 auto" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        style={{
          background: "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.1) 50%, rgba(6,182,212,0.1) 100%)",
          border: "1px solid rgba(99,102,241,0.3)",
          borderRadius: "var(--radius-xl)", padding: "72px 48px",
          textAlign: "center", position: "relative", overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: "var(--radius-xl)" }}>
          <div className="orb" style={{ width: 400, height: 400, background: "#6366F1", top: -150, left: -100, opacity: 0.08 }} />
          <div className="orb" style={{ width: 300, height: 300, background: "#06B6D4", bottom: -100, right: -50, opacity: 0.08 }} />
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <Award size={40} style={{ color: "var(--accent-primary)", marginBottom: 16, margin: "0 auto 16px" }} />
          <h2 style={{ fontSize: "clamp(28px, 4vw, 52px)", fontWeight: 900, letterSpacing: "-1.5px", marginBottom: 16 }}>
            Ready to crack your
            <br /><span className="gradient-text">dream placement?</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 18, maxWidth: 500, margin: "0 auto 36px" }}>
            Join 50,000+ students who use CopilotAI to navigate placements with confidence.
          </p>
          <Link href="/dashboard">
            <button className="btn-primary" style={{ fontSize: 16, padding: "16px 48px", display: "inline-flex", alignItems: "center", gap: 8 }}>
              Start for Free — No Credit Card <ArrowRight size={18} />
            </button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

// ───────────────────────── Footer ─────────────────────────
function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--border)", padding: "48px 24px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap size={16} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 16 }}>Copilot<span className="gradient-text">AI</span></span>
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
          © 2024 CopilotAI. Built with ❤️ for students.
        </p>
        <div style={{ display: "flex", gap: 16 }}>
          <a href="https://github.com/AbhiSingh109/moonShot" target="_blank" rel="noreferrer" style={{ color: "var(--text-muted)", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "var(--text-primary)"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>
            <ExternalLink size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
}

// ───────────────────────── Page ─────────────────────────
export default function HomePage() {
  return (
    <main style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Hero />
        <Features />
        <HowItWorks />
        <Architecture />
        <Testimonials />
        <CTA />
        <Footer />
      </div>
    </main>
  );
}
