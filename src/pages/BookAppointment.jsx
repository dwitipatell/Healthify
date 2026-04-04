// src/pages/BookAppointment.jsx
// ─── Healthify · Intelligent Appointment Scheduling ───────────────────────────
// Phase 2: Real slot generation, conflict detection, AI duration prediction,
//          no-show risk scoring, rescheduling flow.
// Strictly uses the existing teal/blue patient theme tokens.

import { useState, useEffect, useCallback } from 'react';
import {
  getDoctors,
  getAvailableSlots,
  bookAppointment,
  rescheduleAppointment,
  getPatientAppointments,
  createNotification,
  formatTime,
  formatDate,
} from '../services/supabase';
import { supabase } from '../services/supabase';

// ─── Theme (matches patientdashboard.jsx exactly) ────────────────────────────
const C = {
  sidebarBg: "#0D2926", primary: "#0D9488", primaryDark: "#0F766E",
  primaryLight: "#CCFBF1", primaryXLight: "#F0FDFA", primaryGlow: "rgba(13,148,136,0.15)",
  accent: "#6366F1", accentLight: "#EEF2FF",
  amber: "#F59E0B", amberLight: "#FEF3C7",
  rose: "#F43F5E", roseLight: "#FFE4E6",
  emerald: "#10B981", emeraldLight: "#D1FAE5",
  text: "#0F2422", textMuted: "#4B7B76", textLight: "#7CA8A4",
  white: "#FFFFFF", surface: "#F8FFFE", surfaceAlt: "#F0FDFA",
  border: "#D1F0EC", borderMuted: "#E5F7F5",
};
const FONT_SANS  = "'DM Sans', sans-serif";
const FONT_SERIF = "'Fraunces', serif";

// ─── Specialties filter list ──────────────────────────────────────────────────
const SPECIALTIES = ['All', 'Cardiology', 'Dermatology', 'Orthopedics', 'General', 'Neurology'];

// ─── Common reasons (for duration prediction prompt) ─────────────────────────
const COMMON_REASONS = [
  'Routine checkup', 'Follow-up', 'Chest pain', 'Fever / cold',
  'Skin rash', 'Joint pain', 'Headache / migraine', 'BP monitoring',
  'Diabetes review', 'Other',
];

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepBar({ step }) {
  const steps = ['Choose Doctor', 'Pick Slot', 'Your Details', 'Confirm'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 28 }}>
      {steps.map((s, i) => {
        const n = i + 1;
        const done    = n < step;
        const current = n === step;
        return (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: done ? C.primary : current ? C.primary : C.borderMuted,
                border: current ? `3px solid ${C.primaryLight}` : 'none',
                fontFamily: FONT_SANS, fontWeight: 700, fontSize: 12,
                color: done || current ? C.white : C.textMuted,
                boxShadow: current ? `0 0 0 3px ${C.primaryGlow}` : 'none',
                transition: 'all 0.2s',
              }}>
                {done ? '✓' : n}
              </div>
              <span style={{ fontFamily: FONT_SANS, fontSize: 10, color: current ? C.primary : C.textMuted, fontWeight: current ? 600 : 400, whiteSpace: 'nowrap' }}>{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: done ? C.primary : C.border, margin: '0 6px', marginBottom: 18, transition: 'background 0.3s' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 1: Choose Doctor ────────────────────────────────────────────────────
function StepDoctor({ onSelect }) {
  const [doctors, setDoctors]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState('All');
  const [search, setSearch]         = useState('');
  const [selected, setSelected]     = useState(null);

  useEffect(() => {
    getDoctors().then(d => { setDoctors(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = doctors.filter(d => {
    const matchSpec = filter === 'All' || d.specialty === filter;
    const matchSearch = d.full_name.toLowerCase().includes(search.toLowerCase()) ||
                        d.specialty.toLowerCase().includes(search.toLowerCase());
    return matchSpec && matchSearch;
  });

  return (
    <div>
      <h2 style={{ fontFamily: FONT_SERIF, fontSize: 22, fontWeight: 700, color: C.text, margin: '0 0 4px' }}>Choose a Doctor</h2>
      <p style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.textMuted, margin: '0 0 20px' }}>Browse by specialty and select your preferred doctor</p>

      {/* Search */}
      <input
        placeholder="Search by name or specialty…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontFamily: FONT_SANS, fontSize: 13, color: C.text, marginBottom: 12, outline: 'none', boxSizing: 'border-box' }}
      />

      {/* Specialty filter chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {SPECIALTIES.map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{ padding: '5px 14px', borderRadius: 100, border: `1.5px solid ${filter === s ? C.primary : C.border}`, background: filter === s ? C.primary : C.white, color: filter === s ? C.white : C.textMuted, fontFamily: FONT_SANS, fontSize: 12, fontWeight: filter === s ? 600 : 400, cursor: 'pointer' }}>
            {s}
          </button>
        ))}
      </div>

      {loading && <p style={{ fontFamily: FONT_SANS, color: C.textMuted, fontSize: 13 }}>Loading doctors…</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(d => (
          <div
            key={d.id}
            onClick={() => setSelected(d)}
            style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 14, border: `1.5px solid ${selected?.id === d.id ? C.primary : C.border}`, background: selected?.id === d.id ? C.primaryXLight : C.white, cursor: 'pointer', transition: 'all 0.15s' }}
          >
            <div style={{ width: 46, height: 46, borderRadius: '50%', background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_SANS, fontWeight: 700, fontSize: 15, color: C.white, flexShrink: 0 }}>
              {d.avatar || d.full_name.slice(0, 2).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: FONT_SANS, fontWeight: 600, fontSize: 14, color: C.text, margin: 0 }}>{d.full_name}</p>
              <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.textMuted, margin: '2px 0 0' }}>
                {d.specialty} · {d.clinic} · ~{d.avg_consult_min} min/consult
              </p>
              <p style={{ fontFamily: FONT_SANS, fontSize: 11, color: C.primary, margin: '3px 0 0' }}>
                {d.doctor_availability?.filter(a => a.is_active).length || 0} days/week available
              </p>
            </div>
            {selected?.id === d.id && (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke={C.primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            )}
          </div>
        ))}
        {!loading && filtered.length === 0 && (
          <p style={{ fontFamily: FONT_SANS, color: C.textMuted, fontSize: 13, textAlign: 'center', padding: 24 }}>No doctors found for this filter.</p>
        )}
      </div>

      <button
        onClick={() => selected && onSelect(selected)}
        disabled={!selected}
        style={{ marginTop: 20, width: '100%', padding: '13px 0', borderRadius: 12, border: 'none', background: selected ? C.primary : C.border, color: selected ? C.white : C.textMuted, fontFamily: FONT_SANS, fontWeight: 600, fontSize: 15, cursor: selected ? 'pointer' : 'not-allowed', boxShadow: selected ? `0 6px 20px ${C.primaryGlow}` : 'none', transition: 'all 0.2s' }}
      >
        Continue with {selected ? selected.full_name : 'a doctor'} →
      </button>
    </div>
  );
}

// ─── Step 2: Pick Slot ────────────────────────────────────────────────────────
function StepSlot({ doctor, onSelect, onBack }) {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [slots, setSlots]               = useState([]);
  const [loading, setLoading]           = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [noAvail, setNoAvail]           = useState(false);

  // Generate next 14 days for date picker
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i); return d;
  });

  const loadSlots = useCallback(async (date) => {
    setLoading(true); setSlots([]); setSelectedSlot(null); setNoAvail(false);
    try {
      const available = await getAvailableSlots(doctor.id, date, doctor.avg_consult_min || 20);
      // Only show future slots
      const now = new Date();
      const future = available.filter(s => s > now);
      setSlots(future);
      if (future.length === 0) setNoAvail(true);
    } catch { setNoAvail(true); }
    setLoading(false);
  }, [doctor]);

  useEffect(() => { loadSlots(selectedDate); }, [selectedDate, loadSlots]);

  const dayLabel = d => d.toLocaleDateString('en-IN', { weekday: 'short' });
  const dateLabel = d => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const isToday = d => d.toDateString() === new Date().toDateString();

  return (
    <div>
      <h2 style={{ fontFamily: FONT_SERIF, fontSize: 22, fontWeight: 700, color: C.text, margin: '0 0 4px' }}>Pick a Slot</h2>
      <p style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.textMuted, margin: '0 0 20px' }}>
        {doctor.full_name} · {doctor.specialty} · {doctor.clinic}
      </p>

      {/* Date strip */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 20 }}>
        {dates.map((d, i) => {
          const sel = d.toDateString() === selectedDate.toDateString();
          return (
            <button key={i} onClick={() => setSelectedDate(d)} style={{ flexShrink: 0, width: 56, padding: '10px 0', borderRadius: 12, border: `1.5px solid ${sel ? C.primary : C.border}`, background: sel ? C.primary : C.white, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <span style={{ fontFamily: FONT_SANS, fontSize: 10, color: sel ? 'rgba(255,255,255,0.75)' : C.textMuted }}>{dayLabel(d)}</span>
              <span style={{ fontFamily: FONT_SANS, fontSize: 15, fontWeight: 700, color: sel ? C.white : C.text }}>{d.getDate()}</span>
              {isToday(d) && <span style={{ width: 5, height: 5, borderRadius: '50%', background: sel ? C.white : C.primary }} />}
            </button>
          );
        })}
      </div>

      {/* Time slots */}
      {loading && <p style={{ fontFamily: FONT_SANS, color: C.textMuted, fontSize: 13 }}>Loading available slots…</p>}
      {noAvail && !loading && (
        <div style={{ background: C.amberLight, borderRadius: 12, padding: '14px 18px', fontFamily: FONT_SANS, fontSize: 13, color: C.amber }}>
          ⚠️ No slots available on {dateLabel(selectedDate)}. Try another date.
        </div>
      )}
      {!loading && slots.length > 0 && (
        <>
          <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.textMuted, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '.5px' }}>
            {slots.length} slots available · {dateLabel(selectedDate)}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {slots.map((s, i) => {
              const sel = selectedSlot?.getTime() === s.getTime();
              return (
                <button key={i} onClick={() => setSelectedSlot(s)} style={{ padding: '10px 0', borderRadius: 10, border: `1.5px solid ${sel ? C.primary : C.border}`, background: sel ? C.primary : C.white, fontFamily: FONT_SANS, fontSize: 13, fontWeight: sel ? 600 : 400, color: sel ? C.white : C.text, cursor: 'pointer', transition: 'all 0.15s' }}>
                  {formatTime(s)}
                </button>
              );
            })}
          </div>
        </>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <button onClick={onBack} style={{ flex: 1, padding: '12px 0', borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.white, fontFamily: FONT_SANS, fontWeight: 500, fontSize: 14, color: C.textMuted, cursor: 'pointer' }}>← Back</button>
        <button
          onClick={() => selectedSlot && onSelect(selectedSlot)}
          disabled={!selectedSlot}
          style={{ flex: 2, padding: '12px 0', borderRadius: 12, border: 'none', background: selectedSlot ? C.primary : C.border, color: selectedSlot ? C.white : C.textMuted, fontFamily: FONT_SANS, fontWeight: 600, fontSize: 14, cursor: selectedSlot ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Patient Details + AI Duration Prediction ────────────────────────
function StepDetails({ doctor, slot, onSubmit, onBack }) {
  const [form, setForm] = useState({ name: '', age: '', gender: 'F', reason: COMMON_REASONS[0], notes: '' });
  const [predicting, setPredicting] = useState(false);
  const [prediction, setPrediction] = useState(null); // { durationMin, noshowRisk, noshowProbability, reasoning }
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const predict = async () => {
    if (!form.age || !form.reason) return;
    setPredicting(true); setPrediction(null);
    try {
      const prompt = `You are a medical scheduling AI for a hospital system.

Predict for this upcoming appointment:
1. Estimated consultation duration in minutes
2. No-show risk (Low / Medium / High)
3. No-show probability (0-100)
4. One-line reasoning

Patient:
- Age: ${form.age}, Gender: ${form.gender === 'F' ? 'Female' : 'Male'}
- Reason: ${form.reason}
- Doctor specialty: ${doctor.specialty}
- Doctor's avg consult time: ${doctor.avg_consult_min} min
- Appointment time: ${formatTime(slot)} on ${formatDate(slot)}
- Days until appointment: ${Math.round((slot - Date.now()) / 86400000)}

Respond ONLY with JSON, no markdown:
{
  "durationMin": <integer>,
  "noshowRisk": "Low" | "Medium" | "High",
  "noshowProbability": <0-100>,
  "reasoning": "<one sentence>"
}`;

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 300, messages: [{ role: 'user', content: prompt }] }),
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text || '').join('').trim().replace(/```json|```/g, '');
      setPrediction(JSON.parse(text));
    } catch { /* silent — we'll use defaults */ }
    setPredicting(false);
  };

  // Auto-predict when age + reason are filled
  useEffect(() => {
    if (form.age && parseInt(form.age) > 0) {
      const t = setTimeout(predict, 600);
      return () => clearTimeout(t);
    }
  }, [form.age, form.reason, form.gender]);

  const riskColor = r => r === 'High' ? C.rose : r === 'Medium' ? C.amber : C.emerald;
  const riskBg    = r => r === 'High' ? C.roseLight : r === 'Medium' ? C.amberLight : C.emeraldLight;

  const canContinue = form.name && form.age && form.reason;

  return (
    <div>
      <h2 style={{ fontFamily: FONT_SERIF, fontSize: 22, fontWeight: 700, color: C.text, margin: '0 0 4px' }}>Your Details</h2>
      <p style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.textMuted, margin: '0 0 20px' }}>
        {doctor.full_name} · {formatTime(slot)}, {formatDate(slot)}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <Field label="Full Name">
          <input placeholder="Your full name" value={form.name} onChange={e => set('name', e.target.value)} style={inputSt} />
        </Field>
        <Field label="Age">
          <input type="number" min="1" max="120" placeholder="e.g. 34" value={form.age} onChange={e => set('age', e.target.value)} style={inputSt} />
        </Field>
      </div>

      <Field label="Gender" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {[['F','Female'],['M','Male'],['Other','Other']].map(([v,l]) => (
            <button key={v} onClick={() => set('gender', v)} style={{ flex: 1, padding: '9px 0', borderRadius: 9, border: `1.5px solid ${form.gender === v ? C.primary : C.border}`, background: form.gender === v ? C.primaryXLight : C.white, fontFamily: FONT_SANS, fontSize: 13, color: form.gender === v ? C.primary : C.textMuted, fontWeight: form.gender === v ? 600 : 400, cursor: 'pointer' }}>{l}</button>
          ))}
        </div>
      </Field>

      <Field label="Reason for Visit" style={{ marginBottom: 12 }}>
        <select value={form.reason} onChange={e => set('reason', e.target.value)} style={inputSt}>
          {COMMON_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </Field>

      <Field label="Additional Notes (optional)">
        <textarea placeholder="Any symptoms, history, or concerns…" value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} style={{ ...inputSt, resize: 'vertical' }} />
      </Field>

      {/* AI prediction card */}
      {(predicting || prediction) && (
        <div style={{ marginTop: 16, borderRadius: 14, border: `1.5px solid ${prediction ? riskColor(prediction.noshowRisk) : C.border}`, background: prediction ? riskBg(prediction.noshowRisk) : C.surfaceAlt, padding: '14px 18px' }}>
          {predicting && <p style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.textMuted, margin: 0 }}>🤖 AI is predicting duration and no-show risk…</p>}
          {prediction && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontFamily: FONT_SANS, fontSize: 11, color: C.textMuted, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '.4px' }}>Est. Duration</p>
                <p style={{ fontFamily: FONT_SERIF, fontSize: 22, fontWeight: 700, color: C.primary, margin: 0 }}>{prediction.durationMin} min</p>
              </div>
              <div>
                <p style={{ fontFamily: FONT_SANS, fontSize: 11, color: C.textMuted, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '.4px' }}>No-show Risk</p>
                <p style={{ fontFamily: FONT_SERIF, fontSize: 22, fontWeight: 700, color: riskColor(prediction.noshowRisk), margin: 0 }}>{prediction.noshowRisk}</p>
              </div>
              <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.textMuted, flex: 1, margin: 0 }}>💡 {prediction.reasoning}</p>
            </div>
          )}
        </div>
      )}

      {error && <p style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.rose, marginTop: 10 }}>{error}</p>}

      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <button onClick={onBack} style={{ flex: 1, padding: '12px 0', borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.white, fontFamily: FONT_SANS, fontWeight: 500, fontSize: 14, color: C.textMuted, cursor: 'pointer' }}>← Back</button>
        <button
          onClick={() => canContinue && onSubmit(form, prediction)}
          disabled={!canContinue}
          style={{ flex: 2, padding: '12px 0', borderRadius: 12, border: 'none', background: canContinue ? C.primary : C.border, color: canContinue ? C.white : C.textMuted, fontFamily: FONT_SANS, fontWeight: 600, fontSize: 14, cursor: canContinue ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}
        >
          Review & Confirm →
        </button>
      </div>
    </div>
  );
}

// ─── Step 4: Confirm ──────────────────────────────────────────────────────────
function StepConfirm({ doctor, slot, form, prediction, onConfirm, onBack, booking }) {
  const riskColor = r => r === 'High' ? C.rose : r === 'Medium' ? C.amber : C.emerald;

  const rows = [
    ['Doctor',     `${doctor.full_name} · ${doctor.specialty}`],
    ['Clinic',     doctor.clinic],
    ['Date & Time',`${formatDate(slot)}, ${formatTime(slot)}`],
    ['Patient',    `${form.name} · ${form.age}y · ${form.gender}`],
    ['Reason',     form.reason],
    ['Est. Duration', prediction ? `${prediction.durationMin} min` : `${doctor.avg_consult_min} min`],
  ];

  return (
    <div>
      <h2 style={{ fontFamily: FONT_SERIF, fontSize: 22, fontWeight: 700, color: C.text, margin: '0 0 4px' }}>Confirm Booking</h2>
      <p style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.textMuted, margin: '0 0 20px' }}>Review your appointment details before confirming</p>

      <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, overflow: 'hidden', marginBottom: 14 }}>
        {rows.map(([label, value], i) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '13px 18px', borderBottom: i < rows.length - 1 ? `1px solid ${C.borderMuted}` : 'none' }}>
            <span style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.textMuted }}>{label}</span>
            <span style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600, color: C.text }}>{value}</span>
          </div>
        ))}
      </div>

      {prediction && (
        <div style={{ background: C.surfaceAlt, borderRadius: 12, padding: '12px 18px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.textMuted }}>AI No-show Risk:</span>
          <span style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 700, color: riskColor(prediction.noshowRisk) }}>{prediction.noshowRisk} ({prediction.noshowProbability}%)</span>
          {prediction.noshowRisk === 'High' && (
            <span style={{ fontFamily: FONT_SANS, fontSize: 11, color: C.rose }}>⚠️ We'll send you an extra reminder</span>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onBack} disabled={booking} style={{ flex: 1, padding: '12px 0', borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.white, fontFamily: FONT_SANS, fontWeight: 500, fontSize: 14, color: C.textMuted, cursor: 'pointer' }}>← Back</button>
        <button onClick={onConfirm} disabled={booking} style={{ flex: 2, padding: '12px 0', borderRadius: 12, border: 'none', background: booking ? C.border : C.primary, color: booking ? C.textMuted : C.white, fontFamily: FONT_SANS, fontWeight: 600, fontSize: 15, cursor: booking ? 'not-allowed' : 'pointer', boxShadow: booking ? 'none' : `0 6px 20px ${C.primaryGlow}`, transition: 'all 0.2s' }}>
          {booking ? 'Booking…' : '✓ Confirm Appointment'}
        </button>
      </div>
    </div>
  );
}

// ─── Success Screen ───────────────────────────────────────────────────────────
function SuccessScreen({ appointment, doctor, onDone }) {
  return (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <div style={{ width: 70, height: 70, borderRadius: '50%', background: C.emeraldLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke={C.emerald} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      <h2 style={{ fontFamily: FONT_SERIF, fontSize: 24, fontWeight: 700, color: C.text, margin: '0 0 8px' }}>Appointment Confirmed!</h2>
      <p style={{ fontFamily: FONT_SANS, fontSize: 14, color: C.textMuted, margin: '0 0 24px' }}>
        Your appointment with <strong>{doctor.full_name}</strong> on <strong>{formatDate(new Date(appointment.scheduled_at))}</strong> at <strong>{formatTime(new Date(appointment.scheduled_at))}</strong> is booked.
      </p>
      <div style={{ background: C.primaryXLight, borderRadius: 14, padding: '14px 20px', marginBottom: 24, textAlign: 'left' }}>
        <p style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.primary, fontWeight: 600, margin: '0 0 4px' }}>📱 What's next?</p>
        <p style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.textMuted, margin: 0 }}>You'll receive a reminder notification 24 hours before your appointment. On the day, check in via the app to join the live queue.</p>
      </div>
      <button onClick={onDone} style={{ padding: '12px 32px', borderRadius: 12, border: 'none', background: C.primary, color: C.white, fontFamily: FONT_SANS, fontWeight: 600, fontSize: 14, cursor: 'pointer', boxShadow: `0 6px 20px ${C.primaryGlow}` }}>
        Go to My Appointments →
      </button>
    </div>
  );
}

// ─── Reschedule Modal ─────────────────────────────────────────────────────────
function RescheduleModal({ appointment, doctor, onClose, onRescheduled }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [slots, setSlots]               = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading]           = useState(false);
  const [saving, setSaving]             = useState(false);

  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i + 1); return d;
  });

  useEffect(() => {
    if (!doctor) return;
    setLoading(true); setSlots([]); setSelectedSlot(null);
    getAvailableSlots(doctor.id, selectedDate, doctor.avg_consult_min || 20)
      .then(s => { setSlots(s.filter(sl => sl > new Date())); setLoading(false); })
      .catch(() => setLoading(false));
  }, [selectedDate, doctor]);

  const handleReschedule = async () => {
    if (!selectedSlot) return;
    setSaving(true);
    try {
      const updated = await rescheduleAppointment(appointment.id, selectedSlot.toISOString());
      onRescheduled(updated);
    } catch { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,41,38,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}>
      <div style={{ background: C.white, borderRadius: 20, padding: 28, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontFamily: FONT_SERIF, fontSize: 20, fontWeight: 700, color: C.text, margin: 0 }}>Reschedule Appointment</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: C.textMuted }}>✕</button>
        </div>

        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 16 }}>
          {dates.map((d, i) => {
            const sel = d.toDateString() === selectedDate.toDateString();
            return (
              <button key={i} onClick={() => setSelectedDate(d)} style={{ flexShrink: 0, width: 52, padding: '8px 0', borderRadius: 10, border: `1.5px solid ${sel ? C.primary : C.border}`, background: sel ? C.primary : C.white, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <span style={{ fontFamily: FONT_SANS, fontSize: 9, color: sel ? 'rgba(255,255,255,0.7)' : C.textMuted }}>{d.toLocaleDateString('en-IN', { weekday: 'short' })}</span>
                <span style={{ fontFamily: FONT_SANS, fontSize: 14, fontWeight: 700, color: sel ? C.white : C.text }}>{d.getDate()}</span>
              </button>
            );
          })}
        </div>

        {loading && <p style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.textMuted }}>Loading slots…</p>}
        {!loading && slots.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 20 }}>
            {slots.map((s, i) => {
              const sel = selectedSlot?.getTime() === s.getTime();
              return (
                <button key={i} onClick={() => setSelectedSlot(s)} style={{ padding: '9px 0', borderRadius: 9, border: `1.5px solid ${sel ? C.primary : C.border}`, background: sel ? C.primary : C.white, fontFamily: FONT_SANS, fontSize: 12, fontWeight: sel ? 600 : 400, color: sel ? C.white : C.text, cursor: 'pointer' }}>
                  {formatTime(s)}
                </button>
              );
            })}
          </div>
        )}
        {!loading && slots.length === 0 && (
          <p style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.amber, marginBottom: 20 }}>No slots on this date. Try another.</p>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px 0', borderRadius: 11, border: `1.5px solid ${C.border}`, background: C.white, fontFamily: FONT_SANS, fontSize: 13, color: C.textMuted, cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleReschedule} disabled={!selectedSlot || saving} style={{ flex: 2, padding: '11px 0', borderRadius: 11, border: 'none', background: selectedSlot && !saving ? C.primary : C.border, color: selectedSlot && !saving ? C.white : C.textMuted, fontFamily: FONT_SANS, fontWeight: 600, fontSize: 13, cursor: selectedSlot && !saving ? 'pointer' : 'not-allowed' }}>
            {saving ? 'Rescheduling…' : 'Confirm Reschedule →'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.textMuted, display: 'block', marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  );
}

const inputSt = {
  width: '100%', padding: '10px 13px', borderRadius: 9, border: `1.5px solid ${C.border}`,
  fontFamily: FONT_SANS, fontSize: 13, color: C.text, background: C.white,
  outline: 'none', boxSizing: 'border-box',
};

// ─── Root Export ──────────────────────────────────────────────────────────────
export default function BookAppointment({ onNavigateToAppointments }) {
  const [step, setStep]           = useState(1);
  const [doctor, setDoctor]       = useState(null);
  const [slot, setSlot]           = useState(null);
  const [form, setForm]           = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [booking, setBooking]     = useState(false);
  const [booked, setBooked]       = useState(null);
  const [reschedTarget, setReschedTarget] = useState(null); // { appointment, doctor }

  const handleConfirm = async () => {
    setBooking(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const appt = await bookAppointment({
        patientId:          user.id,
        doctorId:           doctor.id,
        patientName:        form.name,
        patientAge:         parseInt(form.age),
        patientGender:      form.gender,
        reason:             form.reason,
        scheduledAt:        slot.toISOString(),
        durationMin:        prediction?.durationMin || doctor.avg_consult_min,
        noshowRisk:         prediction?.noshowRisk || null,
        noshowProbability:  prediction?.noshowProbability || null,
      });

      // Fire confirmation notification
      await createNotification(
        user.id,
        'Appointment Confirmed ✓',
        `Your appointment with ${doctor.full_name} on ${formatDate(slot)} at ${formatTime(slot)} is confirmed.`,
        'appointment_confirmed',
        appt.id,
      );

      // If high risk, fire extra reminder notification
      if (prediction?.noshowRisk === 'High') {
        await createNotification(
          user.id,
          '⚠️ High No-show Risk Detected',
          `Your upcoming appointment has been flagged as high risk. Please confirm attendance or reschedule if needed.`,
          'noshow_flagged',
          appt.id,
        );
      }

      setBooked(appt);
      setStep(5);
    } catch (e) {
      console.error(e);
    }
    setBooking(false);
  };

  return (
    <div>
      <div style={{ padding: '28px 32px 24px', borderBottom: `1px solid ${C.border}`, background: `rgba(255, 255, 255, 0.85)`, backdropFilter: 'blur(15px)', WebkitBackdropFilter: 'blur(15px)', borderRadius: '0 0 16px 16px' }}>
        <h1 style={{ fontFamily: FONT_SERIF, fontSize: 24, fontWeight: 700, color: C.text, margin: 0 }}>Book an Appointment</h1>
        <p style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.textMuted, margin: '4px 0 0' }}>Smart scheduling with real-time availability and AI predictions</p>
      </div>

      <div style={{ padding: '28px 32px', background: `linear-gradient(135deg, rgba(240, 253, 250, 0.5) 0%, rgba(248, 255, 254, 0.8) 100%)` }}>
        {step < 5 && <StepBar step={step} />}

        {step === 1 && <StepDoctor onSelect={d => { setDoctor(d); setStep(2); }} />}
        {step === 2 && <StepSlot doctor={doctor} onSelect={s => { setSlot(s); setStep(3); }} onBack={() => setStep(1)} />}
        {step === 3 && <StepDetails doctor={doctor} slot={slot} onSubmit={(f, p) => { setForm(f); setPrediction(p); setStep(4); }} onBack={() => setStep(2)} />}
        {step === 4 && <StepConfirm doctor={doctor} slot={slot} form={form} prediction={prediction} onConfirm={handleConfirm} onBack={() => setStep(3)} booking={booking} />}
        {step === 5 && booked && <SuccessScreen appointment={booked} doctor={doctor} onDone={() => onNavigateToAppointments?.()} />}
      </div>

      {reschedTarget && (
        <RescheduleModal
          appointment={reschedTarget.appointment}
          doctor={reschedTarget.doctor}
          onClose={() => setReschedTarget(null)}
          onRescheduled={() => { setReschedTarget(null); }}
        />
      )}
    </div>
  );
}

// Export RescheduleModal separately so patientdashboard can use it on appointments list
export { RescheduleModal };