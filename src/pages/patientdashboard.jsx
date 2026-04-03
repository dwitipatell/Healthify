import { useState } from "react";

const C = {
  // — Sidebar
  sidebarBg: "#0D2926",
  sidebarBorder: "rgba(13,148,136,0.18)",
  sidebarText: "#9DC5C0",
  sidebarActive: "rgba(13,148,136,0.22)",
  sidebarActiveBorder: "#0D9488",
  sidebarActiveText: "#CCFBF1",
  // — Brand / Primary (green)
  primary: "#0D9488",
  primaryDark: "#0F766E",
  primaryLight: "#CCFBF1",
  primaryXLight: "#F0FDFA",
  primaryGlow: "rgba(13,148,136,0.15)",
  // — Accents
  accent: "#6366F1",
  accentLight: "#EEF2FF",
  amber: "#F59E0B",
  amberLight: "#FEF3C7",
  rose: "#F43F5E",
  roseLight: "#FFE4E6",
  emerald: "#10B981",
  // — Text
  text: "#0F2422",
  textMuted: "#4B7B76",
  textLight: "#7CA8A4",
  // — Surfaces
  white: "#FFFFFF",
  surface: "#F8FFFE",
  surfaceAlt: "#F0FDFA",
  border: "#D1F0EC",
  borderMuted: "#E5F7F5",
};

const FONT_SANS = "'DM Sans', sans-serif";
const FONT_SERIF = "'Fraunces', serif";

const NAV_ITEMS = [
  { id: "dashboard",    label: "Dashboard",         icon: DashIcon },
  { id: "book",         label: "Book Appointment",  icon: CalIcon },
  { id: "appointments", label: "My Appointments",   icon: ListIcon },
  { id: "records",      label: "Health Records",    icon: FolderIcon },
  { id: "prescriptions",label: "Prescriptions",     icon: PillIcon },
  { id: "notifications",label: "Notifications",     icon: BellIcon, badge: 3 },
  { id: "settings",     label: "Settings",          icon: GearIcon },
];

// — SVG Icons
function DashIcon({ size=16, color="currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="8" height="8" rx="2" fill={color}/><rect x="13" y="3" width="8" height="8" rx="2" fill={color} opacity=".5"/><rect x="3" y="13" width="8" height="8" rx="2" fill={color} opacity=".5"/><rect x="13" y="13" width="8" height="8" rx="2" fill={color} opacity=".3"/></svg>;
}
function CalIcon({ size=16, color="currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="16" rx="3" stroke={color} strokeWidth="1.8"/><path d="M3 10h18M8 3v4M16 3v4" stroke={color} strokeWidth="1.8" strokeLinecap="round"/></svg>;
}
function ListIcon({ size=16, color="currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke={color} strokeWidth="2" strokeLinecap="round"/></svg>;
}
function FolderIcon({ size=16, color="currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M3 8a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke={color} strokeWidth="1.8"/></svg>;
}
function PillIcon({ size=16, color="currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M10.5 3.5a5 5 0 010 7.07L7.07 14l-4.24-4.24a5 5 0 010-7.07 5 5 0 017.07 0zM13.5 10.5l4.24 4.24a5 5 0 01-7.07 7.07L6.43 17.57" stroke={color} strokeWidth="1.8" strokeLinecap="round"/></svg>;
}
function BellIcon({ size=16, color="currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M15 17H9v1a3 3 0 006 0v-1zm-3-13a6 6 0 016 6v3l2 2H4l2-2v-3a6 6 0 016-6z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function GearIcon({ size=16, color="currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.8"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke={color} strokeWidth="1.8"/></svg>;
}
function CheckIcon({ size=14, color=C.emerald }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function ClockIcon({ size=14, color=C.textMuted }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8"/><path d="M12 7v5l3 3" stroke={color} strokeWidth="1.8" strokeLinecap="round"/></svg>;
}
function PinIcon({ size=14, color=C.rose }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill={color}/></svg>;
}

// ─── Sidebar ────────────────────────────────────────────────────────────────
function Sidebar({ active, setActive }) {
  return (
    <aside style={{
      width: 240, minWidth: 240,
      background: C.sidebarBg,
      display: "flex", flexDirection: "column",
      borderRight: `1px solid ${C.sidebarBorder}`,
      height: "100vh", position: "sticky", top: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: "24px 20px 20px", borderBottom: `1px solid ${C.sidebarBorder}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="4" fill="white" opacity=".2"/>
              <path d="M12 8v8M8 12h8" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <p style={{ fontFamily: FONT_SANS, fontWeight: 700, fontSize: 17, color: C.white, margin: 0, letterSpacing: "-0.3px" }}>
              Health<span style={{ color: C.primaryLight }}>ify</span>
            </p>
            <p style={{ fontFamily: FONT_SANS, fontSize: 11, color: C.sidebarText, margin: 0 }}>Patient Portal</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 12px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button key={item.id} onClick={() => setActive(item.id)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 10, border: "none",
                background: isActive ? C.sidebarActive : "transparent",
                borderLeft: isActive ? `3px solid ${C.sidebarActiveBorder}` : "3px solid transparent",
                cursor: "pointer", position: "relative",
                transition: "all 0.15s",
              }}>
              <span style={{ color: isActive ? C.primaryLight : C.sidebarText, flexShrink: 0 }}>
                <Icon size={16} color={isActive ? C.primaryLight : C.sidebarText} />
              </span>
              <span style={{ fontFamily: FONT_SANS, fontSize: 14, fontWeight: isActive ? 600 : 400, color: isActive ? C.sidebarActiveText : C.sidebarText, flex: 1, textAlign: "left" }}>
                {item.label}
              </span>
              {item.badge && (
                <span style={{ background: C.rose, color: C.white, fontSize: 11, fontWeight: 700, padding: "1px 6px", borderRadius: 100, fontFamily: FONT_SANS }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div style={{ padding: "16px", borderTop: `1px solid ${C.sidebarBorder}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_SANS, fontWeight: 700, fontSize: 14, color: C.white, flexShrink: 0 }}>US</div>
          <div style={{ overflow: "hidden" }}>
            <p style={{ fontFamily: FONT_SANS, fontWeight: 600, fontSize: 13, color: C.white, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Patient</p>
            <p style={{ fontFamily: FONT_SANS, fontSize: 11, color: C.sidebarText, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>usertest101@gmail.com</p>
          </div>
        </div>
        <button style={{ width: "100%", padding: "8px 0", borderRadius: 8, border: `1px solid ${C.sidebarBorder}`, background: "transparent", fontFamily: FONT_SANS, fontSize: 13, fontWeight: 500, color: C.sidebarText, cursor: "pointer" }}>Sign out</button>
      </div>
    </aside>
  );
}

// ─── Top Bar ─────────────────────────────────────────────────────────────────
function TopBar({ onBook }) {
  const now = new Date();
  const dayStr = now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short", year: "numeric" });
  const hour = now.getHours();
  const greet = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const emoji = hour < 12 ? "👋" : hour < 17 ? "☀️" : "🌙";

  return (
    <div style={{ padding: "28px 32px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <h1 style={{ fontFamily: FONT_SERIF, fontSize: 28, fontWeight: 700, color: C.text, margin: 0, letterSpacing: "-0.5px" }}>
          {greet} {emoji}
        </h1>
        <p style={{ fontFamily: FONT_SANS, fontSize: 14, color: C.textMuted, margin: "4px 0 0" }}>
          {dayStr} · Your next appointment is <strong style={{ color: C.primary }}>today</strong>
        </p>
      </div>
      <button onClick={onBook} style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 22px", borderRadius: 12, border: "none", background: C.primary, color: C.white, fontFamily: FONT_SANS, fontWeight: 600, fontSize: 14, cursor: "pointer", boxShadow: `0 6px 20px ${C.primaryGlow}`, flexShrink: 0 }}>
        <span style={{ fontSize: 16 }}>+</span> Book Appointment
      </button>
    </div>
  );
}

// ─── Stat Cards ───────────────────────────────────────────────────────────────
function StatCards() {
  const stats = [
    {
      label: "Upcoming", value: "2", sub: "This week", subColor: C.primary, subBg: C.primaryXLight,
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="16" rx="3" stroke={C.primaryLight} strokeWidth="1.5"/><path d="M3 10h18M8 3v4M16 3v4" stroke={C.primaryLight} strokeWidth="1.5" strokeLinecap="round"/></svg>,
      iconBg: C.primary,
    },
    {
      label: "Completed", value: "14", sub: "All time", subColor: C.emerald, subBg: "#D1FAE5",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M9 11l3 3L22 4" stroke="#D1FAE5" strokeWidth="2" strokeLinecap="round"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="#D1FAE5" strokeWidth="1.8" strokeLinecap="round"/></svg>,
      iconBg: C.emerald,
    },
    {
      label: "Active Rx", value: "3", sub: "1 refill due", subColor: C.amber, subBg: C.amberLight,
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M10.5 3.5a5 5 0 010 7.07L7.07 14l-4.24-4.24a5 5 0 010-7.07 5 5 0 017.07 0zM13.5 10.5l4.24 4.24a5 5 0 01-7.07 7.07L6.43 17.57" stroke={C.amberLight} strokeWidth="1.8" strokeLinecap="round"/></svg>,
      iconBg: C.amber,
    },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, padding: "24px 32px 0" }}>
      {stats.map((s, i) => (
        <div key={i} style={{ background: C.white, borderRadius: 16, padding: "20px 20px", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 16, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, borderRadius: "0 16px 0 80px", background: s.iconBg + "12" }} />
          <div style={{ width: 48, height: 48, borderRadius: 12, background: s.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {s.icon}
          </div>
          <div>
            <p style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.textMuted, margin: "0 0 2px" }}>{s.label}</p>
            <p style={{ fontFamily: FONT_SERIF, fontSize: 32, fontWeight: 700, color: C.text, margin: "0 0 6px", lineHeight: 1 }}>{s.value}</p>
            <span style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 600, color: s.subColor, background: s.subBg, padding: "2px 10px", borderRadius: 100 }}>{s.sub}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Next Appointment Hero ────────────────────────────────────────────────────
function NextAppointment() {
  return (
    <div style={{ margin: "20px 32px 0", borderRadius: 20, padding: "28px 32px", background: `linear-gradient(130deg, #0F4C46 0%, #0D6B62 50%, #1565C0 100%)`, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
      <div style={{ position: "absolute", bottom: -30, right: 80, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

      <p style={{ fontFamily: FONT_SANS, fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.55)", letterSpacing: "1.5px", textTransform: "uppercase", margin: "0 0 10px" }}>Next Appointment</p>
      <h2 style={{ fontFamily: FONT_SERIF, fontSize: 26, fontWeight: 700, color: C.white, margin: "0 0 6px", letterSpacing: "-0.5px" }}>
        Dr. Priya Mehta — <span style={{ color: C.primaryLight }}>Cardiology</span>
      </h2>
      <p style={{ fontFamily: FONT_SANS, fontSize: 14, color: "rgba(255,255,255,0.65)", margin: "0 0 20px" }}>Apollo Clinic · Floor 3, Room 12</p>

      <div style={{ display: "flex", gap: 24, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8"/><path d="M12 7v5l3 3" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" strokeLinecap="round"/></svg>, text: "Today, 2:30 PM" },
          { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 2a10 10 0 100 20" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8"/><path d="M12 6v6l3 2" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" strokeLinecap="round"/></svg>, text: "30 min" },
          { icon: <PinIcon size={15} color="rgba(255,255,255,0.7)" />, text: "In-person" },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {item.icon}
            <span style={{ fontFamily: FONT_SANS, fontSize: 14, color: "rgba(255,255,255,0.8)" }}>{item.text}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        {[
          { label: "View Details", bg: C.white, color: C.text },
          { label: "Reschedule", bg: "rgba(255,255,255,0.15)", color: C.white },
          { label: "Cancel", bg: "rgba(244,63,94,0.25)", color: "#FCA5A5" },
        ].map((btn, i) => (
          <button key={i} style={{ padding: "9px 20px", borderRadius: 10, border: "none", background: btn.bg, color: btn.color, fontFamily: FONT_SANS, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Appointments List ────────────────────────────────────────────────────────
function UpcomingAppointments() {
  const appts = [
    { date: "Today", time: "2:30 PM", dot: C.primary, name: "Dr. Priya Mehta", dept: "Cardiology", clinic: "Apollo Clinic", status: "Confirmed", statusColor: C.primary, statusBg: C.primaryXLight },
    { date: "Mon", time: "10:00 AM", dot: C.amber, name: "Dr. Suresh Iyer", dept: "Dermatology", clinic: "Skin Care Hub", status: "Pending", statusColor: C.amber, statusBg: C.amberLight },
    { date: "Wed", time: "3:15 PM", dot: C.emerald, name: "Dr. Anita Roy", dept: "General Physician", clinic: "City Health Clinic", status: "Confirmed", statusColor: C.emerald, statusBg: "#D1FAE5" },
    { date: "Apr 12", time: "11:00 AM", dot: C.accent, name: "Dr. Kabir Sen", dept: "Neurology", clinic: "Brain & Spine Centre", status: "Confirmed", statusColor: C.accent, statusBg: C.accentLight },
  ];

  return (
    <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden" }}>
      <div style={{ padding: "18px 20px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${C.borderMuted}` }}>
        <p style={{ fontFamily: FONT_SANS, fontWeight: 700, fontSize: 15, color: C.text, margin: 0, letterSpacing: "-0.2px" }}>Upcoming Appointments</p>
        <button style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.primary, background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>View all →</button>
      </div>
      <div>
        {appts.map((a, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderBottom: i < appts.length - 1 ? `1px solid ${C.borderMuted}` : "none" }}>
            <div style={{ textAlign: "center", minWidth: 42 }}>
              <p style={{ fontFamily: FONT_SANS, fontSize: 11, color: C.textMuted, margin: 0 }}>{a.date}</p>
              <p style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 600, color: C.text, margin: "2px 0 0" }}>{a.time}</p>
            </div>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: a.dot, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: FONT_SANS, fontWeight: 600, fontSize: 14, color: C.text, margin: 0 }}>{a.name}</p>
              <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.textMuted, margin: "2px 0 0" }}>{a.dept} · {a.clinic}</p>
            </div>
            <span style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 600, color: a.statusColor, background: a.statusBg, padding: "3px 12px", borderRadius: 100 }}>{a.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Notifications ────────────────────────────────────────────────────────────
function Notifications() {
  const notes = [
    { dot: C.primary, msg: "Reminder: Appointment with Dr. Mehta at 2:30 PM today", time: "10 min ago" },
    { dot: C.amber, msg: "Prescription refill due: Metformin 500mg", time: "Yesterday" },
    { dot: C.emerald, msg: "Lab report ready: Blood test (CBC)", time: "2 days ago" },
    { dot: C.accent, msg: "Dr. Kabir Sen confirmed your Apr 12 slot", time: "3 days ago" },
  ];

  return (
    <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden" }}>
      <div style={{ padding: "18px 20px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${C.borderMuted}` }}>
        <p style={{ fontFamily: FONT_SANS, fontWeight: 700, fontSize: 15, color: C.text, margin: 0 }}>Notifications</p>
        <button style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.primary, background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>Mark all read</button>
      </div>
      {notes.map((n, i) => (
        <div key={i} style={{ display: "flex", gap: 12, padding: "14px 20px", borderBottom: i < notes.length - 1 ? `1px solid ${C.borderMuted}` : "none", alignItems: "flex-start" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: n.dot, marginTop: 6, flexShrink: 0 }} />
          <div>
            <p style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.text, margin: 0, lineHeight: 1.5 }}>{n.msg}</p>
            <p style={{ fontFamily: FONT_SANS, fontSize: 11, color: C.textLight, margin: "4px 0 0" }}>{n.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Health Records Page ──────────────────────────────────────────────────────
function HealthRecordsPage() {
  const records = [
    { type: "Blood Test (CBC)", date: "Mar 28, 2026", doctor: "Dr. Anita Roy", status: "Normal", statusColor: C.emerald, statusBg: "#D1FAE5" },
    { type: "ECG Report", date: "Feb 14, 2026", doctor: "Dr. Priya Mehta", status: "Review needed", statusColor: C.amber, statusBg: C.amberLight },
    { type: "Chest X-Ray", date: "Jan 5, 2026", doctor: "Dr. Rohan Nair", status: "Normal", statusColor: C.emerald, statusBg: "#D1FAE5" },
    { type: "Diabetes Panel", date: "Dec 12, 2025", doctor: "Dr. Anita Roy", status: "Borderline", statusColor: C.rose, statusBg: "#FFE4E6" },
  ];
  return (
    <div>
      <div style={{ padding: "28px 32px 0", marginBottom: 24 }}>
        <h2 style={{ fontFamily: FONT_SERIF, fontSize: 24, fontWeight: 700, color: C.text, margin: 0 }}>Health Records</h2>
        <p style={{ fontFamily: FONT_SANS, fontSize: 14, color: C.textMuted, margin: "4px 0 0" }}>All your medical reports and documents in one place</p>
      </div>
      <div style={{ padding: "0 32px" }}>
        <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}` }}>
          {records.map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", borderBottom: i < records.length - 1 ? `1px solid ${C.borderMuted}` : "none" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: C.primaryXLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <FolderIcon size={20} color={C.primary} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: FONT_SANS, fontWeight: 600, fontSize: 14, color: C.text, margin: 0 }}>{r.type}</p>
                <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.textMuted, margin: "2px 0 0" }}>{r.date} · {r.doctor}</p>
              </div>
              <span style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 600, color: r.statusColor, background: r.statusBg, padding: "3px 12px", borderRadius: 100 }}>{r.status}</span>
              <button style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", fontFamily: FONT_SANS, fontSize: 12, color: C.primary, cursor: "pointer", fontWeight: 500 }}>Download</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Prescriptions Page ───────────────────────────────────────────────────────
function PrescriptionsPage() {
  const rxList = [
    { name: "Metformin 500mg", freq: "Twice daily", doctor: "Dr. Anita Roy", refill: "Due in 3 days", urgent: true },
    { name: "Amlodipine 5mg", freq: "Once daily (morning)", doctor: "Dr. Priya Mehta", refill: "30 days left", urgent: false },
    { name: "Cetirizine 10mg", freq: "As needed", doctor: "Dr. Suresh Iyer", refill: "15 days left", urgent: false },
  ];
  return (
    <div>
      <div style={{ padding: "28px 32px 0", marginBottom: 24 }}>
        <h2 style={{ fontFamily: FONT_SERIF, fontSize: 24, fontWeight: 700, color: C.text, margin: 0 }}>Prescriptions</h2>
        <p style={{ fontFamily: FONT_SANS, fontSize: 14, color: C.textMuted, margin: "4px 0 0" }}>Your active medications and refill schedule</p>
      </div>
      <div style={{ padding: "0 32px", display: "flex", flexDirection: "column", gap: 12 }}>
        {rxList.map((r, i) => (
          <div key={i} style={{ background: C.white, borderRadius: 16, border: `1px solid ${r.urgent ? C.amber : C.border}`, padding: "18px 20px", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: r.urgent ? C.amberLight : C.primaryXLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <PillIcon size={20} color={r.urgent ? C.amber : C.primary} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: FONT_SANS, fontWeight: 700, fontSize: 15, color: C.text, margin: 0 }}>{r.name}</p>
              <p style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.textMuted, margin: "3px 0 0" }}>{r.freq} · {r.doctor}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 600, color: r.urgent ? C.amber : C.emerald, background: r.urgent ? C.amberLight : "#D1FAE5", padding: "3px 12px", borderRadius: 100 }}>{r.refill}</span>
              {r.urgent && <p style={{ fontFamily: FONT_SANS, fontSize: 11, color: C.amber, margin: "6px 0 0", textAlign: "right" }}>Request refill →</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Book Appointment Page ────────────────────────────────────────────────────
function BookAppointmentPage() {
  const [selected, setSelected] = useState(null);
  const doctors = [
    { name: "Dr. Priya Mehta", dept: "Cardiology", exp: "12 yrs", rating: "4.9", initials: "PM", color: C.primary },
    { name: "Dr. Suresh Iyer", dept: "Dermatology", exp: "8 yrs", rating: "4.7", initials: "SI", color: C.accent },
    { name: "Dr. Anita Roy", dept: "General Physician", exp: "15 yrs", rating: "4.8", initials: "AR", color: C.amber },
    { name: "Dr. Kabir Sen", dept: "Neurology", exp: "10 yrs", rating: "4.6", initials: "KS", color: C.rose },
  ];
  const slots = ["9:00 AM", "9:30 AM", "10:00 AM", "11:00 AM", "2:00 PM", "2:30 PM", "3:15 PM", "4:00 PM"];

  return (
    <div>
      <div style={{ padding: "28px 32px 0", marginBottom: 24 }}>
        <h2 style={{ fontFamily: FONT_SERIF, fontSize: 24, fontWeight: 700, color: C.text, margin: 0 }}>Book Appointment</h2>
        <p style={{ fontFamily: FONT_SANS, fontSize: 14, color: C.textMuted, margin: "4px 0 0" }}>Choose a doctor, pick a date and time</p>
      </div>
      <div style={{ padding: "0 32px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          <p style={{ fontFamily: FONT_SANS, fontWeight: 600, fontSize: 13, color: C.textMuted, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 12 }}>Select Doctor</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {doctors.map((d, i) => (
              <div key={i} onClick={() => setSelected(i)} style={{ background: C.white, border: `1.5px solid ${selected === i ? C.primary : C.border}`, borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", transition: "all 0.15s" }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: d.color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_SANS, fontWeight: 700, fontSize: 13, color: d.color, flexShrink: 0 }}>{d.initials}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: FONT_SANS, fontWeight: 600, fontSize: 14, color: C.text, margin: 0 }}>{d.name}</p>
                  <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.textMuted, margin: "2px 0 0" }}>{d.dept} · {d.exp} exp · ★ {d.rating}</p>
                </div>
                {selected === i && <CheckIcon size={18} color={C.primary} />}
              </div>
            ))}
          </div>
        </div>
        <div>
          <p style={{ fontFamily: FONT_SANS, fontWeight: 600, fontSize: 13, color: C.textMuted, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 12 }}>Available Slots — Today</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 20 }}>
            {slots.map((s, i) => (
              <button key={i} style={{ padding: "9px 0", borderRadius: 10, border: `1.5px solid ${i === 2 ? C.primary : C.border}`, background: i === 2 ? C.primaryXLight : C.white, color: i === 2 ? C.primary : C.textMuted, fontFamily: FONT_SANS, fontSize: 13, fontWeight: i === 2 ? 600 : 400, cursor: "pointer" }}>{s}</button>
            ))}
          </div>
          <button style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: C.primary, color: C.white, fontFamily: FONT_SANS, fontWeight: 600, fontSize: 15, cursor: "pointer", boxShadow: `0 6px 20px ${C.primaryGlow}` }}>
            Confirm Booking →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Main Content ───────────────────────────────────────────────────
function DashboardContent({ setActive }) {
  return (
    <div style={{ paddingBottom: 40 }}>
      <TopBar onBook={() => setActive("book")} />
      <StatCards />
      <NextAppointment />
      <div style={{ padding: "20px 32px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <UpcomingAppointments />
        <Notifications />
      </div>
    </div>
  );
}

// ─── Page Router ─────────────────────────────────────────────────────────────
function PageContent({ active, setActive }) {
  switch (active) {
    case "dashboard": return <DashboardContent setActive={setActive} />;
    case "book": return <BookAppointmentPage />;
    case "appointments": return <UpcomingAppointmentsFull />;
    case "records": return <HealthRecordsPage />;
    case "prescriptions": return <PrescriptionsPage />;
    case "notifications": return <NotificationsFullPage />;
    default: return <DashboardContent setActive={setActive} />;
  }
}

function UpcomingAppointmentsFull() {
  return (
    <div>
      <div style={{ padding: "28px 32px 24px" }}>
        <h2 style={{ fontFamily: FONT_SERIF, fontSize: 24, fontWeight: 700, color: C.text, margin: 0 }}>My Appointments</h2>
        <p style={{ fontFamily: FONT_SANS, fontSize: 14, color: C.textMuted, margin: "4px 0 0" }}>All upcoming and past appointments</p>
      </div>
      <div style={{ padding: "0 32px" }}><UpcomingAppointments /></div>
    </div>
  );
}

function NotificationsFullPage() {
  return (
    <div>
      <div style={{ padding: "28px 32px 24px" }}>
        <h2 style={{ fontFamily: FONT_SERIF, fontSize: 24, fontWeight: 700, color: C.text, margin: 0 }}>Notifications</h2>
        <p style={{ fontFamily: FONT_SANS, fontSize: 14, color: C.textMuted, margin: "4px 0 0" }}>Stay updated on your health activities</p>
      </div>
      <div style={{ padding: "0 32px" }}><Notifications /></div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function PatientDashboard() {
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