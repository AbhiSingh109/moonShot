"use client";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import {
  TrendingUp, Users, MessageSquare, FileText,
  Target, ArrowUpRight, ArrowDownRight, Calendar,
  Activity, Zap
} from "lucide-react";

const dauData = [
  { day: "Mon", users: 1200, sessions: 3400 },
  { day: "Tue", users: 1900, sessions: 5100 },
  { day: "Wed", users: 1600, sessions: 4200 },
  { day: "Thu", users: 2400, sessions: 6800 },
  { day: "Fri", users: 2100, sessions: 5900 },
  { day: "Sat", users: 1400, sessions: 3200 },
  { day: "Sun", users: 1100, sessions: 2800 },
];

const interviewData = [
  { week: "W1", score: 52, interviews: 2 },
  { week: "W2", score: 58, interviews: 3 },
  { week: "W3", score: 61, interviews: 4 },
  { week: "W4", score: 68, interviews: 3 },
  { week: "W5", score: 71, interviews: 5 },
  { week: "W6", score: 74, interviews: 4 },
  { week: "W7", score: 79, interviews: 6 },
  { week: "W8", score: 83, interviews: 5 },
];

const retentionData = [
  { name: "D1", value: 72 },
  { name: "D7", value: 48 },
  { name: "D14", value: 36 },
  { name: "D30", value: 24 },
];

const skillProgress = [
  { skill: "React", prev: 70, curr: 88 },
  { skill: "TypeScript", prev: 30, curr: 62 },
  { skill: "System Design", prev: 20, curr: 45 },
  { skill: "Node.js", prev: 65, curr: 80 },
  { skill: "Docker", prev: 10, curr: 38 },
];

const funnelData = [
  { stage: "Sign Ups", value: 5000, color: "#6366F1" },
  { stage: "Resume Upload", value: 3200, color: "#8B5CF6" },
  { stage: "Roadmap Generated", value: 2400, color: "#06B6D4" },
  { stage: "Interview Started", value: 1600, color: "#10B981" },
  { stage: "Interview Completed", value: 980, color: "#F59E0B" },
];

const customTooltipStyle = {
  backgroundColor: "#111827",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 8,
  color: "#F8FAFC",
  fontSize: 12,
};

function StatCard({ label, value, change, positive, icon, color }: any) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)", padding: "24px",
        display: "flex", flexDirection: "column", gap: 12,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: `${color}18`, border: `1px solid ${color}30`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color,
        }}>
          {icon}
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 4,
          fontSize: 12, fontWeight: 600,
          color: positive ? "var(--accent-green)" : "var(--accent-red)",
          background: positive ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
          border: `1px solid ${positive ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
          padding: "4px 8px", borderRadius: 100,
        }}>
          {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {change}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-1px" }}>{value}</div>
        <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>{label}</div>
      </div>
    </motion.div>
  );
}

export default function AnalyticsPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 6 }}>
            Product Analytics
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
            Layer 5 — Real-time metrics tracking DAU, feature usage, retention, and your personal progress.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {["7D", "30D", "90D"].map((p, i) => (
            <button key={p} style={{
              padding: "6px 14px", borderRadius: "var(--radius-md)",
              background: i === 0 ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${i === 0 ? "rgba(99,102,241,0.3)" : "var(--border)"}`,
              color: i === 0 ? "var(--accent-primary)" : "var(--text-secondary)",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        <StatCard label="Daily Active Users" value="2,847" change="+12.4%" positive icon={<Users size={20} />} color="#6366F1" />
        <StatCard label="Resume Uploads" value="1,234" change="+8.1%" positive icon={<FileText size={20} />} color="#06B6D4" />
        <StatCard label="Interviews Completed" value="867" change="+23.7%" positive icon={<MessageSquare size={20} />} color="#10B981" />
        <StatCard label="Avg Interview Score" value="71.4" change="+5.2%" positive icon={<Target size={20} />} color="#F59E0B" />
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        {/* DAU Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-xl)", padding: "24px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Daily Active Users</h3>
              <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>This week's platform engagement</p>
            </div>
            <Activity size={18} style={{ color: "var(--accent-primary)" }} />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={dauData}>
              <defs>
                <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="sessionGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: "#475569", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Area type="monotone" dataKey="sessions" stroke="#06B6D4" strokeWidth={2} fill="url(#sessionGrad)" name="Sessions" />
              <Area type="monotone" dataKey="users" stroke="#6366F1" strokeWidth={2} fill="url(#userGrad)" name="Users" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Retention */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-xl)", padding: "24px",
          }}
        >
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>User Retention</h3>
            <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Cohort retention curve</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={retentionData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fill: "#475569", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip contentStyle={customTooltipStyle} formatter={(v) => [`${v}%`, "Retention"]} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {retentionData.map((_, i) => (
                  <Cell key={i} fill={`rgba(99,102,241,${0.9 - i * 0.18})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Interview Score Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-xl)", padding: "24px",
          }}
        >
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Your Interview Score Trend</h3>
            <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>8-week progress tracking</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={interviewData}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6366F1" />
                  <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="week" tick={{ fill: "#475569", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis domain={[40, 100]} tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Line type="monotone" dataKey="score" stroke="url(#scoreGrad)" strokeWidth={3} dot={{ fill: "#6366F1", r: 4 }} activeDot={{ r: 6 }} name="Score" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Feature Funnel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-xl)", padding: "24px",
          }}
        >
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>User Activation Funnel</h3>
            <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Conversion through key features</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {funnelData.map((item, i) => (
              <motion.div key={item.stage} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{item.stage}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: item.color }}>{item.value.toLocaleString()}</span>
                </div>
                <div className="progress-bar">
                  <motion.div
                    className="progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.value / 5000) * 100}%` }}
                    transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                    style={{ background: item.color }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Skill Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-xl)", padding: "24px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Skill Progress (8 Weeks)</h3>
            <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Before vs. After following the roadmap</p>
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center", fontSize: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(99,102,241,0.3)" }} />
              <span style={{ color: "var(--text-secondary)" }}>Before</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: "#6366F1" }} />
              <span style={{ color: "var(--text-secondary)" }}>After</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {skillProgress.map((item, i) => (
            <div key={item.skill}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{item.skill}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                  <span style={{ color: "var(--text-muted)" }}>{item.prev} →</span>
                  <span style={{ color: "var(--accent-green)", fontWeight: 700 }}>{item.curr}</span>
                  <span style={{ color: "var(--accent-green)", fontSize: 11, background: "rgba(16,185,129,0.1)", padding: "2px 6px", borderRadius: 100 }}>
                    +{item.curr - item.prev}
                  </span>
                </div>
              </div>
              <div style={{ position: "relative", height: 8, background: "rgba(255,255,255,0.04)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${item.prev}%`, background: "rgba(99,102,241,0.25)", borderRadius: 4 }} />
                <motion.div
                  initial={{ width: `${item.prev}%` }}
                  animate={{ width: `${item.curr}%` }}
                  transition={{ duration: 1.2, delay: i * 0.1, ease: "easeOut" }}
                  style={{ position: "absolute", left: 0, top: 0, height: "100%", background: "var(--gradient-primary)", borderRadius: 4 }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
