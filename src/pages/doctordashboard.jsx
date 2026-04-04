<<<<<<< HEAD
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import '../styles/doctordashboard.css';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeNav, setActiveNav] = useState('dashboard');
  const chartRef = useRef(null);

  // ---------- mock data (replace with real Supabase queries) ----------
  const mockQueue = [
    { id: 1, name: 'Rahul Shah', initials: 'RS', time: '2:30 PM', type: 'Follow-up', status: 'in-session' },
    { id: 2, name: 'Neha Patel', initials: 'NP', time: '3:00 PM', type: 'New patient', status: 'pending' },
    { id: 3, name: 'Arjun Modi', initials: 'AM', time: '3:30 PM', type: 'Check-up', status: 'pending' },
    { id: 4, name: 'Sunita Kulkarni', initials: 'SK', time: '4:00 PM', type: 'ECG review', status: 'confirmed' },
  ];
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekCounts = [6, 8, 4, 9, 8, 3];
  const availability = [
    { day: 'Monday',    time: '9 AM – 1 PM', on: true },
    { day: 'Tuesday',   time: '2 PM – 6 PM', on: true },
    { day: 'Wednesday', time: 'Off',          on: false },
    { day: 'Thursday',  time: '9 AM – 5 PM', on: true },
    { day: 'Friday',    time: '9 AM – 2 PM', on: true },
  ];
  // -------------------------------------------------------------------

  const [avail, setAvail] = useState(availability);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login'); return; }
      setUser(user);
    };
    getUser();
  }, []);
=======
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, getDoctorTodayAppointments, getDailyQueueStats } from "../services/supabase";
import LiveQueue from "./LiveQueue";
import DoctorSettingsPage from "./DoctorSettingsPage";
import DoctorAvailabilityManager from "./DoctorAvailabilityManager";
import DoctorQueueAnalytics from "./DoctorQueueAnalytics";

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
  // — Teal accent
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

// ── Icons
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

const NAV_ITEMS = [
  { id: "dashboard",   label: "Dashboard",       icon: DashIcon },
  { id: "schedule",    label: "My Schedule",     icon: CalIcon },
  { id: "queue",       label: "Live Queue",      icon: QueueIcon, badge: 5 },
  { id: "appointments",label: "Appointments",    icon: ListIcon },
  { id: "records",     label: "Patient Records", icon: FolderIcon },
  { id: "prescriptions",label: "Prescriptions", icon: PillIcon },
  { id: "analytics",   label: "Analytics",       icon: ChartIcon },
  { id: "settings",    label: "Settings",        icon: GearIcon },
];

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ active, setActive, user, onSignOut }) {
  return (
    <aside style={{ width: 240, minWidth: 240, background: C.sidebarBg, display: "flex", flexDirection: "column", borderRight: `1px solid ${C.sidebarBorder}`, height: "100vh", position: "sticky", top: 0 }}>
      {/* Logo */}
      <div style={{ padding: "24px 20px 20px", borderBottom: `1px solid ${C.sidebarBorder}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="4" fill="white" opacity=".2" />
              <path d="M12 8v8M8 12h8" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: FONT_SANS, fontWeight: 700, fontSize: 17, color: C.white, margin: 0, letterSpacing: "-0.3px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              Health<span style={{ color: C.primaryLight }}>ify</span>
            </p>
            <p style={{ fontFamily: FONT_SANS, fontSize: 11, color: C.sidebarText, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Doctor Portal</p>
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
            {user?.user_metadata?.full_name?.slice(0, 2).toUpperCase() || user?.email?.slice(0, 2).toUpperCase() || 'DR'}
          </div>
          <div style={{ overflow: "hidden" }}>
            <p style={{ fontFamily: FONT_SANS, fontWeight: 600, fontSize: 13, color: C.white, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.user_metadata?.full_name || 'Doctor'}
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

// ── Top Bar ───────────────────────────────────────────────────────────────────
function TopBar({ user, queueCount = 5, appointmentCount = 12 }) {
  const now = new Date();
  const hour = now.getHours();
  const greet = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  return (
    <div style={{ padding: "28px 32px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <h1 style={{ fontFamily: FONT_SERIF, fontSize: 28, fontWeight: 700, color: C.text, margin: 0, letterSpacing: "-0.5px" }}>
          {greet}, Dr. {user?.user_metadata?.full_name?.split(' ')[1] || 'Doctor'} 👋
        </h1>
        <p style={{ fontFamily: FONT_SANS, fontSize: 14, color: C.textMuted, margin: "4px 0 0" }}>
          <strong style={{ color: C.primary }}>{queueCount} patients in queue</strong> · {appointmentCount} appointments today
        </p>
      </div>
    </div>
  );
}

// ── Stat Cards ────────────────────────────────────────────────────────────────
function StatCards({ stats = {} }) {
  const {
    totalAppointments = 12,
    completedAppointments = 8,
    currentQueueCount = 5,
    monthlyPatients = 156,
    rating = 4.8,
  } = stats;

  const statCards = [
    {
      label: "Today's Appointments", value: String(totalAppointments), sub: `${completedAppointments} completed`, subColor: C.primary, subBg: C.primaryXLight, iconBg: C.primary,
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="16" rx="3" stroke="rgba(199,210,254,0.9)" strokeWidth="1.5" /><path d="M3 10h18M8 3v4M16 3v4" stroke="rgba(199,210,254,0.9)" strokeWidth="1.5" strokeLinecap="round" /></svg>
    },
    {
      label: "Patients in Queue", value: String(currentQueueCount), sub: "live waiting", subColor: C.primary, subBg: C.primaryXLight, iconBg: C.primary,
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3" stroke="rgba(199,210,254,0.9)" strokeWidth="1.8"/><path d="M6 20v-1a6 6 0 0112 0v1" stroke="rgba(199,210,254,0.9)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
    },
    {
      label: "Avg. Rating", value: String(rating), sub: "from 347 reviews", subColor: C.amber, subBg: C.amberLight, iconBg: C.amber,
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="rgba(254,243,199,0.9)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
    },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, padding: "24px 32px 0" }}>
      {statCards.map((s, i) => (
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

// ── Today's Schedule ──────────────────────────────────────────────────────────
function TodaySchedule({ doctorId }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!doctorId) {
      setLoading(false);
      return;
    }

    const loadAppointments = async () => {
      try {
        const data = await getDoctorTodayAppointments(doctorId);
        if (data && data.length > 0) {
          const formatted = data.map(appt => ({
            id: appt.id,
            time: new Date(appt.scheduled_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
            patient: appt.patient_name || 'Unknown Patient',
            type: appt.reason || 'Consultation',
            duration: appt.predicted_duration ? `~${appt.predicted_duration} min` : appt.duration_min ? `${appt.duration_min} min` : '~20 min',
            predictedDuration: appt.predicted_duration,
            noshowRisk: appt.noshow_risk,
            noshowProbability: appt.noshow_probability,
            status: appt.status === 'completed' ? 'completed' : appt.status === 'in_progress' ? 'in-progress' : 'upcoming',
          }));
          setAppointments(formatted);
        }
      } catch (err) {
        console.error('Error loading today\'s appointments:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();

    // Subscribe to real-time changes
    const channel = supabase
      .channel(`doctor-appointments-${doctorId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `doctor_id=eq.${doctorId}`,
        },
        () => {
          loadAppointments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [doctorId]);

  if (loading) {
    return (
      <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden", marginTop: 20, padding: "20px", textAlign: "center", color: C.textMuted }}>
        Loading today's appointments...
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden", marginTop: 20, padding: "20px", textAlign: "center", color: C.textMuted }}>
        No appointments today
      </div>
    );
  }

  return (
    <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden", marginTop: 20 }}>
      <div style={{ padding: "18px 20px 14px", borderBottom: `1px solid ${C.borderMuted}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ fontFamily: FONT_SANS, fontWeight: 700, fontSize: 15, color: C.text, margin: 0 }}>Today's Appointments ({appointments.length})</p>
        <button style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.primary, background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>View all →</button>
      </div>
      {appointments.map((appt, i) => {
        const statusColor = appt.status === 'completed' ? C.emerald : appt.status === 'in-progress' ? C.primary : C.textMuted;
        const statusBg = appt.status === 'completed' ? C.emeraldLight : appt.status === 'in-progress' ? C.primaryXLight : C.borderMuted;
        const riskColor = appt.noshowRisk === 'high' ? C.rose : appt.noshowRisk === 'medium' ? C.amber : C.emerald;
        const riskBg = appt.noshowRisk === 'high' ? C.roseLight : appt.noshowRisk === 'medium' ? C.amberLight : C.emeraldLight;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 20px", borderBottom: i < appointments.length - 1 ? `1px solid ${C.borderMuted}` : "none" }}>
            <div style={{ minWidth: 80 }}>
              <p style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 700, color: C.primary, margin: 0 }}>{appt.time}</p>
              <p style={{ fontFamily: FONT_SANS, fontSize: 11, color: C.textMuted, margin: "2px 0 0" }}>{appt.duration}</p>
              {appt.predictedDuration && (
                <p style={{ fontFamily: FONT_SANS, fontSize: 10, color: C.primary, margin: "2px 0 0", fontStyle: 'italic' }}>AI: ~{appt.predictedDuration}m</p>
              )}
            </div>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: statusColor, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: FONT_SANS, fontWeight: 600, fontSize: 14, color: C.text, margin: 0 }}>{appt.patient}</p>
              <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.textMuted, margin: "2px 0 0" }}>{appt.type}</p>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {appt.noshowRisk && (
                <span style={{ fontFamily: FONT_SANS, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 100, color: riskColor, background: riskBg }}>
                  Risk: {appt.noshowRisk}
                </span>
              )}
              <span style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 600, padding: "3px 12px", borderRadius: 100, color: statusColor, background: statusBg }}>
                {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Dashboard Content ────────────────────────────────────────────────────
function DashboardContent({ user, doctorId }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!doctorId) return;
      try {
        const queueStats = await getDailyQueueStats(doctorId);
        setStats(queueStats);
      } catch (err) {
        console.error('Error loading queue stats:', err);
        // Use default stats on error
        setStats({
          totalAppointments: 12,
          completedAppointments: 8,
          currentQueueCount: 5,
        });
      } finally {
        setLoading(false);
      }
    };

    loadStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, [doctorId]);

  return (
    <div>
      <TopBar user={user} queueCount={stats?.currentQueueCount || 0} appointmentCount={stats?.totalAppointments || 0} />
      <StatCards stats={stats || {}} />
      <div style={{ padding: "0 32px 40px" }}>
        <TodaySchedule doctorId={doctorId} />
      </div>
    </div>
  );
}

// ── Schedule Page ─────────────────────────────────────────────────────────────
function SchedulePage({ user, doctorId }) {
  return (
    <div style={{ padding: "28px 32px" }}>
      <DoctorAvailabilityManager user={user} doctorId={doctorId} />
    </div>
  );
}

// ── Patient Records Page ──────────────────────────────────────────────────────
function PatientRecordsPage() {
  return (
    <div style={{ padding: "28px 32px" }}>
      <h2 style={{ fontFamily: FONT_SERIF, fontSize: 24, fontWeight: 700, color: C.text, margin: 0 }}>Patient Records</h2>
      <p style={{ fontFamily: FONT_SANS, fontSize: 14, color: C.textMuted, margin: "4px 0 0" }}>Access your patient database</p>
      <div style={{ marginTop: 20, padding: 20, background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, textAlign: "center" }}>
        <p style={{ fontFamily: FONT_SANS, color: C.textMuted }}>Patient records view coming soon</p>
      </div>
    </div>
  );
}

// ── Analytics Page ────────────────────────────────────────────────────────────
function AnalyticsPage({ user, doctorId }) {
  return (
    <div style={{ padding: "28px 32px" }}>
      <DoctorQueueAnalytics user={user} doctorId={doctorId} />
    </div>
  );
}

// ─── Page Router ─────────────────────────────────────────────────────────────
function PageContent({ active, setActive, user, doctorId, loading }) {
  // Show loading message if data not ready
  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
        <h2 style={{ fontFamily: FONT_SANS, fontSize: 18, fontWeight: 600, color: C.text, marginBottom: 8 }}>
          Loading Your Dashboard...
        </h2>
        <p style={{ fontFamily: FONT_SANS, fontSize: 14, color: C.textMuted }}>
          Just a moment while we fetch your data.
        </p>
      </div>
    );
  }

  // Show setup message if doctorId is not available
  if (!doctorId && (active === "queue" || active === "analytics")) {
    const actionText = active === "queue" ? "access the queue" : "view analytics";
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🏥</div>
        <h2 style={{ fontFamily: FONT_SANS, fontSize: 18, fontWeight: 600, color: C.text, marginBottom: 8 }}>
          Doctor Profile Not Found
        </h2>
        <p style={{ fontFamily: FONT_SANS, fontSize: 14, color: C.textMuted, marginBottom: 20 }}>
          We couldn't find your doctor profile. Please contact the administrator to set up your account, or return to the dashboard.
        </p>
        <button
          onClick={() => setActive("dashboard")}
          style={{
            padding: "10px 24px",
            background: C.primary,
            color: "white",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  switch (active) {
    case "dashboard":    return <DashboardContent user={user} doctorId={doctorId} />;
    case "schedule":     return doctorId ? <SchedulePage user={user} doctorId={doctorId} /> : <div style={{ padding: 40 }}>Loading...</div>;
    case "queue":        return doctorId ? <LiveQueue role="doctor" doctorId={doctorId} /> : null;
    case "appointments": return doctorId ? <SchedulePage user={user} doctorId={doctorId} /> : <div style={{ padding: 40 }}>Loading...</div>;
    case "records":      return <PatientRecordsPage />;
    case "prescriptions": return <PatientRecordsPage />;
    case "analytics":    return doctorId ? <AnalyticsPage user={user} doctorId={doctorId} /> : null;
    case "settings":     return <DoctorSettingsPage />;
    default:             return <DashboardContent user={user} doctorId={doctorId} />;
  }
}

// ─── Root Component ──────────────────────────────────────────────────────────
export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [active, setActive] = useState("dashboard");
  const [user, setUser] = useState(null);
  const [doctorId, setDoctorId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/login');
          return;
        }

        // Check if user has doctor role
        const userRole = user?.user_metadata?.role;
        if (userRole && userRole !== 'doctor') {
          // User is trying to access doctor dashboard with a different role
          await supabase.auth.signOut();
          localStorage.removeItem('userRole');
          alert(`Access Denied: This account is registered as a ${userRole}. Please login with the correct role.`);
          navigate('/login');
          return;
        }

        setUser(user);
        
        // Fetch doctor ID from user ID
        try {
          const { data: doctors, error } = await supabase
            .from('doctors')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle(); // Use maybeSingle instead of single to handle 0 rows gracefully
          
          if (error) {
            console.error('Failed to fetch doctor record:', error);
            setDoctorId(null);
          } else if (doctors?.id) {
            console.log('✅ Doctor ID loaded:', doctors.id);
            setDoctorId(doctors.id);
          } else {
            console.warn('⚠️ No doctor profile found for user:', user.id);
            setDoctorId(null);
          }
        } catch (err) {
          console.error('Failed to fetch doctor ID:', err);
          setDoctorId(null);
        }
      } finally {
        setLoading(false);
      }
    };
    getUser();
  }, [navigate]);
>>>>>>> 4f68ca780b03aab9907770c835736ccd5115bf63

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

<<<<<<< HEAD
  const toggleAvail = (index) => {
    setAvail(prev => prev.map((a, i) => i === index ? { ...a, on: !a.on } : a));
  };

  const maxCount = Math.max(...weekCounts);

  const navItems = [
    { key: 'dashboard', icon: '🏠', label: 'Dashboard' },
    { key: 'schedule',  icon: '📅', label: 'My Schedule' },
    { key: 'patients',  icon: '👥', label: 'Patients' },
    { key: 'analytics', icon: '📊', label: 'Analytics' },
    { key: 'availability', icon: '🕐', label: 'Availability' },
    { key: 'alerts',    icon: '🔔', label: 'Alerts', badge: 5 },
    { key: 'settings',  icon: '⚙️', label: 'Settings' },
  ];

  return (
    <div className="dd-layout">
      {/* ── SIDEBAR ── */}
      <aside className="dd-sidebar">
        <div className="dd-logo">
          <span className="dd-logo-icon">🏥</span>
          <div>
            <div className="dd-logo-text">MediBook</div>
            <div className="dd-logo-sub">Doctor Portal</div>
          </div>
        </div>

        <nav className="dd-nav">
          {navItems.map(item => (
            <div
              key={item.key}
              className={`dd-nav-item ${activeNav === item.key ? 'active' : ''}`}
              onClick={() => setActiveNav(item.key)}
            >
              <span className="dd-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge && <span className="dd-nav-badge">{item.badge}</span>}
            </div>
          ))}
        </nav>

        <div className="dd-sidebar-footer">
          <div className="dd-user-chip">
            <div className="dd-avatar">
              {user?.user_metadata?.full_name?.slice(0, 2).toUpperCase() || 'DR'}
            </div>
            <div>
              <div className="dd-user-name">{user?.user_metadata?.full_name || 'Doctor'}</div>
              <div className="dd-user-role">Cardiologist</div>
            </div>
          </div>
          <button className="dd-signout-btn" onClick={handleSignOut}>Sign out</button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="dd-main">
        {/* Header */}
        <div className="dd-header">
          <div>
            <h1 className="dd-greeting">Today's Overview 📋</h1>
            <p className="dd-greeting-sub">Friday, 3 Apr 2026 · {mockQueue.length} appointments scheduled</p>
          </div>
          <button className="dd-primary-btn">+ Block Time Slot</button>
        </div>

        {/* Stats */}
        <div className="dd-stats">
          {[
            { icon: '📅', label: "Today's Appts",   value: '8',   badge: '3 remaining',   badgeClass: 'red' },
            { icon: '⏳', label: 'Pending Confirm',  value: '4',   badge: 'Action needed', badgeClass: 'amber' },
            { icon: '👥', label: 'Total Patients',   value: '312', badge: '+6 this week',  badgeClass: 'green' },
          ].map((s, i) => (
            <div className="dd-stat-card" key={i}>
              <span className="dd-stat-icon">{s.icon}</span>
              <div className="dd-stat-label">{s.label}</div>
              <div className="dd-stat-value">{s.value}</div>
              <span className={`dd-badge dd-badge-${s.badgeClass}`}>{s.badge}</span>
            </div>
          ))}
        </div>

        {/* Now Serving Hero */}
        <div className="dd-hero">
          <div className="dd-hero-deco1"></div>
          <div className="dd-hero-deco2"></div>
          <div className="dd-hero-label">Now Serving</div>
          <div className="dd-hero-title">{mockQueue[0].name} — Consultation</div>
          <div className="dd-hero-sub">Follow-up visit · Cardiac monitoring · Patient #P4821</div>
          <div className="dd-hero-meta">
            <span>🕑 {mockQueue[0].time} slot</span>
            <span>⏱ 30 min</span>
            <span>🔁 Follow-up</span>
          </div>
          <div className="dd-hero-actions">
            <button className="dd-hero-btn-solid">View Patient File</button>
            <button className="dd-hero-btn-outline">Write Prescription</button>
            <button className="dd-hero-btn-outline">Mark Complete</button>
          </div>
        </div>

        {/* Two Col */}
        <div className="dd-two-col">
          {/* Patient Queue */}
          <div className="dd-card">
            <div className="dd-card-header">
              <span className="dd-card-title">Today's Patient Queue</span>
              <span className="dd-card-link">Full schedule →</span>
            </div>
            {mockQueue.map((patient, i) => (
              <div className="dd-queue-row" key={patient.id}>
                <div className="dd-queue-num">{i + 1}</div>
                <div className="dd-q-avatar">{patient.initials}</div>
                <div className="dd-q-info">
                  <div className="dd-q-name">{patient.name}</div>
                  <div className="dd-q-detail">{patient.time} · {patient.type}</div>
                </div>
                <div className="dd-q-actions">
                  {patient.status === 'in-session' && (
                    <span className="dd-status dd-status-session">In session</span>
                  )}
                  {patient.status === 'pending' && (
                    <button className="dd-q-btn dd-q-confirm">Confirm</button>
                  )}
                  {patient.status !== 'in-session' && (
                    <button className="dd-q-btn dd-q-view">View</button>
                  )}
                  {patient.status === 'in-session' && (
                    <button className="dd-q-btn dd-q-view">File</button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Availability */}
          <div className="dd-card">
            <div className="dd-card-header">
              <span className="dd-card-title">Weekly Availability</span>
              <span className="dd-card-link">Edit slots →</span>
            </div>
            {avail.map((a, i) => (
              <div className="dd-avail-row" key={i}>
                <div>
                  <div className="dd-avail-day">{a.day}</div>
                  <div className="dd-avail-time">{a.time}</div>
                </div>
                <div
                  className={`dd-toggle ${a.on ? 'on' : 'off'}`}
                  onClick={() => toggleAvail(i)}
                >
                  <div className="dd-toggle-thumb"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Analytics Chart */}
        <div className="dd-card dd-full-card">
          <div className="dd-card-header">
            <span className="dd-card-title">Appointments This Week</span>
            <span className="dd-card-link">Full analytics →</span>
          </div>
          <div className="dd-chart-wrap">
            <div className="dd-chart">
              {weekCounts.map((count, i) => (
                <div key={i} className="dd-chart-col">
                  <div className="dd-chart-val">{count}</div>
                  <div
                    className={`dd-chart-bar ${i === 4 ? 'today' : ''}`}
                    style={{ height: `${Math.round((count / maxCount) * 100)}%` }}
                  ></div>
                  <div className="dd-chart-lbl">{weekDays[i]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DoctorDashboard;
=======
  return (
    <div style={{ display: "flex", background: `linear-gradient(135deg, ${C.surface} 0%, ${C.surfaceAlt} 50%, rgba(99, 102, 241, 0.08) 100%)`, minHeight: "100vh", fontFamily: FONT_SANS }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        button { transition: all 0.15s ease; }
        button:hover { opacity: 0.85; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }
      `}</style>
      <Sidebar active={active} setActive={setActive} user={user} onSignOut={handleSignOut} />
      <main style={{ flex: 1, overflowY: "auto", minWidth: 0, background: `linear-gradient(135deg, rgba(245, 244, 255, 0.6) 0%, rgba(238, 242, 255, 0.4) 100%)` }}>
        <PageContent active={active} setActive={setActive} user={user} doctorId={doctorId} loading={loading} />
      </main>
    </div>
  );
}
>>>>>>> 4f68ca780b03aab9907770c835736ccd5115bf63
