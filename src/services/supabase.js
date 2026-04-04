// src/services/supabase.js
// ─── Healthify · Complete Supabase Service Layer ─────────────────────────────

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);


// ══════════════════════════════════════════════════════════════════════════════
//  AUTH
// ══════════════════════════════════════════════════════════════════════════════

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const signOut = () => supabase.auth.signOut();


// ══════════════════════════════════════════════════════════════════════════════
//  DOCTORS
// ══════════════════════════════════════════════════════════════════════════════

export const getDoctors = async () => {
  const { data, error } = await supabase
    .from('doctors')
    .select('*, doctor_availability(*)')
    .eq('is_active', true)
    .order('full_name');
  if (error) throw error;
  return data;
};

export const getDoctorByUserId = async (userId) => {
  const { data, error } = await supabase
    .from('doctors')
    .select('*, doctor_availability(*)')
    .eq('user_id', userId)
    .single();
  if (error) throw error;
  return data;
};

export const toggleDoctorDay = async (availId, isActive) => {
  const { data, error } = await supabase
    .from('doctor_availability')
    .update({ is_active: isActive })
    .eq('id', availId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateAvgConsultTime = async (doctorId, avgMin) => {
  const { data, error } = await supabase
    .from('doctors')
    .update({ avg_consult_min: avgMin })
    .eq('id', doctorId)
    .select()
    .single();
  if (error) throw error;
  return data;
};


// ══════════════════════════════════════════════════════════════════════════════
//  APPOINTMENTS
// ══════════════════════════════════════════════════════════════════════════════

export const getBookedSlots = async (doctorId, date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from('appointments')
    .select('scheduled_at, duration_min, status')
    .eq('doctor_id', doctorId)
    .gte('scheduled_at', start.toISOString())
    .lte('scheduled_at', end.toISOString())
    .not('status', 'in', '("cancelled","no_show")');
  if (error) throw error;
  return data;
};

export const getAvailableSlots = async (doctorId, date, slotDurationMin = 20) => {
  const { data: avail, error: ae } = await supabase
    .from('doctor_availability')
    .select('start_time, end_time')
    .eq('doctor_id', doctorId)
    .eq('day_of_week', new Date(date).getDay())
    .eq('is_active', true)
    .single();

  if (ae || !avail) return [];

  const booked = await getBookedSlots(doctorId, date);

  const [startH, startM] = avail.start_time.split(':').map(Number);
  const [endH, endM]     = avail.end_time.split(':').map(Number);

  const slots = [];
  const cursor = new Date(date);
  cursor.setHours(startH, startM, 0, 0);
  const endTime = new Date(date);
  endTime.setHours(endH, endM, 0, 0);

  while (cursor < endTime) {
    const slotEnd = new Date(cursor.getTime() + slotDurationMin * 60000);
    const overlaps = booked.some(b => {
      const bs = new Date(b.scheduled_at);
      const be = new Date(bs.getTime() + (b.duration_min || slotDurationMin) * 60000);
      return cursor < be && slotEnd > bs;
    });
    if (!overlaps) slots.push(new Date(cursor));
    cursor.setMinutes(cursor.getMinutes() + slotDurationMin);
  }
  return slots;
};

export const bookAppointment = async ({
  patientId, doctorId, patientName, patientAge, patientGender,
  reason, scheduledAt, durationMin = 20,
  noshowRisk = null, noshowProbability = null,
}) => {
  const { data, error } = await supabase
    .from('appointments')
    .insert({
      patient_id: patientId,
      doctor_id: doctorId,
      patient_name: patientName,
      patient_age: patientAge,
      patient_gender: patientGender,
      reason,
      scheduled_at: scheduledAt,
      duration_min: durationMin,
      status: 'confirmed',
      noshow_risk: noshowRisk,
      noshow_probability: noshowProbability,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const rescheduleAppointment = async (appointmentId, newScheduledAt) => {
  const { data, error } = await supabase
    .from('appointments')
    .update({ scheduled_at: newScheduledAt, status: 'confirmed' })
    .eq('id', appointmentId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const cancelAppointment = async (appointmentId) => {
  const { data, error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', appointmentId)
    .select()
    .single();
  if (error) throw error;
  await supabase.from('queue').delete().eq('appointment_id', appointmentId);
  return data;
};

export const markNoShow = async (appointmentId, doctorId) => {
  const { data, error } = await supabase
    .from('appointments')
    .update({ status: 'no_show' })
    .eq('id', appointmentId)
    .select()
    .single();
  if (error) throw error;
  await supabase.from('queue').delete().eq('appointment_id', appointmentId);
  await recomputeQueueWaitTimes(doctorId);
  return data;
};

export const startConsultation = async (appointmentId) => {
  const { data, error } = await supabase
    .from('appointments')
    .update({ status: 'in_progress', actual_start: new Date().toISOString() })
    .eq('id', appointmentId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const completeConsultation = async (appointmentId, doctorId, specialty, reason, patientAge) => {
  const { data: appt } = await supabase
    .from('appointments')
    .select('actual_start')
    .eq('id', appointmentId)
    .single();

  const actualMin = appt?.actual_start
    ? Math.round((Date.now() - new Date(appt.actual_start)) / 60000)
    : null;

  const { data, error } = await supabase
    .from('appointments')
    .update({ status: 'completed', actual_end: new Date().toISOString() })
    .eq('id', appointmentId)
    .select()
    .single();
  if (error) throw error;

  if (actualMin) {
    await supabase.from('consult_history').insert({
      doctor_id: doctorId, specialty, reason, patient_age: patientAge, actual_min: actualMin,
    });
  }

  await recomputeQueueWaitTimes(doctorId);
  return data;
};

export const getPatientAppointments = async (patientId) => {
  const { data, error } = await supabase
    .from('appointments')
    .select('*, doctors(full_name, specialty, clinic, avatar)')
    .eq('patient_id', patientId)
    .order('scheduled_at', { ascending: true });
  if (error) throw error;
  return data;
};

export const getDoctorTodayAppointments = async (doctorId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('doctor_id', doctorId)
    .gte('scheduled_at', today.toISOString())
    .lt('scheduled_at', tomorrow.toISOString())
    .order('scheduled_at');
  if (error) throw error;
  return data;
};

export const updateNoShowRisk = async (appointmentId, risk, probability) => {
  const { data, error } = await supabase
    .from('appointments')
    .update({ noshow_risk: risk, noshow_probability: probability })
    .eq('id', appointmentId)
    .select()
    .single();
  if (error) throw error;
  return data;
};


// ══════════════════════════════════════════════════════════════════════════════
//  QUEUE
// ══════════════════════════════════════════════════════════════════════════════

/** Get live queue for a doctor today (with patient details) */
export const getDoctorQueue = async (doctorId) => {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('queue')
    .select(`
      id, position, status, predicted_duration, notes, updated_at,
      appointments!inner(
        id, scheduled_at, reason_for_visit, predicted_duration,
        patient_name, patient_age, patient_gender,
        status, noshow_risk
      )
    `)
    .eq('doctor_id', doctorId)
    .gte('appointments.scheduled_at', today + 'T00:00:00')
    .lte('appointments.scheduled_at', today + 'T23:59:59')
    .in('status', ['waiting', 'in-progress', 'delayed'])
    .order('position', { ascending: true });
  if (error) throw error;
  return data ?? [];
};

/** Get a patient's queue status for today (all their appointments) */
export const getPatientQueueStatus = async (patientId) => {
  const today = new Date().toISOString().split('T')[0];

  const { data: appts, error } = await supabase
    .from('appointments')
    .select('id, scheduled_at, status, predicted_duration, doctor_id, doctors(full_name, specialty)')
    .eq('patient_id', patientId)
    .gte('scheduled_at', today + 'T00:00:00')
    .lte('scheduled_at', today + 'T23:59:59')
    .in('status', ['confirmed', 'in_progress']);

  if (error) throw error;

  const enriched = await Promise.all((appts ?? []).map(async (appt) => {
    const { data: qEntry } = await supabase
      .from('queue')
      .select('id, position, status, predicted_duration')
      .eq('appointment_id', appt.id)
      .maybeSingle();

    const { data: ahead } = await supabase
      .from('queue')
      .select('predicted_duration')
      .eq('doctor_id', appt.doctor_id)
      .lt('position', qEntry?.position ?? 999)
      .in('status', ['waiting', 'in-progress']);

    const waitMins = (ahead ?? []).reduce((sum, e) => sum + (e.predicted_duration ?? 15), 0);
    return { ...appt, queueEntry: qEntry, waitMins };
  }));

  return enriched;
};

/** Get a patient's queue position for a specific appointment */
export const getPatientQueuePosition = async (appointmentId) => {
  const { data, error } = await supabase
    .from('queue')
    .select('position, predicted_duration')
    .eq('appointment_id', appointmentId)
    .single();
  if (error) return null;
  return data;
};

/** Add an appointment to today's queue */
export const addToQueue = async (appointmentId, doctorId) => {
  const today = new Date().toISOString().split('T')[0];
  const { data: existing } = await supabase
    .from('queue')
    .select('position')
    .eq('doctor_id', doctorId)
    .eq('queue_date', today)
    .order('position', { ascending: false })
    .limit(1);

  const nextPos = existing?.length ? existing[0].position + 1 : 1;

  const { data, error } = await supabase
    .from('queue')
    .insert({
      appointment_id: appointmentId,
      doctor_id: doctorId,
      position: nextPos,
      queue_date: today,
      status: 'waiting',
    })
    .select()
    .single();
  if (error) throw error;
  await recomputeQueueWaitTimes(doctorId);
  return data;
};

/** Update a queue entry's status */
export const updateQueueStatus = async (queueId, newStatus) => {
  const { error } = await supabase
    .from('queue')
    .update({ status: newStatus })
    .eq('id', queueId);
  if (error) throw error;
};

/** Update predicted duration on both queue and appointment */
export const updateQueueDuration = async (queueId, appointmentId, minutes) => {
  const [q, a] = await Promise.all([
    supabase.from('queue').update({ predicted_duration: minutes }).eq('id', queueId),
    supabase.from('appointments').update({ predicted_duration: minutes }).eq('id', appointmentId),
  ]);
  if (q.error) throw q.error;
  if (a.error) throw a.error;
};

/** Check a patient in (they've arrived at the clinic) */
export const checkInPatient = async (queueId) => {
  const { data, error } = await supabase
    .from('queue')
    .update({ checked_in: true, checked_in_at: new Date().toISOString() })
    .eq('id', queueId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

/** Recompute estimated wait times for all patients in today's queue */
export const recomputeQueueWaitTimes = async (doctorId) => {
  const today = new Date().toISOString().split('T')[0];
  const { data: queueRows } = await supabase
    .from('queue')
    .select('id, position, predicted_duration')
    .eq('doctor_id', doctorId)
    .eq('queue_date', today)
    .in('status', ['waiting', 'in-progress', 'delayed'])
    .order('position', { ascending: true });

  if (!queueRows?.length) return;

  let cumulativeWait = 0;
  for (const row of queueRows) {
    await supabase
      .from('queue')
      .update({ estimated_wait: cumulativeWait })
      .eq('id', row.id);
    cumulativeWait += row.predicted_duration ?? 20;
  }
};

/** Subscribe to real-time queue changes for a doctor */
export const subscribeToQueue = (doctorId, callback) => {
  return supabase
    .channel('queue-doctor-' + doctorId)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'queue',
      filter: `doctor_id=eq.${doctorId}`,
    }, callback)
    .subscribe();
};

/** Subscribe to real-time queue changes for a patient */
export const subscribeToPatientQueue = (patientId, callback) => {
  return supabase
    .channel('queue-patient-' + patientId)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'queue',
      filter: `patient_id=eq.${patientId}`,
    }, callback)
    .subscribe();
};


// ══════════════════════════════════════════════════════════════════════════════
//  NOTIFICATIONS
// ══════════════════════════════════════════════════════════════════════════════

export const getNotifications = async (userId) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const getUnreadCount = async (userId) => {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  if (error) return 0;
  return count;
};

export const markNotificationRead = async (notifId) => {
  await supabase.from('notifications').update({ is_read: true }).eq('id', notifId);
};

export const markAllRead = async (userId) => {
  await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId);
};

export const createNotification = async (userId, title, body, type, relatedId = null) => {
  const { data, error } = await supabase
    .from('notifications')
    .insert({ user_id: userId, title, body, type, related_id: relatedId })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const subscribeToNotifications = (userId, callback) => {
  return supabase
    .channel('notif-' + userId)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`,
    }, callback)
    .subscribe();
};


// ══════════════════════════════════════════════════════════════════════════════
//  DOCTOR UTILIZATION (Analytics)
// ══════════════════════════════════════════════════════════════════════════════

export const getDoctorUtilization = async (doctorId, days = 7) => {
  const from = new Date();
  from.setDate(from.getDate() - days);

  const { data, error } = await supabase
    .from('appointments')
    .select('scheduled_at, status, duration_min, actual_start, actual_end')
    .eq('doctor_id', doctorId)
    .gte('scheduled_at', from.toISOString())
    .order('scheduled_at');
  if (error) throw error;

  const byDate = {};
  data.forEach(appt => {
    const d = appt.scheduled_at.split('T')[0];
    if (!byDate[d]) byDate[d] = { total: 0, completed: 0, noShow: 0, totalMin: 0 };
    byDate[d].total++;
    if (appt.status === 'completed') {
      byDate[d].completed++;
      if (appt.actual_start && appt.actual_end) {
        byDate[d].totalMin += Math.round(
          (new Date(appt.actual_end) - new Date(appt.actual_start)) / 60000
        );
      }
    }
    if (appt.status === 'no_show') byDate[d].noShow++;
  });

  return byDate;
};

export const getConsultHistory = async (doctorId) => {
  const { data, error } = await supabase
    .from('consult_history')
    .select('specialty, reason, patient_age, actual_min')
    .eq('doctor_id', doctorId)
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) throw error;
  return data;
};


// ══════════════════════════════════════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════════════════════════════════════

export const formatTime = (date) =>
  new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

export const formatWait = (minutes) =>
  minutes === 0 ? 'Now' : `~${minutes} min`;