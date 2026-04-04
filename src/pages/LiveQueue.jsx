import { useState, useEffect, useRef } from "react";
import { supabase, testCreateAppointment, debugListQueue, debugListAppointments } from "../services/supabase";
import { calculateCurrentQueueWaitTime, suggestAlternativeDoctors, getQueueHealthReport } from "../services/queueOptimization";
import { notifyDoctorQueueOverload, broadcastQueueUpdate } from "../services/notifications";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatTime(minutes) {
  if (!minutes || minutes < 1) return "< 1 min";
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function calcCumulativeWait(queue, upToIndex) {
  return queue
    .slice(0, upToIndex)
    .reduce((sum, e) => sum + (e.predicted_duration ?? 15), 0);
}

function StatusBadge({ status }) {
  const map = {
    waiting:       { label: "Waiting",     color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
    "in-progress": { label: "In Progress", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
    completed:     { label: "Completed",   color: "#6366f1", bg: "rgba(99,102,241,0.12)" },
    skipped:       { label: "Skipped",     color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
    delayed:       { label: "Delayed",     color: "#f97316", bg: "rgba(249,115,22,0.12)" },
  };
  const s = map[status] ?? { label: status, color: "#9ca3af", bg: "rgba(156,163,175,0.12)" };
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: "3px 10px",
      borderRadius: 20, color: s.color, background: s.bg,
      letterSpacing: 0.3, whiteSpace: "nowrap",
    }}>
      {s.label}
    </span>
  );
}

function LiveDot() {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{
        width: 8, height: 8, borderRadius: "50%",
        background: "#10b981", display: "inline-block",
        animation: "lqPulse 1.5s ease-in-out infinite",
      }} />
      <style>{`@keyframes lqPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.35;transform:scale(.65)}}`}</style>
    </span>
  );
}

function StatBox({ label, value, accent }) {
  return (
    <div style={{
      background: "var(--bg-secondary, #f9fafb)",
      borderRadius: 10, padding: "10px 12px", textAlign: "center",
    }}>
      <p style={{ fontSize: 20, fontWeight: 800, color: accent, marginBottom: 2, lineHeight: 1 }}>
        {value}
      </p>
      <p style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500 }}>{label}</p>
    </div>
  );
}

function MiniStat({ icon, label, value, truncate }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <span style={{ fontSize: 13 }}>{icon}</span>
      <span style={{ fontSize: 12, color: "#9ca3af" }}>{label}:</span>
      <span style={{
        fontSize: 12, fontWeight: 600,
        color: "var(--text-primary, #111)",
        maxWidth: truncate ? 200 : "none",
        overflow: truncate ? "hidden" : "visible",
        textOverflow: truncate ? "ellipsis" : "clip",
        whiteSpace: truncate ? "nowrap" : "normal",
      }}>
        {value}
      </span>
    </div>
  );
}

function ActionBtn({ label, color, outlined, loading, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        padding: "7px 14px", borderRadius: 8,
        fontSize: 12, fontWeight: 600,
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.6 : 1,
        border: outlined ? `1.5px solid ${color}` : "none",
        background: outlined ? "transparent" : color,
        color: outlined ? color : "#fff",
        transition: "opacity 0.15s",
      }}
    >
      {loading ? "…" : label}
    </button>
  );
}

// ─── Patient Queue View ──────────────────────────────────────────────────────

export function PatientQueueView({ userId }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    loadMyQueue();

    const channel = supabase
      .channel("patient-queue-" + userId)
      .on("postgres_changes", { event: "*", schema: "public", table: "queue" }, loadMyQueue)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [userId]);

  async function loadMyQueue() {
    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];

      const { data: appts, error: e } = await supabase
        .from("appointments")
        .select("id, scheduled_at, status, predicted_duration, doctor_id, doctors(full_name, specialty)")
        .eq("patient_id", userId)
        .gte("scheduled_at", today + "T00:00:00")
        .lte("scheduled_at", today + "T23:59:59")
        .in("status", ["confirmed", "in_progress"]);

      if (e) throw e;

      const enriched = await Promise.all((appts ?? []).map(async (appt) => {
        const { data: qEntry } = await supabase
          .from("queue")
          .select("id, status, predicted_duration, created_at")
          .eq("appointment_id", appt.id)
          .maybeSingle();

        const { data: ahead } = await supabase
          .from("queue")
          .select("predicted_duration")
          .eq("doctor_id", appt.doctor_id)
          .lt("created_at", qEntry?.created_at ?? new Date().toISOString())
          .in("status", ["waiting", "in-progress"]);

        const waitMins = (ahead ?? []).reduce((sum, e) => sum + (e.predicted_duration ?? 15), 0);
        return { ...appt, queueEntry: qEntry, waitMins };
      }));

      setAppointments(enriched);
    } catch (e) {
      console.error('Patient queue error:', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const card = {
    background: "var(--card-bg, #fff)",
    borderRadius: 16, padding: "20px 24px", marginBottom: 16,
    border: "1px solid var(--border-color, #e5e7eb)",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  };

  if (loading) return <div style={card}><p style={{ color: "#9ca3af", fontSize: 14 }}>Loading your queue status…</p></div>;
  if (error)   return <div style={card}><p style={{ color: "#ef4444", fontSize: 14 }}>Error: {error}</p></div>;

  if (appointments.length === 0) return (
    <div style={{ ...card, textAlign: "center", padding: "32px 24px" }}>
      <div style={{ fontSize: 40, marginBottom: 8 }}>🏥</div>
      <p style={{ fontWeight: 700, color: "var(--text-primary, #111)", marginBottom: 4 }}>No appointments today</p>
      <p style={{ color: "#9ca3af", fontSize: 13 }}>Book an appointment to see your live queue status here.</p>
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <LiveDot />
        <span style={{ fontSize: 13, color: "#10b981", fontWeight: 600 }}>Live Queue</span>
      </div>

      {appointments.map((appt) => (
        <div key={appt.id} style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary, #111)", marginBottom: 2 }}>
                Dr. {appt.doctors?.full_name ?? "Unknown"}
              </p>
              <p style={{ fontSize: 12, color: "#9ca3af" }}>{appt.doctors?.specialty}</p>
            </div>
            <StatusBadge status={appt.queueEntry?.status ?? appt.status} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginTop: 16 }}>
            <StatBox
              label="Your Position"
              value={appt.queueEntry?.position != null ? `#${appt.queueEntry.position}` : "—"}
              accent="var(--primary-color, #0ea5e9)"
            />
            <StatBox
              label="Est. Wait"
              value={appt.waitMins > 0 ? formatTime(appt.waitMins) : "Next up!"}
              accent="#10b981"
            />
            <StatBox
              label="Consult Time"
              value={formatTime(appt.predicted_duration ?? 15)}
              accent="#f59e0b"
            />
          </div>

          {appt.queueEntry?.status === "in-progress" && (
            <div style={{
              marginTop: 14, padding: "10px 14px", borderRadius: 10,
              background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ fontSize: 18 }}>🟢</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#10b981" }}>
                You're being seen right now
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Doctor Queue View ───────────────────────────────────────────────────────

export function DoctorQueueView({ doctorId }) {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const aiCallActive = useRef(false);

  // Validate doctorId early
  useEffect(() => {
    if (!doctorId) {
      setError('No doctor ID available. Please refresh the page.');
      setLoading(false);
      console.error('❌ DoctorQueueView mounted without doctorId:', { doctorId });
      return;
    }

    console.log('✅ DoctorQueueView initialized with doctorId:', doctorId);
    loadQueue();
    checkDatabaseState();

    const channel = supabase
      .channel("doctor-queue-" + doctorId)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "queue",
        filter: `doctor_id=eq.${doctorId}`,
      }, loadQueue)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [doctorId]);

  async function checkDatabaseState() {
    try {
      // Check if there are ANY queue entries for this doctor
      const { data: allQueue } = await supabase
        .from('queue')
        .select('id, doctor_id, status, appointment_id')
        .eq('doctor_id', doctorId);

      // Check if there are ANY appointments for this doctor
      const { data: allAppts } = await supabase
        .from('appointments')
        .select('id, doctor_id, patient_name, status')
        .eq('doctor_id', doctorId)
        .limit(5);

      console.log('📊 Debug - Queue entries:', allQueue);
      console.log('📊 Debug - Recent appointments:', allAppts);
      
      setDebugInfo({
        totalQueueEntries: allQueue?.length || 0,
        totalAppointments: allAppts?.length || 0,
        doctorId,
      });
    } catch (err) {
      console.error('Debug check failed:', err);
    }
  }

  async function loadQueue() {
    setLoading(true);
    try {
      console.log('🔍 Loading queue for doctor:', doctorId);
      
      // First, get all queue entries for this doctor without relationships
      const { data: queueData, error: qErr } = await supabase
        .from("queue")
        .select("*")
        .eq("doctor_id", doctorId)
        .in("status", ["waiting", "in-progress", "delayed"])
        .order("created_at", { ascending: true });

      if (qErr) {
        console.error('❌ Queue query error:', qErr);
        throw qErr;
      }

      console.log('📋 Queue rows from DB:', queueData);

      // Now fetch appointment data for each queue entry
      const enrichedQueue = await Promise.all((queueData || []).map(async (qEntry) => {
        const { data: apptData } = await supabase
          .from("appointments")
          .select("id, scheduled_at, reason_for_visit, predicted_duration, patient_name, patient_age, patient_gender, patient_id")
          .eq("id", qEntry.appointment_id)
          .single();

        return {
          ...qEntry,
          appointments: apptData,
        };
      }));

      console.log('✅ Queue loaded with appointments:', enrichedQueue);
      setQueue(enrichedQueue ?? []);
    } catch (e) {
      console.error('❌ Queue load error:', e);
      setError(e.message || 'Failed to load queue');
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(queueId, newStatus) {
    setActionLoading(queueId);
    try {
      await supabase.from("queue").update({ status: newStatus }).eq("id", queueId);

      // Auto-advance: completing current → next waiting becomes in-progress
      if (newStatus === "completed") {
        const next = queue.find((q) => q.id !== queueId && q.status === "waiting");
        if (next) {
          await supabase.from("queue").update({ status: "in-progress" }).eq("id", next.id);
        }
      }

      // Write notification for patient
      const entry = queue.find((q) => q.id === queueId);
      if (entry && ["in-progress", "skipped", "delayed"].includes(newStatus)) {
        const msgMap = {
          "in-progress": "The doctor is ready to see you now — please head in.",
          "skipped":     "Your queue slot was skipped. Please check with reception.",
          "delayed":     "Your appointment is running slightly delayed. We'll update you shortly.",
        };
        await supabase.from("notifications").insert({
          user_id: entry.appointments?.patient_id ?? null,
          type: newStatus === "in-progress" ? "queue_called" : "queue_update",
          title: newStatus === "in-progress" ? "It's your turn!" : "Queue Update",
          message: msgMap[newStatus],
          is_read: false,
        });
      }

      await loadQueue();
    } finally {
      setActionLoading(null);
    }
  }

  async function aiPredictDuration(entry) {
    if (aiCallActive.current) return;
    aiCallActive.current = true;
    setActionLoading(entry.id + "-ai");

    const appt = entry.appointments;
    const patientName = appt?.patient_name ?? "Patient";
    const patientAge = appt?.patient_age ?? "unknown";
    const patientGender = appt?.patient_gender ?? "person";

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 200,
          system: "You are a medical scheduling AI. Return ONLY a valid JSON object with no markdown: {\"duration_minutes\": number, \"reason\": string}",
          messages: [{
            role: "user",
            content: `Patient: ${patientAge} yr old ${patientGender}. Reason for visit: "${appt?.reason_for_visit ?? "general checkup"}". Predict consultation duration in minutes (5–60 range).`,
          }],
        }),
      });
      const data = await res.json();
      const text = data.content?.[0]?.text ?? "{}";
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      const duration = parsed.duration_minutes ?? 15;

      await Promise.all([
        supabase.from("queue").update({ predicted_duration: duration, notes: parsed.reason ?? null }).eq("id", entry.id),
        supabase.from("appointments").update({ predicted_duration: duration }).eq("id", appt.id),
      ]);

      await loadQueue();
    } catch (_) {
      // silent fail — keep existing duration
    } finally {
      aiCallActive.current = false;
      setActionLoading(null);
    }
  }

  const withWait = queue.map((entry, idx) => ({
    ...entry,
    cumulativeWait: calcCumulativeWait(queue, idx),
  }));

  const totalTime = queue.reduce((sum, e) => sum + (e.predicted_duration ?? 15), 0);

  const card = {
    background: "var(--card-bg, #fff)",
    borderRadius: 16, padding: "20px 24px", marginBottom: 14,
    border: "1px solid var(--border-color, #e5e7eb)",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  };

  if (loading) return (
    <div style={{ padding: "28px 32px" }}>
      <div style={card}><p style={{ color: "#9ca3af", fontSize: 14 }}>⏳ Loading queue…</p></div>
      <div style={{ ...card, background: "#f0fdf4", border: "1px solid #bbf7d0", marginTop: 12 }}>
        <p style={{ fontSize: 12, color: "#166534", fontFamily: "monospace", margin: 0 }}>
          Debug: doctorId={doctorId}, Loading...
        </p>
      </div>
    </div>
  );
  
  if (error) return (
    <div style={{ padding: "28px 32px" }}>
      <div style={card}><p style={{ color: "#ef4444", fontSize: 14 }}>❌ Error: {error}</p></div>
      <div style={{ ...card, background: "#fef2f2", border: "1px solid #fecaca", marginTop: 12 }}>
        <p style={{ fontSize: 12, color: "#7f1d1d", fontFamily: "monospace", margin: 0 }}>
          Debug: doctorId={doctorId}
        </p>
        <p style={{ fontSize: 11, color: "#991b1b", fontFamily: "monospace", margin: "4px 0 0 0" }}>
          Error: {error}
        </p>
      </div>
    </div>
  );

  return (
    <div style={{ padding: "28px 32px" }}>
      <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 28, fontWeight: 700, color: "#1e1b4b", margin: "0 0 8px", letterSpacing: "-0.3px" }}>Live Queue</h2>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#6b7fbd", margin: "0 0 24px" }}>Real-time patient queue management with AI-powered duration predictions</p>

      {/* Summary stats */}
      {withWait.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
          <div style={{ ...card, padding: "16px 20px" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#6b7fbd", textTransform: "uppercase", margin: "0 0 6px", letterSpacing: "0.4px" }}>Patients Waiting</p>
            <p style={{ fontSize: 28, fontWeight: 800, color: "#6366f1", margin: 0, lineHeight: 1 }}>{withWait.length}</p>
          </div>
          <div style={{ ...card, padding: "16px 20px" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#6b7fbd", textTransform: "uppercase", margin: "0 0 6px", letterSpacing: "0.4px" }}>Total Wait</p>
            <p style={{ fontSize: 28, fontWeight: 800, color: "#f59e0b", margin: 0, lineHeight: 1 }}>{formatTime(totalTime)}</p>
          </div>
          <div style={{ ...card, padding: "16px 20px" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#6b7fbd", textTransform: "uppercase", margin: "0 0 6px", letterSpacing: "0.4px" }}>Avg / Patient</p>
            <p style={{ fontSize: 28, fontWeight: 800, color: "#10b981", margin: 0, lineHeight: 1 }}>{formatTime(totalTime / withWait.length)}</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {withWait.length === 0 ? (
        <div>
          <div style={{
            ...card,
            textAlign: "center",
            padding: "48px 32px",
            background: "linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(129, 140, 248, 0.03) 100%)",
            border: "2px dashed var(--border-color, #e0e7ff)",
          }}>
            <div style={{ fontSize: 56, marginBottom: 12, animation: "bounce 2s infinite", display: "inline-block" }}>
              <style>{`@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }`}</style>
              ✨
            </div>
            <h3 style={{ fontFamily: "Fraunces, serif", fontSize: 22, fontWeight: 700, color: "#1e1b4b", margin: "0 0 8px" }}>Queue is Clear!</h3>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#6b7fbd", margin: 0 }}>No patients waiting right now. Take a well-deserved break! ☕</p>
          </div>

          {/* Debug info - show database state */}
          {debugInfo && (
            <div style={{ ...card, background: "#fef3c7", border: "1px solid #fcd34d", marginTop: 16 }}>
              <p style={{ fontSize: 12, color: "#92400e", fontWeight: 600, margin: "0 0 8px" }}>📊 Debug Info:</p>
              <p style={{ fontSize: 11, color: "#b45309", fontFamily: "monospace", margin: "0 0 4px" }}>
                doctorId: {debugInfo.doctorId}
              </p>
              <p style={{ fontSize: 11, color: "#b45309", fontFamily: "monospace", margin: "0 0 4px" }}>
                Queue entries: {debugInfo.totalQueueEntries}
              </p>
              <p style={{ fontSize: 11, color: "#b45309", fontFamily: "monospace", margin: "0 0 12px" }}>
                Appointments: {debugInfo.totalAppointments}
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={async () => {
                    await testCreateAppointment("Debug Patient", doctorId, 35);
                    setTimeout(loadQueue, 500);
                  }}
                  style={{
                    padding: "6px 12px", fontSize: 11, background: "#f59e0b",
                    color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600
                  }}
                >
                  🧪 Create Test Appt
                </button>
                <button
                  onClick={() => debugListQueue(doctorId)}
                  style={{
                    padding: "6px 12px", fontSize: 11, background: "#6366f1",
                    color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600
                  }}
                >
                  📋 Check Queue DB
                </button>
                <button
                  onClick={() => debugListAppointments(doctorId)}
                  style={{
                    padding: "6px 12px", fontSize: 11, background: "#8b5cf6",
                    color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600
                  }}
                >
                  📅 Check Appts DB
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <LiveDot />
            <span style={{ fontSize: 13, color: "#10b981", fontWeight: 600 }}>Live Updates</span>
            <span style={{ fontSize: 12, color: "#9ca3af", marginLeft: "auto" }}>Updates automatically</span>
          </div>

          {/* Queue list */}
          {withWait.map((entry, idx) => {
            const appt = entry.appointments;
            const isCurrent = entry.status === "in-progress";
            const isDelayed = entry.status === "delayed";

            return (
              <div
                key={entry.id}
                style={{
                  ...card,
                  borderLeft: isCurrent 
                    ? "5px solid #10b981" 
                    : isDelayed 
                    ? "5px solid #f97316" 
                    : "5px solid #e0e7ff",
                  background: isCurrent 
                    ? "linear-gradient(135deg, rgba(16, 185, 129, 0.04) 0%, rgba(16, 185, 129, 0.02) 100%)" 
                    : "var(--card-bg, #fff)",
                  transition: "all 0.3s ease",
                }}
              >
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                    {/* Queue position */}
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        flexShrink: 0,
                        background: isCurrent ? "#10b981" : idx === 0 ? "#6366f1" : "#e5e7ff",
                        color: isCurrent || idx === 0 ? "#fff" : "#6366f1",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: 16,
                        boxShadow: isCurrent ? "0 4px 12px rgba(16, 185, 129, 0.3)" : "none",
                      }}
                    >
                      {idx + 1}
                    </div>

                    {/* Patient info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontFamily: "Fraunces, serif",
                        fontWeight: 700,
                        fontSize: 16,
                        color: "#1e1b4b",
                        margin: "0 0 4px",
                        wordBreak: "break-word",
                      }}>
                        {appt?.patient_name ?? "Patient"}
                      </p>
                      <p style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 12,
                        color: "#6b7fbd",
                        margin: 0,
                      }}>
                        {appt?.patient_age}y • {appt?.patient_gender} • {appt?.reason_for_visit ?? "General checkup"}
                      </p>
                    </div>
                  </div>

                  {/* Status badges */}
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <StatusBadge status={entry.status} />
                    {isDelayed && <span style={{ fontSize: 16 }}>⚠️</span>}
                    {isCurrent && <span style={{ fontSize: 16 }}>👨‍⚕️</span>}
                  </div>
                </div>

                {/* Stats row */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: 12,
                  marginBottom: 14,
                  padding: "12px",
                  background: isCurrent ? "rgba(16, 185, 129, 0.08)" : "#f9fafb",
                  borderRadius: 10,
                }}>
                  <MiniStat icon="⏱" label="Duration" value={formatTime(entry.predicted_duration ?? 15)} />
                  <MiniStat
                    icon="⌛"
                    label={idx === 0 ? "Status" : "Wait from now"}
                    value={idx === 0 ? (isCurrent ? "Being seen" : "Next up →") : formatTime(entry.cumulativeWait)}
                  />
                  {entry.notes && <MiniStat icon="🤖" label="AI note" value={entry.notes} truncate />}
                </div>

                {/* Action buttons */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {entry.status === "waiting" && (
                    <ActionBtn
                      label="▶ Start Consultation"
                      color="#10b981"
                      loading={actionLoading === entry.id}
                      onClick={() => updateStatus(entry.id, "in-progress")}
                    />
                  )}
                  {entry.status === "in-progress" && (
                    <ActionBtn
                      label="✓ Mark Complete"
                      color="#6366f1"
                      loading={actionLoading === entry.id}
                      onClick={() => updateStatus(entry.id, "completed")}
                    />
                  )}
                  {["waiting", "in-progress"].includes(entry.status) && (
                    <ActionBtn
                      label="⚠ Mark Delayed"
                      color="#f97316"
                      outlined
                      loading={actionLoading === entry.id + "-delay"}
                      onClick={() => updateStatus(entry.id, "delayed")}
                    />
                  )}
                  {entry.status === "waiting" && (
                    <ActionBtn
                      label={actionLoading === entry.id + "-ai" ? "🤖 Predicting…" : "🤖 AI Estimate"}
                      color="#8b5cf6"
                      outlined
                      loading={actionLoading === entry.id + "-ai"}
                      onClick={() => aiPredictDuration(entry)}
                    />
                  )}
                  {entry.status === "waiting" && (
                    <ActionBtn
                      label="✕ Skip"
                      color="#ef4444"
                      outlined
                      loading={false}
                      onClick={() => updateStatus(entry.id, "skipped")}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Default export ──────────────────────────────────────────────────────────

export default function LiveQueue({ role = "patient", userId, doctorId }) {
  if (role === "doctor") return <DoctorQueueView doctorId={doctorId} />;
  return <PatientQueueView userId={userId} />;
}