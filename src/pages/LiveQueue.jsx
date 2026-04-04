import { useState, useEffect, useRef } from "react";
import { supabase } from "../services/supabase";

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
        .select("id, appointment_date, status, predicted_duration, doctor_id, doctors(name, specialty)")
        .eq("patient_id", userId)
        .gte("appointment_date", today + "T00:00:00")
        .lte("appointment_date", today + "T23:59:59")
        .in("status", ["confirmed", "in-progress"]);

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
                Dr. {appt.doctors?.name ?? "Unknown"}
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
  const aiCallActive = useRef(false);

  useEffect(() => {
    if (!doctorId) return;
    loadQueue();

    const channel = supabase
      .channel("doctor-queue-" + doctorId)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "queue",
        filter: `doctor_id=eq.${doctorId}`,
      }, loadQueue)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [doctorId]);

  async function loadQueue() {
    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const { data, error: e } = await supabase
        .from("queue")
        .select(`
          id, status, predicted_duration, notes, created_at,
          appointments!inner(
            id, appointment_date, reason_for_visit, predicted_duration,
            patients:patient_id(full_name, age, gender)
          )
        `)
        .eq("doctor_id", doctorId)
        .gte("appointments.appointment_date", today + "T00:00:00")
        .lte("appointments.appointment_date", today + "T23:59:59")
        .in("status", ["waiting", "in-progress", "delayed"])
        .order("created_at", { ascending: true });

      if (e) throw e;
      setQueue(data ?? []);
    } catch (e) {
      setError(e.message);
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
          user_id: entry.appointments?.patients?.id ?? null,
          type: newStatus === "in-progress" ? "appointment" : "alert",
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
    const patient = appt?.patients;

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
            content: `Patient: ${patient?.age ?? "unknown"} yr old ${patient?.gender ?? "person"}. Reason for visit: "${appt?.reason_for_visit ?? "general checkup"}". Predict consultation duration in minutes (5–60 range).`,
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

  if (loading) return <div style={card}><p style={{ color: "#9ca3af", fontSize: 14 }}>Loading queue…</p></div>;
  if (error)   return <div style={card}><p style={{ color: "#ef4444", fontSize: 14 }}>Error: {error}</p></div>;

  return (
    <div>
      {/* Summary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
        <StatBox label="In Queue"      value={queue.length}                                               accent="var(--primary-color, #6366f1)" />
        <StatBox label="Total Wait"    value={formatTime(totalTime)}                                     accent="#f59e0b" />
        <StatBox label="Avg / Patient" value={queue.length ? formatTime(totalTime / queue.length) : "—"} accent="#10b981" />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <LiveDot />
        <span style={{ fontSize: 13, color: "#10b981", fontWeight: 600 }}>Live Queue</span>
        <span style={{ fontSize: 12, color: "#9ca3af", marginLeft: "auto" }}>Updates automatically</span>
      </div>

      {withWait.length === 0 ? (
        <div style={{ ...card, textAlign: "center", padding: "36px 24px" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
          <p style={{ fontWeight: 700, color: "var(--text-primary, #111)" }}>Queue is clear!</p>
          <p style={{ color: "#9ca3af", fontSize: 13 }}>No patients waiting right now.</p>
        </div>
      ) : (
        withWait.map((entry, idx) => {
          const appt = entry.appointments;
          const patient = appt?.patients;
          const isCurrent = entry.status === "in-progress";
          const isDelayed = entry.status === "delayed";

          return (
            <div key={entry.id} style={{
              ...card,
              borderLeft: isCurrent ? "4px solid #10b981"
                        : isDelayed ? "4px solid #f97316"
                        : "4px solid transparent",
              background: isCurrent ? "rgba(16,185,129,0.03)" : "var(--card-bg, #fff)",
            }}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                    background: isCurrent ? "#10b981" : "var(--bg-secondary, #f3f4f6)",
                    color: isCurrent ? "#fff" : "var(--text-primary, #111)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 800, fontSize: 13,
                  }}>
                    {idx + 1}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary, #111)", marginBottom: 2 }}>
                      {patient?.full_name ?? "Patient"}
                    </p>
                    <p style={{ fontSize: 12, color: "#9ca3af" }}>
                      {patient?.age} yrs · {patient?.gender} · {appt?.reason_for_visit ?? "General checkup"}
                    </p>
                  </div>
                </div>
                <StatusBadge status={entry.status} />
              </div>

              {/* Stats */}
              <div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
                <MiniStat icon="⏱" label="Duration"         value={formatTime(entry.predicted_duration ?? 15)} />
                <MiniStat icon="⌛" label={idx === 0 ? "Status" : "Wait from now"} value={idx === 0 ? "Next up" : formatTime(entry.cumulativeWait)} />
                {entry.notes && <MiniStat icon="🤖" label="AI note" value={entry.notes} truncate />}
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                {entry.status === "waiting" && (
                  <ActionBtn label="Start" color="#10b981"
                    loading={actionLoading === entry.id}
                    onClick={() => updateStatus(entry.id, "in-progress")} />
                )}
                {entry.status === "in-progress" && (
                  <ActionBtn label="Mark Complete" color="#6366f1"
                    loading={actionLoading === entry.id}
                    onClick={() => updateStatus(entry.id, "completed")} />
                )}
                {["waiting", "in-progress"].includes(entry.status) && (
                  <ActionBtn label="Mark Delayed" color="#f97316" outlined
                    loading={actionLoading === entry.id + "-delay"}
                    onClick={() => updateStatus(entry.id, "delayed")} />
                )}
                {entry.status === "waiting" && (
                  <ActionBtn
                    label={actionLoading === entry.id + "-ai" ? "Predicting…" : "🤖 AI Duration"}
                    color="#8b5cf6" outlined
                    loading={actionLoading === entry.id + "-ai"}
                    onClick={() => aiPredictDuration(entry)} />
                )}
                {entry.status === "waiting" && (
                  <ActionBtn label="Skip" color="#ef4444" outlined
                    loading={false}
                    onClick={() => updateStatus(entry.id, "skipped")} />
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// ─── Default export ──────────────────────────────────────────────────────────

export default function LiveQueue({ role = "patient", userId, doctorId }) {
  if (role === "doctor") return <DoctorQueueView doctorId={doctorId} />;
  return <PatientQueueView userId={userId} />;
}