"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Bot, User, Mic, MicOff, RefreshCw,
  Star, CheckCircle2, AlertCircle, ChevronRight,
  Volume2, Settings, Trophy, Clock, Zap
} from "lucide-react";

interface Message {
  role: "interviewer" | "user";
  content: string;
  timestamp: Date;
  score?: number;
  feedback?: string;
}

const interviewQuestions = [
  {
    q: "Tell me about yourself and why you're interested in this SDE role.",
    feedback: "Good introduction! Try to structure it as: current situation → past experiences → why this role. Add specific technologies you're excited about.",
    score: 72,
  },
  {
    q: "Can you explain the difference between SQL and NoSQL databases and when you'd use each?",
    feedback: "Solid technical answer. You correctly identified key differences. Strengthen by mentioning specific use cases: PostgreSQL for transactional data, MongoDB for flexible schema, Redis for caching.",
    score: 78,
  },
  {
    q: "Walk me through how you'd design a URL shortener system like bit.ly.",
    feedback: "Good high-level thinking! You covered the core API design. For senior roles, mention: hash collisions, cache-aside with Redis, CDN for analytics, database sharding strategy.",
    score: 65,
  },
  {
    q: "What's the time complexity of your approach? Can you optimize it further?",
    feedback: "You correctly identified O(n) but missed the O(n log n) sort-based approach. Always discuss trade-offs between time and space complexity in interviews.",
    score: 70,
  },
  {
    q: "Describe a challenging technical problem you solved. What was your approach?",
    feedback: "Great use of STAR format (Situation, Task, Action, Result). Remember to quantify the impact — '40% performance improvement' is much stronger than 'significantly faster'.",
    score: 82,
  },
];

const roles = [
  "SDE-1 at Amazon", "Frontend Engineer at Swiggy",
  "Backend Developer at Razorpay", "Full Stack at CRED",
  "Data Engineer at Flipkart",
];

export default function InterviewPage() {
  const [selectedRole, setSelectedRole] = useState(roles[0]);
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [qIndex, setQIndex] = useState(0);
  const [waiting, setWaiting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startInterview = () => {
    setStarted(true);
    setMessages([{
      role: "interviewer",
      content: `Hi! I'm your AI interviewer for the ${selectedRole} position. I'll ask you 5 questions covering technical concepts, system design, and behavioral scenarios. Take your time, think out loud, and don't worry — this is a safe space to practice! Ready? Let's start.\n\n${interviewQuestions[0].q}`,
      timestamp: new Date(),
    }]);
    setQIndex(0);
  };

  const sendMessage = () => {
    if (!input.trim() || waiting) return;
    const userMsg: Message = { role: "user", content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setWaiting(true);
    setShowFeedback(false);

    setTimeout(() => {
      const currentQ = interviewQuestions[qIndex];
      const feedbackMsg: Message = {
        role: "interviewer",
        content: qIndex < interviewQuestions.length - 1
          ? `${currentQ.feedback}\n\nGreat, let's move on! Here's the next question:\n\n${interviewQuestions[qIndex + 1].q}`
          : `${currentQ.feedback}\n\n🎉 That's a wrap! You've completed the mock interview. Check your detailed performance report below.`,
        timestamp: new Date(),
        score: currentQ.score,
        feedback: currentQ.feedback,
      };
      setMessages(prev => [...prev, feedbackMsg]);
      setWaiting(false);
      setShowFeedback(true);
      if (qIndex < interviewQuestions.length - 1) {
        setQIndex(prev => prev + 1);
      } else {
        setCompleted(true);
      }
    }, 1800);
  };

  const avgScore = Math.round(
    interviewQuestions.slice(0, qIndex + 1).reduce((acc, q) => acc + q.score, 0) / (qIndex + 1)
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, height: "calc(100vh - 128px)" }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 6 }}>
          Mock Interview
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
          Practice with an AI recruiter tailored to your target role and get instant feedback.
        </p>
      </div>

      {!started ? (
        /* Role Selection */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 600, margin: "0 auto", width: "100%" }}
        >
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-xl)", padding: "32px",
          }}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{
                width: 72, height: 72, borderRadius: 20,
                background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px", color: "var(--accent-primary)",
              }}>
                <Bot size={32} />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Select Your Target Role</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                Our AI will tailor questions to match the specific role and company standards.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {roles.map((role) => (
                <motion.div
                  key={role}
                  whileHover={{ x: 4 }}
                  onClick={() => setSelectedRole(role)}
                  style={{
                    padding: "14px 18px", borderRadius: "var(--radius-md)",
                    border: `1px solid ${selectedRole === role ? "var(--accent-primary)" : "var(--border)"}`,
                    background: selectedRole === role ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.02)",
                    cursor: "pointer", transition: "all 0.2s ease",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: selectedRole === role ? 600 : 400 }}>{role}</span>
                  {selectedRole === role && <CheckCircle2 size={16} style={{ color: "var(--accent-primary)" }} />}
                </motion.div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
              {[
                { label: "5 Questions", icon: <Zap size={14} /> },
                { label: "~20 Minutes", icon: <Clock size={14} /> },
                { label: "Instant Score", icon: <Star size={14} /> },
              ].map((item, i) => (
                <div key={i} style={{
                  padding: "10px", borderRadius: "var(--radius-md)",
                  background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)",
                  display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-secondary)",
                }}>
                  <span style={{ color: "var(--accent-primary)" }}>{item.icon}</span> {item.label}
                </div>
              ))}
            </div>

            <button className="btn-primary" onClick={startInterview} style={{ width: "100%", fontSize: 15, padding: "14px" }}>
              Start Interview → {selectedRole.split(" at ")[0]}
            </button>
          </div>
        </motion.div>
      ) : (
        /* Interview Chat */
        <div style={{ display: "flex", gap: 20, flex: 1, overflow: "hidden" }}>
          {/* Chat */}
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-xl)", overflow: "hidden",
          }}>
            {/* Chat Header */}
            <div style={{
              padding: "16px 24px", borderBottom: "1px solid var(--border)",
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 11,
                background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--accent-primary)",
              }}>
                <Bot size={20} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>AI Interviewer</div>
                <div style={{ fontSize: 12, color: "var(--accent-green)", display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent-green)" }} />
                  Live Interview • {selectedRole}
                </div>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Q {Math.min(qIndex + 1, 5)} of 5</span>
                <div className="progress-bar" style={{ width: 80, height: 4 }}>
                  <div className="progress-fill" style={{ width: `${(Math.min(qIndex + 1, 5) / 5) * 100}%` }} />
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: 16 }}>
              <AnimatePresence>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      display: "flex",
                      flexDirection: msg.role === "user" ? "row-reverse" : "row",
                      gap: 12, alignItems: "flex-start",
                    }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                      background: msg.role === "interviewer" ? "rgba(99,102,241,0.15)" : "var(--gradient-primary)",
                      border: msg.role === "interviewer" ? "1px solid rgba(99,102,241,0.3)" : "none",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: msg.role === "interviewer" ? "var(--accent-primary)" : "white",
                    }}>
                      {msg.role === "interviewer" ? <Bot size={15} /> : <User size={15} />}
                    </div>
                    <div style={{ maxWidth: "75%" }}>
                      <div style={{
                        padding: "12px 16px",
                        background: msg.role === "interviewer" ? "rgba(255,255,255,0.04)" : "rgba(99,102,241,0.15)",
                        border: `1px solid ${msg.role === "interviewer" ? "var(--border)" : "rgba(99,102,241,0.3)"}`,
                        borderRadius: "var(--radius-lg)",
                        fontSize: 14, lineHeight: 1.7, color: "var(--text-primary)",
                        whiteSpace: "pre-wrap",
                      }}>
                        {msg.content}
                      </div>
                      {msg.score && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          style={{
                            marginTop: 6, display: "flex", alignItems: "center", gap: 8,
                            padding: "6px 12px", background: "rgba(16,185,129,0.08)",
                            border: "1px solid rgba(16,185,129,0.2)", borderRadius: "var(--radius-md)",
                            fontSize: 12, color: "var(--accent-green)",
                          }}
                        >
                          <Star size={12} fill="currentColor" />
                          Answer Score: <strong>{msg.score}/100</strong>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {waiting && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-primary)", flexShrink: 0 }}>
                    <Bot size={15} />
                  </div>
                  <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", display: "flex", gap: 6, alignItems: "center" }}>
                    {[0, 1, 2].map(j => (
                      <motion.div key={j} style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent-primary)" }}
                        animate={{ y: [0, -6, 0] }} transition={{ duration: 0.8, delay: j * 0.2, repeat: Infinity }} />
                    ))}
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            {!completed && (
              <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border)" }}>
                <div style={{ display: "flex", gap: 10 }}>
                  <input
                    className="input-field"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
                    placeholder="Type your answer... (Enter to send)"
                    disabled={waiting}
                    style={{ flex: 1 }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsRecording(!isRecording)}
                    style={{
                      width: 44, height: 44, borderRadius: "var(--radius-md)",
                      background: isRecording ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${isRecording ? "rgba(239,68,68,0.3)" : "var(--border)"}`,
                      color: isRecording ? "#EF4444" : "var(--text-muted)",
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={sendMessage}
                    disabled={!input.trim() || waiting}
                    className="btn-primary"
                    style={{ width: 44, height: 44, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: !input.trim() ? 0.5 : 1 }}
                  >
                    <Send size={16} />
                  </motion.button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Stats */}
          <div style={{ width: 260, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: "20px" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Interview Progress</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {interviewQuestions.map((q, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                      background: i < qIndex ? "var(--accent-green)" : i === qIndex ? "var(--accent-primary)" : "rgba(255,255,255,0.05)",
                      border: `2px solid ${i < qIndex ? "var(--accent-green)" : i === qIndex ? "var(--accent-primary)" : "var(--border)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 700,
                    }}>
                      {i < qIndex ? <CheckCircle2 size={12} color="white" /> : <span style={{ color: i === qIndex ? "white" : "var(--text-muted)" }}>{i + 1}</span>}
                    </div>
                    <span style={{ fontSize: 12, color: i <= qIndex ? "var(--text-primary)" : "var(--text-muted)" }}>
                      Q{i + 1}: {i === 0 ? "Introduction" : i === 1 ? "Technical" : i === 2 ? "System Design" : i === 3 ? "Algorithms" : "Behavioral"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {qIndex > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: "20px" }}
              >
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Live Score</h3>
                <div style={{ textAlign: "center", marginBottom: 16 }}>
                  <div style={{ fontSize: 48, fontWeight: 900, color: avgScore >= 75 ? "var(--accent-green)" : avgScore >= 60 ? "#F59E0B" : "#EF4444" }}>
                    {avgScore}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Average Score</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {["Communication", "Technical Depth", "Structure"].map((m, i) => (
                    <div key={m}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12, color: "var(--text-secondary)" }}>
                        <span>{m}</span>
                        <span>{[avgScore + 5, avgScore - 8, avgScore + 2][i]}</span>
                      </div>
                      <div className="progress-bar">
                        <motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${[avgScore + 5, avgScore - 8, avgScore + 2][i]}%` }} transition={{ duration: 1, delay: i * 0.2 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {completed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.3)",
                  borderRadius: "var(--radius-xl)", padding: "20px", textAlign: "center",
                }}
              >
                <Trophy size={32} style={{ color: "#F59E0B", margin: "0 auto 8px" }} />
                <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>Interview Complete!</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>
                  Your final score: <strong style={{ color: "var(--accent-green)" }}>{avgScore}/100</strong>
                </div>
                <button className="btn-primary" style={{ width: "100%", fontSize: 13, padding: "10px" }}
                  onClick={() => { setStarted(false); setMessages([]); setQIndex(0); setCompleted(false); }}>
                  <RefreshCw size={13} style={{ marginRight: 6 }} /> New Interview
                </button>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
