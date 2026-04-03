import { useState } from "react";

const C = {
  // — Sidebar (dark indigo)
  sidebarBg: "#12103A",
  sidebarBorder: "rgba(99,102,241,0.18)",
  sidebarText: "#A5B4FC",
  sidebarActive: "rgba(99,102,241,0.22)",
  sidebarActiveBorder: "#818CF8",
  sidebarActiveText: "#C7D2FE",
  // — Primary (purple/indigo)
  primary: "#6366F1",
  primaryDark: "#4F46E5",
  primaryLight: "#C7D2FE",
  primaryXLight: "#EEF2FF",
  primaryGlow: "rgba(99,102,241,0.2)",
  // — Teal accent (from landing page teal palette — keeps vibe consistent)
  teal: "#0D9488",
  tealLight: "#CCFBF1",
  tealXLight: "#F0FDFA",
  // — Semantic
  amber: "#F59E0B",
  amberLight: "#FEF3C7",
  rose: "#F43F5E",
  roseLight: "#FFE4E6",
  emerald: "#10B981",
  emeraldLight: "#D1FAE5",
  // — Text
  text: "#1E1B4B",
  textMuted: "#6B7FBD",
  textLight: "#A5B4FC",
  // — Surfaces
  white: "#FFFFFF",
  surface: "#F5F4FF",
  surfaceAlt: "#EEF2FF",
  border: "#DDD9FF",
  borderMuted: "#EDEAFF",
};

const FONT_SANS = "'DM Sans', sans-serif";
const FONT_SERIF = "'Fraunces', serif";

const NAV_ITEMS = [
  { id: "dashboard",   label: "Dashboard",       icon: DashIcon },
  { id: "schedule",    label: "My Schedule",      icon: CalIcon },
  { id: "queue",       label: "Patient Queue",    icon: QueueIcon, badge: 5 },
  { id: "appointments",label: "Appointments",     icon: ListIcon },
  { id: "records",     label: "Patient Records",  icon: FolderIcon },
  { id: "prescriptions",label: "Prescriptions",  icon: PillIcon },
  { id: "analytics",   label: "Analytics",        icon: ChartIcon },
  { id: "settings",    label: "Settings",         icon: GearIcon },
];

// — Icons
function DashIcon({ size=16, color="currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="8" height="8" rx="2" fill={color}/><rect x="13" y="3" width="8" height="8" rx="2" fill={color} opacity=".5"/><rect x="3" y="13" width="8" height="8" rx="2" fill={color} opacity=".5"/><rect x="13" y="13" width="8" height="8" rx="2" fill={color} opacity=".3"/></svg>;
}
function CalIcon({ size=16, color="currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="16" rx="3" stroke={color} strokeWidth="1.8"/><path d="M3 10h18M8 3v4M16 3v4" stroke={color} strokeWidth="1.8" strokeLinecap="round"/></svg>;
}
function QueueIcon({ size=16, color="currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="9" cy="7" r="3" stroke={color} strokeWidth="1.8"/><path d="M3 20v-1a6 6 0 0112 0v1" stroke={color} strokeWidth="1.8" strokeLinecap="round"/><path d="M16 3l4 4-4 4M20 7H13" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function ListIcon({ size=16, color="currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke={color} strokeWidth="2" strokeLinecap="round"/></svg>;
}
function FolderIcon({ size=16, color="currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M3 8a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke={color} strokeWidth="1.8"/></svg>;
}
function PillIcon({ size=16, color="currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M10.5 3.5a5 5 0 010 7.07L7.07 14l-4.24-4.24a5 5 0 010-7.07 5 5 0 017.07 0zM13.5 10.5l4.24 4.24a5 5 0 01-7.07 7.07" stroke={color} strokeWidth="1.8" strokeLinecap="round"/></svg>;
}
function ChartIcon({ size=16, color="currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M4 20h16M4 20V10l5-5 4 4 5-5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function GearIcon({ size=16, color="currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.8"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke={color} strokeWidth="1.8"/></svg>;
}
function StethIcon({ size=20, color="currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M4.5 6.5a3 3 0 003 3v4a4.5 4.5 0 009 0v-1a2 2 0 10-1.5 0v1a3 3 0 01-6 0v-4a3 3 0 003-3V3.5h-1.5v1h-3v-1H4.5v3z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function CheckIcon({ size=14, color="#10B981" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
function Sidebar({ active, setActive }) {
  return (
    <aside style={{ width: 240, minWidth: 240, background: C.sidebarBg, display: "flex", flexDirection: "column", borderRight: `1px solid ${C.sidebarBorder}`, height: "100vh", position: "sticky", top: 0 }}>
      <div style={{ padding: "24px 20px 20px", borderBottom: `1px solid ${C.sidebarBorder}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="4" fill="white" opacity=".2"/>
              <path d="M12 8v8M8 12h8" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <p style={{ fontFamily: FONT_SANS, fontWeight: 700, fontSize: 17, color: C.white, margin: 0, letterSpacing: "-0.3px" }}>Health<span style={{ color: C.primaryLight }}>ify</span></p>
            <p style={{ fontFamily: FONT_SANS, fontSize: 11, color: C.sidebarText, margin: 0 }}>Doctor Portal</p>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: "12px 12px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button key={item.id} onClick={() => setActive(item.id)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: "none", background: isActive ? C.sidebarActive : "transparent", borderLeft: isActive ? `3px solid ${C.sidebarActiveBorder}` : "3px solid transparent", cursor: "pointer", transition: "all 0.15s" }}>
              <Icon size={16} color={isActive ? C.primaryLight : C.sidebarText} />
              <span style={{ fontFamily: FONT_SANS, fontSize: 14, fontWeight: isActive ? 600 : 400, color: isActive ? C.sidebarActiveText : C.sidebarText, flex: 1, textAlign: "left" }}>{item.label}</span>
              {item.badge && (
                <span style={{ background: C.rose, color: C.white, fontSize: 11, fontWeight: 700, padding: "1px 6px", borderRadius: 100, fontFamily: FONT_SANS }}>{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: "16px", borderTop: `1px solid ${C.sidebarBorder}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_SANS, fontWeight: 700, fontSize: 14, color: C.white, flexShrink: 0 }}>PM</div>
          <div style={{ overflow: "hidden" }}>
            <p style={{ fontFamily: FONT_SANS, fontWeight: 600, fontSize: 13, color: C.white, margin: 0 }}>Dr. Priya Mehta</p>
            <p style={{ fontFamily: FONT_SANS, fontSize: 11, color: C.sidebarText, margin: 0 }}>Cardiologist</p>
          </div>
        </div>
        <button style={{ width: "100%", padding: "8px 0", borderRadius: 8, border: `1px solid ${C.sidebarBorder}`, background: "transparent", fontFamily: FONT_SANS, fontSize: 13, fontWeight: 500, color: C.sidebarText, cursor: "pointer" }}>Sign out</button>
      </div>
    </aside>
  );
}

// ─── Stat Cards ───────────────────────────────────────────────────────────────
function StatCards() {
  const stats = [
    { label: "Today's Patients", value: "12", sub: "3 remaining", subColor: C.primary, subBg: C.primaryXLight, iconBg: C.primary,
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="7" r="4" stroke="rgba(199,210,254,0.9)" strokeWidth="1.8"/><path d="M3 21v-2a7 7 0 0114 0v2" stroke="rgba(199,210,254,0.9)" strokeWidth="1.8" strokeLinecap="round"/></svg> },
    { label: "Completed Today", value: "9", sub: "On schedule", subColor: C.emerald, subBg: "#D1FAE5", iconBg: C.emerald,
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4" stroke="rgba(209,250,229,0.9)" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="12" r="9" stroke="rgba(209,250,229,0.9)" strokeWidth="1.8"/></svg> },
    { label: "Pending Notes", value: "4", sub: "Write now", subColor: C.amber, subBg: C.amberLight, iconBg: C.amber,
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="rgba(254,243,199,0.9)" strokeWidth="1.8" strokeLinecap="round"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="rgba(254,243,199,0.9)" strokeWidth="1.8" strokeLinecap="round"/></svg> },
    { label: "Free Slots Today", value: "2", sub: "Out of 14", subColor: C.teal, subBg: C.tealXLight, iconBg: C.teal,
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="16" rx="3" stroke="rgba(204,251,241,0.9)" strokeWidth="1.5"/><path d="M3 10h18M8 3v4M16 3v4" stroke="rgba(204,251,241,0.9)" strokeWidth="1.5" strokeLinecap="round"/></svg> },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, padding: "24px 32px 0" }}>
      {stats.map((s, i) => (
        <div key={i} style={{ background: C.white, borderRadius: 16, padding: "18px 16px", border: `1px solid ${C.border}`, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: 70, height: 70, borderRadius: "0 16px 0 70px", background: s.iconBg + "10" }} />
          <div style={{ width: 44, height: 44, borderRadius: 12, background: s.iconBg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>{s.icon}</div>
          <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.textMuted, margin: "0 0 2px" }}>{s.label}</p>
          <p style={{ fontFamily: FONT_SERIF, fontSize: 30, fontWeight: 700, color: C.text, margin: "0 0 6px", lineHeight: 1 }}>{s.value}</p>
          <span style={{ fontFamily: FONT_SANS, fontSize: 11, fontWeight: 600, color: s.subColor, background: s.subBg, padding: "2px 10px", borderRadius: 100 }}>{s.sub}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Today's Schedule Timeline ────────────────────────────────────────────────
function TodaySchedule() {
  const schedule = [
    { time: "9:00 AM", name: "Arjun Sharma", age: 34, reason: "Follow-up ECG", status: "done", statusLabel: "Done" },
    { time: "9:30 AM", name: "Kavya Nair", age: 28, reason: "First visit – chest pain", status: "done", statusLabel: "Done" },
    { time: "10:00 AM", name: "Ravi Pillai", age: 52, reason: "BP monitoring review", status: "done", statusLabel: "Done" },
    { time: "2:30 PM", name: "Sneha Joshi", age: 41, reason: "Cardiology consultation", status: "current", statusLabel: "In progress" },
    { time: "3:15 PM", name: "Mohan Das", age: 60, reason: "Post-surgery check-in", status: "waiting", statusLabel: "Waiting" },
    { time: "4:00 PM", name: "Preethi Iyer", age: 37, reason: "Palpitations workup", status: "upcoming", statusLabel: "Upcoming" },
  ];

  const statusStyles = {
    done:     { color: C.emerald, bg: C.emeraldLight },
    current:  { color: C.primary, bg: C.primaryXLight },
    waiting:  { color: C.amber, bg: C.amberLight },
    upcoming: { color: C.textMuted, bg: C.borderMuted },
  };

  return (
    <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden" }}>
      <div style={{ padding: "18px 20px 14px", borderBottom: `1px solid ${C.borderMuted}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ fontFamily: FONT_SANS, fontWeight: 700, fontSize: 15, color: C.text, margin: 0 }}>Today's Schedule</p>
        <button style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.primary, background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>Full calendar →</button>
      </div>
      {schedule.map((s, i) => {
        const ss = statusStyles[s.status];
        const isCurrent = s.status === "current";
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 20px", borderBottom: i < schedule.length - 1 ? `1px solid ${C.borderMuted}` : "none", background: isCurrent ? C.primaryXLight : "transparent", transition: "background 0.15s" }}>
            <p style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 600, color: isCurrent ? C.primary : C.textMuted, minWidth: 58, margin: 0 }}>{s.time}</p>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: ss.color, flexShrink: 0, boxShadow: isCurrent ? `0 0 0 3px ${C.primaryXLight}, 0 0 0 5px ${C.primary}40` : "none" }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: FONT_SANS, fontWeight: 600, fontSize: 14, color: C.text, margin: 0 }}>{s.name} <span style={{ fontWeight: 400, color: C.textMuted, fontSize: 13 }}>· {s.age}y</span></p>
              <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.textMuted, margin: "2px 0 0" }}>{s.reason}</p>
            </div>
            <span style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 600, color: ss.color, background: ss.bg, padding: "3px 12px", borderRadius: 100 }}>{s.statusLabel}</span>
            {isCurrent && (
              <button style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: C.primary, color: C.white, fontFamily: FONT_SANS, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Open →</button>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Patient Queue ────────────────────────────────────────────────────────────
function PatientQueue() {
  const queue = [
    { pos: 1, name: "Sneha Joshi", wait: "Now", urgent: false, tag: "Cardiology" },
    { pos: 2, name: "Mohan Das", wait: "~10 min", urgent: false, tag: "Post-op" },
    { pos: 3, name: "Preethi Iyer", wait: "~25 min", urgent: true, tag: "Urgent" },
    { pos: 4, name: "Walk-in patient", wait: "~40 min", urgent: false, tag: "General" },
    { pos: 5, name: "Rithvik Menon", wait: "~55 min", urgent: false, tag: "Follow-up" },
  ];

  return (
    <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden" }}>
      <div style={{ padding: "18px 20px 14px", borderBottom: `1px solid ${C.borderMuted}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <p style={{ fontFamily: FONT_SANS, fontWeight: 700, fontSize: 15, color: C.text, margin: 0 }}>Patient Queue</p>
          <span style={{ background: C.rose, color: C.white, fontSize: 11, fontWeight: 700, padding: "1px 8px", borderRadius: 100, fontFamily: FONT_SANS }}>5</span>
        </div>
        <button style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.primary, background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>Manage →</button>
      </div>
      {queue.map((q, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderBottom: i < queue.length - 1 ? `1px solid ${C.borderMuted}` : "none" }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: i === 0 ? C.primary : C.borderMuted, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_SANS, fontWeight: 700, fontSize: 13, color: i === 0 ? C.white : C.textMuted, flexShrink: 0 }}>{q.pos}</div>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: FONT_SANS, fontWeight: 600, fontSize: 13, color: C.text, margin: 0 }}>{q.name}</p>
            <p style={{ fontFamily: FONT_SANS, fontSize: 11, color: C.textMuted, margin: "2px 0 0" }}>Wait: {q.wait}</p>
          </div>
          <span style={{ fontFamily: FONT_SANS, fontSize: 11, fontWeight: 600, color: q.urgent ? C.rose : C.primary, background: q.urgent ? C.roseLight : C.primaryXLight, padding: "2px 10px", borderRadius: 100 }}>{q.tag}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Quick Actions ────────────────────────────────────────────────────────────
function QuickActions() {
  const actions = [
    { label: "Write Prescription", color: C.primary, bg: C.primaryXLight },
    { label: "Add Lab Order", color: C.teal, bg: C.tealXLight },
    { label: "Schedule Follow-up", color: C.amber, bg: C.amberLight },
    { label: "View Lab Results", color: C.emerald, bg: C.emeraldLight },
  ];
  return (
    <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: "18px 20px" }}>
      <p style={{ fontFamily: FONT_SANS, fontWeight: 700, fontSize: 15, color: C.text, margin: "0 0 14px" }}>Quick Actions</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {actions.map((a, i) => (
          <button key={i} style={{ padding: "11px 14px", borderRadius: 10, border: `1px solid ${a.color}30`, background: a.bg, color: a.color, fontFamily: FONT_SANS, fontWeight: 600, fontSize: 13, cursor: "pointer", textAlign: "left" }}>{a.label}</button>
        ))}
      </div>
    </div>
  );
}

// ─── Analytics Mini ───────────────────────────────────────────────────────────
function AnalyticsMini() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const vals = [8, 12, 9, 14, 12, 4];
  const max = Math.max(...vals);
  return (
    <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: "18px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <p style={{ fontFamily: FONT_SANS, fontWeight: 700, fontSize: 15, color: C.text, margin: 0 }}>Patients This Week</p>
        <span style={{ fontFamily: FONT_SERIF, fontSize: 22, fontWeight: 700, color: C.primary }}>59</span>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80 }}>
        {vals.map((v, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ width: "100%", borderRadius: 6, background: i === 4 ? C.primary : C.primaryXLight, height: `${(v / max) * 64}px`, transition: "height 0.3s" }} />
            <span style={{ fontFamily: FONT_SANS, fontSize: 10, color: C.textMuted }}>{days[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Dashboard Main ───────────────────────────────────────────────────────────
function DashboardContent() {
  const now = new Date();
  const hour = now.getHours();
  const greet = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const dayStr = now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short", year: "numeric" });

  return (
    <div style={{ paddingBottom: 40 }}>
      <div style={{ padding: "28px 32px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontFamily: FONT_SERIF, fontSize: 28, fontWeight: 700, color: C.text, margin: 0, letterSpacing: "-0.5px" }}>
            {greet}, Dr. Mehta 🩺
          </h1>
          <p style={{ fontFamily: FONT_SANS, fontSize: 14, color: C.textMuted, margin: "4px 0 0" }}>
            {dayStr} · <strong style={{ color: C.primary }}>3 patients remaining</strong> today
          </p>
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 22px", borderRadius: 12, border: "none", background: C.primary, color: C.white, fontFamily: FONT_SANS, fontWeight: 600, fontSize: 14, cursor: "pointer", boxShadow: `0 6px 20px ${C.primaryGlow}`, flexShrink: 0 }}>
          + New Patient
        </button>
      </div>
      <StatCards />

      {/* Highlight card — Current Patient */}
      <div style={{ margin: "20px 32px 0", borderRadius: 20, padding: "26px 32px", background: `linear-gradient(130deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -50, right: -50, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div style={{ position: "absolute", bottom: -30, right: 100, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
        <p style={{ fontFamily: FONT_SANS, fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", letterSpacing: "1.5px", textTransform: "uppercase", margin: "0 0 10px" }}>Current Patient</p>
        <h2 style={{ fontFamily: FONT_SERIF, fontSize: 24, fontWeight: 700, color: C.white, margin: "0 0 6px" }}>
          Sneha Joshi <span style={{ color: C.primaryLight, fontSize: 18 }}>· 41y · F</span>
        </h2>
        <p style={{ fontFamily: FONT_SANS, fontSize: 14, color: "rgba(255,255,255,0.6)", margin: "0 0 18px" }}>Cardiology consultation · Apollo Clinic, Room 12</p>
        <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
          {[["BP", "130/85 mmHg"], ["HR", "78 bpm"], ["O₂ Sat", "98%"], ["Temp", "98.6°F"]].map(([k, v]) => (
            <div key={k} style={{ background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 14px" }}>
              <p style={{ fontFamily: FONT_SANS, fontSize: 11, color: "rgba(255,255,255,0.5)", margin: "0 0 2px" }}>{k}</p>
              <p style={{ fontFamily: FONT_SANS, fontWeight: 600, fontSize: 14, color: C.white, margin: 0 }}>{v}</p>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {[
            { label: "View Full Record", bg: C.white, color: C.text },
            { label: "Write Prescription", bg: "rgba(255,255,255,0.15)", color: C.white },
            { label: "Add Notes", bg: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" },
          ].map((btn, i) => (
            <button key={i} style={{ padding: "9px 18px", borderRadius: 10, border: "none", background: btn.bg, color: btn.color, fontFamily: FONT_SANS, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>{btn.label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "20px 32px 0", display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <TodaySchedule />
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <PatientQueue />
        </div>
      </div>
      <div style={{ padding: "16px 32px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <QuickActions />
        <AnalyticsMini />
      </div>
    </div>
  );
}

// ─── Schedule Page ────────────────────────────────────────────────────────────
function SchedulePage() {
  return (
    <div>
      <div style={{ padding: "28px 32px 24px" }}>
        <h2 style={{ fontFamily: FONT_SERIF, fontSize: 24, fontWeight: 700, color: C.text, margin: 0 }}>My Schedule</h2>
        <p style={{ fontFamily: FONT_SANS, fontSize: 14, color: C.textMuted, margin: "4px 0 0" }}>Full weekly appointment calendar</p>
      </div>
      <div style={{ padding: "0 32px" }}><TodaySchedule /></div>
    </div>
  );
}

// ─── Patient Records Page ─────────────────────────────────────────────────────
function PatientRecordsPage() {
  const patients = [
    { name: "Arjun Sharma", age: 34, condition: "Hypertension", lastVisit: "Today", avatar: "AS" },
    { name: "Kavya Nair", age: 28, condition: "Chest pain workup", lastVisit: "Today", avatar: "KN" },
    { name: "Ravi Pillai", age: 52, condition: "Type 2 Diabetes + HTN", lastVisit: "Today", avatar: "RP" },
    { name: "Sneha Joshi", age: 41, condition: "Palpitations", lastVisit: "Today", avatar: "SJ" },
    { name: "Preethi Iyer", age: 37, condition: "Post-MI follow-up", lastVisit: "Mar 20", avatar: "PI" },
  ];
  return (
    <div>
      <div style={{ padding: "28px 32px 24px" }}>
        <h2 style={{ fontFamily: FONT_SERIF, fontSize: 24, fontWeight: 700, color: C.text, margin: 0 }}>Patient Records</h2>
        <p style={{ fontFamily: FONT_SANS, fontSize: 14, color: C.textMuted, margin: "4px 0 0" }}>All patients under your care</p>
      </div>
      <div style={{ padding: "0 32px" }}>
        <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}` }}>
          {patients.map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", borderBottom: i < patients.length - 1 ? `1px solid ${C.borderMuted}` : "none" }}>
              <div style={{ width: 42, height: 42, borderRadius: "50%", background: C.primaryXLight, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_SANS, fontWeight: 700, fontSize: 13, color: C.primary, flexShrink: 0 }}>{p.avatar}</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: FONT_SANS, fontWeight: 600, fontSize: 14, color: C.text, margin: 0 }}>{p.name} <span style={{ fontWeight: 400, color: C.textMuted }}>· {p.age}y</span></p>
                <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.textMuted, margin: "2px 0 0" }}>{p.condition} · Last visit: {p.lastVisit}</p>
              </div>
              <button style={{ padding: "7px 16px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", fontFamily: FONT_SANS, fontSize: 12, color: C.primary, cursor: "pointer", fontWeight: 500 }}>View Record</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Analytics Page ───────────────────────────────────────────────────────────
function AnalyticsPage() {
  const months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
  const vals   = [48, 62, 55, 71, 65, 59];
  const max    = Math.max(...vals);
  return (
    <div>
      <div style={{ padding: "28px 32px 24px" }}>
        <h2 style={{ fontFamily: FONT_SERIF, fontSize: 24, fontWeight: 700, color: C.text, margin: 0 }}>Analytics</h2>
        <p style={{ fontFamily: FONT_SANS, fontSize: 14, color: C.textMuted, margin: "4px 0 0" }}>Your practice performance over time</p>
      </div>
      <div style={{ padding: "0 32px", display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: "20px" }}>
          <p style={{ fontFamily: FONT_SANS, fontWeight: 700, fontSize: 15, color: C.text, margin: "0 0 20px" }}>Monthly Patient Volume</p>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 160 }}>
            {vals.map((v, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <span style={{ fontFamily: FONT_SANS, fontSize: 11, color: C.textMuted }}>{v}</span>
                <div style={{ width: "100%", borderRadius: 8, background: i === 5 ? C.primary : C.primaryXLight, height: `${(v / max) * 120}px` }} />
                <span style={{ fontFamily: FONT_SANS, fontSize: 11, color: C.textMuted }}>{months[i]}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[["Avg. patients/day", "11.8", C.primary], ["Avg. consult time", "22 min", C.teal], ["No-show rate", "4.2%", C.amber], ["Patient satisfaction", "4.8 / 5", C.emerald]].map(([label, val, color], i) => (
            <div key={i} style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: "14px 16px" }}>
              <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.textMuted, margin: "0 0 4px" }}>{label}</p>
              <p style={{ fontFamily: FONT_SERIF, fontSize: 24, fontWeight: 700, color, margin: 0 }}>{val}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Queue Page ───────────────────────────────────────────────────────────────
function QueuePage() {
  return (
    <div>
      <div style={{ padding: "28px 32px 24px" }}>
        <h2 style={{ fontFamily: FONT_SERIF, fontSize: 24, fontWeight: 700, color: C.text, margin: 0 }}>Patient Queue</h2>
        <p style={{ fontFamily: FONT_SANS, fontSize: 14, color: C.textMuted, margin: "4px 0 0" }}>Live queue management</p>
      </div>
      <div style={{ padding: "0 32px" }}><PatientQueue /></div>
    </div>
  );
}

// ─── Page Router ─────────────────────────────────────────────────────────────
function PageContent({ active, setActive }) {
  switch (active) {
    case "dashboard":    return <DashboardContent setActive={setActive} />;
    case "schedule":     return <SchedulePage />;
    case "queue":        return <QueuePage />;
    case "appointments": return <SchedulePage />;
    case "records":      return <PatientRecordsPage />;
    case "analytics":    return <AnalyticsPage />;
    default:             return <DashboardContent setActive={setActive} />;
  }
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function DoctorDashboard() {
  const [active, setActive] = useState("dashboard");

  return (
    <div style={{ display: "flex", background: C.surface, minHeight: "100vh", fontFamily: FONT_SANS }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        button { transition: all 0.15s ease; }
        button:hover { opacity: 0.85; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }
      `}</style>
      <Sidebar active={active} setActive={setActive} />
      <main style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>
        <PageContent active={active} setActive={setActive} />
      </main>
    </div>
  );
}