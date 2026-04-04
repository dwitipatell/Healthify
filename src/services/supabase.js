// src/services/supabase.js
// ─── Healthify · Complete Supabase Service Layer ─────────────────────────────

import { createClient } from '@supabase/supabase-js';
import { sendAppointmentConfirmationSMS } from './smsReminder';
import { NOTIFICATION_TYPES } from '../constants/notificationKeys';

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
  
  if (error) {
    console.error('Error fetching doctors:', error);
    // Fallback: try fetching without the is_active filter
    const { data: allDoctors, error: fallbackError } = await supabase
      .from('doctors')
      .select('*, doctor_availability(*)')
      .order('full_name');
    
    if (fallbackError) throw fallbackError;
    return allDoctors || [];
  }
  
  return data || [];
};

export const getDoctorByUserId = async (userId) => {
  const { data, error } = await supabase
    .from('doctors')
    .select('*, doctor_availability(*)')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    console.warn('No doctor profile found for user:', userId);
    return null;
  }
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
  patientPhone = null, doctorName = null, clinic = null,
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
  
  if (error) {
    // Check if this is the position column error from a database trigger
    if (error.message && error.message.includes('q.position')) {
      console.warn('Database position column issue detected. This is a database-level trigger/function error that needs to be fixed in Supabase.');
      // The appointment was likely created despite the trigger error, so we'll continue
      // but log this for debugging
      const { data: created } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patientId)
        .eq('scheduled_at', scheduledAt)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (created) {
        // Create queue entry and send notifications
        await addToQueue(created.id, doctorId);
        await triggerAppointmentConfirmationNotifications(created, patientPhone, doctorName);
        return created;
      }
    }
    throw error;
  }

  // Create queue entry for the appointment
  try {
    await addToQueue(data.id, doctorId);
  } catch (qErr) {
    console.error('Error adding appointment to queue:', qErr);
    // Don't throw - appointment already created successfully
  }

  // Send SMS confirmation and create notification
  await triggerAppointmentConfirmationNotifications(data, patientPhone, doctorName);

  return data;
};

/**
 * Trigger SMS and in-app notifications when appointment is confirmed
 */
const triggerAppointmentConfirmationNotifications = async (appointment, patientPhone, doctorName) => {
  try {
    // Send SMS if phone available
    if (patientPhone) {
      await sendAppointmentConfirmationSMS(
        patientPhone,
        appointment,
        doctorName || 'Dr. Your Doctor'
      );
    }

    // Create in-app notification
    await createNotification(
      appointment.patient_id,
      'Appointment Confirmed ✅',
      `Your appointment with ${doctorName || 'your doctor'} has been confirmed for ${new Date(appointment.scheduled_at).toLocaleDateString('en-IN')}.`,
      NOTIFICATION_TYPES.APPOINTMENT_CONFIRMED,
      appointment.id
    );
  } catch (err) {
    console.error('Error sending appointment confirmation notifications:', err);
    // Don't throw - appointment already created successfully
  }
};

export const rescheduleAppointment = async (appointmentId, newScheduledAt, patientPhone = null, doctorName = null) => {
  const { data, error } = await supabase
    .from('appointments')
    .update({ scheduled_at: newScheduledAt, status: 'confirmed' })
    .eq('id', appointmentId)
    .select()
    .single();
  if (error) throw error;

  // Send reschedule notification
  if (patientPhone) {
    const { sendAppointmentRescheduleNotificationSMS } = await import('./smsReminder');
    await sendAppointmentRescheduleNotificationSMS(patientPhone, data, doctorName);
  }
  
  // Create in-app notification
  await createNotification(
    data.patient_id,
    'Appointment Rescheduled 📅',
    `Your appointment has been moved to ${new Date(newScheduledAt).toLocaleDateString('en-IN')} at ${new Date(newScheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}.`,
    NOTIFICATION_TYPES.APPOINTMENT_RESCHEDULED,
    appointmentId
  );

  return data;
};

export const cancelAppointment = async (appointmentId, patientPhone = null, doctorName = null) => {
  // Get appointment details before cancelling
  const { data: appointmentData } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', appointmentId)
    .single();

  const { data, error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', appointmentId)
    .select()
    .single();
  if (error) throw error;
  
  await supabase.from('queue').delete().eq('appointment_id', appointmentId);

  // Send cancellation notification
  if (patientPhone && appointmentData) {
    const { sendAppointmentCancellationSMS } = await import('./smsReminder');
    await sendAppointmentCancellationSMS(patientPhone, appointmentData, doctorName);
  }

  // Create in-app notification
  await createNotification(
    data.patient_id,
    'Appointment Cancelled ❌',
    `Your appointment has been cancelled. Contact us to reschedule.`,
    NOTIFICATION_TYPES.APPOINTMENT_CANCELLED,
    appointmentId
  );

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
      id, status, predicted_duration, notes, updated_at,
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
    .order('created_at', { ascending: true });
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
      .select('id, status, predicted_duration, created_at')
      .eq('appointment_id', appt.id)
      .maybeSingle();

    const qEntryTime = qEntry?.created_at ? new Date(qEntry.created_at).getTime() : Date.now();
    const { data: ahead } = await supabase
      .from('queue')
      .select('predicted_duration')
      .eq('doctor_id', appt.doctor_id)
      .lt('created_at', new Date(qEntryTime).toISOString())
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
    .select('id, predicted_duration, created_at')
    .eq('appointment_id', appointmentId)
    .single();
  if (error) return null;
  return data;
};

/** Add an appointment to today's queue */
export const addToQueue = async (appointmentId, doctorId) => {
  const { data, error } = await supabase
    .from('queue')
    .insert({
      appointment_id: appointmentId,
      doctor_id: doctorId,
      status: 'waiting',
      predicted_duration: 20, // Default 20 min
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error adding to queue:', error);
    // Don't throw - let the appointment succeed even if queue fails
    return null;
  }
  
  try {
    await recomputeQueueWaitTimes(doctorId);
  } catch (err) {
    console.error('Error recomputing queue wait times:', err);
  }
  
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

/** Get daily queue statistics for a doctor */
export const getDailyQueueStats = async (doctorId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Get total appointments for today
  const { data: appointments, error: apptError } = await supabase
    .from('appointments')
    .select('id, status')
    .eq('doctor_id', doctorId)
    .gte('scheduled_at', today.toISOString())
    .lt('scheduled_at', tomorrow.toISOString());
  
  if (apptError) throw apptError;

  // Get current queue count
  const { count: queueCount, error: queueError } = await supabase
    .from('queue')
    .select('id', { count: 'exact', head: true })
    .eq('doctor_id', doctorId)
    .in('status', ['waiting', 'in-progress', 'delayed']);

  if (queueError) throw queueError;

  // Calculate stats
  const totalAppointments = appointments?.length || 0;
  const completedAppointments = appointments?.filter(a => a.status === 'completed').length || 0;
  const cancelledAppointments = appointments?.filter(a => a.status === 'cancelled').length || 0;
  const noShowAppointments = appointments?.filter(a => a.status === 'no_show').length || 0;
  const currentQueueCount = queueCount || 0;

  return {
    totalAppointments,
    completedAppointments,
    cancelledAppointments,
    noShowAppointments,
    currentQueueCount,
    upcomingAppointments: totalAppointments - completedAppointments - cancelledAppointments - noShowAppointments,
  };
};

/** Recompute estimated wait times for all patients in today's queue */
export const recomputeQueueWaitTimes = async (doctorId) => {
  try {
    const { data: queueRows } = await supabase
      .from('queue')
      .select('id, created_at, predicted_duration')
      .eq('doctor_id', doctorId)
      .in('status', ['waiting', 'in-progress'])
      .order('created_at', { ascending: true });

    if (!queueRows?.length) return;

    let cumulativeWait = 0;
    for (const row of queueRows) {
      await supabase
        .from('queue')
        .update({ cumulative_wait_time: cumulativeWait })
        .eq('id', row.id);
      cumulativeWait += row.predicted_duration ?? 20;
    }
  } catch (err) {
    console.error('Error recomputing queue wait times:', err);
    // Don't throw - let the calling function continue
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


// ══════════════════════════════════════════════════════════════════════════════
//  NO-SHOW RISK & PREDICTION
// ══════════════════════════════════════════════════════════════════════════════

/** Calculate no-show risk based on patient history and appointment factors */
export const calculateNoShowRisk = async (patientId, doctorId) => {
  const { data: history } = await supabase
    .from('appointments')
    .select('status')
    .eq('patient_id', patientId);

  if (!history?.length) return { risk: 'low', probability: 0.05 };

  const noShowCount = history.filter(a => a.status === 'no_show').length;
  const totalCount = history.length;
  const noShowRate = noShowCount / totalCount;

  let risk = 'low';
  let probability = noShowRate;

  if (noShowRate > 0.3) {
    risk = 'high';
  } else if (noShowRate > 0.15) {
    risk = 'medium';
  }

  return { risk, probability };
};

/** Predict appointment duration based on consultation history and reason */
export const predictConsultationDuration = async (doctorId, reason) => {
  const { data: history } = await supabase
    .from('consult_history')
    .select('actual_min, reason')
    .eq('doctor_id', doctorId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (!history?.length) return 20; // default 20 minutes

  // Filter by similar reason if available
  const similarReasons = history.filter(h => 
    h.reason?.toLowerCase().includes(reason?.toLowerCase())
  );

  const relevantHistory = similarReasons.length > 0 ? similarReasons : history;
  const durations = relevantHistory
    .filter(h => h.actual_min && h.actual_min > 0)
    .map(h => h.actual_min);

  if (durations.length === 0) return 20;

  const avgDuration = Math.round(durations.reduce((a, b) => a + b) / durations.length);
  return Math.max(15, Math.min(60, avgDuration)); // Clamp between 15-60 min
};

/** Get delay performance metrics for a doctor */
export const getDoctorDelayMetrics = async (doctorId, days = 30) => {
  const from = new Date();
  from.setDate(from.getDate() - days);

  const { data } = await supabase
    .from('appointments')
    .select('scheduled_at, actual_start, actual_end, status, duration_min')
    .eq('doctor_id', doctorId)
    .gte('scheduled_at', from.toISOString())
    .eq('status', 'completed');

  if (!data?.length) return { avgDelay: 0, onTimeRate: 100, schedule: [] };

  const delays = data
    .filter(a => a.actual_start && a.scheduled_at)
    .map(a => {
      const sched = new Date(a.scheduled_at);
      const actual = new Date(a.actual_start);
      return (actual - sched) / (1000 * 60); // Convert to minutes
    });

  const avgDelay = delays.length > 0 
    ? Math.round(delays.reduce((a, b) => a + b) / delays.length) 
    : 0;

  const onTimeCount = delays.filter(d => d <= 5).length; // Within 5 min is "on time"
  const onTimeRate = Math.round((onTimeCount / delays.length) * 100);

  return { avgDelay, onTimeRate, totalAppts: data.length };
};


// ══════════════════════════════════════════════════════════════════════════════
//  APPOINTMENT ANALYTICS
// ══════════════════════════════════════════════════════════════════════════════

/** Get appointment reasons summary for analytics */
export const getAppointmentReasonStats = async (doctorId, days = 30) => {
  const from = new Date();
  from.setDate(from.getDate() - days);

  const { data } = await supabase
    .from('appointments')
    .select('reason, status')
    .eq('doctor_id', doctorId)
    .gte('scheduled_at', from.toISOString());

  if (!data?.length) return [];

  const stats = {};
  data.forEach(a => {
    if (!stats[a.reason]) stats[a.reason] = { count: 0, completed: 0 };
    stats[a.reason].count++;
    if (a.status === 'completed') stats[a.reason].completed++;
  });

  return Object.entries(stats)
    .map(([reason, { count, completed }]) => ({
      reason,
      count,
      completed,
      completionRate: Math.round((completed / count) * 100),
    }))
    .sort((a, b) => b.count - a.count);
};

/** Get patient demographics for a doctor's appointments */
export const getPatientDemographics = async (doctorId, days = 30) => {
  const from = new Date();
  from.setDate(from.getDate() - days);

  const { data } = await supabase
    .from('appointments')
    .select('patient_age, patient_gender')
    .eq('doctor_id', doctorId)
    .eq('status', 'completed')
    .gte('scheduled_at', from.toISOString());

  if (!data?.length) return { genders: {}, ageGroups: {} };

  const genders = {};
  const ageGroups = {};

  data.forEach(a => {
    // Count genders
    const g = a.patient_gender || 'unknown';
    genders[g] = (genders[g] || 0) + 1;

    // Group ages
    const age = a.patient_age || 0;
    let group = '0-17';
    if (age >= 18) group = '18-30';
    if (age >= 31) group = '31-50';
    if (age >= 51) group = '51-65';
    if (age >= 66) group = '65+';

    ageGroups[group] = (ageGroups[group] || 0) + 1;
  });

  return { genders, ageGroups };
};

/** Get top available time slots for booking (considering doctor load) */
export const getOptimalBookingSlots = async (doctorId, date, count = 5) => {
  const slots = await getAvailableSlots(doctorId, date);
  if (!slots.length) return [];

  // Get current queue load throughout the day
  const appointments = await getBookedSlots(doctorId, date);
  
  // Score slots based on minimal surrounding appointments
  const scored = slots.map(slot => {
    const slotTime = slot.getTime();
    // Count appointments within 2 hours
    const nearby = appointments.filter(a => {
      const aTime = new Date(a.scheduled_at).getTime();
      return Math.abs(aTime - slotTime) < 2 * 60 * 60 * 1000;
    }).length;
    return { slot, load: nearby };
  });

  return scored
    .sort((a, b) => a.load - b.load)
    .slice(0, count)
    .map(s => s.slot);
};

// ══════════════════════════════════════════════════════════════════════════════
//  INTELLIGENT APPOINTMENT SYSTEM - ADDITIONAL FUNCTIONS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Update appointment with predicted values (duration & no-show risk)
 */
export const updateAppointmentPredictions = async (appointmentId, predictedDurationMin, noshowRisk, noshowProbability) => {
  const { data, error } = await supabase
    .from('appointments')
    .update({
      predicted_duration: predictedDurationMin,
      noshow_risk: noshowRisk,
      noshow_probability: noshowProbability,
    })
    .eq('id', appointmentId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Get all high-risk appointments for a doctor today
 */
export const getDoctorHighRiskAppointments = async (doctorId) => {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('doctor_id', doctorId)
    .eq('noshow_risk', true)
    .gte('scheduled_at', today + 'T00:00:00')
    .lte('scheduled_at', today + 'T23:59:59')
    .in('status', ['confirmed']);

  if (error) throw error;
  return data || [];
};

/**
 * Get queue health metrics for all doctors
 */
export const getSystemQueueHealthMetrics = async () => {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('queue')
    .select(`
      doctor_id,
      status,
      predicted_duration,
      appointments!inner(scheduled_at)
    `)
    .gte('appointments.scheduled_at', today + 'T00:00:00')
    .lte('appointments.scheduled_at', today + 'T23:59:59');

  if (error) throw error;

  // Group by doctor and calculate metrics
  const metrics = {};
  if (data && data.length > 0) {
    data.forEach(entry => {
      if (!metrics[entry.doctor_id]) {
        metrics[entry.doctor_id] = { waiting: 0, inProgress: 0, totalWaitMin: 0 };
      }
      if (entry.status === 'waiting') metrics[entry.doctor_id].waiting++;
      if (entry.status === 'in-progress') metrics[entry.doctor_id].inProgress++;
      metrics[entry.doctor_id].totalWaitMin += entry.predicted_duration || 15;
    });
  }

  return metrics;
};

/**
 * Log appointment delay for analytics
 */
export const logAppointmentDelay = async (appointmentId, delayMinutes) => {
  const { data, error } = await supabase
    .from('appointments')
    .update({ delay_min: delayMinutes })
    .eq('id', appointmentId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Get alternative doctor recommendations for patient
 */
export const getAlternativeDoctorRecommendations = async (doctorId, specialty, limit = 3) => {
  const { data, error } = await supabase
    .from('doctors')
    .select('id, full_name, specialty, clinic, is_active')
    .eq('specialty', specialty)
    .eq('is_active', true)
    .neq('id', doctorId)
    .limit(limit);

  if (error) throw error;
  return data || [];
};

/**
 * Record consultation analytics for ML training
 */
export const recordConsultationMetrics = async (appointmentId, doctorId, actualDurationMin, specialty, reason, patientAge) => {
  // This should already be handled by completeConsultation, but here for explicitness
  const { data, error } = await supabase
    .from('consult_history')
    .insert({
      appointment_id: appointmentId,
      doctor_id: doctorId,
      actual_min: actualDurationMin,
      specialty,
      reason,
      patient_age: patientAge,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/** Reschedule appointment with load balancing */
export const smartRescheduleAppointment = async (appointmentId, doctorId, preferredDate) => {
  const { data: appt } = await supabase
    .from('appointments')
    .select('reason, duration_min, patient_id')
    .eq('id', appointmentId)
    .single();

  if (!appt) throw new Error('Appointment not found');

  const optimalSlots = await getOptimalBookingSlots(doctorId, preferredDate, 1);
  if (!optimalSlots.length) throw new Error('No available slots on preferred date');

  return rescheduleAppointment(appointmentId, optimalSlots[0].toISOString());
};

/** Update queue after checking in a patient */
export const patientCheckIn = async (appointmentId, doctorId) => {
  const { data: qEntry } = await supabase
    .from('queue')
    .select('id')
    .eq('appointment_id', appointmentId)
    .single();

  if (qEntry) {
    await checkInPatient(qEntry.id);
  }

  // Move to in-progress if checking in
  await startConsultation(appointmentId);
  await recomputeQueueWaitTimes(doctorId);
};

/** Send automated appointment reminder notification */
export const sendAppointmentReminder = async (appointmentId, userId) => {
  const { data: appt } = await supabase
    .from('appointments')
    .select('scheduled_at, doctors(full_name)')
    .eq('id', appointmentId)
    .single();

  if (!appt) return;

  const time = formatTime(appt.scheduled_at);
  const doctor = appt.doctors?.full_name || 'Your doctor';

  await createNotification(
    userId,
    'Upcoming Appointment',
    `Your appointment with ${doctor} is at ${time}`,
    'appointment_reminder',
    appointmentId
  );
};

/** Send delay notification to all waiting patients */
export const notifyQueueDelay = async (doctorId, delayMinutes) => {
  const { data: queue } = await supabase
    .from('queue')
    .select('appointments(patient_id)')
    .eq('doctor_id', doctorId)
    .in('status', ['waiting', 'in-progress']);

  if (!queue?.length) return;

  const promises = queue.map(q => {
    const patientId = q.appointments?.patient_id;
    if (patientId) {
      return createNotification(
        patientId,
        'Queue Delay Notice',
        `Doctor is running ${delayMinutes} minutes behind schedule`,
        'queue_delay',
        doctorId
      );
    }
  });

  await Promise.all(promises);
};

// ══════════════════════════════════════════════════════════════════════════════
//  DEBUG/TEST FUNCTIONS - For development only
// ══════════════════════════════════════════════════════════════════════════════

/** Test function: Create a test appointment and queue entry */
export const testCreateAppointment = async (patientName = "Test Patient", doctorId, patientAge = 30) => {
  try {
    console.log('🧪 Creating test appointment for doctorId:', doctorId);
    
    // Create appointment
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const { data: appt, error: apptErr } = await supabase
      .from('appointments')
      .insert({
        patient_id: '00000000-0000-0000-0000-000000000001', // fake ID
        doctor_id: doctorId,
        patient_name: patientName,
        patient_age: patientAge,
        patient_gender: 'M',
        reason: 'TEST: General Checkup',
        scheduled_at: tomorrow.toISOString(),
        duration_min: 20,
        status: 'confirmed',
      })
      .select()
      .single();

    if (apptErr) {
      console.error('❌ Failed to create appointment:', apptErr);
      return;
    }

    console.log('✅ Appointment created:', appt);

    // Create queue entry
    const queueResult = await addToQueue(appt.id, doctorId);
    console.log('✅ Queue entry created:', queueResult);

    return appt;
  } catch (err) {
    console.error('❌ Test failed:', err);
  }
};

/** Debug function: List all queue entries */
export const debugListQueue = async (doctorId) => {
  try {
    const { data } = await supabase
      .from('queue')
      .select('*')
      .eq('doctor_id', doctorId);
    console.log('📋 Queue entries for doctor', doctorId, ':', data);
    return data;
  } catch (err) {
    console.error('❌ Debug failed:', err);
  }
};

/** Debug function: List all appointments */
export const debugListAppointments = async (doctorId) => {
  try {
    const { data } = await supabase
      .from('appointments')
      .select('*')
      .eq('doctor_id', doctorId)
      .limit(10);
    console.log('📅 Appointments for doctor', doctorId, ':', data);
    return data;
  } catch (err) {
    console.error('❌ Debug failed:', err);
  }
};