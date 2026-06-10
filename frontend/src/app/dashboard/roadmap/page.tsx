"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, Circle, Clock, BookOpen,
  Code, Play, ExternalLink,
  ChevronDown, ChevronRight, Lock, Zap,
  Target, Trophy, Calendar
} from "lucide-react";

const roadmapData = [
  {
    week: "Week 1–2",
    title: "TypeScript Fundamentals",
    status: "completed",
    priority: "critical",
    description: "Master TypeScript — types, interfaces, generics, and decorators. This is non-negotiable for 89% of SDE roles.",
    skills: ["Types & Interfaces", "Generics", "Decorators", "tsconfig"],
    resources: [
      { type: "youtube", title: "TypeScript Full Course", url: "#", duration: "4h" },
      { type: "docs", title: "Official TS Handbook", url: "#", duration: "6h" },
      { type: "project", title: "Build: TS REST API", url: "#", duration: "8h" },
    ],
    project: "Build a typed REST API with Express + TypeScript",
    xp: 150,
  },
  {
    week: "Week 3–4",
    title: "System Design Basics",
    status: "in-progress",
    priority: "critical",
    description: "Learn scalability, load balancers, databases, caching, and distributed systems concepts.",
    skills: ["Load Balancing", "CAP Theorem", "Database Sharding", "Caching Strategies"],
    resources: [
      { type: "youtube", title: "System Design Primer", url: "#", duration: "8h" },
      { type: "docs", title: "Designing Data-Intensive Apps", url: "#", duration: "20h" },
      { type: "project", title: "Design: URL Shortener", url: "#", duration: "4h" },
    ],
    project: "Design and diagram a Twitter-like feed system",
    xp: 200,
  },
  {
    week: "Week 5–6",
    title: "Docker & Containerization",
    status: "locked",
    priority: "high",
    description: "Containerize applications with Docker, write docker-compose files, and understand K8s basics.",
    skills: ["Dockerfile", "docker-compose", "Networking", "Kubernetes Basics"],
    resources: [
      { type: "youtube", title: "Docker Mastery Course", url: "#", duration: "6h" },
      { type: "project", title: "Containerize your TS API", url: "#", duration: "4h" },
    ],
    project: "Deploy a full-stack app with Docker Compose",
    xp: 180,
  },
  {
    week: "Week 7–8",
    title: "Redis & Caching",
    status: "locked",
    priority: "high",
    description: "Implement caching strategies, session management, pub/sub, and rate limiting with Redis.",
    skills: ["Data Structures", "Caching Patterns", "Pub/Sub", "Rate Limiting"],
    resources: [
      { type: "docs", title: "Redis University (Free)", url: "#", duration: "10h" },
      { type: "project", title: "Add caching to your API", url: "#", duration: "6h" },
    ],
    project: "Implement Redis caching for a high-traffic endpoint",
    xp: 160,
  },
  {
    week: "Week 9–10",
    title: "GraphQL & API Design",
    status: "locked",
    priority: "medium",
    description: "Master GraphQL schema design, resolvers, subscriptions, and compare with REST patterns.",
    skills: ["Schema Design", "Resolvers", "Subscriptions", "Apollo"],
    resources: [
      { type: "youtube", title: "GraphQL Crash Course", url: "#", duration: "3h" },
      { type: "project", title: "Build: GraphQL API", url: "#", duration: "10h" },
    ],
    project: "Rebuild your REST API in GraphQL with Apollo Server",
    xp: 140,
  },
  {
    week: "Week 11–12",
    title: "CI/CD & DevOps Basics",
    status: "locked",
    priority: "medium",
    description: "Set up automated pipelines with GitHub Actions, understand deployment strategies, and monitoring.",
    skills: ["GitHub Actions", "Deployment Strategies", "Monitoring", "Logging"],
    resources: [
      { type: "docs", title: "GitHub Actions Docs", url: "#", duration: "4h" },
      { type: "project", title: "CI/CD Pipeline Setup", url: "#", duration: "8h" },
    ],
    project: "Build an automated CI/CD pipeline for your project",
    xp: 180,
  },
];

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

export default function RoadmapPage() {
  const [expanded, setExpanded] = useState<string | null>("Week 3–4");

  const totalXP = roadmapData.reduce((acc, r) => r.status === "completed" ? acc + r.xp : acc, 0);
  const completed = roadmapData.filter(r => r.status === "completed").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 6 }}>
            Your Learning Roadmap
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
            AI-generated 12-week path from your current profile to SDE-ready.
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
              <div style={{ fontSize: 18, fontWeight: 800, color: "#6366F1" }}>{completed}/{roadmapData.length}</div>
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
            {Math.round((completed / roadmapData.length) * 100)}%
          </span>
        </div>
        <div className="progress-bar" style={{ height: 10 }}>
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${(completed / roadmapData.length) * 100}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Start: JavaScript Basics</span>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Goal: SDE-1 Ready</span>
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
          {roadmapData.map((item, i) => {
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
