"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  FileText, Map, MessageSquare, BarChart3,
  TrendingUp, Target, CheckCircle2, Clock,
  ArrowRight, Sparkles, Zap, Award,
  AlertCircle, BookOpen, Code, Brain
} from "lucide-react";

// Mock data for the dashboard
const skillScore = 68;
const atsScore = 74;
const interviewScore = 61;

const skillGaps = [
  { skill: "System Design", priority: "High", demand: 94 },
  { skill: "TypeScript", priority: "High", demand: 89 },
  { skill: "Docker & K8s", priority: "Medium", demand: 78 },
  { skill: "GraphQL", priority: "Medium", demand: 65 },
  { skill: "Redis", priority: "Low", demand: 58 },
];

const recentActivity = [
  { action: "Completed Mock Interview", time: "2h ago", icon: <MessageSquare size={14} />, color: "#6366F1" },
  { action: "Updated Roadmap Week 3", time: "1d ago", icon: <Map size={14} />, color: "#8B5CF6" },
  { action: "Resume Re-analyzed", time: "2d ago", icon: <FileText size={14} />, color: "#06B6D4" },
  { action: "Completed: React Advanced", time: "3d ago", icon: <CheckCircle2 size={14} />, color: "#10B981" },
];

const upcomingTasks = [
  { task: "Complete LeetCode Medium - Arrays", due: "Today", done: false },
  { task: "Watch: System Design Basics", due: "Tomorrow", done: false },
  { task: "Build: Full-Stack To-Do App", due: "This Week", done: true },
  { task: "Mock Interview: Backend Role", due: "This Week", done: false },
];

function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ position: "relative", width: 100, height: 100 }}>
        <svg width="100" height="100" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <motion.circle
            cx="50" cy="50" r={radius}
            fill="none" stroke={color} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
            style={{ filter: `drop-shadow(0 0 6px ${color}60)` }}
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0, display: "flex",
          alignItems: "center", justifyContent: "center",
          flexDirection: "column",
        }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)" }}>{score}</span>
        </div>
      </div>
      <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>{label}</span>
    </div>
  );
}

export default function DashboardHome() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1), rgba(6,182,212,0.08))",
          border: "1px solid rgba(99,102,241,0.25)",
          borderRadius: "var(--radius-xl)", padding: "28px 32px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          position: "relative", overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          <div className="orb" style={{ width: 300, height: 300, background: "#6366F1", top: -100, right: -50, opacity: 0.06 }} />
        </div>
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Sparkles size={16} style={{ color: "var(--accent-primary)" }} />
            <span style={{ fontSize: 13, color: "var(--accent-primary)", fontWeight: 600 }}>AI Analysis Ready</span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 6 }}>
            Welcome back, Abhinav 👋
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
            Your placement probability increased by <span style={{ color: "var(--accent-green)", fontWeight: 700 }}>+7%</span> this week. Keep it up!
          </p>
        </div>
        <div style={{ display: "flex", gap: 20, position: "relative" }}>
          <ScoreRing score={skillScore} label="Skill Score" color="#6366F1" />
          <ScoreRing score={atsScore} label="ATS Score" color="#06B6D4" />
          <ScoreRing score={interviewScore} label="Interview" color="#10B981" />
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {[
          { label: "Analyze Resume", desc: "Upload & get AI feedback", icon: <FileText size={20} />, color: "#6366F1", href: "/dashboard/resume" },
          { label: "View Roadmap", desc: "Your learning path", icon: <Map size={20} />, color: "#8B5CF6", href: "/dashboard/roadmap" },
          { label: "Mock Interview", desc: "Practice with AI", icon: <MessageSquare size={20} />, color: "#06B6D4", href: "/dashboard/interview" },
          { label: "Analytics", desc: "Track progress", icon: <BarChart3 size={20} />, color: "#10B981", href: "/dashboard/analytics" },
        ].map((action, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -4, borderColor: action.color + "50" }}
          >
            <Link href={action.href} style={{ textDecoration: "none" }}>
              <div style={{
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)", padding: "20px",
                cursor: "pointer", transition: "all 0.3s ease",
                display: "flex", flexDirection: "column", gap: 10,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: `${action.color}18`, border: `1px solid ${action.color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: action.color,
                }}>
                  {action.icon}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>{action.label}</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{action.desc}</div>
                </div>
                <ArrowRight size={14} style={{ color: "var(--text-muted)", marginTop: "auto" }} />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* 3-column grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
        {/* Skill Gaps */}
        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-xl)", padding: "24px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
              <Target size={16} style={{ color: "var(--accent-primary)" }} /> Skill Gaps
            </h3>
            <Link href="/dashboard/resume" style={{ fontSize: 12, color: "var(--accent-primary)", textDecoration: "none" }}>
              View All →
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {skillGaps.map((gap, i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{gap.skill}</span>
                  <span className={`badge ${gap.priority === "High" ? "badge-red" : gap.priority === "Medium" ? "badge-amber" : "badge-green"}`} style={{ fontSize: 10, padding: "2px 8px" }}>
                    {gap.priority}
                  </span>
                </div>
                <div className="progress-bar">
                  <motion.div
                    className="progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${gap.demand}%` }}
                    transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                  />
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>{gap.demand}% market demand</div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-xl)", padding: "24px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
              <CheckCircle2 size={16} style={{ color: "var(--accent-green)" }} /> Tasks
            </h3>
            <Link href="/dashboard/roadmap" style={{ fontSize: 12, color: "var(--accent-primary)", textDecoration: "none" }}>
              Roadmap →
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {upcomingTasks.map((task, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  padding: "10px 12px",
                  background: task.done ? "rgba(16,185,129,0.05)" : "rgba(255,255,255,0.02)",
                  borderRadius: "var(--radius-md)",
                  border: `1px solid ${task.done ? "rgba(16,185,129,0.2)" : "var(--border)"}`,
                  opacity: task.done ? 0.6 : 1,
                }}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: "50%", flexShrink: 0, marginTop: 1,
                  border: `2px solid ${task.done ? "var(--accent-green)" : "var(--border)"}`,
                  background: task.done ? "var(--accent-green)" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {task.done && <CheckCircle2 size={10} color="white" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, textDecoration: task.done ? "line-through" : "none", color: task.done ? "var(--text-muted)" : "var(--text-primary)" }}>
                    {task.task}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                    <Clock size={10} /> {task.due}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-xl)", padding: "24px",
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <Zap size={16} style={{ color: "var(--accent-amber)" }} /> Recent Activity
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {recentActivity.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                style={{ display: "flex", alignItems: "center", gap: 12 }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: `${item.color}18`, border: `1px solid ${item.color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: item.color,
                }}>
                  {item.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{item.action}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{item.time}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* AI Tip */}
          <div style={{
            marginTop: 20, padding: "14px",
            background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)",
            borderRadius: "var(--radius-md)",
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent-primary)", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
              <Brain size={12} /> AI Insight
            </div>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Students who complete 3+ mock interviews have a <strong style={{ color: "var(--text-primary)" }}>2.8x higher</strong> chance of clearing technical rounds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
