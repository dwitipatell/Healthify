// src/pages/SettingsPage.jsx
// ─── Patient Portal Settings with LIVE PREVIEWS ────────────────────────────────

import { useState } from 'react';
import { useSettings } from '../context/SettingsContext';

// ─── Theme tokens (patient dashboard teal theme) ──────────────────────────────
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
function SaveIcon({ size=16, color="currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><polyline points="17 21 17 13 7 13 7 21" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function SpinIcon({ size=16, color="currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" opacity="0.3"/><path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="2" strokeLinecap="round"/></svg>;
}
function EyeOffIcon({ size=16, color="currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke={color} strokeWidth="1.5" strokeLinecap="round"/><line x1="1" y1="1" x2="23" y2="23" stroke={color} strokeWidth="1.5" strokeLinecap="round"/></svg>;
}

// ─── Toggle Component ────────────────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <label className="toggle-wrap">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <div className="toggle-track" />
      <div className="toggle-knob" />
    </label>
  );
}

// ─── NAV ITEMS ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "theme",        label: "Theme & Colors",     icon: PaletteIcon },
  { id: "typography",   label: "Typography",         icon: TypeIcon },
  { id: "layout",       label: "Layout & Density",   icon: LayoutIcon },
  { id: "motion",       label: "Motion",             icon: ZapIcon },
  { id: "language",     label: "Language & Region",  icon: BellIcon },
  { id: "accessibility", label: "Accessibility",     icon: EyeIcon },
  { id: "privacy",      label: "Privacy",            icon: ShieldIcon },
  { id: "darkmode",     label: "Dark Mode",          icon: SunIcon },
];

const ACCENTS = [
  { id: "teal",   color: "#0D9488", label: "Teal" },
  { id: "indigo", color: "#6366F1", label: "Indigo" },
  { id: "rose",   color: "#F43F5E", label: "Rose" },
  { id: "amber",  color: "#F59E0B", label: "Amber" },
  { id: "emerald",color: "#10B981", label: "Emerald" },
  { id: "blue",   color: "#3B82F6", label: "Blue" },
];

const BODY_FONTS = ["DM Sans", "Lato", "Nunito"];
const HEADING_FONTS = ["Fraunces", "Playfair Display", "Merriweather"];
const DENSITIES = [
  { id: "compact",     label: "Compact",     desc: "Less spacing" },
  { id: "comfortable", label: "Comfortable", desc: "Balanced" },
  { id: "spacious",    label: "Spacious",    desc: "More breathing room" },
];

// ═════════════════════════════════════════════════════════════════════════════
// Live Preview Components
// ═════════════════════════════════════════════════════════════════════════════

function LivePreviewBox({ children, title = "Live Preview", style = {} }) {
  return (
    <div style={{ 
      ...style,
      background: C.white, 
      border: `1px solid ${C.border}`,
      borderRadius: 14,
      padding: 20,
      minHeight: 120,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {title}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {children}
      </div>
    </div>
  );
}

function ColorPreview({ accentColor }) {
  return (
    <LivePreviewBox title="Color Preview">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <button style={{
          padding: '12px 20px',
          background: accentColor,
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          fontWeight: 600,
          fontSize: 14,
          cursor: 'pointer',
          transition: 'all 0.3s',
        }}>
          Primary Action
        </button>
        <div style={{
          padding: '12px 20px',
          background: accentColor + '20',
          color: accentColor,
          border: `2px solid ${accentColor}`,
          borderRadius: 8,
          fontWeight: 600,
          fontSize: 14,
          textAlign: 'center',
        }}>
          Secondary
        </div>
      </div>
    </LivePreviewBox>
  );
}

function TypographyPreview({ bodyFont, headingFont, fontSize }) {
  return (
    <LivePreviewBox title="Font Preview" style={{ minHeight: 180 }}>
      <div style={{
        fontFamily: `'${headingFont}', serif`,
        fontSize: fontSize + 8,
        fontWeight: 700,
        color: C.text,
        marginBottom: 8,
      }}>
        Heading Preview
      </div>
      <div style={{
        fontFamily: `'${bodyFont}', sans-serif`,
        fontSize: fontSize,
        color: C.textMuted,
        lineHeight: 1.5,
      }}>
        This is body text preview. Current size: {fontSize}px
      </div>
    </LivePreviewBox>
  );
}

function DensityPreview({ density, radius }) {
  const densityMap = {
    compact: { padding: 8, gap: 8 },
    comfortable: { padding: 12, gap: 12 },
    spacious: { padding: 16, gap: 16 },
  };
  const d = densityMap[density];

  return (
    <LivePreviewBox title="Spacing Preview">
      <div style={{ display: 'flex', flexDirection: 'column', gap: d.gap }}>
        {[1, 2].map(i => (
          <div key={i} style={{
            padding: d.padding,
            background: C.surfaceAlt,
            borderRadius: radius,
            border: `1px solid ${C.border}`,
            fontSize: 13,
            color: C.textMuted,
          }}>
            Card Item {i}
          </div>
        ))}
      </div>
      <div style={{ fontSize: 12, color: C.textMuted, marginTop: 8 }}>
        Spacing: {d.padding}px | Radius: {radius}px
      </div>
    </LivePreviewBox>
  );
}

function MotionPreview({ animSpeed, reduceMotion }) {
  const speeds = { slow: '2s', normal: '1s', fast: '0.5s' };
  const duration = reduceMotion ? '0s' : speeds[animSpeed];

  return (
    <LivePreviewBox title="Animation Preview">
      <div style={{
        width: 60,
        height: 60,
        background: C.primary,
        borderRadius: 12,
        animation: `pulse ${duration}`,
      }} />
      <div style={{ fontSize: 12, color: C.textMuted }}>
        {reduceMotion ? 'Motion: Disabled' : `Speed: ${animSpeed} (${duration})`}
      </div>
    </LivePreviewBox>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Main Settings Component
// ═════════════════════════════════════════════════════════════════════════════

export default function SettingsPageEnhanced() {
  const { settings, updateSetting, reset } = useSettings();
  const [activeTab, setActiveTab] = useState('theme');
  const [saveAnim, setSaveAnim] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaveAnim(true);
    setSaved(false);
    await new Promise(r => setTimeout(r, 600));
    setSaveAnim(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=Fraunces:ital,opsz,wght@0,9..144,700;1,9..144,500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .settings-page-v2 {
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
          overflow-y: auto;
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
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 18px;
          cursor: pointer;
          border-left: 2.5px solid transparent;
          transition: all 0.15s;
          font-size: 13px;
          color: rgba(255,255,255,0.48);
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

        .settings-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .settings-header {
          padding: 20px 28px;
          border-bottom: 1px solid ${C.border};
          background: ${C.white};
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-actions {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .saved-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: #D1FAE5;
          color: ${C.emerald};
          borderRadius: 8px;
          fontSize: 12px;
          fontWeight: 600;
        }

        .btn-primary, .btn-ghost {
          padding: 8px 16px;
          borderRadius: 8px;
          border: 1px solid ${C.border};
          font-family: ${FONT_SANS};
          fontWeight: 500;
          fontSize: 13px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .btn-primary {
          background: ${C.primary};
          color: white;
          border: 1px solid ${C.primary};
        }

        .btn-primary:hover {
          background: ${C.primaryDark};
          box-shadow: 0 4px 12px ${C.primaryGlow};
        }

        .btn-ghost {
          background: ${C.surface};
          color: ${C.text};
        }

        .btn-ghost:hover {
          background: ${C.surfaceAlt};
        }

        .settings-body {
          flex: 1;
          overflow-y: auto;
          padding: 28px;
        }

        .tab-heading {
          margin-bottom: 24px;
        }

        .tab-heading h2 {
          font-family: ${FONT_SERIF};
          font-size: 24px;
          font-weight: 700;
          color: ${C.text};
          margin: 0 0 4px;
        }

        .tab-heading p {
          font-size: 13px;
          color: ${C.textMuted};
          margin: 0;
        }

        .section-card {
          background: ${C.white};
          border: 1px solid ${C.border};
          border-radius: 14px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .section-card-header {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }

        .section-icon-wrap {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .section-card-header h2 {
          font-size: 14px;
          fontWeight: 600;
          color: ${C.text};
          margin: 0 0 2px;
        }

        .section-card-header p {
          font-size: 12px;
          color: ${C.textMuted};
          margin: 0;
        }

        .setting-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 0;
          border-bottom: 1px solid ${C.borderMuted};
        }

        .setting-row:last-child {
          border-bottom: none;
        }

        .setting-label {
          font-size: 13px;
          fontWeight: 500;
          color: ${C.text};
        }

        .setting-desc {
          font-size: 11px;
          color: ${C.textMuted};
          margin-top: 2px;
        }

        .swatch-row {
          display: flex;
          gap: 8px;
        }

        .swatch {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 2px solid transparent;
          cursor: pointer;
          transition: all 0.2s;
        }

        .swatch:hover {
          transform: scale(1.05);
        }

        .swatch.active {
          border-color: ${C.text};
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        .chip-group {
          display: flex;
          gap: 8px;
        }

        .chip {
          padding: 6px 12px;
          background: ${C.surfaceAlt};
          border: 1.5px solid ${C.border};
          border-radius: 8px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 500;
          color: ${C.text};
        }

        .chip:hover {
          background: ${C.primaryXLight};
          border-color: ${C.primary};
        }

        .chip.active {
          background: ${C.primary};
          border-color: ${C.primary};
          color: white;
        }

        .slider-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .slider-track {
          flex: 1;
          height: 6px;
          cursor: pointer;
          accent-color: ${C.primary};
        }

        .slider-val {
          font-size: 12px;
          font-weight: 600;
          color: ${C.primary};
          min-width: 40px;
          text-align: right;
        }

        .toggle-wrap {
          display: flex;
          align-items: center;
          cursor: pointer;
          user-select: none;
        }

        .toggle-wrap input {
          position: absolute;
          opacity: 0;
        }

        .toggle-track {
          width: 44px;
          height: 24px;
          background: ${C.border};
          border-radius: 12px;
          transition: background 0.3s;
          position: relative;
        }

        .toggle-wrap input:checked ~ .toggle-track {
          background: ${C.primary};
        }

        .toggle-knob {
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          position: absolute;
          top: 2px;
          left: 2px;
          transition: left 0.3s;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .toggle-wrap input:checked ~ .toggle-knob {
          left: 22px;
        }

        .preview-grid {
          display: grid;
          gridTemplateColumns: 1fr 1fr;
          gap: 20px;
          margin-top: 24px;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .preview-grid > div {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>

      <div className="settings-page-v2">
        {/* Sidebar Navigation */}
        <div className="settings-nav">
          <div className="nav-brand">
            <div className="nav-brand-icon">⚙️</div>
            <div className="nav-brand-label">Settings</div>
          </div>
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="settings-content">
          <div className="settings-header">
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: 0 }}>
                {NAV_ITEMS.find(i => i.id === activeTab)?.label}
              </h1>
              <p style={{ fontSize: 12, color: C.textMuted, margin: '4px 0 0' }}>
                Customize and preview your changes in real-time
              </p>
            </div>
            <div className="header-actions">
              {saved && (
                <div className="saved-badge">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Saved
                </div>
              )}
              <button className="btn-ghost" onClick={() => { reset(); handleSave(); }}>Reset</button>
              <button className="btn-primary" onClick={handleSave}>
                {saveAnim ? <><SpinIcon size={14} /> Saving…</> : <><SaveIcon size={14} /> Save</>}
              </button>
            </div>
          </div>

          <div className="settings-body">
            {/* ════ THEME TAB ═════════════════════════════════════ */}
            {activeTab === 'theme' && (
              <div>
                <div className="tab-heading">
                  <h2>Theme & Colors</h2>
                  <p>Choose your preferred accent color</p>
                </div>
                <div className="section-card">
                  <div className="section-card-header">
                    <div className="section-icon-wrap" style={{ background: C.primaryXLight }}>
                      <PaletteIcon size={16} color={C.primary} />
                    </div>
                    <div>
                      <h2>Accent Color</h2>
                      <p>Applied to buttons and highlights</p>
                    </div>
                  </div>
                  <div className="setting-row">
                    <div>
                      <div className="setting-label">Select accent color</div>
                      <div className="setting-desc">Changes apply instantly</div>
                    </div>
                    <div className="swatch-row">
                      {ACCENTS.map(a => (
                        <div
                          key={a.id}
                          className={`swatch ${settings.accentColor === a.color ? 'active' : ''}`}
                          style={{ background: a.color }}
                          onClick={() => updateSetting('accentColor', a.color)}
                          title={a.label}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="preview-grid">
                  <ColorPreview accentColor={settings.accentColor} />
                  <div style={{
                    background: C.white,
                    border: `1px solid ${C.border}`,
                    borderRadius: 14,
                    padding: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: 'uppercase' }}>
                      Color Details
                    </div>
                    <div style={{ fontSize: 13, fontFamily: 'monospace', color: C.text }}>
                      {settings.accentColor}
                    </div>
                    <p style={{ fontSize: 12, color: C.textMuted, margin: 0 }}>
                      This color will be applied to all buttons, links, and interactive elements across the dashboard.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ════ TYPOGRAPHY TAB ═════════════════════════════ */}
            {activeTab === 'typography' && (
              <div>
                <div className="tab-heading">
                  <h2>Typography</h2>
                  <p>Customize fonts and text sizes</p>
                </div>

                <div className="section-card">
                  <div className="section-card-header">
                    <div className="section-icon-wrap" style={{ background: C.primaryXLight }}>
                      <TypeIcon size={16} color={C.primary} />
                    </div>
                    <div>
                      <h2>Body Font</h2>
                      <p>Primary font for text</p>
                    </div>
                  </div>
                  <div className="setting-row">
                    <div className="setting-label">Font family</div>
                    <div className="chip-group">
                      {BODY_FONTS.map(f => (
                        <button
                          key={f}
                          className={`chip ${settings.bodyFont === f ? 'active' : ''}`}
                          style={{ fontFamily: `'${f}', sans-serif` }}
                          onClick={() => updateSetting('bodyFont', f)}
                        >{f}</button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="section-card">
                  <div className="section-card-header">
                    <div className="section-icon-wrap" style={{ background: C.primaryXLight }}>
                      <TypeIcon size={16} color={C.primary} />
                    </div>
                    <div>
                      <h2>Heading Font</h2>
                      <p>Font for titles and headings</p>
                    </div>
                  </div>
                  <div className="setting-row">
                    <div className="setting-label">Font family</div>
                    <div className="chip-group">
                      {HEADING_FONTS.map(f => (
                        <button
                          key={f}
                          className={`chip ${settings.headingFont === f ? 'active' : ''}`}
                          style={{ fontFamily: `'${f}', serif` }}
                          onClick={() => updateSetting('headingFont', f)}
                        >{f}</button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="section-card">
                  <div className="section-card-header">
                    <div className="section-icon-wrap" style={{ background: C.primaryXLight }}>
                      <TypeIcon size={16} color={C.primary} />
                    </div>
                    <div>
                      <h2>Text Size</h2>
                      <p>Base font size for readability</p>
                    </div>
                  </div>
                  <div className="setting-row">
                    <div className="setting-label">Size: {settings.fontSize}px</div>
                    <div className="slider-row" style={{ width: 200 }}>
                      <input
                        type="range"
                        min="12"
                        max="18"
                        step="1"
                        value={settings.fontSize}
                        onChange={e => updateSetting('fontSize', +e.target.value)}
                        className="slider-track"
                      />
                      <span className="slider-val">{settings.fontSize}px</span>
                    </div>
                  </div>
                </div>

                <div className="preview-grid">
                  <TypographyPreview
                    bodyFont={settings.bodyFont}
                    headingFont={settings.headingFont}
                    fontSize={settings.fontSize}
                  />
                </div>
              </div>
            )}

            {/* ════ LAYOUT & DENSITY TAB ════════════════════════ */}
            {activeTab === 'layout' && (
              <div>
                <div className="tab-heading">
                  <h2>Layout & Density</h2>
                  <p>Control spacing and element sizing</p>
                </div>

                <div className="section-card">
                  <div className="section-card-header">
                    <div className="section-icon-wrap" style={{ background: C.primaryXLight }}>
                      <LayoutIcon size={16} color={C.primary} />
                    </div>
                    <div>
                      <h2>Density</h2>
                      <p>Spacing between elements</p>
                    </div>
                  </div>
                  <div className="setting-row">
                    <div className="setting-label">Choose density</div>
                    <div className="chip-group">
                      {DENSITIES.map(d => (
                        <button
                          key={d.id}
                          className={`chip ${settings.density === d.id ? 'active' : ''}`}
                          onClick={() => updateSetting('density', d.id)}
                          title={d.desc}
                        >{d.label}</button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="section-card">
                  <div className="section-card-header">
                    <div className="section-icon-wrap" style={{ background: C.primaryXLight }}>
                      <LayoutIcon size={16} color={C.primary} />
                    </div>
                    <div>
                      <h2>Corner Radius</h2>
                      <p>Roundness of elements</p>
                    </div>
                  </div>
                  <div className="setting-row">
                    <div className="setting-label">Radius: {settings.radius}px</div>
                    <div className="slider-row" style={{ width: 200 }}>
                      <input
                        type="range"
                        min="0"
                        max="24"
                        step="2"
                        value={settings.radius}
                        onChange={e => updateSetting('radius', +e.target.value)}
                        className="slider-track"
                      />
                      <span className="slider-val">{settings.radius}px</span>
                    </div>
                  </div>
                </div>

                <div className="preview-grid">
                  <DensityPreview density={settings.density} radius={settings.radius} />
                </div>
              </div>
            )}

            {/* ════ MOTION TAB ════════════════════════════════════ */}
            {activeTab === 'motion' && (
              <div>
                <div className="tab-heading">
                  <h2>Motion & Animations</h2>
                  <p>Control animation speed and effects</p>
                </div>

                <div className="section-card">
                  <div className="setting-row">
                    <div className="setting-label">Enable animations</div>
                    <Toggle checked={settings.animations} onChange={(v) => updateSetting('animations', v)} />
                  </div>
                </div>

                <div className="section-card">
                  <div className="setting-row">
                    <div className="setting-label">Reduce motion</div>
                    <Toggle checked={settings.reduceMotion} onChange={(v) => updateSetting('reduceMotion', v)} />
                  </div>
                  <div style={{ fontSize: 12, color: C.textMuted, marginTop: 8 }}>
                    Reduces or disables animations for accessibility
                  </div>
                </div>

                {!settings.reduceMotion && (
                  <div className="section-card">
                    <div className="section-card-header">
                      <div className="section-icon-wrap" style={{ background: C.primaryXLight }}>
                        <ZapIcon size={16} color={C.primary} />
                      </div>
                      <div>
                        <h2>Animation Speed</h2>
                        <p>Pace of transitions</p>
                      </div>
                    </div>
                    <div className="setting-row">
                      <div className="setting-label">Speed</div>
                      <div className="chip-group">
                        {['slow', 'normal', 'fast'].map(s => (
                          <button
                            key={s}
                            className={`chip ${settings.animSpeed === s ? 'active' : ''}`}
                            onClick={() => updateSetting('animSpeed', s)}
                          >
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="preview-grid">
                  <MotionPreview animSpeed={settings.animSpeed} reduceMotion={settings.reduceMotion} />
                </div>
              </div>
            )}

            {/* ════ ACCESSIBILITY TAB ═════════════════════════════ */}
            {activeTab === 'accessibility' && (
              <div>
                <div className="tab-heading">
                  <h2>Accessibility</h2>
                  <p>Enhance visibility and usability</p>
                </div>

                <div className="section-card">
                  <div className="setting-row">
                    <div className="setting-label">High contrast mode</div>
                    <Toggle checked={settings.highContrast} onChange={(v) => updateSetting('highContrast', v)} />
                  </div>
                </div>

                <div className="section-card">
                  <div className="setting-row">
                    <div className="setting-label">Color blind mode</div>
                    <Toggle checked={settings.colorBlind} onChange={(v) => updateSetting('colorBlind', v)} />
                  </div>
                </div>

                <div className="section-card">
                  <div className="setting-row">
                    <div className="setting-label">Always show focus rings</div>
                    <Toggle checked={settings.focusRings} onChange={(v) => updateSetting('focusRings', v)} />
                  </div>
                </div>

                <LivePreviewBox title="Accessibility Features Active">
                  <ul style={{ fontSize: 13, color: C.textMuted, margin: 0, paddingLeft: 18 }}>
                    {settings.highContrast && <li>• High contrast mode enabled</li>}
                    {settings.colorBlind && <li>• Color blind mode enabled</li>}
                    {settings.focusRings && <li>• Focus rings always visible</li>}
                    {!settings.highContrast && !settings.colorBlind && !settings.focusRings && (
                      <li style={{ color: C.textMuted }}>No accessibility features enabled</li>
                    )}
                  </ul>
                </LivePreviewBox>
              </div>
            )}

            {/* ════ DARK MODE TAB ══════════════════════════════════ */}
            {activeTab === 'darkmode' && (
              <div>
                <div className="tab-heading">
                  <h2>Dark Mode</h2>
                  <p>Switch to dark theme for reduced eye strain</p>
                </div>

                <div className="section-card">
                  <div className="setting-row">
                    <div className="setting-label">Enable dark mode</div>
                    <Toggle checked={settings.darkMode} onChange={(v) => updateSetting('darkMode', v)} />
                  </div>
                </div>

                <LivePreviewBox title={`Dark Mode: ${settings.darkMode ? 'Enabled' : 'Disabled'}`} style={{
                  background: settings.darkMode ? '#1a1a2e' : C.white,
                  color: settings.darkMode ? '#eaeaea' : C.text,
                  border: settings.darkMode ? '1px solid #404040' : `1px solid ${C.border}`,
                }}>
                  <p style={{ fontSize: 13, margin: 0 }}>
                    {settings.darkMode 
                      ? '🌙 Dark mode is now active across your dashboard' 
                      : '☀️ Light mode is currently active'}
                  </p>
                </LivePreviewBox>
              </div>
            )}

            {/* ════ LANGUAGE & REGION TAB ═════════════════════════ */}
            {activeTab === 'language' && (
              <div>
                <div className="tab-heading">
                  <h2>Language & Region</h2>
                  <p>Set your preferred language and locale</p>
                </div>

                <div className="section-card">
                  <div className="setting-row">
                    <div>
                      <div className="setting-label">Language</div>
                      <div className="setting-desc">Interface language</div>
                    </div>
                    <select
                      value={settings.language}
                      onChange={e => updateSetting('language', e.target.value)}
                      style={{
                        padding: '8px 12px',
                        border: `1px solid ${C.border}`,
                        borderRadius: 8,
                        fontFamily: FONT_SANS,
                        fontSize: 13,
                        cursor: 'pointer',
                      }}
                    >
                      {['English', 'Spanish', 'French', 'German', 'Hindi', 'Chinese', 'Japanese', 'Arabic'].map(l => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="section-card">
                  <div className="setting-row">
                    <div>
                      <div className="setting-label">Region</div>
                      <div className="setting-desc">Your location</div>
                    </div>
                    <select
                      value={settings.region}
                      onChange={e => updateSetting('region', e.target.value)}
                      style={{
                        padding: '8px 12px',
                        border: `1px solid ${C.border}`,
                        borderRadius: 8,
                        fontFamily: FONT_SANS,
                        fontSize: 13,
                        cursor: 'pointer',
                      }}
                    >
                      {['India', 'US', 'UK', 'Canada', 'Australia', 'Europe'].map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <LivePreviewBox title="Localization Preview">
                  <div style={{ fontSize: 13 }}>
                    <div style={{ marginBottom: 8 }}>
                      🌐 Language: <strong>{settings.language}</strong>
                    </div>
                    <div>
                      📍 Region: <strong>{settings.region}</strong>
                    </div>
                  </div>
                </LivePreviewBox>
              </div>
            )}

            {/* ════ PRIVACY TAB ════════════════════════════════════ */}
            {activeTab === 'privacy' && (
              <div>
                <div className="tab-heading">
                  <h2>Privacy & Data</h2>
                  <p>Control your data and privacy preferences</p>
                </div>

                <div className="section-card">
                  <div className="setting-row">
                    <div className="setting-label">Analytics</div>
                    <Toggle checked={settings.analytics} onChange={(v) => updateSetting('analytics', v)} />
                  </div>
                </div>

                <div className="section-card">
                  <div className="setting-row">
                    <div className="setting-label">AI Features</div>
                    <Toggle checked={settings.aiFeatures} onChange={(v) => updateSetting('aiFeatures', v)} />
                  </div>
                </div>

                <div className="section-card">
                  <div className="setting-row">
                    <div className="setting-label">Share usage data</div>
                    <Toggle checked={settings.shareData} onChange={(v) => updateSetting('shareData', v)} />
                  </div>
                </div>

                <LivePreviewBox title="Privacy Settings Active">
                  <ul style={{ fontSize: 13, color: C.textMuted, margin: 0, paddingLeft: 18 }}>
                    <li>• Analytics: {settings.analytics ? 'Enabled' : 'Disabled'}</li>
                    <li>• AI Features: {settings.aiFeatures ? 'Enabled' : 'Disabled'}</li>
                    <li>• Data Sharing: {settings.shareData ? 'Enabled' : 'Disabled'}</li>
                  </ul>
                </LivePreviewBox>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
