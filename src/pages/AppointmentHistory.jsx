// src/pages/AppointmentHistory.jsx
// ─── Healthify · Appointment Management ───────────────────────────────────────
// Complete appointment history, status tracking, rescheduling, and cancellation

import { useState, useEffect } from 'react';
import {
  getPatientAppointments,
  rescheduleAppointment,
  cancelAppointment,
  getAvailableSlots,
  getDoctors,
  createNotification,
  formatTime,
  formatDate,
} from '../services/supabase';

// ─── Theme tokens (matches patient dashboard) ──────────────────────────────
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

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    confirmed: { color: C.primary, bg: C.primaryLight },
    in_progress: { color: C.emerald, bg: C.emeraldLight },
    completed: { color: C.accent, bg: C.accentLight },
    cancelled: { color: C.textMuted, bg: C.borderMuted },
    no_show: { color: C.rose, bg: C.roseLight },
  };
  const s = map[status] || { color: C.textMuted, bg: C.borderMuted };
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '6px 12px',
      borderRadius: 20,
      background: s.bg,
      color: s.color,
      fontWeight: 600,
      fontSize: 12,
      fontFamily: FONT_SANS,
    }}>
      {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
    </span>
  );
}

// ─── Appointment card ──────────────────────────────────────────────────────────
function AppointmentCard({ appt, user, onReschedule, onCancel, loading }) {
  const [showReschedule, setShowReschedule] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');

  const canReschedule = ['confirmed'].includes(appt.status);
  const canCancel = ['confirmed', 'in_progress'].includes(appt.status);
  const isPast = new Date(appt.scheduled_at) < new Date();
  const isToday = new Date(appt.scheduled_at).toDateString() === new Date().toDateString();

  async function loadSlots() {
    if (!rescheduleDate || !appt.doctor_id) return;
    setLoadingSlots(true);
    try {
      const slots = await getAvailableSlots(appt.doctor_id, new Date(rescheduleDate), 20);
      setAvailableSlots(slots);
    } catch (err) {
      console.error('Failed to load slots:', err);
    } finally {
      setLoadingSlots(false);
    }
  }

  async function handleReschedule() {
    if (!selectedSlot) return;
    await onReschedule(appt.id, selectedSlot.toISOString());
    setShowReschedule(false);
    setSelectedSlot(null);
  }

  return (
    <div style={{
      background: C.white,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      {/* Header with doctor and status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <h3 style={{ fontFamily: FONT_SERIF, fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 4 }}>
            Dr. {appt.doctors?.full_name || 'Unknown'}
          </h3>
          <p style={{ fontSize: 12, color: C.textMuted }}>
            {appt.doctors?.specialty || 'Specialist'} • {appt.doctors?.clinic || 'Clinic'}
          </p>
        </div>
        <StatusBadge status={appt.status} />
      </div>

      {/* Appointment details grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 12,
        marginBottom: 12,
        padding: '12px',
        background: C.surfaceAlt,
        borderRadius: 8,
      }}>
        <div>
          <p style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, marginBottom: 2 }}>DATE & TIME</p>
          <p style={{ fontSize: 14, fontWeight: 600, color: C.text }}>
            {formatDate(appt.scheduled_at)} • {formatTime(appt.scheduled_at)}
          </p>
        </div>
        <div>
          <p style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, marginBottom: 2 }}>REASON</p>
          <p style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{appt.reason || 'General checkup'}</p>
        </div>
        {appt.predicted_duration && (
          <div>
            <p style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, marginBottom: 2 }}>EST. DURATION</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{appt.predicted_duration} min</p>
          </div>
        )}
        {appt.noshow_risk && (
          <div>
            <p style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, marginBottom: 2 }}>NO-SHOW RISK</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: appt.noshow_risk === 'high' ? C.rose : C.amber }}>
              {appt.noshow_risk.charAt(0).toUpperCase() + appt.noshow_risk.slice(1)}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {canReschedule && !isPast && (
          <button
            onClick={() => setShowReschedule(!showReschedule)}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: `1.5px solid ${C.primary}`,
              background: 'transparent',
              color: C.primary,
              fontWeight: 600,
              fontSize: 12,
              fontFamily: FONT_SANS,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = C.primaryXLight;
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
            }}
          >
            ↻ Reschedule
          </button>
        )}
        {canCancel && !isPast && (
          <button
            onClick={() => onCancel(appt.id)}
            disabled={loading}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: `1.5px solid ${C.rose}`,
              background: 'transparent',
              color: C.rose,
              fontWeight: 600,
              fontSize: 12,
              fontFamily: FONT_SANS,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!loading) e.target.style.background = C.roseLight;
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
            }}
          >
            ✕ Cancel
          </button>
        )}
        {isToday && appt.status === 'confirmed' && (
          <div style={{
            padding: '8px 12px',
            borderRadius: 8,
            background: C.primaryLight,
            color: C.text,
            fontSize: 12,
            fontWeight: 600,
            fontFamily: FONT_SANS,
          }}>
            📍 Check in at clinic
          </div>
        )}
      </div>

      {/* Reschedule modal */}
      {showReschedule && (
        <div style={{ marginTop: 12, padding: 12, background: C.surfaceAlt, borderRadius: 8 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 8 }}>Select new date:</p>
          <input
            type="date"
            value={rescheduleDate}
            onChange={(e) => {
              setRescheduleDate(e.target.value);
              if (e.target.value) loadSlots();
            }}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: 6,
              border: `1px solid ${C.border}`,
              fontFamily: FONT_SANS,
              marginBottom: 8,
            }}
          />
          {loadingSlots && <p style={{ fontSize: 12, color: C.textMuted }}>Loading available slots...</p>}
          {availableSlots.length > 0 && (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 6,
                marginBottom: 8,
              }}>
                {availableSlots.slice(0, 9).map((slot, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedSlot(slot)}
                    style={{
                      padding: '6px',
                      borderRadius: 6,
                      border: `1px solid ${C.border}`,
                      background: selectedSlot === slot ? C.primary : 'transparent',
                      color: selectedSlot === slot ? C.white : C.text,
                      fontSize: 11,
                      fontWeight: 600,
                      fontFamily: FONT_SANS,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {formatTime(slot)}
                  </button>
                ))}
              </div>
              <button
                onClick={handleReschedule}
                disabled={!selectedSlot || loading}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: 6,
                  border: 'none',
                  background: C.primary,
                  color: C.white,
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: FONT_SANS,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? 'Rescheduling...' : 'Confirm Reschedule'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AppointmentHistory({ user }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, [user?.id]);

  async function loadAppointments() {
    if (!user?.id) return;
    setLoading(true);
    try {
      const appts = await getPatientAppointments(user.id);
      setAppointments(appts || []);
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleReschedule(appointmentId, newTime) {
    setActionLoading(true);
    try {
      await rescheduleAppointment(appointmentId, newTime);
      await createNotification(user.id, 'Appointment Rescheduled', 'Your appointment has been updated', 'appointment_update', appointmentId);
      await loadAppointments();
    } catch (err) {
      console.error('Reschedule failed:', err);
      alert('Failed to reschedule: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCancel(appointmentId) {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    setActionLoading(true);
    try {
      await cancelAppointment(appointmentId);
      await createNotification(user.id, 'Appointment Cancelled', 'Your appointment has been cancelled', 'appointment_cancel', appointmentId);
      await loadAppointments();
    } catch (err) {
      console.error('Cancel failed:', err);
      alert('Failed to cancel: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  }

  const now = new Date();
  const upcoming = appointments.filter(a => new Date(a.scheduled_at) >= now && a.status !== 'cancelled');
  const past = appointments.filter(a => new Date(a.scheduled_at) < now || a.status === 'cancelled');

  const filtered = filter === 'all' ? appointments : filter === 'upcoming' ? upcoming : past;

  return (
    <div style={{ fontFamily: FONT_SANS }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: FONT_SERIF, fontSize: 24, fontWeight: 700, color: C.text, marginBottom: 8 }}>
          My Appointments
        </h2>
        <p style={{ fontSize: 14, color: C.textMuted }}>
          Manage and track all your medical appointments
        </p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['all', 'upcoming', 'past'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              background: filter === f ? C.primary : C.surfaceAlt,
              color: filter === f ? C.white : C.text,
              fontWeight: 600,
              fontSize: 12,
              fontFamily: FONT_SANS,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)} ({f === 'all' ? appointments.length : f === 'upcoming' ? upcoming.length : past.length})
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{
          textAlign: 'center',
          padding: 32,
          background: C.surfaceAlt,
          borderRadius: 12,
        }}>
          <p style={{ fontSize: 14, color: C.textMuted }}>Loading appointments...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: 32,
          background: C.surfaceAlt,
          borderRadius: 12,
        }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>📋</div>
          <p style={{ fontWeight: 600, color: C.text, marginBottom: 4 }}>
            No {filter === 'all' ? '' : filter} appointments
          </p>
          <p style={{ fontSize: 13, color: C.textMuted }}>
            {filter === 'upcoming' ? 'You have no upcoming appointments.' : 'Start by booking your first appointment.'}
          </p>
        </div>
      )}

      {/* Appointments list */}
      {!loading && filtered.map(appt => (
        <AppointmentCard
          key={appt.id}
          appt={appt}
          user={user}
          onReschedule={handleReschedule}
          onCancel={handleCancel}
          loading={actionLoading}
        />
      ))}
    </div>
  );
}
