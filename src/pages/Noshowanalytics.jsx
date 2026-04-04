import React, { useState, useRef, useCallback } from "react";

// ─── Design tokens (neutral, works in both purple & teal portals) ─────────────
const C = {
  bg: "#F8FAFC",
  white: "#FFFFFF",
  border: "#E2E8F0",
  borderMuted: "#F1F5F9",
  text: "#0F172A",
  textMuted: "#64748B",
  primary: "#6366F1",       // indigo — neutral between portals
  primaryLight: "#EEF2FF",
  primaryGlow: "rgba(99,102,241,0.15)",
  teal: "#0D9488",
  tealLight: "#F0FDFA",
  rose: "#F43F5E",
  roseLight: "#FFF1F2",
  amber: "#F59E0B",
  amberLight: "#FFFBEB",
  emerald: "#10B981",
  emeraldLight: "#ECFDF5",
};
const FONT_SANS  = "'DM Sans', sans-serif";
const FONT_SERIF = "'Fraunces', serif";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseCSV(text) {
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ""));
  return lines.slice(1).map(line => {
    const vals = line.split(",").map(v => v.trim().replace(/"/g, ""));
    return Object.fromEntries(headers.map((h, i) => [h, vals[i]]));
  });
}

function ageGroup(age) {
  const a = parseInt(age);
  if (a < 18) return "0-17";
  if (a < 30) return "18-29";
  if (a < 45) return "30-44";
  if (a < 60) return "45-59";
  return "60+";
}

function computeStats(rows) {
  const total = rows.length;
  // Kaggle CSV uses "No-show" column: "Yes" = did not show
  const noShowCol = rows[0] ? Object.keys(rows[0]).find(k => k.toLowerCase().includes("no-show") || k.toLowerCase().includes("noshow")) : null;
  const isNoShow = r => r[noShowCol] === "Yes";

  // Overall
  const noShows = rows.filter(isNoShow).length;
  const rate = ((noShows / total) * 100).toFixed(1);

  // By age group
  const ageGroups = ["0-17","18-29","30-44","45-59","60+"];
  const byAge = ageGroups.map(g => {
    const subset = rows.filter(r => ageGroup(r.Age) === g);
    const ns = subset.filter(isNoShow).length;
    return { label: g, total: subset.length, noShows: ns, rate: subset.length ? ((ns/subset.length)*100).toFixed(1) : 0 };
  });

  // By gender
  const genders = [...new Set(rows.map(r => r.Gender))].filter(Boolean);
  const byGender = genders.map(g => {
    const subset = rows.filter(r => r.Gender === g);
    const ns = subset.filter(isNoShow).length;
    return { label: g === "F" ? "Female" : "Male", total: subset.length, noShows: ns, rate: ((ns/subset.length)*100).toFixed(1) };
  });

  // By SMS received
  const bySms = ["0","1"].map(v => {
    const subset = rows.filter(r => r.SMS_received === v);
    const ns = subset.filter(isNoShow).length;
    return { label: v === "1" ? "SMS Sent" : "No SMS", total: subset.length, noShows: ns, rate: subset.length ? ((ns/subset.length)*100).toFixed(1) : 0 };
  });

  // By condition
  const conditions = ["Hipertension","Diabetes","Alcoholism","Handcap"];
  const byCondition = conditions.map(cond => {
    const subset = rows.filter(r => r[cond] === "1");
    const ns = subset.filter(isNoShow).length;
    return { label: cond === "Hipertension" ? "Hypertension" : cond === "Handcap" ? "Disability" : cond, total: subset.length, noShows: ns, rate: subset.length ? ((ns/subset.length)*100).toFixed(1) : 0 };
  });

  // Wait time buckets (days between schedule & appointment)
  const schedCol = Object.keys(rows[0]).find(k => k.toLowerCase().includes("scheduled"));
  const apptCol  = Object.keys(rows[0]).find(k => k.toLowerCase().includes("appointment"));
  const waitBuckets = ["0","1-3","4-7","8-14","15+"];
  const byWait = waitBuckets.map(b => {
    const subset = rows.filter(r => {
      if (!schedCol || !apptCol) return false;
      const diff = Math.max(0, Math.round((new Date(r[apptCol]) - new Date(r[schedCol])) / 86400000));
      if (b === "0") return diff === 0;
      if (b === "1-3") return diff >= 1 && diff <= 3;
      if (b === "4-7") return diff >= 4 && diff <= 7;
      if (b === "8-14") return diff >= 8 && diff <= 14;
      return diff >= 15;
    });
    const ns = subset.filter(isNoShow).length;
    return { label: `${b}d`, total: subset.length, noShows: ns, rate: subset.length ? ((ns/subset.length)*100).toFixed(1) : 0 };
  });

  return { total, noShows, rate, byAge, byGender, bySms, byCondition, byWait, noShowCol };
}

// ─── Bar Chart ────────────────────────────────────────────────────────────────
function BarChart({ data, color = C.primary, valueKey = "rate", label = "No-show Rate (%)" }) {
  const max = Math.max(...data.map(d => parseFloat(d[valueKey])), 1);
  return (
    <div style={{ width: "100%" }}>
      <p style={{ fontFamily: FONT_SANS, fontSize: 11, color: C.textMuted, marginBottom: 10, textTransform: "uppercase", letterSpacing: ".6px" }}>{label}</p>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end", gap: 4 }}>
            <span style={{ fontFamily: FONT_SANS, fontSize: 10, color: C.textMuted }}>{d[valueKey]}%</span>
            <div style={{ width: "100%", borderRadius: "4px 4px 0 0", background: color, opacity: 0.85, height: `${(parseFloat(d[valueKey]) / max) * 90}px`, minHeight: 4, transition: "height 0.4s ease" }} />
            <span style={{ fontFamily: FONT_SANS, fontSize: 10, color: C.textMuted, textAlign: "center", lineHeight: 1.2 }}>{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color = C.primary, bg }) {
  return (
    <div style={{ background: bg || C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: "18px 20px", borderTop: `3px solid ${color}` }}>
      <p style={{ fontFamily: FONT_SANS, fontSize: 11, color: C.textMuted, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: ".5px" }}>{label}</p>
      <p style={{ fontFamily: FONT_SERIF, fontSize: 28, fontWeight: 700, color, margin: 0, lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontFamily: FONT_SANS, fontSize: 11, color: C.textMuted, margin: "5px 0 0" }}>{sub}</p>}
    </div>
  );
}

// ─── CSV Upload Zone ──────────────────────────────────────────────────────────
function UploadZone({ onData }) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef();

  const process = file => {
    if (!file || !file.name.endsWith(".csv")) { setError("Please upload a .csv file"); return; }
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const rows = parseCSV(e.target.result);
        if (rows.length < 10) { setError("File seems too small — make sure it's the Kaggle no-show CSV."); return; }
        onData(rows);
      } catch { setError("Could not parse CSV. Please use the Kaggle no-show appointments CSV."); }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", padding: 32 }}>
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); process(e.dataTransfer.files[0]); }}
        onClick={() => inputRef.current.click()}
        style={{ width: "100%", maxWidth: 480, border: `2px dashed ${dragging ? C.primary : C.border}`, borderRadius: 20, padding: "48px 32px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, cursor: "pointer", background: dragging ? C.primaryLight : C.white, transition: "all 0.2s" }}
      >
        <div style={{ width: 64, height: 64, borderRadius: 16, background: C.primaryLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke={C.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontFamily: FONT_SANS, fontWeight: 600, fontSize: 16, color: C.text, margin: 0 }}>Drop your Kaggle CSV here</p>
          <p style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.textMuted, margin: "6px 0 0" }}>or click to browse · KaggleV2-May-2016.csv</p>
        </div>
        <input ref={inputRef} type="file" accept=".csv" style={{ display: "none" }} onChange={e => process(e.target.files[0])} />
      </div>
      {error && <p style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.rose, marginTop: 12 }}>{error}</p>}
      <div style={{ marginTop: 28, background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: "16px 20px", maxWidth: 480, width: "100%" }}>
        <p style={{ fontFamily: FONT_SANS, fontWeight: 600, fontSize: 13, color: C.text, margin: "0 0 8px" }}>📥 How to get the CSV</p>
        <ol style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.textMuted, margin: 0, paddingLeft: 18, lineHeight: 2 }}>
          <li>Go to <strong>kaggle.com/datasets/joniarroba/noshowappointments</strong></li>
          <li>Sign in (free) → click <strong>Download</strong></li>
          <li>Unzip → upload <strong>KaggleV2-May-2016.csv</strong> here</li>
        </ol>
      </div>
    </div>
  );
}

// ─── EDA Dashboard ────────────────────────────────────────────────────────────
function EDADashboard({ stats }) {
  return (
    <div style={{ padding: "0 32px 32px" }}>
      {/* Summary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        <StatCard label="Total Records"   value={stats.total.toLocaleString()} sub="appointments in dataset" color={C.primary} />
        <StatCard label="No-shows"        value={stats.noShows.toLocaleString()} sub="patients who missed" color={C.rose} />
        <StatCard label="No-show Rate"    value={`${stats.rate}%`} sub="overall dataset" color={C.amber} />
        <StatCard label="Show-up Rate"    value={`${(100 - parseFloat(stats.rate)).toFixed(1)}%`} sub="arrived as scheduled" color={C.emerald} />
      </div>

      {/* Charts row 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: 20 }}>
          <BarChart data={stats.byAge} color={C.primary} label="No-show Rate by Age Group (%)" />
        </div>
        <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: 20 }}>
          <BarChart data={stats.byGender} color={C.teal} label="No-show Rate by Gender (%)" />
        </div>
      </div>

      {/* Charts row 2 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: 20 }}>
          <BarChart data={stats.bySms} color={C.amber} label="SMS Reminder Impact on No-shows (%)" />
        </div>
        <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: 20 }}>
          <BarChart data={stats.byCondition} color={C.rose} label="No-show Rate by Health Condition (%)" />
        </div>
      </div>

      {/* Wait time full width */}
      <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: 20 }}>
        <BarChart data={stats.byWait} color={C.primary} label="No-show Rate by Wait Time (days between booking & appointment) (%)" />
        <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.textMuted, marginTop: 12 }}>
          💡 <strong>Key insight:</strong> Longer wait times generally correlate with higher no-show rates — patients who booked far in advance are more likely to forget or reschedule.
        </p>
      </div>
    </div>
  );
}

// ─── AI Prediction ────────────────────────────────────────────────────────────
function PredictionForm() {
  const [form, setForm] = useState({
    age: "", gender: "F", waitDays: "", sms: "0",
    hypertension: "0", diabetes: "0", alcoholism: "0", scholarship: "0",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const predict = async () => {
    if (!form.age) { setError("Please enter patient age."); return; }
    setError(""); setLoading(true); setResult(null);

    const prompt = `You are a medical no-show prediction model trained on Brazilian hospital appointment data.

Patient details:
- Age: ${form.age}
- Gender: ${form.gender === "F" ? "Female" : "Male"}
- Days between booking and appointment: ${form.waitDays || "Unknown"}
- SMS reminder sent: ${form.sms === "1" ? "Yes" : "No"}
- Has Hypertension: ${form.hypertension === "1" ? "Yes" : "No"}
- Has Diabetes: ${form.diabetes === "1" ? "Yes" : "No"}
- Has Alcoholism: ${form.alcoholism === "1" ? "Yes" : "No"}
- Social welfare scholarship: ${form.scholarship === "1" ? "Yes" : "No"}

Based on patterns from the Kaggle No-Show Appointments dataset (110,527 Brazilian hospital appointments), predict whether this patient is likely to miss their appointment.

Respond ONLY with a JSON object — no preamble, no markdown, no backticks — exactly this shape:
{
  "risk": "High" | "Medium" | "Low",
  "probability": <number 0-100>,
  "summary": "<1 sentence verdict>",
  "reasons": ["<reason 1>", "<reason 2>", "<reason 3>"],
  "recommendations": ["<action 1>", "<action 2>"]
}`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("").trim();
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
    } catch (e) {
      setError("Prediction failed. Please try again.");
    }
    setLoading(false);
  };

  const riskColor = r => r === "High" ? C.rose : r === "Medium" ? C.amber : C.emerald;
  const riskBg    = r => r === "High" ? C.roseLight : r === "Medium" ? C.amberLight : C.emeraldLight;

  return (
    <div style={{ padding: "0 32px 32px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>
      {/* Form */}
      <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: 24 }}>
        <p style={{ fontFamily: FONT_SERIF, fontSize: 18, fontWeight: 700, color: C.text, margin: "0 0 4px" }}>Patient Details</p>
        <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.textMuted, margin: "0 0 20px" }}>Enter patient info to predict no-show risk via AI</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Age">
            <input type="number" min="0" max="120" placeholder="e.g. 45" value={form.age} onChange={e => set("age", e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Gender">
            <select value={form.gender} onChange={e => set("gender", e.target.value)} style={inputStyle}>
              <option value="F">Female</option>
              <option value="M">Male</option>
            </select>
          </Field>
          <Field label="Wait Days (booking → appt)">
            <input type="number" min="0" placeholder="e.g. 10" value={form.waitDays} onChange={e => set("waitDays", e.target.value)} style={inputStyle} />
          </Field>
          <Field label="SMS Reminder Sent?">
            <select value={form.sms} onChange={e => set("sms", e.target.value)} style={inputStyle}>
              <option value="0">No</option>
              <option value="1">Yes</option>
            </select>
          </Field>
        </div>

        <p style={{ fontFamily: FONT_SANS, fontSize: 11, color: C.textMuted, margin: "16px 0 8px", textTransform: "uppercase", letterSpacing: ".5px" }}>Conditions</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[["hypertension","Hypertension"],["diabetes","Diabetes"],["alcoholism","Alcoholism"],["scholarship","Welfare Scholarship"]].map(([k,l]) => (
            <label key={k} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: FONT_SANS, fontSize: 13, color: C.text, cursor: "pointer" }}>
              <input type="checkbox" checked={form[k] === "1"} onChange={e => set(k, e.target.checked ? "1" : "0")} style={{ accentColor: C.primary, width: 15, height: 15 }} />
              {l}
            </label>
          ))}
        </div>

        {error && <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.rose, marginTop: 12 }}>{error}</p>}

        <button onClick={predict} disabled={loading} style={{ marginTop: 20, width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: loading ? C.border : C.primary, color: loading ? C.textMuted : C.white, fontFamily: FONT_SANS, fontWeight: 600, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s", boxShadow: loading ? "none" : `0 6px 20px ${C.primaryGlow}` }}>
          {loading ? "Analysing with AI…" : "Predict No-show Risk →"}
        </button>
      </div>

      {/* Result */}
      <div>
        {!result && !loading && (
          <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: 32, textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: C.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M9 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V9M9 3l6 6M9 3v6h6" stroke={C.primary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <p style={{ fontFamily: FONT_SANS, fontWeight: 600, color: C.text, margin: 0 }}>Fill in patient details</p>
            <p style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.textMuted, margin: "6px 0 0" }}>Claude AI will predict the no-show risk based on patterns from 110,000+ real appointments</p>
          </div>
        )}

        {loading && (
          <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: 40, textAlign: "center" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", border: `3px solid ${C.primaryLight}`, borderTopColor: C.primary, margin: "0 auto 16px", animation: "spin 0.8s linear infinite" }} />
            <p style={{ fontFamily: FONT_SANS, color: C.textMuted, fontSize: 14 }}>Analysing patient risk factors…</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {result && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Risk badge */}
            <div style={{ background: riskBg(result.risk), borderRadius: 16, border: `2px solid ${riskColor(result.risk)}`, padding: "20px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontFamily: FONT_SANS, fontSize: 11, fontWeight: 600, color: riskColor(result.risk), textTransform: "uppercase", letterSpacing: ".6px" }}>No-show Risk</span>
                <span style={{ fontFamily: FONT_SERIF, fontSize: 22, fontWeight: 700, color: riskColor(result.risk) }}>{result.risk}</span>
              </div>
              {/* Probability bar */}
              <div style={{ background: "rgba(0,0,0,0.08)", borderRadius: 99, height: 8, overflow: "hidden" }}>
                <div style={{ width: `${result.probability}%`, height: "100%", background: riskColor(result.risk), borderRadius: 99, transition: "width 0.6s ease" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
                <span style={{ fontFamily: FONT_SANS, fontSize: 11, color: C.textMuted }}>0%</span>
                <span style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 600, color: riskColor(result.risk) }}>{result.probability}% estimated probability</span>
                <span style={{ fontFamily: FONT_SANS, fontSize: 11, color: C.textMuted }}>100%</span>
              </div>
              <p style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.text, margin: "10px 0 0" }}>{result.summary}</p>
            </div>

            {/* Reasons */}
            <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: "16px 20px" }}>
              <p style={{ fontFamily: FONT_SANS, fontWeight: 600, fontSize: 13, color: C.text, margin: "0 0 10px" }}>🔍 Key Risk Factors</p>
              {result.reasons?.map((r, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                  <span style={{ color: riskColor(result.risk), flexShrink: 0 }}>•</span>
                  <p style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.textMuted, margin: 0 }}>{r}</p>
                </div>
              ))}
            </div>

            {/* Recommendations */}
            <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: "16px 20px" }}>
              <p style={{ fontFamily: FONT_SANS, fontWeight: 600, fontSize: 13, color: C.text, margin: "0 0 10px" }}>✅ Recommended Actions</p>
              {result.recommendations?.map((r, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                  <span style={{ color: C.emerald, flexShrink: 0 }}>→</span>
                  <p style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.textMuted, margin: 0 }}>{r}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.textMuted, display: "block", marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "9px 12px", borderRadius: 9, border: `1.5px solid ${C.border}`,
  fontFamily: FONT_SANS, fontSize: 13, color: C.text, background: C.white, outline: "none",
  boxSizing: "border-box",
};

// ─── Root Component ───────────────────────────────────────────────────────────
export default function NoShowAnalytics() {
  const [rows, setRows]   = useState(null);
  const [stats, setStats] = useState(null);
  const [tab, setTab]     = useState("eda"); // "eda" | "predict"

  const handleData = useCallback(data => {
    setRows(data);
    setStats(computeStats(data));
    setTab("eda");
  }, []);

  const tabs = [
    { id: "eda",     label: "📊 EDA Dashboard" },
    { id: "predict", label: "🤖 AI Prediction" },
  ];

  return (
    <div style={{ fontFamily: FONT_SANS, background: C.bg, minHeight: "100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=DM+Sans:wght@300;400;500;600;700&display=swap');`}</style>

      {/* Header */}
      <div style={{ padding: "28px 32px 0", borderBottom: `1px solid ${C.border}`, background: C.white }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h1 style={{ fontFamily: FONT_SERIF, fontSize: 26, fontWeight: 700, color: C.text, margin: 0 }}>No-show Analytics</h1>
            <p style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.textMuted, margin: "4px 0 0" }}>
              {rows ? `${rows.length.toLocaleString()} records loaded · Kaggle Hospital Appointments Dataset` : "Upload the Kaggle CSV to get started"}
            </p>
          </div>
          {rows && (
            <button onClick={() => { setRows(null); setStats(null); }} style={{ padding: "8px 16px", borderRadius: 9, border: `1.5px solid ${C.border}`, background: "transparent", fontFamily: FONT_SANS, fontSize: 12, color: C.textMuted, cursor: "pointer" }}>
              ↑ Upload new CSV
            </button>
          )}
        </div>

        {rows && (
          <div style={{ display: "flex", gap: 4 }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "10px 20px", borderRadius: "10px 10px 0 0", border: "none", background: tab === t.id ? C.bg : "transparent", fontFamily: FONT_SANS, fontSize: 13, fontWeight: tab === t.id ? 600 : 400, color: tab === t.id ? C.primary : C.textMuted, cursor: "pointer", borderBottom: tab === t.id ? `2px solid ${C.primary}` : "2px solid transparent" }}>
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      {!rows && <UploadZone onData={handleData} />}
      {rows && stats && tab === "eda" && (
        <div style={{ padding: "24px 0 0" }}>
          <EDADashboard stats={stats} />
        </div>
      )}
      {rows && tab === "predict" && (
        <div style={{ padding: "24px 0 0" }}>
          <div style={{ padding: "0 32px 16px" }}>
            <h2 style={{ fontFamily: FONT_SERIF, fontSize: 20, fontWeight: 700, color: C.text, margin: 0 }}>AI No-show Predictor</h2>
            <p style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.textMuted, margin: "4px 0 0" }}>Powered by Claude · Enter a patient's details to predict appointment no-show risk</p>
          </div>
          <PredictionForm />
        </div>
      )}
    </div>
  );
}