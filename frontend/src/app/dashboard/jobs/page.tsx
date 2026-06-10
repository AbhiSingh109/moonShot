"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, MapPin, CheckCircle2, AlertTriangle, FileText, Sparkles, Send, Brain, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

interface JobMatch {
  title: string;
  company: string;
  match_score: number;
  missing_skills: string[];
  location: string;
  description: string;
  requirements: string;
}

export default function JobMatchesPage() {
  const [jobs, setJobs] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobMatch | null>(null);
  
  // Cover letter generator state
  const [letterTone, setLetterTone] = useState("professional");
  const [generatingLetter, setGeneratingLetter] = useState(false);
  const [coverLetterText, setCoverLetterText] = useState("");

  // STAR Rewriter state
  const [rewritingBullet, setRewritingBullet] = useState(false);
  const [bulletInput, setBulletInput] = useState("");
  const [starResult, setStarResult] = useState<any>(null);

  // JD Match state
  const [jdPasted, setJdPasted] = useState("");
  const [jdMatchResult, setJdMatchResult] = useState<any>(null);
  const [matchingJd, setMatchingJd] = useState(false);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/jobs/match");
      const data = await res.json();
      if (data.matched_jobs) {
        setJobs(data.matched_jobs);
        if (data.matched_jobs.length > 0) {
          setSelectedJob(data.matched_jobs[0]);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch job matches.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!selectedJob) return;
    try {
      setGeneratingLetter(true);
      setCoverLetterText("");
      const res = await fetch("/api/v1/features/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: selectedJob.company,
          role: selectedJob.title,
          tone: letterTone
        })
      });
      const data = await res.json();
      if (data.cover_letter) {
        setCoverLetterText(data.cover_letter);
        toast.success("Cover letter generated!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Cover letter generation failed.");
    } finally {
      setGeneratingLetter(false);
    }
  };

  const handleRewriteBullet = async () => {
    if (!bulletInput.trim()) {
      toast.error("Please enter a resume bullet point first.");
      return;
    }
    try {
      setRewritingBullet(true);
      setStarResult(null);
      const res = await fetch("/api/v1/features/achievement-rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bullet: bulletInput })
      });
      const data = await res.json();
      if (data.star_bullet) {
        setStarResult(data);
        toast.success("Achievement rewritten using STAR format!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Rewrite failed.");
    } finally {
      setRewritingBullet(false);
    }
  };

  const handleCustomJdMatch = async () => {
    if (!jdPasted.trim()) {
      toast.error("Please paste a job description first.");
      return;
    }
    try {
      setMatchingJd(true);
      setJdMatchResult(null);
      const res = await fetch("/api/v1/features/jd-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jd_text: jdPasted })
      });
      const data = await res.json();
      if (data.match_score !== undefined) {
        setJdMatchResult(data);
        toast.success("Job description match complete!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Custom JD matching failed.");
    } finally {
      setMatchingJd(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, minHeight: "100%" }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 6 }}>
          RAG-Powered Job Matching
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
          Cosine-similarity search against 500+ top software roles using Voyage AI embeddings & pgvector.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.8fr", gap: 24, alignItems: "start" }}>
        
        {/* Left Side: Matched Job Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
            <Briefcase size={16} style={{ color: "var(--accent-primary)" }} /> Top Matches
          </h2>

          {loading ? (
            <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-secondary)" }}>
              Computing vector similarities...
            </div>
          ) : jobs.length === 0 ? (
            <div style={{ padding: "40px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", textAlign: "center" }}>
              <p style={{ color: "var(--text-secondary)", marginBottom: 12 }}>No vector matches found. Make sure you upload a resume first!</p>
            </div>
          ) : (
            jobs.map((job, idx) => {
              const isSelected = selectedJob?.title === job.title && selectedJob?.company === job.company;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -2 }}
                  onClick={() => setSelectedJob(job)}
                  style={{
                    background: isSelected ? "rgba(99,102,241,0.1)" : "var(--bg-card)",
                    border: isSelected ? "1px solid var(--accent-primary)" : "1px solid var(--border)",
                    borderRadius: "var(--radius-lg)",
                    padding: 20,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>{job.title}</h3>
                      <p style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>{job.company}</p>
                    </div>
                    <div style={{
                      padding: "4px 10px",
                      borderRadius: 100,
                      background: job.match_score >= 80 ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
                      border: `1px solid ${job.match_score >= 80 ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)"}`,
                      color: job.match_score >= 80 ? "var(--accent-green)" : "var(--accent-amber)",
                      fontSize: 12,
                      fontWeight: 700
                    }}>
                      {job.match_score}% Match
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)", marginBottom: 14 }}>
                    <MapPin size={12} /> {job.location}
                  </div>

                  {job.missing_skills.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {job.missing_skills.slice(0, 3).map((skill, sIdx) => (
                        <span key={sIdx} style={{
                          fontSize: 10,
                          padding: "2px 8px",
                          borderRadius: 6,
                          background: "rgba(239,68,68,0.06)",
                          border: "1px solid rgba(239,68,68,0.15)",
                          color: "var(--accent-red)",
                          fontWeight: 500
                        }}>
                          -{skill}
                        </span>
                      ))}
                      {job.missing_skills.length > 3 && (
                        <span style={{ fontSize: 10, color: "var(--text-muted)", alignSelf: "center" }}>
                          +{job.missing_skills.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>

        {/* Right Side: Selected Job Info & Quick Win Operations */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {selectedJob ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-xl)",
                padding: 28,
                display: "flex",
                flexDirection: "column",
                gap: 20
              }}
            >
              <div>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent-primary)", textTransform: "uppercase" }}>Selected Opportunity</span>
                <h2 style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{selectedJob.title}</h2>
                <p style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{selectedJob.company}</p>
              </div>

              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Job Description</h4>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{selectedJob.description}</p>
              </div>

              <div>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Requirements</h4>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{selectedJob.requirements}</p>
              </div>

              {/* Cover Letter Quick Win Integration */}
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: 18, marginTop: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                    <Sparkles size={14} style={{ color: "var(--accent-primary)" }} /> AI Cover Letter
                  </h4>
                  <div style={{ display: "flex", gap: 8 }}>
                    <select
                      value={letterTone}
                      onChange={(e) => setLetterTone(e.target.value)}
                      style={{
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border)",
                        borderRadius: 6,
                        color: "var(--text-primary)",
                        fontSize: 12,
                        padding: "4px 8px"
                      }}
                    >
                      <option value="professional">Professional</option>
                      <option value="confident">Confident</option>
                      <option value="eager">Eager & Humble</option>
                    </select>
                    <button
                      onClick={handleGenerateCoverLetter}
                      disabled={generatingLetter}
                      className="btn-primary"
                      style={{ padding: "6px 12px", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}
                    >
                      {generatingLetter ? "Generating..." : "Generate"}
                    </button>
                  </div>
                </div>

                {coverLetterText && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    style={{ overflow: "hidden" }}
                  >
                    <textarea
                      readOnly
                      value={coverLetterText}
                      style={{
                        width: "100%",
                        height: 200,
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-md)",
                        padding: 12,
                        fontSize: 12,
                        fontFamily: "monospace",
                        color: "var(--text-secondary)",
                        marginTop: 10,
                        resize: "none"
                      }}
                    />
                  </motion.div>
                )}
              </div>

            </motion.div>
          ) : (
            <div style={{ padding: 40, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", textAlign: "center", color: "var(--text-secondary)" }}>
              Select a job match on the left to view description and generate tailored assets.
            </div>
          )}

          {/* Quick Win Box 2: STAR Achievement Rewriter */}
          <div style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-xl)",
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 16
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
              <Brain size={16} style={{ color: "var(--accent-green)" }} /> STAR Achievement Rewriter
            </h3>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: -8 }}>
              Convert weak resume bullets into impact-driven sentences containing Context, Action, and Quantified Results.
            </p>

            <div style={{ display: "flex", gap: 10 }}>
              <input
                type="text"
                placeholder="e.g., I worked on backend code and fixed database queries."
                value={bulletInput}
                onChange={(e) => setBulletInput(e.target.value)}
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  padding: "10px 14px",
                  color: "var(--text-primary)",
                  fontSize: 13,
                  outline: "none"
                }}
              />
              <button
                onClick={handleRewriteBullet}
                disabled={rewritingBullet}
                className="btn-primary"
                style={{ padding: "0 18px", fontSize: 13 }}
              >
                {rewritingBullet ? "Rewriting..." : "STAR-ify"}
              </button>
            </div>

            {starResult && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  background: "rgba(16,185,129,0.05)",
                  border: "1px solid rgba(16,185,129,0.2)",
                  borderRadius: "var(--radius-md)",
                  padding: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10
                }}
              >
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-green)", textTransform: "uppercase" }}>Rewritten Bullet</span>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginTop: 2 }}>{starResult.star_bullet}</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 10 }}>
                  <div>
                    <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700 }}>SITUATION & TASK</span>
                    <p style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>{starResult.situation} {starResult.task}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700 }}>ACTION & RESULT</span>
                    <p style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>{starResult.action} {starResult.result}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Quick Win Box 3: Custom JD Match */}
          <div style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-xl)",
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 16
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
              <FileText size={16} style={{ color: "var(--accent-amber)" }} /> Paste Custom Job Description
            </h3>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: -8 }}>
              Paste a custom job listing to perform direct skill-gap alignment analysis against your profile.
            </p>

            <textarea
              placeholder="Paste job description requirements here..."
              value={jdPasted}
              onChange={(e) => setJdPasted(e.target.value)}
              style={{
                width: "100%",
                height: 100,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                padding: 12,
                fontSize: 13,
                color: "var(--text-primary)",
                resize: "none",
                outline: "none"
              }}
            />

            <button
              onClick={handleCustomJdMatch}
              disabled={matchingJd}
              className="btn-primary"
              style={{ alignSelf: "flex-end", padding: "10px 20px" }}
            >
              {matchingJd ? "Analyzing Gap..." : "Analyze Skill Match"}
            </button>

            {jdMatchResult && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  padding: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>Custom Match Rating</span>
                  <span style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: jdMatchResult.match_score >= 75 ? "var(--accent-green)" : "var(--accent-amber)"
                  }}>
                    {jdMatchResult.match_score}%
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-green)", display: "flex", alignItems: "center", gap: 4 }}>
                      <CheckCircle2 size={12} /> MATCHING
                    </span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
                      {jdMatchResult.matching_skills.map((s: string) => (
                        <span key={s} style={{ fontSize: 10, padding: "2px 6px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: 4, color: "var(--accent-green)" }}>{s}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-red)", display: "flex", alignItems: "center", gap: 4 }}>
                      <AlertTriangle size={12} /> MISSING
                    </span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
                      {jdMatchResult.missing_skills.map((s: string) => (
                        <span key={s} style={{ fontSize: 10, padding: "2px 6px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 4, color: "var(--accent-red)" }}>{s}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)" }}>AI Gap Analysis</span>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4, lineHeight: 1.5 }}>{jdMatchResult.gap_analysis}</p>
                </div>
              </motion.div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
