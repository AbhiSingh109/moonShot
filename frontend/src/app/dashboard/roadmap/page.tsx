"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, Circle, Clock, BookOpen,
  Code, Play, ExternalLink,
  ChevronDown, ChevronRight, Lock, Zap,
  Target, Trophy, Calendar
} from "lucide-react";

import { useEffect } from "react";

const statusConfig: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
  completed: { color: "#10B981", label: "Completed", icon: <CheckCircle2 size={16} /> },
  "in-progress": { color: "#6366F1", label: "In Progress", icon: <Zap size={16} /> },
  locked: { color: "#475569", label: "Locked", icon: <Lock size={16} /> },
};

const priorityBadge: Record<string, string> = {
  critical: "badge-red",
  high: "badge-amber",
  medium: "badge-purple",
};

const resourceIcon: Record<string, React.ReactNode> = {
  youtube: <Play size={14} />,
  docs: <BookOpen size={14} />,
  project: <Code size={14} />,
};

interface RoadmapResource {
  type: string;
  title: string;
  url: string;
  duration: string;
}

interface RoadmapWeek {
  week: string;
  title: string;
  status: string;
  priority: string;
  description: string;
  skills: string[];
  resources: RoadmapResource[];
  project: string;
  xp: number;
}

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState<RoadmapWeek[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [totalXP, setTotalXP] = useState(0);
  const [completed, setCompleted] = useState(0);

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const res = await fetch("/api/v1/roadmap");
        if (!res.ok) {
          throw new Error("Failed to fetch roadmap");
        }
        const data = await res.json();
        
        // Map status based on week indexes
        const mappedWeeks = data.weeks.map((w: any, index: number) => {
          let status = "locked";
          if (index === 0) status = "completed";
          else if (index === 1) status = "in-progress";
          
          return {
            ...w,
            status,
            priority: w.priority || "critical"
          };
        });

        setRoadmap(mappedWeeks);
        setTotalXP(mappedWeeks.reduce((acc: number, r: any) => r.status === "completed" ? acc + r.xp : acc, 0));
        setCompleted(mappedWeeks.filter((r: any) => r.status === "completed").length);
        setExpanded(mappedWeeks[1]?.week || mappedWeeks[0]?.week || null);
      } catch (err: any) {
        console.error("Roadmap fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmap();
  }, []);

  if (loading) {
    return (
      <div style={{
        display: "flex", minHeight: "60vh", alignItems: "center",
        justifyContent: "center", color: "var(--text-secondary)", fontSize: 15,
        gap: 12
      }}>
        <div style={{
          width: 20, height: 20, borderRadius: "50%",
          border: "2px solid rgba(255,255,255,0.1)",
          borderTopColor: "var(--accent-primary)",
          animation: "spin 1s linear infinite"
        }} />
        Analyzing profile and generating personalized roadmap...
        <style jsx global>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 6 }}>
            Your Learning Roadmap
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
            AI-generated personalized roadmap based on your detected skill gaps.
          </p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)", padding: "12px 20px",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <Trophy size={18} style={{ color: "#F59E0B" }} />
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#F59E0B" }}>{totalXP} XP</div>
              <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>Points Earned</div>
            </div>
          </div>
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)", padding: "12px 20px",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <Target size={18} style={{ color: "#6366F1" }} />
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#6366F1" }}>{completed}/{roadmap.length}</div>
              <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>Completed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: "var(--radius-xl)", padding: "24px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Overall Progress</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--accent-primary)" }}>
            {Math.round((completed / roadmap.length) * 100)}%
          </span>
        </div>
        <div className="progress-bar" style={{ height: 10 }}>
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${(completed / roadmap.length) * 100}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Start Profile Analysis</span>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Goal: Placement Ready</span>
        </div>
      </div>

      {/* Roadmap Timeline */}
      <div style={{ position: "relative" }}>
        {/* Timeline line */}
        <div style={{
          position: "absolute", left: 28, top: 0, bottom: 0, width: 2,
          background: "linear-gradient(to bottom, var(--accent-primary), var(--accent-secondary), rgba(99,102,241,0.1))",
          borderRadius: 1,
        }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {roadmap.map((item, i) => {
            const isExpanded = expanded === item.week;
            const config = statusConfig[item.status];
            const isLocked = item.status === "locked";

            return (
              <motion.div
                key={item.week}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                style={{ paddingLeft: 60, position: "relative" }}
              >
                {/* Timeline dot */}
                <div style={{
                  position: "absolute", left: 20, top: 24, width: 18, height: 18,
                  borderRadius: "50%", background: config.color,
                  border: "3px solid var(--bg-primary)",
                  boxShadow: item.status !== "locked" ? `0 0 12px ${config.color}60` : "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }} />

                <motion.div
                  style={{
                    background: isLocked ? "rgba(17,24,39,0.5)" : "var(--bg-card)",
                    border: `1px solid ${isExpanded && !isLocked ? config.color + "40" : "var(--border)"}`,
                    borderRadius: "var(--radius-xl)", overflow: "hidden",
                    opacity: isLocked ? 0.6 : 1,
                    transition: "all 0.3s ease",
                  }}
                >
                  {/* Card Header */}
                  <div
                    style={{
                      padding: "20px 24px", cursor: isLocked ? "default" : "pointer",
                      display: "flex", alignItems: "center", gap: 16,
                    }}
                    onClick={() => !isLocked && setExpanded(isExpanded ? null : item.week)}
                  >
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                      background: `${config.color}15`, border: `1px solid ${config.color}30`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: config.color,
                    }}>
                      {config.icon}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                        <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace" }}>{item.week}</span>
                        <span className={`badge ${priorityBadge[item.priority]}`} style={{ fontSize: 10 }}>
                          {item.priority}
                        </span>
                        <span style={{
                          fontSize: 11, padding: "2px 8px", borderRadius: 100,
                          background: `${config.color}12`, color: config.color,
                          border: `1px solid ${config.color}25`, fontWeight: 600,
                        }}>
                          {config.label}
                        </span>
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 700 }}>{item.title}</div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ fontSize: 13, color: "#F59E0B", fontWeight: 700 }}>+{item.xp} XP</div>
                      {!isLocked && (
                        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                          <ChevronDown size={16} style={{ color: "var(--text-muted)" }} />
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isExpanded && !isLocked && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: "hidden" }}
                      >
                        <div style={{ padding: "0 24px 24px", borderTop: "1px solid var(--border)" }}>
                          <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.7, margin: "16px 0 20px" }}>
                            {item.description}
                          </p>

                          {/* Skills */}
                          <div style={{ marginBottom: 20 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Skills Covered</div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                              {item.skills.map((skill) => (
                                <span key={skill} className="badge badge-purple" style={{ fontSize: 12 }}>{skill}</span>
                              ))}
                            </div>
                          </div>

                          {/* Resources */}
                          <div style={{ marginBottom: 20 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Resources</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              {item.resources.map((res, j) => (
                                <a key={j} href={res.url} style={{ textDecoration: "none" }}>
                                  <div style={{
                                    display: "flex", alignItems: "center", gap: 10,
                                    padding: "10px 14px",
                                    background: "rgba(255,255,255,0.03)",
                                    border: "1px solid var(--border)",
                                    borderRadius: "var(--radius-md)",
                                    transition: "all 0.2s ease",
                                  }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)"}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
                                  >
                                    <span style={{ color: "var(--accent-primary)" }}>{resourceIcon[res.type]}</span>
                                    <span style={{ fontSize: 13, color: "var(--text-primary)", flex: 1 }}>{res.title}</span>
                                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{res.duration}</span>
                                    <ExternalLink size={12} style={{ color: "var(--text-muted)" }} />
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>

                          {/* Project */}
                          <div style={{
                            padding: "14px 16px",
                            background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)",
                            borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", gap: 10,
                          }}>
                            <Code size={16} style={{ color: "#06B6D4", flexShrink: 0 }} />
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 600, color: "#67E8F9", marginBottom: 2 }}>🏗️ Project Challenge</div>
                              <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{item.project}</div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
