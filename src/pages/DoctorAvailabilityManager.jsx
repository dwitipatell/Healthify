// src/pages/DoctorAvailabilityManager.jsx
// ─── Healthify · Doctor Availability & Schedule Management ───────────────────
// Manage working hours, breaks, vacation days, and doctor availability

import { useState, useEffect } from 'react';
import { getDoctorByUserId, toggleDoctorDay, updateAvgConsultTime, supabase } from '../services/supabase';

// ─── Theme tokens (doctor indigo theme) ───────────────────────────────────────
const C = {
  primary: "#6366F1",
  primaryDark: "#4F46E5",
  primaryLight: "#EEF2FF",
  primaryXLight: "#F3F4F8",
  accent: "#818CF8",
  text: "#1E1B4B",
  textMuted: "#6B7FBD",
  textLight: "#9CA3AF",
  white: "#FFFFFF",
  surface: "#F9FAFB",
  surfaceAlt: "#F3F4F8",
  border: "#E0E7FF",
  borderMuted: "#F0F1FF",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
};
const FONT_SANS = "'DM Sans', sans-serif";
const FONT_SERIF = "'Fraunces', serif";

// ─── Days of week ─────────────────────────────────────────────────────────────
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_CODES = [1, 2, 3, 4, 5, 6, 0]; // 0 = Sunday

// ─── Day availability card ────────────────────────────────────────────────────
function DayAvailabilityCard({ day, available, startTime, endTime, breakStart, breakEnd, onUpdate, loading }) {
  const [editing, setEditing] = useState(false);
  const [st, setSt] = useState(startTime);
  const [et, setEt] = useState(endTime);
  const [bs, setBs] = useState(breakStart);
  const [be, setBe] = useState(breakEnd);

  async function handleSave() {
    try {
      // Update availability in database
      const { error } = await supabase
        .from('doctor_availability')
        .update({
          is_active: available,
          start_time: st,
          end_time: et,
          break_start: bs,
          break_end: be,
        })
        .eq('day_of_week', DAY_CODES[DAYS.indexOf(day)]);
      
      if (error) throw error;
      setEditing(false);
      onUpdate?.();
    } catch (err) {
      alert('Failed to update: ' + err.message);
    }
  }

  return (
    <div style={{
      background: C.white,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      position: 'relative',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <h3 style={{ fontFamily: FONT_SERIF, fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 4 }}>
            {day}
          </h3>
          {!editing && (
            <p style={{ fontSize: 12, color: C.textMuted }}>
              {available ? `${st} - ${et}` : 'Not working'}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 12px',
            borderRadius: 20,
            background: available ? 'rgba(16,185,129,0.12)' : 'rgba(107,127,189,0.12)',
            color: available ? C.success : C.textMuted,
            fontSize: 11,
            fontWeight: 600,
            fontFamily: FONT_SANS,
          }}>
            <span style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: available ? C.success : C.textMuted,
            }} />
            {available ? 'Active' : 'Off'}
          </span>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                border: `1px solid ${C.border}`,
                background: 'transparent',
                color: C.primary,
                fontSize: 12,
                fontWeight: 600,
                fontFamily: FONT_SANS,
                cursor: 'pointer',
              }}
            >
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Edit mode */}
      {editing && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          padding: 12,
          background: C.surfaceAlt,
          borderRadius: 8,
        }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.textMuted, marginBottom: 4 }}>
              Working
            </label>
            <input
              type="checkbox"
              checked={available}
              onChange={(e) => setSt(e.target.checked ? '09:00' : '')}
              style={{ marginBottom: 8 }}
            />
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.textMuted, marginBottom: 4 }}>
              Start Time
            </label>
            <input
              type="time"
              value={st}
              onChange={(e) => setSt(e.target.value)}
              disabled={!available}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: 6,
                border: `1px solid ${C.border}`,
                fontFamily: FONT_SANS,
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.textMuted, marginBottom: 4 }}>
              End Time
            </label>
            <input
              type="time"
              value={et}
              onChange={(e) => setEt(e.target.value)}
              disabled={!available}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: 6,
                border: `1px solid ${C.border}`,
                fontFamily: FONT_SANS,
              }}
            />
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.textMuted, marginBottom: 4, marginTop: 8 }}>
              Break Start
            </label>
            <input
              type="time"
              value={bs}
              onChange={(e) => setBs(e.target.value)}
              disabled={!available}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: 6,
                border: `1px solid ${C.border}`,
                fontFamily: FONT_SANS,
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.textMuted, marginBottom: 4 }}>
              Break End
            </label>
            <input
              type="time"
              value={be}
              onChange={(e) => setBe(e.target.value)}
              disabled={!available}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: 6,
                border: `1px solid ${C.border}`,
                fontFamily: FONT_SANS,
              }}
            />
          </div>
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8 }}>
            <button
              onClick={handleSave}
              disabled={loading}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: 6,
                border: 'none',
                background: C.primary,
                color: C.white,
                fontSize: 12,
                fontWeight: 600,
                fontFamily: FONT_SANS,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => setEditing(false)}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: 6,
                border: `1px solid ${C.border}`,
                background: 'transparent',
                color: C.text,
                fontSize: 12,
                fontWeight: 600,
                fontFamily: FONT_SANS,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function DoctorAvailabilityManager({ user }) {
  const [doctor, setDoctor] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [avgConsultMin, setAvgConsultMin] = useState(20);
  const [editingConsultTime, setEditingConsultTime] = useState(false);

  useEffect(() => {
    loadDoctorData();
  }, [user?.id]);

  async function loadDoctorData() {
    if (!user?.id) return;
    setLoading(true);
    try {
      const doc = await getDoctorByUserId(user.id);
      setDoctor(doc);
      setAvgConsultMin(doc?.avg_consult_min || 20);
      setAvailability(doc?.doctor_availability || []);
    } catch (err) {
      console.error('Failed to load doctor data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateConsultTime() {
    try {
      await updateAvgConsultTime(doctor.id, avgConsultMin);
      await loadDoctorData();
      setEditingConsultTime(false);
    } catch (err) {
      alert('Failed to update: ' + err.message);
    }
  }

  return (
    <div style={{ fontFamily: FONT_SANS }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: FONT_SERIF, fontSize: 24, fontWeight: 700, color: C.text, marginBottom: 8 }}>
          Availability & Schedule
        </h2>
        <p style={{ fontSize: 14, color: C.textMuted }}>
          Manage your working hours, breaks, and availability
        </p>
      </div>

      {/* Average consultation time card */}
      <div style={{
        background: C.primaryXLight,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
      }}>
        <h3 style={{ fontFamily: FONT_SERIF, fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 12 }}>
          Average Consultation Time
        </h3>
        <p style={{ fontSize: 12, color: C.textMuted, marginBottom: 12 }}>
          Used for appointment slot generation and queue estimation
        </p>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          {editingConsultTime ? (
            <>
              <div style={{ flex: 1 }}>
                <input
                  type="number"
                  value={avgConsultMin}
                  onChange={(e) => setAvgConsultMin(Math.max(5, parseInt(e.target.value) || 0))}
                  min="5"
                  max="120"
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: 6,
                    border: `1px solid ${C.border}`,
                    fontFamily: FONT_SANS,
                    fontSize: 14,
                  }}
                />
                <p style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>minutes</p>
              </div>
              <button
                onClick={handleUpdateConsultTime}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: 'none',
                  background: C.primary,
                  color: C.white,
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: FONT_SANS,
                  cursor: 'pointer',
                }}
              >
                Save
              </button>
              <button
                onClick={() => setEditingConsultTime(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: `1px solid ${C.border}`,
                  background: 'transparent',
                  color: C.text,
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: FONT_SANS,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <div>
                <p style={{ fontSize: 24, fontWeight: 700, color: C.primary, marginBottom: 4 }}>
                  {avgConsultMin} min
                </p>
              </div>
              <button
                onClick={() => setEditingConsultTime(true)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: `1px solid ${C.border}`,
                  background: 'transparent',
                  color: C.primary,
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: FONT_SANS,
                  cursor: 'pointer',
                }}
              >
                Edit
              </button>
            </>
          )}
        </div>
      </div>

      {/* Weekly schedule */}
      <div>
        <h3 style={{ fontFamily: FONT_SERIF, fontSize: 18, fontWeight: 600, color: C.text, marginBottom: 12 }}>
          Weekly Schedule
        </h3>
        {loading ? (
          <p style={{ fontSize: 14, color: C.textMuted }}>Loading schedule...</p>
        ) : (
          <div>
            {DAYS.map((day, idx) => {
              const dayAvail = availability.find(a => a.day_of_week === DAY_CODES[idx]);
              return (
                <DayAvailabilityCard
                  key={day}
                  day={day}
                  available={dayAvail?.is_active || false}
                  startTime={dayAvail?.start_time || '09:00'}
                  endTime={dayAvail?.end_time || '17:00'}
                  breakStart={dayAvail?.break_start || '13:00'}
                  breakEnd={dayAvail?.break_end || '14:00'}
                  onUpdate={loadDoctorData}
                  loading={loading}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Vacation/Unavailable dates section */}
      <div style={{ marginTop: 24, padding: 16, background: C.surfaceAlt, borderRadius: 12 }}>
        <h3 style={{ fontFamily: FONT_SERIF, fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 8 }}>
          💼 Vacation & Unavailable Dates
        </h3>
        <p style={{ fontSize: 12, color: C.textMuted, marginBottom: 12 }}>
          Mark specific dates when you're unable to see patients
        </p>
        <button style={{
          padding: '8px 16px',
          borderRadius: 6,
          border: `1px solid ${C.border}`,
          background: C.white,
          color: C.primary,
          fontSize: 12,
          fontWeight: 600,
          fontFamily: FONT_SANS,
          cursor: 'pointer',
        }}>
          + Add Vacation Period
        </button>
      </div>
    </div>
  );
}
