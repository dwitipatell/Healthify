// src/pages/DoctorQueueAnalytics.jsx
// ─── Healthify · Doctor Queue Analytics & Performance Metrics ───────────────
// Real-time queue monitoring, performance analytics, and utilization metrics

import { useState, useEffect } from 'react';
import {
  getDoctorQueue,
  getDoctorUtilization,
  getDoctorDelayMetrics,
  getAppointmentReasonStats,
  getPatientDemographics,
  recomputeQueueWaitTimes,
} from '../services/supabase';

// ─── Theme tokens (doctor indigo theme) ───────────────────────────────────────
const C = {
  primary: "#6366F1",
  primaryDark: "#4F46E5",
  primaryLight: "#EEF2FF",
  accent: "#818CF8",
  text: "#1E1B4B",
  textMuted: "#6B7FBD",
  textLight: "#9CA3AF",
  white: "#FFFFFF",
  surface: "#F9FAFB",
  surfaceAlt: "#F3F4F8",
  border: "#E0E7FF",
  emerald: "#10B981",
  amber: "#F59E0B",
  rose: "#EF4444",
};
const FONT_SANS = "'DM Sans', sans-serif";
const FONT_SERIF = "'Fraunces', serif";

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, trend, color = C.primary }) {
  return (
    <div style={{
      background: C.white,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: 16,
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
    }}>
      <div style={{
        width: 48,
        height: 48,
        borderRadius: 10,
        background: `${color}15`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 24,
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: 'uppercase', marginBottom: 4 }}>
          {label}
        </p>
        <p style={{ fontSize: 24, fontWeight: 700, color: C.text, marginBottom: 4 }}>
          {value}
        </p>
        {trend && (
          <p style={{ fontSize: 11, color: trend.includes('↑') ? C.emerald : C.rose }}>
            {trend}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Chart component ──────────────────────────────────────────────────────────
function SimpleChart({ data, title }) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div style={{
        background: C.white,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: 16,
        textAlign: 'center',
      }}>
        <p style={{ fontSize: 12, color: C.textMuted }}>No data available</p>
      </div>
    );
  }

  const entries = Object.entries(data);
  const maxValue = Math.max(...entries.map(([_, v]) => typeof v === 'number' ? v : 0));

  return (
    <div style={{
      background: C.white,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: 16,
    }}>
      <h3 style={{ fontFamily: FONT_SERIF, fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 12 }}>
        {title}
      </h3>
      {entries.map(([label, value]) => (
        <div key={label} style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>{label}</span>
            <span style={{ fontSize: 12, color: C.textMuted, fontWeight: 600 }}>
              {typeof value === 'number' ? value : Object.values(value).reduce((a, b) => a + b, 0)}
            </span>
          </div>
          <div style={{
            height: 8,
            background: C.surfaceAlt,
            borderRadius: 4,
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              background: C.primary,
              width: `${maxValue > 0 ? (value / maxValue) * 100 : 0}%`,
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function DoctorQueueAnalytics({ doctorId, user }) {
  const [queue, setQueue] = useState([]);
  const [utilization, setUtilization] = useState({});
  const [delayMetrics, setDelayMetrics] = useState({});
  const [reasonStats, setReasonStats] = useState([]);
  const [demographics, setDemographics] = useState({});
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7'); // days

  useEffect(() => {
    loadAllData();
    const interval = setInterval(loadAllData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [doctorId, period]);

  async function loadAllData() {
    if (!doctorId) return;
    setLoading(true);
    try {
      const [q, util, delays, reasons, demo] = await Promise.all([
        getDoctorQueue(doctorId),
        getDoctorUtilization(doctorId, parseInt(period)),
        getDoctorDelayMetrics(doctorId, parseInt(period)),
        getAppointmentReasonStats(doctorId, parseInt(period)),
        getPatientDemographics(doctorId, parseInt(period)),
      ]);
      setQueue(q || []);
      setUtilization(util || {});
      setDelayMetrics(delays || {});
      setReasonStats(reasons || []);
      setDemographics(demo || {});
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  }

  const todayTotal = queue.length;
  const inProgress = queue.filter(q => q.status === 'in-progress').length;
  const waiting = queue.filter(q => q.status === 'waiting').length;
  const avgWaitMins = queue.length > 0
    ? Math.round(queue.reduce((sum, q) => sum + (q.estimated_wait || 0), 0) / queue.length)
    : 0;

  const completedToday = Object.values(utilization).reduce((sum, day) => sum + (day.completed || 0), 0);
  const noShowToday = Object.values(utilization).reduce((sum, day) => sum + (day.noShow || 0), 0);

  return (
    <div style={{ fontFamily: FONT_SANS }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div>
            <h2 style={{ fontFamily: FONT_SERIF, fontSize: 24, fontWeight: 700, color: C.text, marginBottom: 4 }}>
              Queue & Analytics
            </h2>
            <p style={{ fontSize: 14, color: C.textMuted }}>
              Real-time queue monitor and performance metrics
            </p>
          </div>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: `1px solid ${C.border}`,
              fontFamily: FONT_SANS,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            <option value="1">Last 24 hours</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p style={{ fontSize: 14, color: C.textMuted }}>Loading analytics...</p>
      ) : (
        <>
          {/* Today's Queue Stats */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontFamily: FONT_SERIF, fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 12 }}>
              Today's Queue
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
              <StatCard icon="📋" label="Total Patients" value={todayTotal} />
              <StatCard icon="👨‍⚕️" label="In Progress" value={inProgress} color={C.emerald} />
              <StatCard icon="⏳" label="Waiting" value={waiting} color={C.amber} />
              <StatCard icon="⌛" label="Avg Wait" value={`${avgWaitMins} min`} color={C.primary} />
            </div>
          </div>

          {/* Performance Metrics */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontFamily: FONT_SERIF, fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 12 }}>
              Performance Metrics
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
              <StatCard
                icon="✅"
                label="Completed"
                value={completedToday}
                trend="↑ On track"
                color={C.emerald}
              />
              <StatCard
                icon="⏰"
                label="Avg Delay"
                value={`${delayMetrics.avgDelay || 0} min`}
                trend={`${delayMetrics.onTimeRate || 0}% on time`}
                color={delayMetrics.avgDelay > 10 ? C.rose : C.primary}
              />
              <StatCard
                icon="📊"
                label="No-Shows"
                value={noShowToday}
                color={noShowToday > 0 ? C.rose : C.emerald}
              />
              <StatCard
                icon="📈"
                label="Total Patients"
                value={delayMetrics.totalAppts || 0}
                color={C.accent}
              />
            </div>
          </div>

          {/* Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12, marginBottom: 24 }}>
            <SimpleChart data={demographics.genders} title="Patient Gender Distribution" />
            <SimpleChart data={demographics.ageGroups} title="Patient Age Groups" />
            <SimpleChart
              data={reasonStats.length > 0 ? Object.fromEntries(
                reasonStats.slice(0, 8).map(r => [r.reason, r.count])
              ) : {}}
              title="Top Appointment Reasons"
            />
            <SimpleChart
              data={reasonStats.length > 0 ? Object.fromEntries(
                reasonStats.slice(0, 8).map(r => [r.reason, r.completionRate])
              ) : {}}
              title="Completion Rate by Reason"
            />
          </div>

          {/* Live Queue */}
          <div style={{ marginTop: 24 }}>
            <h3 style={{ fontFamily: FONT_SERIF, fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 12 }}>
              ⏱ Live Queue
            </h3>
            {queue.length === 0 ? (
              <div style={{
                background: C.surfaceAlt,
                borderRadius: 12,
                padding: 24,
                textAlign: 'center',
              }}>
                <p style={{ fontSize: 14, color: C.textMuted }}>No patients in queue</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                {queue.slice(0, 10).map((q, idx) => (
                  <div
                    key={q.id}
                    style={{
                      background: C.white,
                      border: `1px solid ${C.border}`,
                      borderRadius: 8,
                      padding: 12,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: C.primary,
                        color: C.white,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 12,
                      }}>
                        {idx + 1}
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
                          {q.appointments?.patient_name || 'Patient'}
                        </p>
                        <p style={{ fontSize: 11, color: C.textMuted }}>
                          {q.appointments?.reason_for_visit || 'General'}
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: 20,
                        background: q.status === 'in-progress' ? 'rgba(16,185,129,0.12)' : 'rgba(107,127,189,0.12)',
                        color: q.status === 'in-progress' ? C.emerald : C.textMuted,
                        fontSize: 11,
                        fontWeight: 600,
                      }}>
                        {q.status}
                      </span>
                      <p style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>
                        Wait: {q.estimated_wait || 0} min
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
