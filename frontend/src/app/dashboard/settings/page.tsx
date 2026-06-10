"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  User, Bell, Shield, Palette, Globe,
  Save, Camera, CheckCircle2, Briefcase,
  GraduationCap, Code
} from "lucide-react";

const tabs = [
  { id: "profile", label: "Profile", icon: <User size={16} /> },
  { id: "notifications", label: "Notifications", icon: <Bell size={16} /> },
  { id: "preferences", label: "Preferences", icon: <Palette size={16} /> },
  { id: "privacy", label: "Privacy", icon: <Shield size={16} /> },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 6 }}>Settings</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>Manage your profile, preferences, and notifications.</p>
      </div>

      <div style={{ display: "flex", gap: 24 }}>
        {/* Tab Nav */}
        <div style={{
          width: 200, flexShrink: 0,
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-xl)", padding: "12px",
          display: "flex", flexDirection: "column", gap: 4, height: "fit-content",
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 14px", borderRadius: "var(--radius-md)",
                background: activeTab === tab.id ? "rgba(99,102,241,0.15)" : "transparent",
                border: activeTab === tab.id ? "1px solid rgba(99,102,241,0.3)" : "1px solid transparent",
                color: activeTab === tab.id ? "var(--text-primary)" : "var(--text-secondary)",
                fontWeight: activeTab === tab.id ? 600 : 400, fontSize: 14,
                cursor: "pointer", transition: "all 0.2s ease", textAlign: "left",
              }}
            >
              <span style={{ color: activeTab === tab.id ? "var(--accent-primary)" : "inherit" }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1 }}>
          {activeTab === "profile" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: "var(--radius-xl)", padding: "32px",
                display: "flex", flexDirection: "column", gap: 28,
              }}
            >
              {/* Avatar */}
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{ position: "relative" }}>
                  <div style={{
                    width: 80, height: 80, borderRadius: "50%",
                    background: "var(--gradient-primary)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 28, fontWeight: 900, color: "white",
                  }}>
                    AS
                  </div>
                  <button style={{
                    position: "absolute", bottom: 0, right: 0,
                    width: 28, height: 28, borderRadius: "50%",
                    background: "var(--accent-primary)", border: "3px solid var(--bg-card)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer",
                  }}>
                    <Camera size={12} color="white" />
                  </button>
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>Abhinav Singh</div>
                  <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>CS • Final Year • SDE Aspirant</div>
                </div>
              </div>

              {/* Form Fields */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {[
                  { label: "Full Name", value: "Abhinav Singh", icon: <User size={15} /> },
                  { label: "Email", value: "abhinav@example.com", icon: <Globe size={15} /> },
                  { label: "University", value: "IIT Roorkee", icon: <GraduationCap size={15} /> },
                  { label: "Graduation Year", value: "2025", icon: <Briefcase size={15} /> },
                ].map((field) => (
                  <div key={field.label}>
                    <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, display: "block", color: "var(--text-secondary)" }}>
                      {field.label}
                    </label>
                    <div style={{ position: "relative" }}>
                      <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
                        {field.icon}
                      </div>
                      <input
                        className="input-field"
                        defaultValue={field.value}
                        style={{ paddingLeft: 36 }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, display: "block", color: "var(--text-secondary)" }}>
                  Target Role
                </label>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {["SDE-1", "Frontend Engineer", "Backend Developer", "Full Stack", "Data Engineer"].map((role) => (
                    <motion.button
                      key={role}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        padding: "7px 16px", borderRadius: 100, fontSize: 13, fontWeight: 600,
                        background: role === "SDE-1" ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.04)",
                        border: `1px solid ${role === "SDE-1" ? "rgba(99,102,241,0.3)" : "var(--border)"}`,
                        color: role === "SDE-1" ? "var(--accent-primary)" : "var(--text-secondary)",
                        cursor: "pointer", transition: "all 0.2s ease",
                      }}
                    >
                      {role}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, display: "block", color: "var(--text-secondary)" }}>
                  Current Skills (comma separated)
                </label>
                <input
                  className="input-field"
                  defaultValue="React, JavaScript, Python, Node.js, MongoDB, Git"
                />
              </div>

              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20, display: "flex", gap: 12 }}>
                <button
                  className="btn-primary"
                  onClick={handleSave}
                  style={{ fontSize: 14, padding: "10px 28px", display: "flex", alignItems: "center", gap: 8 }}
                >
                  {saved ? <><CheckCircle2 size={15} /> Saved!</> : <><Save size={15} /> Save Changes</>}
                </button>
                <button className="btn-secondary" style={{ fontSize: 14, padding: "10px 20px" }}>
                  Cancel
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === "notifications" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: "var(--radius-xl)", padding: "32px",
              }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 24 }}>Notification Preferences</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {[
                  { label: "Weekly Progress Report", desc: "Get a summary of your weekly learning progress", on: true },
                  { label: "Interview Reminders", desc: "Reminders to practice mock interviews", on: true },
                  { label: "New Job Matches", desc: "When new roles match your profile via RAG", on: false },
                  { label: "Roadmap Milestones", desc: "Celebrate when you complete a roadmap week", on: true },
                  { label: "Community Updates", desc: "Tips and success stories from other students", on: false },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 20, borderBottom: i < 4 ? "1px solid var(--border)" : "none" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{item.label}</div>
                      <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{item.desc}</div>
                    </div>
                    <div style={{
                      width: 44, height: 24, borderRadius: 100, cursor: "pointer",
                      background: item.on ? "var(--accent-primary)" : "rgba(255,255,255,0.1)",
                      position: "relative", transition: "all 0.3s ease",
                    }}>
                      <div style={{
                        position: "absolute", top: 3, left: item.on ? 22 : 2,
                        width: 18, height: 18, borderRadius: "50%", background: "white",
                        transition: "left 0.3s ease",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {(activeTab === "preferences" || activeTab === "privacy") && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: "var(--radius-xl)", padding: "32px",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                minHeight: 300, gap: 16,
              }}
            >
              <div style={{ fontSize: 48 }}>{activeTab === "preferences" ? "🎨" : "🔒"}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>{activeTab === "preferences" ? "Preferences" : "Privacy"}</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                {activeTab === "preferences" ? "Theme, language, and display preferences" : "Data privacy and security controls"} — Coming soon
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
