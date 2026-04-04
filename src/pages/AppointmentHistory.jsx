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
import { NOTIFICATION_TYPES } from '../constants/notificationKeys';

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
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
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
          <p style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>DATE & TIME</p>
          <p style={{ fontSize: 14, fontWeight: 600, color: C.text }}>
            {formatDate(appt.scheduled_at)} • {formatTime(appt.scheduled_at)}
          </p>
        </div>
        <div>
          <p style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>REASON</p>
          <p style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{appt.reason || 'General checkup'}</p>
        </div>
        {appt.predicted_duration && (
          <div style={{ background: C.primaryXLight, padding: '8px 10px', borderRadius: 6 }}>
            <p style={{ fontSize: 11, color: C.primaryDark, fontWeight: 600, marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>⏱️ AI Est. Duration</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: C.primary }}>{appt.predicted_duration} min</p>
          </div>
        )}
        {appt.noshow_risk && (
          <div style={{ background: appt.noshow_risk === 'high' ? C.roseLight : C.amberLight, padding: '8px 10px', borderRadius: 6 }}>
            <p style={{ fontSize: 11, color: appt.noshow_risk === 'high' ? C.rose : C.amber, fontWeight: 600, marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>⚠️ NO-SHOW RISK</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: appt.noshow_risk === 'high' ? C.rose : appt.noshow_risk === 'medium' ? C.amber : C.emerald }}>
              {appt.noshow_risk.charAt(0).toUpperCase() + appt.noshow_risk.slice(1)}
              {appt.noshow_probability && ` (${appt.noshow_probability}%)`}
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
            onClick={() => setShowCancelConfirm(true)}
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
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: C.white,
            borderRadius: 16,
            padding: '28px',
            maxWidth: 500,
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
          }}>
            <h2 style={{ fontFamily: FONT_SERIF, fontSize: 20, fontWeight: 700, color: C.text, margin: '0 0 8px' }}>
              Reschedule Appointment
            </h2>
            <p style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.textMuted, margin: '0 0 20px' }}>
              Dr. {appt.doctors?.full_name} • {appt.doctors?.specialty}
            </p>

            <div style={{ background: C.surfaceAlt, padding: '14px', borderRadius: 10, marginBottom: 20 }}>
              <p style={{ fontFamily: FONT_SANS, fontSize: 11, color: C.textMuted, fontWeight: 600, margin: '0 0 4px', textTransform: 'uppercase' }}>Current Date & Time</p>
              <p style={{ fontFamily: FONT_SANS, fontSize: 14, fontWeight: 700, color: C.primary, margin: 0 }}>
                {formatDate(appt.scheduled_at)} • {formatTime(appt.scheduled_at)}
              </p>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 600, color: C.text, display: 'block', marginBottom: 8, textTransform: 'uppercase' }}>
                Select New Date
              </label>
              <input
                type="date"
                value={rescheduleDate}
                onChange={(e) => {
                  setRescheduleDate(e.target.value);
                  if (e.target.value) loadSlots();
                }}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: `1.5px solid ${C.border}`,
                  fontFamily: FONT_SANS,
                  fontSize: 14,
                  color: C.text,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {loadingSlots && (
              <div style={{ textAlign: 'center', padding: '20px', color: C.textMuted, fontFamily: FONT_SANS, fontSize: 13 }}>
                ⏳ Loading available time slots...
              </div>
            )}

            {rescheduleDate && availableSlots.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 600, color: C.text, display: 'block', marginBottom: 10, textTransform: 'uppercase' }}>
                  Select New Time
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 8,
                  marginBottom: 16,
                }}>
                  {availableSlots.slice(0, 12).map((slot, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedSlot(slot)}
                      style={{
                        padding: '10px 8px',
                        borderRadius: 8,
                        border: `2px solid ${selectedSlot === slot ? C.primary : C.border}`,
                        background: selectedSlot === slot ? C.primaryXLight : C.white,
                        color: selectedSlot === slot ? C.primary : C.text,
                        fontSize: 12,
                        fontWeight: selectedSlot === slot ? 700 : 600,
                        fontFamily: FONT_SANS,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        if (selectedSlot !== slot) {
                          e.target.style.borderColor = C.primary;
                          e.target.style.background = C.primaryLight;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedSlot !== slot) {
                          e.target.style.borderColor = C.border;
                          e.target.style.background = C.white;
                        }
                      }}
                    >
                      {formatTime(slot)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {rescheduleDate && availableSlots.length === 0 && !loadingSlots && (
              <div style={{
                background: C.amberLight,
                padding: '12px',
                borderRadius: 8,
                marginBottom: 20,
                color: C.amber,
                fontFamily: FONT_SANS,
                fontSize: 13,
              }}>
                ⚠️ No available slots for this date. Please choose another date.
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => {
                  setShowReschedule(false);
                  setRescheduleDate('');
                  setSelectedSlot(null);
                  setAvailableSlots([]);
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 8,
                  border: `1.5px solid ${C.border}`,
                  background: C.white,
                  color: C.text,
                  fontWeight: 600,
                  fontSize: 14,
                  fontFamily: FONT_SANS,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = C.surfaceAlt;
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = C.white;
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleReschedule}
                disabled={!selectedSlot || loading}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 8,
                  border: 'none',
                  background: selectedSlot && !loading ? C.primary : C.border,
                  color: selectedSlot && !loading ? C.white : C.textMuted,
                  fontWeight: 600,
                  fontSize: 14,
                  fontFamily: FONT_SANS,
                  cursor: selectedSlot && !loading ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (selectedSlot && !loading) e.target.style.background = C.primaryDark;
                }}
                onMouseLeave={(e) => {
                  if (selectedSlot && !loading) e.target.style.background = C.primary;
                }}
              >
                {loading ? '⏳ Rescheduling...' : '✓ Confirm Reschedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel confirmation modal */}
      {showCancelConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: C.white,
            borderRadius: 16,
            padding: '28px',
            maxWidth: 420,
            width: '90%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
          }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <p style={{ fontSize: 32, margin: '0 0 12px' }}>⚠️</p>
              <h2 style={{ fontFamily: FONT_SERIF, fontSize: 20, fontWeight: 700, color: C.text, margin: '0 0 8px' }}>
                Cancel Appointment?
              </h2>
              <p style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.textMuted, margin: 0 }}>
                This action cannot be undone. Your appointment with Dr. {appt.doctors?.full_name} will be cancelled.
              </p>
            </div>

            <div style={{ background: C.roseLight, padding: '12px', borderRadius: 10, marginBottom: 20, fontFamily: FONT_SANS, fontSize: 12, color: C.rose }}>
              <strong>Appointment Details:</strong><br />
              {formatDate(appt.scheduled_at)} • {formatTime(appt.scheduled_at)}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowCancelConfirm(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 8,
                  border: `1.5px solid ${C.border}`,
                  background: C.white,
                  color: C.text,
                  fontWeight: 600,
                  fontSize: 14,
                  fontFamily: FONT_SANS,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = C.surfaceAlt;
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = C.white;
                }}
              >
                Keep Appointment
              </button>
              <button
                onClick={async () => {
                  await onCancel(appt.id);
                  setShowCancelConfirm(false);
                }}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 8,
                  border: 'none',
                  background: loading ? C.border : C.rose,
                  color: loading ? C.textMuted : C.white,
                  fontWeight: 600,
                  fontSize: 14,
                  fontFamily: FONT_SANS,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.target.style.background = '#E02E5A';
                }}
                onMouseLeave={(e) => {
                  if (!loading) e.target.style.background = C.rose;
                }}
              >
                {loading ? '⏳ Cancelling...' : '✕ Yes, Cancel It'}
              </button>
            </div>
          </div>
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
      const appt = appointments.find(a => a.id === appointmentId);
      const phoneNumber = user?.user_metadata?.phone || null;
      const doctorName = appt?.doctors?.full_name || 'Your Doctor';
      
      await rescheduleAppointment(appointmentId, newTime, phoneNumber, doctorName);
      // Reload appointments to show updated schedule
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
      const appt = appointments.find(a => a.id === appointmentId);
      const phoneNumber = user?.user_metadata?.phone || null;
      const doctorName = appt?.doctors?.full_name || 'Your Doctor';
      
      // cancelAppointment already creates the notification, so just call it
      await cancelAppointment(appointmentId, phoneNumber, doctorName);
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
