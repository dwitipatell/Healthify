// src/pages/DoctorSettingsPage.jsx
// ─── Doctor Portal Settings with Blue/Indigo Theme ────────────────────────────
// Mirrors SettingsPage exactly but uses doctor dashboard blue colors

import { useState } from 'react';

// ─── Theme tokens (matches doctordashboard indigo theme) ──────────────────────
const C = {
  sidebarBg: "#12103A",
  primary: "#6366F1",
  primaryDark: "#4F46E5",
  primaryLight: "#C7D2FE",
  primaryXLight: "#EEF2FF",
  primaryGlow: "rgba(99,102,241,0.2)",
  accent: "#0D9488",
  accentLight: "#EEF2FF",
  amber: "#F59E0B",
  amberLight: "#FEF3C7",
  rose: "#F43F5E",
  roseLight: "#FFE4E6",
  emerald: "#10B981",
  emeraldLight: "#D1FAE5",
  text: "#1E1B4B",
  textMuted: "#6B7FBD",
  textLight: "#A5B4FC",
  white: "#FFFFFF",
  surface: "#F5F4FF",
  surfaceAlt: "#EEF2FF",
  border: "#DDD9FF",
  borderMuted: "#EDEAFF",
};

const FONT_SANS = "'DM Sans', sans-serif";
const FONT_SERIF = "'Fraunces', serif";

// ─── NAV ITEMS ────────────────────────────────────────────────────────────────
const NAV = [
  {
    group: "Appearance",
    items: [
      { id: "theme",        label: "Theme & Colors",     icon: PaletteIcon },
      { id: "darkmode",     label: "Dark Mode",          icon: PaletteIcon },
      { id: "typography",   label: "Typography",         icon: TypeIcon },
      { id: "layout",       label: "Layout & Density",   icon: LayoutIcon },
      { id: "motion",       label: "Motion",             icon: ZapIcon },
    ],
  },
  {
    group: "Preferences",
    items: [
      { id: "language",     label: "Language & Region",  icon: BellIcon },
      { id: "accessibility", label: "Accessibility",     icon: EyeIcon },
      { id: "notifications", label: "Notifications",     icon: BellIcon },
      { id: "privacy",       label: "Privacy",           icon: ShieldIcon },
    ],
  },
];

// ─── ACCENT COLOR OPTIONS ────────────────────────────────────────────────────
const ACCENTS = [
  { id: "indigo", color: "#6366F1", bg: "#EEF2FF", label: "Indigo" },
  { id: "blue",   color: "#3B82F6", bg: "#DBEAFE", label: "Blue" },
  { id: "teal",   color: "#0D9488", bg: "#CCFBF1", label: "Teal" },
  { id: "rose",   color: "#F43F5E", bg: "#FFE4E6", label: "Rose" },
  { id: "amber",  color: "#F59E0B", bg: "#FEF3C7", label: "Amber" },
  { id: "emerald",color: "#10B981", bg: "#D1FAE5", label: "Emerald" },
];

// ─── FONT OPTIONS ─────────────────────────────────────────────────────────────
const BODY_FONTS = ["DM Sans", "Lato", "Nunito"];
const HEADING_FONTS = ["Fraunces", "Playfair Display", "DM Serif Display"];

// ─── Icon Components ──────────────────────────────────────────────────────────
function PaletteIcon({ size=16, color="currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5"/><circle cx="7" cy="8" r="1.5" fill={color}/><circle cx="17" cy="8" r="1.5" fill={color}/><circle cx="10" cy="15" r="1.5" fill={color}/><circle cx="14" cy="15" r="1.5" fill={color}/></svg>;
}
function TypeIcon({ size=16, color="currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M4 8h16M4 14h16" stroke={color} strokeWidth="1.5" strokeLinecap="round"/></svg>;
}
function LayoutIcon({ size=16, color="currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="1.5"/><path d="M3 9h18" stroke={color} strokeWidth="1.5"/><path d="M9 9v12" stroke={color} strokeWidth="1.5"/></svg>;
}
function ZapIcon({ size=16, color="currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><polygon points="13 2 3 14 10 14 10 22 21 10 14 10 14 2" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function BellIcon({ size=16, color="currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function EyeIcon({ size=16, color="currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={color} strokeWidth="1.5"/><circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.5"/></svg>;
}
function ShieldIcon({ size=16, color="currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M12 1l8 3v7c0 6-8 8-8 8s-8-2-8-8V4l8-3z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function SunIcon({ size=16, color="currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="5" stroke={color} strokeWidth="1.5"/><path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" stroke={color} strokeWidth="1.5" strokeLinecap="round"/></svg>;
}
function SidebarIcon({ size=16, color="currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="1.5"/><path d="M9 3v18" stroke={color} strokeWidth="1.5"/></svg>;
}
function DropletIcon({ size=16, color="currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.32 0z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function HeadingIcon({ size=16, color="currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M6 4v16M18 4v16M6 12h12" stroke={color} strokeWidth="1.5" strokeLinecap="round"/></svg>;
}
function GridIcon({ size=16, color="currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" stroke={color} strokeWidth="1.5"/><rect x="14" y="3" width="7" height="7" stroke={color} strokeWidth="1.5"/><rect x="3" y="14" width="7" height="7" stroke={color} strokeWidth="1.5"/><rect x="14" y="14" width="7" height="7" stroke={color} strokeWidth="1.5"/></svg>;
}
function RadiusIcon({ size=16, color="currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M3 12c0-4.97 4.03-9 9-9s9 4.03 9 9-4.03 9-9 9-9-4.03-9-9z" stroke={color} strokeWidth="1.5"/><circle cx="12" cy="12" r="3" fill={color}/></svg>;
}
function LayersIcon({ size=16, color="currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><polyline points="12 2 20 6 20 14 12 18 4 14 4 6 12 2" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><polyline points="4 10 12 14 20 10" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function SaveIcon({ size=16, color="currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><polyline points="17 21 17 13 7 13 7 21" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><polyline points="7 5 7 3 17 3 17 5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function SpinIcon({ size=16, color="currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" opacity="0.3"/><path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="2" strokeLinecap="round"/></svg>;
}

// ─── Toggle Component ────────────────────────────────────────────────────────
function Toggle({ checked, onChange, danger }) {
  return (
    <label className="toggle-wrap" style={{ opacity: danger ? 0.65 : 1 }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <div className="toggle-track" />
      <div className="toggle-knob" />
    </label>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DoctorSettingsPage() {
  const [activeTab, setActiveTab]     = useState("theme");
  const [saved, setSaved]             = useState(false);
  const [saveAnim, setSaveAnim]       = useState(false);

  // Theme state
  const [colorMode, setColorMode]     = useState("light");
  const [darkMode, setDarkMode]       = useState(false);
  const [accent, setAccent]           = useState(ACCENTS[0]);
  const [sidebarStyle, setSidebarStyle] = useState("dark");

  // Typography state
  const [bodyFont, setBodyFont]       = useState("DM Sans");
  const [headingFont, setHeadingFont] = useState("Fraunces");
  const [fontSize, setFontSize]       = useState(14);
  const [lineHeight, setLineHeight]   = useState("normal");

  // Layout state
  const [density, setDensity]         = useState("comfortable");
  const [radius, setRadius]           = useState(12);
  const [cardShadow, setCardShadow]   = useState("subtle");

  // Motion state
  const [animations, setAnimations]   = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [animSpeed, setAnimSpeed]     = useState("normal");
  const [skeletons, setSkeletons]     = useState(true);

  // Language & Region state
  const [language, setLanguage]       = useState("English");
  const [region, setRegion]           = useState("India");
  const [timeFormat, setTimeFormat]   = useState("12h");
  const [dateFormat, setDateFormat]   = useState("DD/MM/YYYY");

  // Accessibility state
  const [highContrast, setHighContrast] = useState(false);
  const [colorBlind, setColorBlind]   = useState(false);
  const [focusRings, setFocusRings]   = useState(true);

  // Notification state
  const [notifBadge, setNotifBadge]   = useState(true);
  const [notifToast, setNotifToast]   = useState(true);
  const [scheduleReminders, setScheduleReminders] = useState(true);
  const [queueAlerts, setQueueAlerts] = useState(true);

  // Privacy state
  const [analytics, setAnalytics]     = useState(true);
  const [aiFeatures, setAiFeatures]   = useState(true);
  const [shareData, setShareData]     = useState(false);

  const handleSave = () => {
    setSaveAnim(true);
    setTimeout(() => {
      setSaved(true);
      setSaveAnim(false);
      setTimeout(() => setSaved(false), 2500);
    }, 400);
  };

  const handleReset = () => {
    setColorMode("light"); setDarkMode(false); setAccent(ACCENTS[0]); setSidebarStyle("dark");
    setBodyFont("DM Sans"); setHeadingFont("Fraunces"); setFontSize(14); setLineHeight("normal");
    setDensity("comfortable"); setRadius(12); setCardShadow("subtle");
    setAnimations(true); setReduceMotion(false); setAnimSpeed("normal"); setSkeletons(true);
    setLanguage("English"); setRegion("India"); setTimeFormat("12h"); setDateFormat("DD/MM/YYYY");
    setHighContrast(false); setColorBlind(false); setFocusRings(true);
    setNotifBadge(true); setNotifToast(true); setScheduleReminders(true); setQueueAlerts(true);
    setAnalytics(true); setAiFeatures(true); setShareData(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=Fraunces:ital,opsz,wght@0,9..144,700;1,9..144,500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .settings-page {
          display: flex;
          min-height: 100vh;
          background: ${C.surface};
          font-family: ${FONT_SANS};
        }

        .settings-nav {
          width: 240px;
          background: ${C.sidebarBg};
          display: flex;
          flex-direction: column;
          padding: 0;
          flex-shrink: 0;
          position: sticky;
          top: 0;
          height: 100vh;
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 24px 22px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .nav-brand-icon {
          width: 32px;
          height: 32px;
          background: ${C.primary};
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-brand-label {
          font-family: ${FONT_SERIF};
          font-size: 17px;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.3px;
        }

        .nav-brand-sub {
          font-family: ${FONT_SANS};
          font-size: 10px;
          color: rgba(255,255,255,0.35);
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-top: 1px;
        }

        .nav-group-label {
          font-family: ${FONT_SANS};
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.25);
          padding: 20px 22px 7px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 18px 10px 22px;
          cursor: pointer;
          border-left: 2.5px solid transparent;
          transition: all 0.18s ease;
          font-size: 13px;
          font-weight: 400;
          color: rgba(255,255,255,0.48);
          user-select: none;
        }

        .nav-item:hover {
          color: rgba(255,255,255,0.78);
          background: rgba(255,255,255,0.04);
        }

        .nav-item.active {
          color: ${C.primaryLight};
          border-left-color: ${C.primary};
          background: rgba(99,102,241,0.12);
          font-weight: 500;
        }

        .nav-bottom {
          margin-top: auto;
          padding: 16px 22px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        .settings-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        .settings-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 36px;
          background: ${C.white};
          border-bottom: 1px solid ${C.border};
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .settings-topbar-left h1 {
          font-family: ${FONT_SERIF};
          font-size: 20px;
          font-weight: 700;
          color: ${C.text};
          letter-spacing: -0.4px;
        }

        .settings-topbar-left p {
          font-family: ${FONT_SANS};
          font-size: 12px;
          color: ${C.textMuted};
          margin-top: 2px;
        }

        .topbar-actions { display: flex; align-items: center; gap: 10px; }

        .btn-ghost {
          padding: 8px 18px;
          border-radius: 9px;
          border: 1.5px solid ${C.border};
          background: transparent;
          font-family: ${FONT_SANS};
          font-size: 13px;
          font-weight: 500;
          color: ${C.textMuted};
          cursor: pointer;
          transition: all 0.16s;
        }
        .btn-ghost:hover { background: ${C.surfaceAlt}; color: ${C.text}; border-color: ${C.primary}; }

        .btn-primary {
          padding: 8px 22px;
          border-radius: 9px;
          border: none;
          background: ${C.primary};
          font-family: ${FONT_SANS};
          font-size: 13px;
          font-weight: 600;
          color: white;
          cursor: pointer;
          transition: all 0.18s;
          box-shadow: 0 4px 14px ${C.primaryGlow};
          display: flex;
          align-items: center;
          gap: 7px;
        }
        .btn-primary:hover { background: ${C.primaryDark}; box-shadow: 0 6px 20px ${C.primaryGlow}; transform: translateY(-1px); }
        .btn-primary.saving { opacity: 0.75; pointer-events: none; }

        .saved-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 100px;
          background: ${C.emeraldLight};
          color: ${C.emerald};
          font-family: ${FONT_SANS};
          font-size: 12px;
          font-weight: 600;
          animation: fadeInUp 0.3s ease;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .settings-body {
          flex: 1;
          padding: 32px 36px 48px;
          max-width: 780px;
        }

        .section-card {
          background: ${C.white};
          border: 1px solid ${C.border};
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 18px;
          animation: fadeInUp 0.25s ease both;
        }

        .section-card-header {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 18px 24px;
          border-bottom: 1px solid ${C.borderMuted};
          background: ${C.surfaceAlt};
        }

        .section-icon-wrap {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .section-card-header h2 {
          font-family: ${FONT_SANS};
          font-size: 14px;
          font-weight: 600;
          color: ${C.text};
        }

        .section-card-header p {
          font-family: ${FONT_SANS};
          font-size: 12px;
          color: ${C.textMuted};
          margin-top: 2px;
        }

        .setting-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          border-bottom: 1px solid ${C.borderMuted};
          gap: 20px;
          transition: background 0.12s;
        }
        .setting-row:last-child { border-bottom: none; }
        .setting-row:hover { background: ${C.surface}; }

        .setting-meta { flex: 1; min-width: 0; }
        .setting-label {
          font-family: ${FONT_SANS};
          font-size: 13px;
          font-weight: 500;
          color: ${C.text};
        }
        .setting-desc {
          font-family: ${FONT_SANS};
          font-size: 12px;
          color: ${C.textLight};
          margin-top: 2px;
          line-height: 1.5;
        }

        .toggle-wrap {
          position: relative;
          width: 42px;
          height: 24px;
          flex-shrink: 0;
          cursor: pointer;
        }
        .toggle-wrap input { position: absolute; opacity: 0; width: 0; height: 0; }
        .toggle-track {
          position: absolute;
          inset: 0;
          border-radius: 12px;
          background: ${C.border};
          transition: background 0.22s;
        }
        .toggle-wrap input:checked ~ .toggle-track { background: ${C.primary}; }
        .toggle-knob {
          position: absolute;
          top: 3px; left: 3px;
          width: 18px; height: 18px;
          border-radius: 50%;
          background: white;
          transition: transform 0.22s cubic-bezier(.34,1.56,.64,1);
          box-shadow: 0 1px 4px rgba(0,0,0,0.18);
        }
        .toggle-wrap input:checked ~ .toggle-track ~ .toggle-knob { transform: translateX(18px); }

        .chip-group { display: flex; gap: 7px; flex-wrap: wrap; }
        .chip {
          padding: 6px 15px;
          border-radius: 100px;
          border: 1.5px solid ${C.border};
          background: ${C.white};
          font-family: ${FONT_SANS};
          font-size: 12px;
          font-weight: 400;
          color: ${C.textMuted};
          cursor: pointer;
          transition: all 0.16s;
          user-select: none;
        }
        .chip:hover { border-color: ${C.primary}; color: ${C.primary}; }
        .chip.active {
          background: ${C.primaryXLight};
          border-color: ${C.primary};
          color: ${C.primary};
          font-weight: 600;
        }

        .tab-heading {
          margin-bottom: 24px;
          padding-bottom: 18px;
          border-bottom: 1px solid ${C.border};
        }
        .tab-heading h2 {
          font-family: ${FONT_SERIF};
          font-size: 22px;
          font-weight: 700;
          color: ${C.text};
          letter-spacing: -0.3px;
          margin-bottom: 4px;
        }
        .tab-heading p {
          font-family: ${FONT_SANS};
          font-size: 13px;
          color: ${C.textMuted};
        }
      `}</style>

      <div className="settings-page">
        {/* ── Sidebar ──────────────────────────────────────────── */}
        <nav className="settings-nav">
          <div className="nav-brand">
            <div className="nav-brand-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 21v-2m0-14V3m9 9h-2m-14 0H3m16.485-5.485l1.414-1.414m-18.898 0l1.414 1.414m16.898 18.898l-1.414 1.414M4.929 4.929l-1.414 1.414" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <div className="nav-brand-label">Healthify</div>
              <div className="nav-brand-sub">Doctor Settings</div>
            </div>
          </div>

          {NAV.map((group) => (
            <div key={group.group}>
              <div className="nav-group-label">{group.group}</div>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className={`nav-item ${activeTab === item.id ? "active" : ""}`}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <Icon size={14} />
                    {item.label}
                  </div>
                );
              })}
            </div>
          ))}

          <div className="nav-bottom">
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", fontFamily: FONT_SANS, lineHeight: 1.6 }}>
              Healthify v2.4.1<br />Doctor Portal
            </div>
          </div>
        </nav>

        {/* ── Main Content ─────────────────────────────────────── */}
        <div className="settings-content">
          <div className="settings-topbar">
            <div className="settings-topbar-left">
              <h1>{NAV.flatMap(g => g.items).find(i => i.id === activeTab)?.label}</h1>
              <p>Customize your Doctor Portal experience</p>
            </div>
            <div className="topbar-actions">
              {saved && (
                <div className="saved-badge">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke={C.emerald} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Saved
                </div>
              )}
              <button className="btn-ghost" onClick={handleReset}>Reset defaults</button>
              <button className={`btn-primary ${saveAnim ? "saving" : ""}`} onClick={handleSave}>
                {saveAnim
                  ? <><SpinIcon /> Saving…</>
                  : <><SaveIcon /> Save changes</>
                }
              </button>
            </div>
          </div>

          <div className="settings-body">
            {/* Simplified settings content for doctor portal */}
            {activeTab === "theme" && (
              <div key="theme">
                <div className="tab-heading">
                  <h2>Doctor Portal Theme</h2>
                  <p>Customize your doctor dashboard appearance</p>
                </div>
                <div className="section-card">
                  <div className="section-card-header">
                    <div className="section-icon-wrap" style={{ background: C.primaryXLight }}>
                      <PaletteIcon size={16} color={C.primary} />
                    </div>
                    <div>
                      <h2>Primary Color</h2>
                      <p>Accent color for buttons, alerts, and active states</p>
                    </div>
                  </div>
                  <div className="setting-row">
                    <div className="setting-meta">
                      <div className="setting-label">Choose your accent color</div>
                      <div className="setting-desc">Applied across all doctor dashboard components</div>
                    </div>
                    <div style={{ display: "flex", gap: 12 }}>
                      {ACCENTS.map(a => (
                        <div key={a.id} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                          <div
                            style={{ width: 30, height: 30, borderRadius: "50%", background: a.color, border: accent.id === a.id ? `3px solid ${a.color}` : "2px solid #ddd", boxShadow: accent.id === a.id ? `0 0 0 2px white` : "none", cursor: "pointer", transition: "all 0.2s" }}
                            onClick={() => setAccent(a)}
                          />
                          <span style={{ fontSize: 10, color: C.textMuted, marginTop: 4 }}>{a.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div key="notifications">
                <div className="tab-heading">
                  <h2>Notifications</h2>
                  <p>Control doctor-specific alerts and reminders</p>
                </div>
                <div className="section-card">
                  <div className="section-card-header">
                    <div className="section-icon-wrap" style={{ background: C.primaryXLight }}>
                      <BellIcon size={16} color={C.primary} />
                    </div>
                    <div><h2>Alert Preferences</h2><p>Manage how you receive notifications</p></div>
                  </div>
                  {[
                    { label: "Schedule reminders",    desc: "Get alerts for upcoming appointments and schedule changes",    val: scheduleReminders, set: setScheduleReminders },
                    { label: "Live queue alerts",    desc: "Notifications when patients join your queue or conditions change",  val: queueAlerts,  set: setQueueAlerts },
                    { label: "No-show notifications",  desc: "Alert when a patient marks no-show or misses appointment",       val: notifToast,   set: setNotifToast },
                    { label: "Unread badge",         desc: "Show count of unread notifications on sidebar",                  val: notifBadge,   set: setNotifBadge },
                  ].map(({ label, desc, val, set }) => (
                    <div className="setting-row" key={label}>
                      <div className="setting-meta">
                        <div className="setting-label">{label}</div>
                        <div className="setting-desc">{desc}</div>
                      </div>
                      <Toggle checked={val} onChange={set} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!["theme", "notifications"].includes(activeTab) && (
              <div key="placeholder">
                <div className="tab-heading">
                  <h2>{NAV.flatMap(g => g.items).find(i => i.id === activeTab)?.label}</h2>
                  <p>Configure your preferences</p>
                </div>
                <div className="section-card">
                  <div style={{ padding: "40px 24px", textAlign: "center" }}>
                    <p style={{ fontFamily: FONT_SANS, color: C.textMuted, fontSize: 14 }}>
                      This settings category is coming soon for the doctor portal.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
