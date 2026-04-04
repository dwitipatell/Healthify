// src/pages/SettingsPage.jsx
// ─── Healthify · Settings — Theme & Preferences ───────────────────────────────
// Matches the teal/dark patient portal aesthetic exactly.
// Uses DM Sans + Fraunces fonts, teal primary palette, animated interactions.

import { useState, useEffect } from 'react';

// ─── Theme tokens (mirrors patientdashboard exactly) ─────────────────────────
const C = {
  sidebarBg: "#0D2926",
  primary: "#0D9488",
  primaryDark: "#0F766E",
  primaryLight: "#CCFBF1",
  primaryXLight: "#F0FDFA",
  primaryGlow: "rgba(13,148,136,0.18)",
  accent: "#6366F1",
  accentLight: "#EEF2FF",
  amber: "#F59E0B",
  amberLight: "#FEF3C7",
  rose: "#F43F5E",
  roseLight: "#FFE4E6",
  emerald: "#10B981",
  emeraldLight: "#D1FAE5",
  text: "#0F2422",
  textMuted: "#4B7B76",
  textLight: "#7CA8A4",
  white: "#FFFFFF",
  surface: "#F8FFFE",
  surfaceAlt: "#F0FDFA",
  border: "#D1F0EC",
  borderMuted: "#E5F7F5",
};

const FONT_SANS = "'DM Sans', sans-serif";
const FONT_SERIF = "'Fraunces', serif";

// ─── NAV ITEMS ────────────────────────────────────────────────────────────────
const NAV = [
  {
    group: "Appearance",
    items: [
      { id: "theme",        label: "Theme & Colors",     icon: PaletteIcon },
      { id: "typography",   label: "Typography",         icon: TypeIcon },
      { id: "layout",       label: "Layout & Density",   icon: LayoutIcon },
      { id: "motion",       label: "Motion",             icon: ZapIcon },
    ],
  },
  {
    group: "Preferences",
    items: [
      { id: "accessibility", label: "Accessibility",     icon: EyeIcon },
      { id: "notifications", label: "Notifications",     icon: BellIcon },
      { id: "privacy",       label: "Privacy",           icon: ShieldIcon },
    ],
  },
];

// ─── ACCENT COLOR OPTIONS ────────────────────────────────────────────────────
const ACCENTS = [
  { id: "teal",   color: "#0D9488", bg: "#CCFBF1", label: "Teal" },
  { id: "indigo", color: "#6366F1", bg: "#EEF2FF", label: "Indigo" },
  { id: "rose",   color: "#F43F5E", bg: "#FFE4E6", label: "Rose" },
  { id: "amber",  color: "#F59E0B", bg: "#FEF3C7", label: "Amber" },
  { id: "emerald",color: "#10B981", bg: "#D1FAE5", label: "Emerald" },
  { id: "blue",   color: "#3B82F6", bg: "#DBEAFE", label: "Blue" },
];

// ─── FONT OPTIONS ─────────────────────────────────────────────────────────────
const BODY_FONTS = ["DM Sans", "Lato", "Nunito"];
const HEADING_FONTS = ["Fraunces", "Playfair Display", "DM Serif Display"];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [activeTab, setActiveTab]     = useState("theme");
  const [saved, setSaved]             = useState(false);
  const [saveAnim, setSaveAnim]       = useState(false);

  // Theme state
  const [colorMode, setColorMode]     = useState("light");
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

  // Accessibility state
  const [highContrast, setHighContrast] = useState(false);
  const [colorBlind, setColorBlind]   = useState(false);
  const [focusRings, setFocusRings]   = useState(true);

  // Notification state
  const [notifBadge, setNotifBadge]   = useState(true);
  const [notifToast, setNotifToast]   = useState(true);
  const [apptReminders, setApptReminders] = useState(true);
  const [noshowAlerts, setNoshowAlerts] = useState(true);

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
    setColorMode("light"); setAccent(ACCENTS[0]); setSidebarStyle("dark");
    setBodyFont("DM Sans"); setHeadingFont("Fraunces"); setFontSize(14); setLineHeight("normal");
    setDensity("comfortable"); setRadius(12); setCardShadow("subtle");
    setAnimations(true); setReduceMotion(false); setAnimSpeed("normal"); setSkeletons(true);
    setHighContrast(false); setColorBlind(false); setFocusRings(true);
    setNotifBadge(true); setNotifToast(true); setApptReminders(true); setNoshowAlerts(true);
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

        /* ── Sidebar Nav ─────────────────────────────────────── */
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
          background: rgba(13,148,136,0.12);
          font-weight: 500;
        }

        .nav-item svg { flex-shrink: 0; opacity: 0.7; }
        .nav-item.active svg { opacity: 1; }

        .nav-bottom {
          margin-top: auto;
          padding: 16px 22px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        /* ── Content area ────────────────────────────────────── */
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
        .btn-primary:active { transform: translateY(0); }
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

        /* ── Section cards ──────────────────────────────────── */
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

        /* ── Setting rows ───────────────────────────────────── */
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

        /* ── Toggle ─────────────────────────────────────────── */
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

        /* ── Pill chips ─────────────────────────────────────── */
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

        /* ── Font chips ─────────────────────────────────────── */
        .font-chip {
          padding: 7px 16px;
          border-radius: 9px;
          border: 1.5px solid ${C.border};
          background: ${C.white};
          font-size: 13px;
          color: ${C.textMuted};
          cursor: pointer;
          transition: all 0.16s;
          user-select: none;
        }
        .font-chip:hover { border-color: ${C.primary}; color: ${C.primary}; }
        .font-chip.active {
          background: ${C.primaryXLight};
          border-color: ${C.primary};
          color: ${C.primary};
          font-weight: 500;
        }

        /* ── Accent swatches ────────────────────────────────── */
        .swatch-row { display: flex; gap: 10px; align-items: center; }
        .swatch {
          width: 30px; height: 30px;
          border-radius: 50%;
          cursor: pointer;
          border: 2.5px solid transparent;
          outline: 2px solid transparent;
          transition: all 0.18s cubic-bezier(.34,1.56,.64,1);
          position: relative;
        }
        .swatch:hover { transform: scale(1.15); }
        .swatch.active {
          border-color: white;
          outline-color: currentColor;
          transform: scale(1.2);
          box-shadow: 0 4px 12px rgba(0,0,0,0.18);
        }
        .swatch-label {
          font-family: ${FONT_SANS};
          font-size: 11px;
          color: ${C.textLight};
          margin-top: 5px;
          text-align: center;
        }

        /* ── Radius slider ──────────────────────────────────── */
        .slider-row { display: flex; align-items: center; gap: 12px; }
        .slider-track {
          flex: 1;
          -webkit-appearance: none;
          appearance: none;
          height: 4px;
          border-radius: 2px;
          background: ${C.border};
          outline: none;
          cursor: pointer;
        }
        .slider-track::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px; height: 18px;
          border-radius: 50%;
          background: ${C.primary};
          border: 2.5px solid white;
          box-shadow: 0 2px 8px ${C.primaryGlow};
          cursor: pointer;
          transition: transform 0.15s;
        }
        .slider-track::-webkit-slider-thumb:hover { transform: scale(1.15); }
        .slider-val {
          font-family: ${FONT_SANS};
          font-size: 12px;
          font-weight: 600;
          color: ${C.primary};
          min-width: 38px;
          text-align: center;
          background: ${C.primaryXLight};
          padding: 3px 8px;
          border-radius: 6px;
        }

        /* ── Density picker ─────────────────────────────────── */
        .density-grid { display: flex; gap: 10px; }
        .density-card {
          flex: 1;
          padding: 14px 12px 12px;
          border: 1.5px solid ${C.border};
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.16s;
          text-align: center;
          background: ${C.white};
        }
        .density-card:hover { border-color: ${C.primary}; }
        .density-card.active {
          border-color: ${C.primary};
          background: ${C.primaryXLight};
          box-shadow: 0 4px 14px ${C.primaryGlow};
        }
        .density-lines { display: flex; flex-direction: column; align-items: center; margin-bottom: 8px; }
        .density-line {
          width: 28px; height: 3px;
          border-radius: 2px;
          background: ${C.border};
        }
        .density-card.active .density-line { background: ${C.primary}; }
        .density-name {
          font-family: ${FONT_SANS};
          font-size: 11px;
          font-weight: 500;
          color: ${C.textMuted};
        }
        .density-card.active .density-name { color: ${C.primary}; }

        /* ── Preview card ───────────────────────────────────── */
        .preview-surface {
          background: ${C.surfaceAlt};
          border-radius: 10px;
          padding: 14px 16px;
          width: 100%;
        }
        .preview-card-inner {
          background: white;
          border: 1px solid ${C.border};
          padding: 14px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: border-radius 0.25s, box-shadow 0.2s;
        }
        .preview-avatar-box {
          width: 38px; height: 38px;
          background: ${C.primaryLight};
          display: flex; align-items: center; justify-content: center;
          font-family: ${FONT_SANS};
          font-size: 13px;
          font-weight: 700;
          color: ${C.primary};
          flex-shrink: 0;
          transition: border-radius 0.25s;
        }
        .preview-badge {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 600;
          background: ${C.emeraldLight};
          color: ${C.emerald};
          margin-left: auto;
          transition: background 0.2s, color 0.2s;
        }

        /* ── Mode selector cards ────────────────────────────── */
        .mode-grid { display: flex; gap: 10px; }
        .mode-card {
          flex: 1;
          padding: 14px 16px;
          border: 1.5px solid ${C.border};
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.16s;
          display: flex;
          align-items: center;
          gap: 10px;
          background: white;
        }
        .mode-card:hover { border-color: ${C.primary}; }
        .mode-card.active {
          border-color: ${C.primary};
          background: ${C.primaryXLight};
        }
        .mode-preview {
          width: 36px; height: 24px;
          border-radius: 5px;
          border: 1.5px solid ${C.border};
          overflow: hidden;
          flex-shrink: 0;
        }
        .mode-label {
          font-family: ${FONT_SANS};
          font-size: 13px;
          font-weight: 500;
          color: ${C.textMuted};
        }
        .mode-card.active .mode-label { color: ${C.primary}; }

        /* ── Tab heading ────────────────────────────────────── */
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

        /* ── Sidebar style selector ─────────────────────────── */
        .sidebar-grid { display: flex; gap: 10px; }
        .sidebar-opt {
          width: 64px;
          cursor: pointer;
          transition: transform 0.15s;
        }
        .sidebar-opt:hover { transform: scale(1.04); }
        .sidebar-thumb {
          height: 48px;
          border-radius: 8px;
          border: 2px solid transparent;
          overflow: hidden;
          display: flex;
          transition: border-color 0.16s;
        }
        .sidebar-opt.active .sidebar-thumb { border-color: ${C.primary}; }
        .sidebar-thumb-bar { width: 16px; height: 100%; }
        .sidebar-thumb-main { flex: 1; }
        .sidebar-opt-label {
          font-family: ${FONT_SANS};
          font-size: 10px;
          text-align: center;
          color: ${C.textLight};
          margin-top: 5px;
        }
        .sidebar-opt.active .sidebar-opt-label { color: ${C.primary}; font-weight: 600; }

        /* ── Badge variants ─────────────────────────────────── */
        .danger-badge {
          padding: 4px 10px;
          border-radius: 100px;
          background: ${C.roseLight};
          color: ${C.rose};
          font-family: ${FONT_SANS};
          font-size: 11px;
          font-weight: 600;
        }
      `}</style>

      <div className="settings-page">
        {/* ── Sidebar ──────────────────────────────────────────── */}
        <nav className="settings-nav">
          <div className="nav-brand">
            <div className="nav-brand-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div className="nav-brand-label">Healthify</div>
              <div className="nav-brand-sub">Settings</div>
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
              Healthify v2.4.1<br />Patient Portal
            </div>
          </div>
        </nav>

        {/* ── Main Content ─────────────────────────────────────── */}
        <div className="settings-content">
          <div className="settings-topbar">
            <div className="settings-topbar-left">
              <h1>{NAV.flatMap(g => g.items).find(i => i.id === activeTab)?.label}</h1>
              <p>Customize your Healthify experience</p>
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

            {/* ════ THEME TAB ══════════════════════════════════════ */}
            {activeTab === "theme" && (
              <div key="theme">
                <div className="tab-heading">
                  <h2>Theme & Colors</h2>
                  <p>Set the overall visual tone of the interface</p>
                </div>

                {/* Color Mode */}
                <div className="section-card">
                  <div className="section-card-header">
                    <div className="section-icon-wrap" style={{ background: C.primaryXLight }}>
                      <SunIcon size={16} color={C.primary} />
                    </div>
                    <div>
                      <h2>Color Mode</h2>
                      <p>Choose your preferred light or dark scheme</p>
                    </div>
                  </div>
                  <div className="setting-row">
                    <div className="setting-meta">
                      <div className="setting-label">Appearance</div>
                      <div className="setting-desc">Controls the base color palette of the entire interface</div>
                    </div>
                    <div className="mode-grid">
                      {[
                        { id: "light",  label: "Light",  bar: "#0D9488", bg: "#F8FFFE" },
                        { id: "dark",   label: "Dark",   bar: "#0D9488", bg: "#0D2926" },
                        { id: "system", label: "System", bar: "#0D9488", bg: "linear-gradient(90deg,#F8FFFE 50%,#0D2926 50%)" },
                      ].map(m => (
                        <div
                          key={m.id}
                          className={`mode-card ${colorMode === m.id ? "active" : ""}`}
                          onClick={() => setColorMode(m.id)}
                        >
                          <div className="mode-preview">
                            <div style={{ display: "flex", height: "100%" }}>
                              <div style={{ width: 10, background: m.bar }} />
                              <div style={{ flex: 1, background: m.bg }} />
                            </div>
                          </div>
                          <span className="mode-label">{m.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Accent Color */}
                <div className="section-card">
                  <div className="section-card-header">
                    <div className="section-icon-wrap" style={{ background: C.amberLight }}>
                      <DropletIcon size={16} color={C.amber} />
                    </div>
                    <div>
                      <h2>Accent Color</h2>
                      <p>Applied to buttons, active states, links, and highlights</p>
                    </div>
                  </div>
                  <div className="setting-row" style={{ alignItems: "flex-start" }}>
                    <div className="setting-meta">
                      <div className="setting-label">Primary accent</div>
                      <div className="setting-desc">Choose a color that suits your style — currently <strong style={{ color: accent.color }}>{accent.label}</strong></div>
                    </div>
                    <div>
                      <div className="swatch-row">
                        {ACCENTS.map(a => (
                          <div key={a.id} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <div
                              className={`swatch ${accent.id === a.id ? "active" : ""}`}
                              style={{ background: a.color, outlineColor: a.color }}
                              onClick={() => setAccent(a)}
                            />
                            <div className="swatch-label">{a.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Live preview */}
                  <div className="setting-row" style={{ background: C.surface }}>
                    <div className="setting-meta">
                      <div className="setting-label" style={{ fontSize: 11, color: C.textLight, textTransform: "uppercase", letterSpacing: "0.6px" }}>Preview</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ padding: "4px 12px", borderRadius: 100, background: accent.bg, color: accent.color, fontSize: 11, fontWeight: 600, fontFamily: FONT_SANS }}>Confirmed</span>
                      <button style={{ padding: "6px 16px", borderRadius: 8, border: "none", background: accent.color, color: "white", fontFamily: FONT_SANS, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                        Book Now
                      </button>
                      <div style={{ width: 20, height: 20, borderRadius: "50%", background: accent.bg, border: `2px solid ${accent.color}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: accent.color }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar Style */}
                <div className="section-card">
                  <div className="section-card-header">
                    <div className="section-icon-wrap" style={{ background: C.accentLight }}>
                      <SidebarIcon size={16} color={C.accent} />
                    </div>
                    <div>
                      <h2>Sidebar Style</h2>
                      <p>Visual treatment of the navigation panel</p>
                    </div>
                  </div>
                  <div className="setting-row">
                    <div className="setting-meta">
                      <div className="setting-label">Background style</div>
                      <div className="setting-desc">Affects the sidebar's color, contrast, and feel</div>
                    </div>
                    <div className="sidebar-grid">
                      {[
                        { id: "dark",     label: "Dark",     bar: "#0D2926", bg: "#F8FFFE" },
                        { id: "light",    label: "Light",    bar: "#E5F7F5", bg: "#FFFFFF" },
                        { id: "gradient", label: "Gradient", bar: "#0D9488", bg: "#F0FDFA" },
                        { id: "tinted",   label: "Tinted",   bar: "#0D9488", bg: "#F0FDFA" },
                      ].map(s => (
                        <div
                          key={s.id}
                          className={`sidebar-opt ${sidebarStyle === s.id ? "active" : ""}`}
                          onClick={() => setSidebarStyle(s.id)}
                        >
                          <div className="sidebar-thumb">
                            <div className="sidebar-thumb-bar" style={{ background: s.bar }} />
                            <div className="sidebar-thumb-main" style={{ background: s.bg }} />
                          </div>
                          <div className="sidebar-opt-label">{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ════ TYPOGRAPHY TAB ═════════════════════════════════ */}
            {activeTab === "typography" && (
              <div key="typography">
                <div className="tab-heading">
                  <h2>Typography</h2>
                  <p>Control fonts, sizes, and text weight across the app</p>
                </div>

                <div className="section-card">
                  <div className="section-card-header">
                    <div className="section-icon-wrap" style={{ background: C.primaryXLight }}>
                      <TypeIcon size={16} color={C.primary} />
                    </div>
                    <div><h2>Body Font</h2><p>Primary typeface for labels, content, and UI text</p></div>
                  </div>
                  <div className="setting-row">
                    <div className="setting-meta">
                      <div className="setting-label">Font family</div>
                      <div className="setting-desc">Used throughout the interface for all body and UI text</div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {BODY_FONTS.map(f => (
                        <div
                          key={f}
                          className={`font-chip ${bodyFont === f ? "active" : ""}`}
                          style={{ fontFamily: `'${f}', sans-serif` }}
                          onClick={() => setBodyFont(f)}
                        >{f}</div>
                      ))}
                    </div>
                  </div>
                  <div className="setting-row">
                    <div className="setting-meta">
                      <div className="setting-label">Base size</div>
                      <div className="setting-desc">Scales all body text proportionally — {fontSize}px</div>
                    </div>
                    <div className="slider-row" style={{ width: 220 }}>
                      <input
                        type="range" min="12" max="18" step="1" value={fontSize}
                        onChange={e => setFontSize(+e.target.value)}
                        className="slider-track"
                        style={{ flex: 1 }}
                      />
                      <span className="slider-val">{fontSize}px</span>
                    </div>
                  </div>
                  <div className="setting-row">
                    <div className="setting-meta">
                      <div className="setting-label">Line height</div>
                      <div className="setting-desc">Controls vertical spacing between lines of text</div>
                    </div>
                    <div className="chip-group">
                      {["tight","normal","relaxed"].map(lh => (
                        <div key={lh} className={`chip ${lineHeight === lh ? "active" : ""}`} onClick={() => setLineHeight(lh)}>
                          {lh.charAt(0).toUpperCase() + lh.slice(1)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="section-card">
                  <div className="section-card-header">
                    <div className="section-icon-wrap" style={{ background: C.primaryXLight }}>
                      <HeadingIcon size={16} color={C.primary} />
                    </div>
                    <div><h2>Heading Font</h2><p>Display typeface used for page titles and card headers</p></div>
                  </div>
                  <div className="setting-row">
                    <div className="setting-meta">
                      <div className="setting-label">Display typeface</div>
                      <div className="setting-desc">Adds personality to section titles and major headings</div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {HEADING_FONTS.map(f => (
                        <div
                          key={f}
                          className={`font-chip ${headingFont === f ? "active" : ""}`}
                          style={{ fontFamily: `'${f}', serif` }}
                          onClick={() => setHeadingFont(f)}
                        >{f}</div>
                      ))}
                    </div>
                  </div>
                  {/* Live preview */}
                  <div className="setting-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: 10, background: C.surfaceAlt }}>
                    <div style={{ fontSize: 11, color: C.textLight, textTransform: "uppercase", letterSpacing: "0.6px", fontFamily: FONT_SANS }}>Preview</div>
                    <div style={{ fontFamily: `'${headingFont}', serif`, fontSize: 22, fontWeight: 700, color: C.text, letterSpacing: "-0.3px" }}>
                      Book an Appointment
                    </div>
                    <div style={{ fontFamily: `'${bodyFont}', sans-serif`, fontSize: fontSize, color: C.textMuted, lineHeight: lineHeight === "tight" ? 1.3 : lineHeight === "relaxed" ? 1.9 : 1.6 }}>
                      Smart scheduling with real-time availability and AI-powered duration predictions to help you get the care you need.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ════ LAYOUT TAB ═════════════════════════════════════ */}
            {activeTab === "layout" && (
              <div key="layout">
                <div className="tab-heading">
                  <h2>Layout & Density</h2>
                  <p>Control spacing, corner radius, and information density</p>
                </div>

                {/* Density */}
                <div className="section-card">
                  <div className="section-card-header">
                    <div className="section-icon-wrap" style={{ background: C.primaryXLight }}>
                      <GridIcon size={16} color={C.primary} />
                    </div>
                    <div><h2>Information Density</h2><p>How much content is shown and how tightly packed it appears</p></div>
                  </div>
                  <div className="setting-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: 14 }}>
                    <div className="setting-meta">
                      <div className="setting-label">Display density</div>
                      <div className="setting-desc">Affects padding and spacing of all cards, rows, and components</div>
                    </div>
                    <div className="density-grid" style={{ width: "100%" }}>
                      {[
                        { id: "compact",     label: "Compact",     gaps: [0] },
                        { id: "comfortable", label: "Comfortable", gaps: [4] },
                        { id: "spacious",    label: "Spacious",    gaps: [8] },
                      ].map(d => (
                        <div
                          key={d.id}
                          className={`density-card ${density === d.id ? "active" : ""}`}
                          onClick={() => setDensity(d.id)}
                        >
                          <div className="density-lines">
                            {[0,1,2].map(i => (
                              <div key={i}>
                                <div className="density-line" />
                                {i < 2 && <div style={{ height: d.gaps[0] || 0 }} />}
                              </div>
                            ))}
                          </div>
                          <div className="density-name">{d.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Border Radius */}
                <div className="section-card">
                  <div className="section-card-header">
                    <div className="section-icon-wrap" style={{ background: C.primaryXLight }}>
                      <RadiusIcon size={16} color={C.primary} />
                    </div>
                    <div><h2>Corner Radius</h2><p>Roundness of cards, buttons, inputs, and modals</p></div>
                  </div>
                  <div className="setting-row">
                    <div className="setting-meta">
                      <div className="setting-label">Border radius</div>
                      <div className="setting-desc">Applies globally — 0 for sharp, 24 for very rounded</div>
                    </div>
                    <div className="slider-row" style={{ width: 220 }}>
                      <input
                        type="range" min="0" max="24" step="2" value={radius}
                        onChange={e => setRadius(+e.target.value)}
                        className="slider-track"
                        style={{ flex: 1 }}
                      />
                      <span className="slider-val">{radius}px</span>
                    </div>
                  </div>
                  {/* Live preview */}
                  <div className="setting-row" style={{ background: C.surfaceAlt }}>
                    <div style={{ fontSize: 11, color: C.textLight, textTransform: "uppercase", letterSpacing: "0.6px", fontFamily: FONT_SANS }}>Preview</div>
                    <div className="preview-surface" style={{ maxWidth: 300 }}>
                      <div className="preview-card-inner" style={{ borderRadius: radius, boxShadow: cardShadow === "lifted" ? "0 8px 24px rgba(0,0,0,0.1)" : cardShadow === "subtle" ? "0 2px 8px rgba(0,0,0,0.06)" : "none" }}>
                        <div className="preview-avatar-box" style={{ borderRadius: Math.max(0, radius - 4) }}>PM</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: C.text, fontFamily: FONT_SANS }}>Dr. Priya Mehta</div>
                          <div style={{ fontSize: 11, color: C.textMuted, fontFamily: FONT_SANS }}>Cardiology · Apollo Clinic</div>
                        </div>
                        <span className="preview-badge" style={{ background: accent.bg, color: accent.color }}>Confirmed</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shadow */}
                <div className="section-card">
                  <div className="section-card-header">
                    <div className="section-icon-wrap" style={{ background: C.primaryXLight }}>
                      <LayersIcon size={16} color={C.primary} />
                    </div>
                    <div><h2>Card Elevation</h2><p>Shadow depth and visual lift of card components</p></div>
                  </div>
                  <div className="setting-row">
                    <div className="setting-meta">
                      <div className="setting-label">Shadow intensity</div>
                      <div className="setting-desc">Higher shadows make cards feel more elevated and tactile</div>
                    </div>
                    <div className="chip-group">
                      {["none","subtle","lifted"].map(s => (
                        <div key={s} className={`chip ${cardShadow === s ? "active" : ""}`} onClick={() => setCardShadow(s)}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ════ MOTION TAB ═════════════════════════════════════ */}
            {activeTab === "motion" && (
              <div key="motion">
                <div className="tab-heading">
                  <h2>Motion & Animation</h2>
                  <p>Control how the interface moves and transitions</p>
                </div>
                <div className="section-card">
                  <div className="section-card-header">
                    <div className="section-icon-wrap" style={{ background: C.primaryXLight }}>
                      <ZapIcon size={16} color={C.primary} />
                    </div>
                    <div><h2>Animation Controls</h2><p>Enable, disable, or tune transition behavior</p></div>
                  </div>
                  {[
                    { label: "Enable animations", desc: "Page transitions, hover effects, and micro-interactions", val: animations, set: setAnimations },
                    { label: "Reduce motion", desc: "For users sensitive to movement — overrides all animations", val: reduceMotion, set: setReduceMotion },
                    { label: "Loading skeletons", desc: "Show animated shimmer placeholders while content loads", val: skeletons, set: setSkeletons },
                  ].map(({ label, desc, val, set }) => (
                    <div className="setting-row" key={label}>
                      <div className="setting-meta">
                        <div className="setting-label">{label}</div>
                        <div className="setting-desc">{desc}</div>
                      </div>
                      <Toggle checked={val} onChange={set} />
                    </div>
                  ))}
                  <div className="setting-row">
                    <div className="setting-meta">
                      <div className="setting-label">Animation speed</div>
                      <div className="setting-desc">How fast transitions and effects play globally</div>
                    </div>
                    <div className="chip-group">
                      {["slow","normal","fast"].map(s => (
                        <div key={s} className={`chip ${animSpeed === s ? "active" : ""}`} onClick={() => setAnimSpeed(s)}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ════ ACCESSIBILITY TAB ══════════════════════════════ */}
            {activeTab === "accessibility" && (
              <div key="accessibility">
                <div className="tab-heading">
                  <h2>Accessibility</h2>
                  <p>Improve usability and comfort for different needs</p>
                </div>
                <div className="section-card">
                  <div className="section-card-header">
                    <div className="section-icon-wrap" style={{ background: C.primaryXLight }}>
                      <EyeIcon size={16} color={C.primary} />
                    </div>
                    <div><h2>Visual Assistance</h2><p>Options to improve visual clarity and comfort</p></div>
                  </div>
                  {[
                    { label: "High contrast mode", desc: "Increases border and text contrast for sharper clarity", val: highContrast, set: setHighContrast },
                    { label: "Color blind support", desc: "Replaces color-only status indicators with shapes and patterns", val: colorBlind, set: setColorBlind },
                    { label: "Always show focus rings", desc: "Keyboard focus indicators are always visible, not just on tab", val: focusRings, set: setFocusRings },
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

            {/* ════ NOTIFICATIONS TAB ══════════════════════════════ */}
            {activeTab === "notifications" && (
              <div key="notifications">
                <div className="tab-heading">
                  <h2>Notifications</h2>
                  <p>Control how and when Healthify alerts you</p>
                </div>
                <div className="section-card">
                  <div className="section-card-header">
                    <div className="section-icon-wrap" style={{ background: C.primaryXLight }}>
                      <BellIcon size={16} color={C.primary} />
                    </div>
                    <div><h2>Notification Display</h2><p>How alerts appear within the app</p></div>
                  </div>
                  {[
                    { label: "Unread badge count",    desc: "Show the unread notification count on the sidebar icon", val: notifBadge,    set: setNotifBadge },
                    { label: "Toast pop-ups",         desc: "Briefly show a pop-up for important new events",         val: notifToast,    set: setNotifToast },
                    { label: "Appointment reminders", desc: "24h and 1h alerts sent before each booked appointment",   val: apptReminders, set: setApptReminders },
                    { label: "No-show risk alerts",   desc: "Notify when AI flags an appointment as high no-show risk",val: noshowAlerts,  set: setNoshowAlerts },
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

            {/* ════ PRIVACY TAB ════════════════════════════════════ */}
            {activeTab === "privacy" && (
              <div key="privacy">
                <div className="tab-heading">
                  <h2>Privacy</h2>
                  <p>Manage what data Healthify collects and uses</p>
                </div>
                <div className="section-card">
                  <div className="section-card-header">
                    <div className="section-icon-wrap" style={{ background: C.primaryXLight }}>
                      <ShieldIcon size={16} color={C.primary} />
                    </div>
                    <div><h2>Data & Analytics</h2><p>Control how your usage data is collected and shared</p></div>
                  </div>
                  {[
                    { label: "Usage analytics",     desc: "Help improve Healthify by sending anonymous usage data",    val: analytics, set: setAnalytics },
                    { label: "AI-powered features", desc: "Allow AI to analyze your appointments for predictions",      val: aiFeatures, set: setAiFeatures },
                    { label: "Share with clinic",   desc: "Share aggregated health trends with your primary clinic",    val: shareData, set: setShareData, danger: true },
                  ].map(({ label, desc, val, set, danger }) => (
                    <div className="setting-row" key={label}>
                      <div className="setting-meta">
                        <div className="setting-label" style={danger ? { color: C.rose } : {}}>{label}</div>
                        <div className="setting-desc">{desc}</div>
                      </div>
                      <Toggle checked={val} onChange={set} danger={danger} />
                    </div>
                  ))}
                  <div className="setting-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: 10, background: C.roseLight }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke={C.rose} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="9" x2="12" y2="13" stroke={C.rose} strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="17" x2="12.01" y2="17" stroke={C.rose} strokeWidth="2" strokeLinecap="round"/></svg>
                      <span style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 600, color: C.rose }}>Data deletion</span>
                    </div>
                    <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.rose, lineHeight: 1.5 }}>
                      To permanently delete your Healthify account and all associated health records, contact your clinic administrator.
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

// ─── Toggle component ─────────────────────────────────────────────────────────
function Toggle({ checked, onChange, danger }) {
  const activeColor = danger ? C.rose : C.primary;
  return (
    <label className="toggle-wrap" style={{ cursor: "pointer" }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <div className="toggle-track" style={{ background: checked ? activeColor : C.border }} />
      <div className="toggle-knob" />
    </label>
  );
}

// ─── SVG Icon Components ─────────────────────────────────────────────────────
function PaletteIcon({ size = 16, color = "currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill={color}/><circle cx="17.5" cy="10.5" r=".5" fill={color}/><circle cx="8.5" cy="7.5" r=".5" fill={color}/><circle cx="6.5" cy="12.5" r=".5" fill={color}/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>;
}
function TypeIcon({ size = 16, color = "currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>;
}
function LayoutIcon({ size = 16, color = "currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>;
}
function ZapIcon({ size = 16, color = "currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
}
function EyeIcon({ size = 16, color = "currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
}
function BellIcon({ size = 16, color = "currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
}
function ShieldIcon({ size = 16, color = "currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
}
function SunIcon({ size = 16, color = "currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
}
function DropletIcon({ size = 16, color = "currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>;
}
function SidebarIcon({ size = 16, color = "currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>;
}
function GridIcon({ size = 16, color = "currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
}
function RadiusIcon({ size = 16, color = "currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="6"/></svg>;
}
function LayersIcon({ size = 16, color = "currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>;
}
function HeadingIcon({ size = 16, color = "currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 12h10M4 18h14"/></svg>;
}
function SaveIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
}
function SpinIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
      <path d="M21 12a9 9 0 1 1-6.219-8.56">
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.7s" repeatCount="indefinite"/>
      </path>
    </svg>
  );
}