import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import Noshowanalytics from './Noshowanalytics';
import BookAppointment from './BookAppointment';
import SettingsPage from './SettingsPage';


// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  // — Sidebar
  sidebarBg: "#0D2926",
  sidebarBorder: "rgba(13,148,136,0.18)",
  sidebarText: "#9DC5C0",
  sidebarActive: "rgba(13,148,136,0.22)",
  sidebarActiveBorder: "#0D9488",
  sidebarActiveText: "#CCFBF1",
  // — Brand / Primary (teal-green)
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
  emeraldLight: "#D1FAE5",
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

// ─── Mock Data ────────────────────────────────────────────────────────────────
const mockAppointments = [
  { id: 1, doctor: "Dr. Priya Mehta", specialty: "Cardiology", clinic: "Apollo Clinic", date: "Apr 4", time: "10:30 AM", status: "confirmed" },
  { id: 2, doctor: "Dr. Rohit Sharma", specialty: "Dermatology", clinic: "Skin Care Hub", date: "Apr 9", time: "3:00 PM", status: "pending" },
  { id: 3, doctor: "Dr. Anita Kapoor", specialty: "Orthopedics", clinic: "Bone & Joint Ctr", date: "Apr 15", time: "11:00 AM", status: "confirmed" },
];

const nextAppt = mockAppointments[0];

const mockNotifs = [
  { id: 1, text: "Your appointment with Dr. Mehta is tomorrow at 10:30 AM.", time: "2 hrs ago", color: C.primary },
  { id: 2, text: "Lab results from your last visit are now available.", time: "Yesterday", color: C.accent },
  { id: 3, text: "Refill reminder: Amlodipine is due in 3 days.", time: "2 days ago", color: C.amber },
];

const mockPastVisits = [
  { date: "Mar 20, 2026", doctor: "Dr. Priya Mehta", type: "Routine ECG check-up" },
  { date: "Feb 14, 2026", doctor: "Dr. Rohit Sharma", type: "Skin rash consultation" },
  { date: "Jan 5, 2026", doctor: "Dr. A. Kapoor", type: "Knee pain follow-up" },
  { date: "Dec 10, 2025", doctor: "Dr. Priya Mehta", type: "BP & cholesterol review" },
];

const mockPrescriptions = [
  { name: "Amlodipine 5mg", frequency: "Once daily", refillIn: "3 days", status: "active" },
  { name: "Metformin 500mg", frequency: "Twice daily", refillIn: "18 days", status: "active" },
  { name: "Atorvastatin 10mg", frequency: "Once at night", refillIn: "25 days", status: "active" },
];

// ─── Nav Items ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: DashIcon },
  { id: "book", label: "Book Appointment", icon: CalIcon },
  { id: "appointments", label: "My Appointments", icon: ListIcon },
  { id: "records", label: "Health Records", icon: FolderIcon },
  { id: "prescriptions", label: "Prescriptions", icon: PillIcon },
  { id: "notifications", label: "Notifications", icon: BellIcon, badge: 3 },
  { id: "noshow", label: "No-show AI", icon: BrainIcon },
  { id: "settings", label: "Settings", icon: GearIcon },
];

// ─── Icons ────────────────────────────────────────────────────────────────────
function DashIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="8" height="8" rx="2" fill={color} />
      <rect x="13" y="3" width="8" height="8" rx="2" fill={color} opacity=".5" />
      <rect x="3" y="13" width="8" height="8" rx="2" fill={color} opacity=".5" />
      <rect x="13" y="13" width="8" height="8" rx="2" fill={color} opacity=".3" />
    </svg>
  );
}
function CalIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="16" rx="3" stroke={color} strokeWidth="1.8" />
      <path d="M3 10h18M8 3v4M16 3v4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function ListIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function FolderIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 8a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke={color} strokeWidth="1.8" />
    </svg>
  );
}
function PillIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M10.5 3.5a5 5 0 010 7.07L7.07 14l-4.24-4.24a5 5 0 010-7.07 5 5 0 017.07 0zM13.5 10.5l4.24 4.24a5 5 0 01-7.07 7.07L6.43 17.57" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function BellIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M15 17H9v1a3 3 0 006 0v-1zm-3-13a6 6 0 016 6v3l2 2H4l2-2v-3a6 6 0 016-6z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function BrainIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M9.5 2a4.5 4.5 0 014 2.5A4.5 4.5 0 0118 9a4.5 4.5 0 01-1.5 8.5M9.5 2A4.5 4.5 0 006 9a4.5 4.5 0 001.5 8.5M9.5 2v18M9.5 20h5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function GearIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.8" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke={color} strokeWidth="1.8" />
    </svg>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ active, setActive, user, onSignOut }) {
  return (
    <aside style={{ width: 240, minWidth: 240, background: C.sidebarBg, display: "flex", flexDirection: "column", borderRight: `1px solid ${C.sidebarBorder}`, height: "100vh", position: "sticky", top: 0 }}>
      {/* Logo */}
      <div style={{ padding: "24px 20px 20px", borderBottom: `1px solid ${C.sidebarBorder}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="4" fill="white" opacity=".2" />
              <path d="M12 8v8M8 12h8" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
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
      <nav style={{ flex: 1, padding: "12px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: "none", background: isActive ? C.sidebarActive : "transparent", borderLeft: isActive ? `3px solid ${C.sidebarActiveBorder}` : "3px solid transparent", cursor: "pointer", transition: "all 0.15s" }}
            >
              <Icon size={16} color={isActive ? C.primaryLight : C.sidebarText} />
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

      {/* User footer */}
      <div style={{ padding: "16px", borderTop: `1px solid ${C.sidebarBorder}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_SANS, fontWeight: 700, fontSize: 14, color: C.white, flexShrink: 0 }}>
            {user?.user_metadata?.full_name?.slice(0, 2).toUpperCase() || user?.email?.slice(0, 2).toUpperCase() || 'PT'}
          </div>
          <div style={{ overflow: "hidden" }}>
            <p style={{ fontFamily: FONT_SANS, fontWeight: 600, fontSize: 13, color: C.white, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.user_metadata?.full_name || 'Patient'}
            </p>
            <p style={{ fontFamily: FONT_SANS, fontSize: 11, color: C.sidebarText, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.email || ''}
            </p>
          </div>
        </div>
        <button
          onClick={onSignOut}
          style={{ width: "100%", padding: "8px 0", borderRadius: 8, border: `1px solid ${C.sidebarBorder}`, background: "transparent", fontFamily: FONT_SANS, fontSize: 13, fontWeight: 500, color: C.sidebarText, cursor: "pointer" }}
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}

// ─── Top Bar ──────────────────────────────────────────────────────────────────
function TopBar({ onBook, user }) {
  const now = new Date();
  const hour = now.getHours();
  const greet = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const dayStr = now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short", year: "numeric" });
  return (
    <div style={{ padding: "28px 32px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <h1 style={{ fontFamily: FONT_SERIF, fontSize: 28, fontWeight: 700, color: C.text, margin: 0, letterSpacing: "-0.5px" }}>
          {greet}, {user?.user_metadata?.full_name?.split(' ')[0] || 'there'} 👋
        </h1>
        <p style={{ fontFamily: FONT_SANS, fontSize: 14, color: C.textMuted, margin: "4px 0 0" }}>
          {dayStr} · <strong style={{ color: C.primary }}>Your next appointment is today</strong>
        </p>
      </div>
      <button
        onClick={onBook}
        style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 22px", borderRadius: 12, border: "none", background: C.primary, color: C.white, fontFamily: FONT_SANS, fontWeight: 600, fontSize: 14, cursor: "pointer", boxShadow: `0 6px 20px ${C.primaryGlow}`, flexShrink: 0 }}
      >
        + Book Appointment
      </button>
    </div>
  );
}

// ─── Stat Cards ───────────────────────────────────────────────────────────────
function StatCards() {
  const stats = [
    {
      label: "Upcoming", value: "2", sub: "This week", subColor: C.primary, subBg: C.primaryXLight, iconBg: C.primary,
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="16" rx="3" stroke="rgba(204,251,241,0.9)" strokeWidth="1.5" /><path d="M3 10h18M8 3v4M16 3v4" stroke="rgba(204,251,241,0.9)" strokeWidth="1.5" strokeLinecap="round" /></svg>
    },
    {
      label: "Completed", value: "14", sub: "All time", subColor: C.emerald, subBg: C.emeraldLight, iconBg: C.emerald,
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4" stroke="rgba(209,250,229,0.9)" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="12" r="9" stroke="rgba(209,250,229,0.9)" strokeWidth="1.8" /></svg>
    },
    {
      label: "Active Rx", value: "3", sub: "1 refill due", subColor: C.amber, subBg: C.amberLight, iconBg: C.amber,
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M10.5 3.5a5 5 0 010 7.07L7.07 14l-4.24-4.24a5 5 0 010-7.07 5 5 0 017.07 0z" stroke="rgba(254,243,199,0.9)" strokeWidth="1.8" strokeLinecap="round" /></svg>
    },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, padding: "24px 32px 0" }}>
      {stats.map((s, i) => (
        <div key={i} style={{ background: C.white, borderRadius: 16, padding: "18px 16px", border: `1px solid ${C.border}`, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: 70, height: 70, borderRadius: "0 16px 0 70px", background: s.iconBg + "10" }} />
          <div style={{ width: 44, height: 44, borderRadius: 12, background: s.iconBg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>{s.icon}</div>
          <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.textMuted, margin: "0 0 2px" }}>{s.label}</p>
          <p style={{ fontFamily: FONT_SERIF, fontSize: 32, fontWeight: 700, color: C.text, margin: "0 0 6px", lineHeight: 1 }}>{s.value}</p>
          <span style={{ fontFamily: FONT_SANS, fontSize: 11, fontWeight: 600, color: s.subColor, background: s.subBg, padding: "2px 10px", borderRadius: 100 }}>{s.sub}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Next Appointment Hero ────────────────────────────────────────────────────
function NextAppointment() {
  return (
    <div style={{ margin: "20px 32px 0", borderRadius: 20, padding: "26px 32px", background: "linear-gradient(130deg, #0D2926 0%, #0F766E 50%, #0D9488 100%)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -50, right: -50, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
      <div style={{ position: "absolute", bottom: -30, right: 100, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
      <p style={{ fontFamily: FONT_SANS, fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", letterSpacing: "1.5px", textTransform: "uppercase", margin: "0 0 10px" }}>Next Appointment</p>
      <h2 style={{ fontFamily: FONT_SERIF, fontSize: 24, fontWeight: 700, color: C.white, margin: "0 0 4px" }}>
        {nextAppt.doctor} <span style={{ color: C.primaryLight, fontSize: 18 }}>— {nextAppt.specialty}</span>
      </h2>
      <p style={{ fontFamily: FONT_SANS, fontSize: 14, color: "rgba(255,255,255,0.6)", margin: "0 0 18px" }}>{nextAppt.clinic} · Floor 3, Room 12</p>
      <div style={{ display: "flex", gap: 20, marginBottom: 20, flexWrap: "wrap" }}>
        {[["🕐 Date", `${nextAppt.date}, ${nextAppt.time}`], ["⏱ Duration", "30 min"], ["📍 Mode", "In-person"]].map(([k, v]) => (
          <div key={k} style={{ background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 14px" }}>
            <p style={{ fontFamily: FONT_SANS, fontSize: 11, color: "rgba(255,255,255,0.5)", margin: "0 0 2px" }}>{k}</p>
            <p style={{ fontFamily: FONT_SANS, fontWeight: 600, fontSize: 14, color: C.white, margin: 0 }}>{v}</p>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        {[
          { label: "View Details", bg: C.white, color: C.text },
          { label: "Reschedule", bg: "rgba(255,255,255,0.15)", color: C.white },
          { label: "Cancel", bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.75)" },
        ].map((btn, i) => (
          <button key={i} style={{ padding: "9px 18px", borderRadius: 10, border: "none", background: btn.bg, color: btn.color, fontFamily: FONT_SANS, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Upcoming Appointments ────────────────────────────────────────────────────
function UpcomingAppointments() {
  return (
    <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden" }}>
      <div style={{ padding: "18px 20px 14px", borderBottom: `1px solid ${C.borderMuted}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ fontFamily: FONT_SANS, fontWeight: 700, fontSize: 15, color: C.text, margin: 0 }}>Upcoming Appointments</p>
        <button style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.primary, background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>View all →</button>
      </div>
      {mockAppointments.map((appt, i) => (
        <div key={appt.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 20px", borderBottom: i < mockAppointments.length - 1 ? `1px solid ${C.borderMuted}` : "none" }}>
          <div style={{ minWidth: 52, textAlign: "center" }}>
            <p style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 700, color: C.primary, margin: 0 }}>{appt.date}</p>
            <p style={{ fontFamily: FONT_SANS, fontSize: 11, color: C.textMuted, margin: "2px 0 0" }}>{appt.time}</p>
          </div>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: appt.status === 'confirmed' ? C.primary : C.amber, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: FONT_SANS, fontWeight: 600, fontSize: 14, color: C.text, margin: 0 }}>{appt.doctor}</p>
            <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.textMuted, margin: "2px 0 0" }}>{appt.specialty} · {appt.clinic}</p>
          </div>
          <span style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 600, padding: "3px 12px", borderRadius: 100, color: appt.status === 'confirmed' ? C.primary : C.amber, background: appt.status === 'confirmed' ? C.primaryXLight : C.amberLight }}>
            {appt.status === 'confirmed' ? 'Confirmed' : 'Pending'}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Notifications ────────────────────────────────────────────────────────────
function Notifications() {
  return (
    <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden" }}>
      <div style={{ padding: "18px 20px 14px", borderBottom: `1px solid ${C.borderMuted}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ fontFamily: FONT_SANS, fontWeight: 700, fontSize: 15, color: C.text, margin: 0 }}>Notifications</p>
        <button style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.primary, background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>Mark all read</button>
      </div>
      {mockNotifs.map((n, i) => (
        <div key={n.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "13px 20px", borderBottom: i < mockNotifs.length - 1 ? `1px solid ${C.borderMuted}` : "none" }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: n.color, flexShrink: 0, marginTop: 4 }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.text, margin: 0, lineHeight: 1.5 }}>{n.text}</p>
            <p style={{ fontFamily: FONT_SANS, fontSize: 11, color: C.textMuted, margin: "4px 0 0" }}>{n.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Recent Visits ────────────────────────────────────────────────────────────
function RecentVisits() {
  return (
    <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden" }}>
      <div style={{ padding: "18px 20px 14px", borderBottom: `1px solid ${C.borderMuted}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ fontFamily: FONT_SANS, fontWeight: 700, fontSize: 15, color: C.text, margin: 0 }}>Recent Visits</p>
        <button style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.primary, background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>Download records →</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1, background: C.borderMuted }}>
        {mockPastVisits.map((v, i) => (
          <div key={i} style={{ background: C.white, padding: "16px 20px" }}>
            <p style={{ fontFamily: FONT_SANS, fontSize: 11, fontWeight: 700, color: C.primary, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{v.date}</p>
            <p style={{ fontFamily: FONT_SANS, fontWeight: 600, fontSize: 14, color: C.text, margin: "0 0 2px" }}>{v.doctor}</p>
            <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.textMuted, margin: "0 0 10px" }}>{v.type}</p>
            <span style={{ fontFamily: FONT_SANS, fontSize: 11, fontWeight: 600, color: C.emerald, background: C.emeraldLight, padding: "2px 10px", borderRadius: 100 }}>Completed</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Dashboard Content ────────────────────────────────────────────────────────
function DashboardContent({ setActive, user }) {
  return (
    <div style={{ paddingBottom: 40 }}>
      <TopBar onBook={() => setActive("book")} user={user} />
      <StatCards />
      <NextAppointment />
      <div style={{ padding: "20px 32px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <UpcomingAppointments />
        <Notifications />
      </div>
      <div style={{ padding: "16px 32px 0" }}>
        <RecentVisits />
      </div>
    </div>
  );
}

// ─── Book Appointment Page ────────────────────────────────────────────────────
function BookAppointmentPage() {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState(null);
  const doctors = [
    { name: "Dr. Priya Mehta", specialty: "Cardiologist", avail: "Mon, Wed, Fri", avatar: "PM" },
    { name: "Dr. Rohit Sharma", specialty: "Dermatologist", avail: "Tue, Thu", avatar: "RS" },
    { name: "Dr. Anita Kapoor", specialty: "Orthopedic", avail: "Mon–Sat", avatar: "AK" },
    { name: "Dr. Kavitha Nair", specialty: "Neurologist", avail: "Wed, Fri", avatar: "KN" },
  ];
  return (
    <div>
      <div style={{ padding: "28px 32px 24px" }}>
        <h2 style={{ fontFamily: FONT_SERIF, fontSize: 24, fontWeight: 700, color: C.text, margin: 0 }}>Book an Appointment</h2>
        <p style={{ fontFamily: FONT_SANS, fontSize: 14, color: C.textMuted, margin: "4px 0 0" }}>Choose a doctor and pick a convenient slot</p>
      </div>
      <div style={{ padding: "0 32px" }}>
        <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}` }}>
          {doctors.map((d, i) => (
            <div key={i} onClick={() => setSelected(i)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", borderBottom: i < doctors.length - 1 ? `1px solid ${C.borderMuted}` : "none", background: selected === i ? C.primaryXLight : "transparent", cursor: "pointer", transition: "background 0.15s" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_SANS, fontWeight: 700, fontSize: 14, color: C.white, flexShrink: 0 }}>{d.avatar}</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: FONT_SANS, fontWeight: 600, fontSize: 14, color: C.text, margin: 0 }}>{d.name}</p>
                <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.textMuted, margin: "2px 0 0" }}>{d.specialty} · Available: {d.avail}</p>
              </div>
              {selected === i && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke={C.primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              )}
              <button style={{ padding: "7px 16px", borderRadius: 8, border: `1px solid ${selected === i ? C.primary : C.border}`, background: selected === i ? C.primary : "transparent", fontFamily: FONT_SANS, fontSize: 12, color: selected === i ? C.white : C.primary, cursor: "pointer", fontWeight: 500 }}>
                {selected === i ? 'Selected' : 'Select'}
              </button>
            </div>
          ))}
        </div>
        {selected !== null && (
          <button style={{ marginTop: 16, width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: C.primary, color: C.white, fontFamily: FONT_SANS, fontWeight: 600, fontSize: 15, cursor: "pointer", boxShadow: `0 6px 20px ${C.primaryGlow}` }}>
            Confirm Booking with {doctors[selected].name} →
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Health Records Page ──────────────────────────────────────────────────────
function HealthRecordsPage() {
  return (
    <div>
      <div style={{ padding: "28px 32px 24px" }}>
        <h2 style={{ fontFamily: FONT_SERIF, fontSize: 24, fontWeight: 700, color: C.text, margin: 0 }}>Health Records</h2>
        <p style={{ fontFamily: FONT_SANS, fontSize: 14, color: C.textMuted, margin: "4px 0 0" }}>Your complete medical history</p>
      </div>
      <div style={{ padding: "0 32px" }}>
        <RecentVisits />
      </div>
    </div>
  );
}

// ─── Prescriptions Page ───────────────────────────────────────────────────────
function PrescriptionsPage() {
  return (
    <div>
      <div style={{ padding: "28px 32px 24px" }}>
        <h2 style={{ fontFamily: FONT_SERIF, fontSize: 24, fontWeight: 700, color: C.text, margin: 0 }}>Prescriptions</h2>
        <p style={{ fontFamily: FONT_SANS, fontSize: 14, color: C.textMuted, margin: "4px 0 0" }}>Your active medications</p>
      </div>
      <div style={{ padding: "0 32px" }}>
        <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}` }}>
          {mockPrescriptions.map((rx, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", borderBottom: i < mockPrescriptions.length - 1 ? `1px solid ${C.borderMuted}` : "none" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: C.amberLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M10.5 3.5a5 5 0 010 7.07L7.07 14l-4.24-4.24a5 5 0 010-7.07 5 5 0 017.07 0z" stroke={C.amber} strokeWidth="1.8" strokeLinecap="round" /></svg>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: FONT_SANS, fontWeight: 600, fontSize: 14, color: C.text, margin: 0 }}>{rx.name}</p>
                <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.textMuted, margin: "2px 0 0" }}>{rx.frequency} · Refill in {rx.refillIn}</p>
              </div>
              <span style={{ fontFamily: FONT_SANS, fontSize: 11, fontWeight: 600, color: C.emerald, background: C.emeraldLight, padding: "2px 10px", borderRadius: 100 }}>Active</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Notifications Full Page ──────────────────────────────────────────────────
function NotificationsFullPage() {
  return (
    <div>
      <div style={{ padding: "28px 32px 24px" }}>
        <h2 style={{ fontFamily: FONT_SERIF, fontSize: 24, fontWeight: 700, color: C.text, margin: 0 }}>Notifications</h2>
        <p style={{ fontFamily: FONT_SANS, fontSize: 14, color: C.textMuted, margin: "4px 0 0" }}>Stay updated on your health activities</p>
      </div>
      <div style={{ padding: "0 32px" }}>
        <Notifications />
      </div>
    </div>
  );
}

// ─── Appointments Full Page ───────────────────────────────────────────────────
function AppointmentsFullPage() {
  return (
    <div>
      <div style={{ padding: "28px 32px 24px" }}>
        <h2 style={{ fontFamily: FONT_SERIF, fontSize: 24, fontWeight: 700, color: C.text, margin: 0 }}>My Appointments</h2>
        <p style={{ fontFamily: FONT_SANS, fontSize: 14, color: C.textMuted, margin: "4px 0 0" }}>All upcoming and past appointments</p>
      </div>
      <div style={{ padding: "0 32px" }}>
        <UpcomingAppointments />
      </div>
    </div>
  );
}

// ─── Page Router ──────────────────────────────────────────────────────────────
function PageContent({ active, setActive, user }) {
  switch (active) {
    case "dashboard": return <DashboardContent setActive={setActive} user={user} />;
    case "book": return <BookAppointment onNavigateToAppointments={() => setActive('appointments')} />;
    case "appointments": return <AppointmentsFullPage />;
    case "records": return <HealthRecordsPage />;
    case "prescriptions": return <PrescriptionsPage />;
    case "notifications": return <NotificationsFullPage />;
    case "noshow": return <Noshowanalytics />;
    case "settings": return <SettingsPage />;
    default: return <DashboardContent setActive={setActive} user={user} />;
  }
}

// ─── Root Component ───────────────────────────────────────────────────────────
export default function PatientDashboard() {
  const navigate = useNavigate();
  const [active, setActive] = useState("dashboard");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      // Check if user has patient role
      const userRole = user?.user_metadata?.role;
      if (userRole && userRole !== 'patient') {
        // User is trying to access patient dashboard with a different role
        await supabase.auth.signOut();
        localStorage.removeItem('userRole');
        alert(`Access Denied: This account is registered as a ${userRole}. Please login with the correct role.`);
        navigate('/login');
        return;
      }

      setUser(user);
    };
    getUser();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div style={{ display: "flex", background: C.surface, minHeight: "100vh", fontFamily: FONT_SANS }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        button { transition: all 0.15s ease; }
        button:hover { opacity: 0.88; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }
      `}</style>
      <Sidebar active={active} setActive={setActive} user={user} onSignOut={handleSignOut} />
      <main style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>
        <PageContent active={active} setActive={setActive} user={user} />
      </main>
    </div>
  );
}