"use client";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import {
  Upload, FileText, CheckCircle2, AlertCircle,
  Star, TrendingUp, Target, Sparkles, RefreshCw,
  ChevronDown, ChevronUp, Download, X
} from "lucide-react";

// Simulated resume analysis data
const mockAnalysis = {
  atsScore: 74,
  overallScore: 68,
  sections: {
    contact: { score: 95, feedback: "Contact information is complete and professional." },
    summary: { score: 60, feedback: "Summary is vague. Add quantified achievements and target role keywords." },
    experience: { score: 72, feedback: "Good structure, but missing impact metrics. Use numbers like '40% improvement'." },
    skills: { score: 65, feedback: "Missing critical skills: TypeScript, Docker, System Design, Redis." },
    education: { score: 90, feedback: "Education section is well-structured with CGPA and relevant coursework." },
    projects: { score: 55, feedback: "Projects lack depth. Add GitHub links, tech stack details, and measurable impact." },
  },
  keywords: {
    present: ["React", "JavaScript", "Python", "Node.js", "MongoDB", "Git", "REST API"],
    missing: ["TypeScript", "Docker", "Kubernetes", "System Design", "Redis", "GraphQL", "CI/CD"],
  },
  improvements: [
    { priority: "critical", text: 'Add quantified impact to all experience bullets (e.g., "Reduced load time by 40%")' },
    { priority: "critical", text: "Include TypeScript in skills — 89% of SDE job postings require it" },
    { priority: "high", text: "Add a portfolio/GitHub link prominently in the header" },
    { priority: "high", text: "Expand project descriptions with architecture decisions and tech stack" },
    { priority: "medium", text: "Add a 3-line professional summary targeting SDE roles" },
    { priority: "medium", text: "Include Docker/containerization experience or projects" },
    { priority: "low", text: "Consider adding open source contributions to strengthen profile" },
  ],
};

function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>{score}/100</span>
      </div>
      <div className="progress-bar">
        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

export default function ResumePage() {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);

  const onDrop = useCallback(async (accepted: File[]) => {
    if (accepted.length > 0) {
      const selectedFile = accepted[0];
      setFile(selectedFile);
      setAnalyzing(true);
      setAnalyzed(false);

      const formData = new FormData();
      formData.append("file", selectedFile);

      try {
        const response = await fetch("/api/v1/resume/analyze", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.detail || "Failed to analyze resume");
        }

        const data = await response.json();
        
        // Map backend properties (snake_case) to frontend (camelCase)
        const mappedData = {
          atsScore: data.ats_score,
          overallScore: data.overall_score,
          keywordMatchScore: data.keyword_match_score,
          sections: data.sections,
          keywords: {
            present: data.keywords_present,
            missing: data.keywords_missing,
          },
          improvements: data.improvements
        };

        setAnalysis(mappedData);
        setAnalyzed(true);
      } catch (err: any) {
        alert("Error analyzing resume: " + err.message);
        setFile(null);
      } finally {
        setAnalyzing(false);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"], "application/msword": [".doc", ".docx"] },
    maxFiles: 1,
  });

  const priorityColors: Record<string, string> = {
    critical: "#EF4444",
    high: "#F59E0B",
    medium: "#6366F1",
    low: "#10B981",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 6 }}>
          Resume Analysis
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
          Upload your resume and get instant AI-powered analysis against real job requirements.
        </p>
      </div>

      {/* Upload Zone */}
      <div
        {...getRootProps()}
        style={{
          border: `2px dashed ${isDragActive ? "var(--accent-primary)" : "var(--border)"}`,
          borderRadius: "var(--radius-xl)", padding: "48px 32px",
          textAlign: "center", cursor: "pointer",
          background: isDragActive ? "rgba(99,102,241,0.05)" : "rgba(255,255,255,0.02)",
          transition: "all 0.3s ease",
        }}
      >
        <input {...getInputProps()} />
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px", color: "var(--accent-primary)",
        }}>
          <Upload size={28} />
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
          {file ? file.name : "Drop your resume here"}
        </h3>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 16 }}>
          Supports PDF, DOC, DOCX • Max 10MB
        </p>
        {!file && (
          <button className="btn-primary" style={{ fontSize: 14, padding: "10px 24px" }}>
            Browse Files
          </button>
        )}
        {file && !analyzing && !analyzed && (
          <span className="badge badge-green"><CheckCircle2 size={12} /> Ready to Analyze</span>
        )}
      </div>

      {/* Analyzing State */}
      <AnimatePresence>
        {analyzing && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{
              background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.25)",
              borderRadius: "var(--radius-xl)", padding: "32px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 20,
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles size={36} style={{ color: "var(--accent-primary)" }} />
            </motion.div>
            <div style={{ textAlign: "center" }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>AI is analyzing your resume...</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                Extracting skills • Scoring sections • Comparing to 10,000+ job descriptions
              </p>
            </div>
            <div style={{ width: "100%", maxWidth: 400 }}>
              {["Parsing document structure...", "Extracting skills & experience...", "Matching against job descriptions...", "Generating improvement report..."].map((step, i) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.7 }}
                  style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ delay: i * 0.7, duration: 0.4 }}
                  >
                    <CheckCircle2 size={14} style={{ color: "var(--accent-green)" }} />
                  </motion.div>
                  <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{step}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analysis Results */}
      <AnimatePresence>
        {analyzed && analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: "flex", flexDirection: "column", gap: 24 }}
          >
            {/* Score Overview */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              {[
                { label: "Overall Resume Score", score: analysis.overallScore, color: "#6366F1", icon: <Star size={18} /> },
                { label: "ATS Compatibility", score: analysis.atsScore, color: "#06B6D4", icon: <TrendingUp size={18} /> },
                { label: "Keyword Match", score: analysis.keywordMatchScore, color: "#10B981", icon: <Target size={18} /> },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  style={{
                    background: "var(--bg-card)", border: "1px solid var(--border)",
                    borderRadius: "var(--radius-lg)", padding: "24px",
                    display: "flex", alignItems: "center", gap: 16,
                  }}
                >
                  <div style={{
                    width: 64, height: 64, borderRadius: 14,
                    background: `${s.color}15`,
                    border: `2px solid ${s.color}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: s.color, flexShrink: 0,
                    position: "relative",
                  }}>
                    <span style={{ fontSize: 22, fontWeight: 900 }}>{s.score}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 900, color: s.color }}>{s.score}/100</div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{s.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              {/* Section Scores */}
              <div style={{
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: "var(--radius-xl)", padding: "24px",
              }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Section Breakdown</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {Object.entries(analysis.sections).map(([key, val]: [string, any], i) => (
                    <div key={key}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, cursor: "pointer" }}
                        onClick={() => setExpandedSection(expandedSection === key ? null : key)}
                      >
                        <span style={{ fontSize: 13, fontWeight: 600, textTransform: "capitalize" }}>{key}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: val.score >= 80 ? "#10B981" : val.score >= 60 ? "#F59E0B" : "#EF4444" }}>
                            {val.score}
                          </span>
                          {expandedSection === key ? <ChevronUp size={12} style={{ color: "var(--text-muted)" }} /> : <ChevronDown size={12} style={{ color: "var(--text-muted)" }} />}
                        </div>
                      </div>
                      <div className="progress-bar">
                        <motion.div
                          className="progress-fill"
                          initial={{ width: 0 }}
                          animate={{ width: `${val.score}%` }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                          style={{ background: val.score >= 80 ? "#10B981" : val.score >= 60 ? "#F59E0B" : "#EF4444" }}
                        />
                      </div>
                      <AnimatePresence>
                        {expandedSection === key && (
                          <motion.p
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 8, lineHeight: 1.6 }}
                          >
                            {val.feedback}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>

              {/* Keywords */}
              <div style={{
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: "var(--radius-xl)", padding: "24px",
                display: "flex", flexDirection: "column", gap: 20,
              }}>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>Keyword Analysis</h3>
                <div>
                  <div style={{ fontSize: 13, color: "var(--accent-green)", fontWeight: 600, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                    <CheckCircle2 size={13} /> Present Keywords
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {analysis.keywords.present.map((kw: string) => (
                      <span key={kw} className="badge badge-green" style={{ fontSize: 12 }}>{kw}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 13, color: "var(--accent-red)", fontWeight: 600, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                    <X size={13} /> Missing Keywords
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {analysis.keywords.missing.map((kw: string) => (
                      <span key={kw} className="badge badge-red" style={{ fontSize: 12 }}>{kw}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Improvements */}
            <div style={{
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-xl)", padding: "24px",
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>🔧 AI Improvement Suggestions</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {analysis.improvements.map((item: any, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 12,
                      padding: "12px 14px",
                      background: `${priorityColors[item.priority]}08`,
                      borderRadius: "var(--radius-md)",
                      border: `1px solid ${priorityColors[item.priority]}20`,
                    }}
                  >
                    <AlertCircle size={14} style={{ color: priorityColors[item.priority], flexShrink: 0, marginTop: 1 }} />
                    <span style={{ fontSize: 13, lineHeight: 1.6, color: "var(--text-secondary)" }}>{item.text}</span>
                    <span style={{
                      flexShrink: 0, fontSize: 10, fontWeight: 700, padding: "2px 8px",
                      borderRadius: 100, background: `${priorityColors[item.priority]}15`,
                      color: priorityColors[item.priority], border: `1px solid ${priorityColors[item.priority]}30`,
                    }}>
                      {item.priority}
                    </span>
                  </motion.div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                <button className="btn-primary" style={{ fontSize: 14, padding: "10px 24px", display: "flex", alignItems: "center", gap: 8 }}>
                  <Download size={16} /> Download Report
                </button>
                <button className="btn-secondary" style={{ fontSize: 14, padding: "10px 24px", display: "flex", alignItems: "center", gap: 8 }}
                  onClick={() => { setFile(null); setAnalyzed(false); setAnalysis(null); }}>
                  <RefreshCw size={16} /> Analyze New Resume
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
