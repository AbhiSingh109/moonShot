"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, LayoutDashboard, FileText, Map, MessageSquare,
  BarChart3, Settings, Bell, Search, ChevronDown,
  LogOut, User
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={18} /> },
  { label: "Resume", href: "/dashboard/resume", icon: <FileText size={18} /> },
  { label: "Roadmap", href: "/dashboard/roadmap", icon: <Map size={18} /> },
  { label: "Mock Interview", href: "/dashboard/interview", icon: <MessageSquare size={18} /> },
  { label: "Analytics", href: "/dashboard/analytics", icon: <BarChart3 size={18} /> },
  { label: "Settings", href: "/dashboard/settings", icon: <Settings size={18} /> },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary)" }}>
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{
          width: 260, flexShrink: 0, height: "100vh", position: "sticky", top: 0,
          background: "var(--bg-secondary)", borderRight: "1px solid var(--border)",
          display: "flex", flexDirection: "column", padding: "24px 16px",
          overflow: "hidden",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px", marginBottom: 36 }}>
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

        {/* User Profile Mini */}
        <div style={{
          background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)",
          borderRadius: "var(--radius-md)", padding: "12px 14px",
          display: "flex", alignItems: "center", gap: 10, marginBottom: 28, cursor: "pointer",
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "var(--gradient-primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 700, color: "white", flexShrink: 0,
          }}>AS</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Abhinav Singh</div>
            <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>CS • Final Year</div>
          </div>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "var(--accent-green)", boxShadow: "0 0 8px var(--accent-green)",
          }} />
        </div>

        {/* Nav Links */}
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
                <motion.div
                  whileHover={{ x: 4 }}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 14px", borderRadius: "var(--radius-md)",
                    background: isActive ? "rgba(99,102,241,0.15)" : "transparent",
                    border: isActive ? "1px solid rgba(99,102,241,0.3)" : "1px solid transparent",
                    color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                    fontWeight: isActive ? 600 : 400, fontSize: 14,
                    transition: "all 0.2s ease", cursor: "pointer",
                  }}
                >
                  <span style={{ color: isActive ? "var(--accent-primary)" : "inherit" }}>{item.icon}</span>
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "var(--accent-primary)" }}
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Upgrade Banner */}
        <div style={{
          background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))",
          border: "1px solid rgba(99,102,241,0.3)",
          borderRadius: "var(--radius-md)", padding: "16px",
          marginTop: 16,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>🚀 Upgrade to Pro</div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 12 }}>
            Unlock unlimited mock interviews & AI roadmap updates
          </div>
          <button className="btn-primary" style={{ width: "100%", padding: "8px", fontSize: 12 }}>
            Upgrade Now
          </button>
        </div>

        {/* Logout */}
        <button style={{
          display: "flex", alignItems: "center", gap: 10, marginTop: 12,
          padding: "10px 14px", borderRadius: "var(--radius-md)",
          background: "transparent", border: "none", color: "var(--text-secondary)",
          fontSize: 14, cursor: "pointer", transition: "all 0.2s", width: "100%",
        }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; e.currentTarget.style.color = "#FCA5A5"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; }}
        >
          <LogOut size={16} /> Sign Out
        </button>
      </motion.aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top Bar */}
        <header style={{
          height: 64, borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 32px", background: "var(--bg-secondary)",
          position: "sticky", top: 0, zIndex: 50,
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)", padding: "8px 14px", width: 280,
          }}>
            <Search size={14} style={{ color: "var(--text-muted)" }} />
            <input
              placeholder="Search skills, jobs, resources..."
              style={{
                background: "transparent", border: "none", outline: "none",
                color: "var(--text-primary)", fontSize: 13, width: "100%",
                fontFamily: "Inter, sans-serif",
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ position: "relative" }}>
              <Bell size={18} style={{ color: "var(--text-secondary)", cursor: "pointer" }} />
              <div style={{
                position: "absolute", top: -4, right: -4,
                width: 10, height: 10, borderRadius: "50%",
                background: "var(--accent-primary)", border: "2px solid var(--bg-secondary)",
              }} />
            </div>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "var(--gradient-primary)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 700, color: "white", cursor: "pointer",
            }}>
              AS
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, overflow: "auto", padding: "32px" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
