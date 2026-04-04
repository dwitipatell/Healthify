// src/services/notifications.js
// ─── Patient & Doctor Notification System ───────────────────────────────
// Handles real-time alerts for appointments, queue updates, delays, etc.

import { supabase } from './supabase';

/**
 * ─── Notification Types & Templates ────────────────────────────────────
 */

const NOTIFICATION_TEMPLATES = {
  // Patient notifications
  APPOINTMENT_CONFIRMED: {
    type: 'appointment_confirmed',
    title: 'Appointment Confirmed',
    template: (data) => `Your appointment with Dr. ${data.doctorName} on ${data.date} at ${data.time} is confirmed. Expected wait time: ${data.waitTimeMin} minutes.`,
    priority: 'normal',
  },
  APPOINTMENT_REMINDER: {
    type: 'appointment_reminder',
    title: 'Appointment Reminder',
    template: (data) => `Reminder: Your appointment with Dr. ${data.doctorName} is in ${data.hoursUntil} hours. Location: ${data.clinic}`,
    priority: 'high',
  },
  QUEUE_POSITION_UPDATE: {
    type: 'queue_update',
    title: 'Queue Position Update',
    template: (data) => `You are now #${data.position} in queue. Estimated wait: ${data.waitTimeMin} minutes.`,
    priority: 'normal',
  },
  DOCTOR_RUNNING_LATE: {
    type: 'doctor_late',
    title: 'Doctor Running Late',
    template: (data) => `Dr. ${data.doctorName} is running ${data.delayMin} minutes behind. Your appointment will be delayed.`,
    priority: 'high',
  },
  APPOINTMENT_CANCELLED: {
    type: 'appointment_cancelled',
    title: 'Appointment Cancelled',
    template: (data) => `Your appointment with Dr. ${data.doctorName} on ${data.date} has been cancelled. Please reschedule.`,
    priority: 'high',
  },
  HIGH_NOSHOW_RISK_REMINDER: {
    type: 'high_noshow_reminder',
    title: 'Don\'t Miss Your Appointment',
    template: (data) => `Gentle reminder: Your appointment with Dr. ${data.doctorName} is tomorrow at ${data.time}. Please confirm or reschedule.`,
    priority: 'high',
  },
  ALTERNATIVE_DOCTOR_SUGGESTION: {
    type: 'alternative_doctor',
    title: 'Shorter Wait Available',
    template: (data) => `Dr. ${data.alternativeDoctor} has an appointment available in ${data.minutesEarlier} minutes. Would you like to switch?`,
    priority: 'normal',
  },
  APPOINTMENT_COMPLETED: {
    type: 'appointment_completed',
    title: 'Appointment Complete',
    template: (data) => `Your appointment with Dr. ${data.doctorName} is complete. Thank you for visiting.`,
    priority: 'low',
  },

  // Doctor notifications
  NEW_PATIENT_IN_QUEUE: {
    type: 'new_patient_queue',
    title: 'New Patient in Queue',
    template: (data) => `${data.patientName} added to queue. Estimated wait: ${data.waitTimeMin} minutes. Reason: ${data.reason}`,
    priority: 'normal',
  },
  PATIENT_NOSHOW_RISK: {
    type: 'patient_noshow_risk',
    title: 'High No-Show Risk',
    template: (data) => `${data.patientName}'s appointment (${data.time}) has ${data.probability}% no-show probability. Consider backup scheduling.`,
    priority: 'high',
  },
  QUEUE_OVERLOAD_ALERT: {
    type: 'queue_overload',
    title: 'Queue Overload Alert',
    template: (data) => `Your queue has ${data.patientCount} patients with ${data.estimatedTotalMin} minutes of wait time.`,
    priority: 'high',
  },
  SUGGESTED_LOAD_BALANCING: {
    type: 'load_balance_suggestion',
    title: 'Load Balancing Suggested',
    template: (data) => `Consider load balancing. ${data.lessLoadedDoctor} (${data.lesserWaitTime} min wait) could take appointments.`,
    priority: 'normal',
  },
};

/**
 * ─── Database Operations ────────────────────────────────────────────────
 */

/**
 * Create a notification in the database
 */
export const createNotification = async (userId, templateKey, data, channel = 'in-app') => {
  try {
    const template = NOTIFICATION_TEMPLATES[templateKey];
    if (!template) {
      console.error(`Unknown notification template: ${templateKey}`);
      return null;
    }

    const message = template.template(data);

    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: template.type,
        title: template.title,
        message,
        data: JSON.stringify(data),
        channel,
        priority: template.priority,
        read: false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return notification;
  } catch (err) {
    console.error('Error creating notification:', err);
    return null;
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId) => {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Get unread notifications for user
 */
export const getUnreadNotifications = async (userId) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .eq('read', false)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
  return data || [];
};

/**
 * Get all notifications for user (with pagination)
 */
export const getUserNotifications = async (userId, limit = 20, offset = 0) => {
  const { data, error, count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching user notifications:', error);
    return { notifications: [], total: 0 };
  }
  return { notifications: data || [], total: count || 0 };
};

/**
 * Delete old notifications (older than 30 days)
 */
export const cleanupOldNotifications = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { error } = await supabase
    .from('notifications')
    .delete()
    .lt('created_at', thirtyDaysAgo.toISOString());

  if (error) {
    console.error('Error cleaning up notifications:', error);
  }
};

/**
 * ─── Notification Preferences ──────────────────────────────────────────
 */

export const DEFAULT_NOTIFICATION_PREFERENCES = {
  appointmentConfirmation: true,
  reminders: true,
  queueUpdates: true,
  delayAlerts: true,
  noshowReminders: true,
  alternativeDoctorSuggestions: false,
  smsNotifications: false,
  emailNotifications: true,
  pushNotifications: true,
};

/**
 * Get user's notification preferences
 */
export const getNotificationPreferences = async (userId) => {
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found, create default
      return DEFAULT_NOTIFICATION_PREFERENCES;
    }
    console.error('Error fetching notification preferences:', error);
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }

  return { ...DEFAULT_NOTIFICATION_PREFERENCES, ...data };
};

/**
 * Update notification preferences
 */
export const updateNotificationPreferences = async (userId, preferences) => {
  const { data, error } = await supabase
    .from('notification_preferences')
    .upsert({
      user_id: userId,
      ...preferences,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * ─── Scheduled Notification Workflows ──────────────────────────────────
 */

/**
 * Send appointment confirmation to patient
 */
export const notifyAppointmentConfirmed = async (userId, doctorName, date, time, waitTimeMin, clinic = 'Main Clinic') => {
  return createNotification(userId, 'APPOINTMENT_CONFIRMED', {
    doctorName,
    date,
    time,
    waitTimeMin,
    clinic,
  });
};

/**
 * Send appointment reminder 24 hours before
 */
export const scheduleAppointmentReminder = async (userId, appointmentId, doctorName, hoursUntil, clinic) => {
  // In real production, use job scheduling (Bull, agenda, etc.)
  // For now, just create the notification immediately if < 24 hours
  if (hoursUntil > 0 && hoursUntil <= 24) {
    return createNotification(userId, 'APPOINTMENT_REMINDER', {
      doctorName,
      hoursUntil: Math.round(hoursUntil),
      clinic,
    });
  }
};

/**
 * Notify about queue position updates
 */
export const notifyQueuePositionUpdate = async (userId, position, waitTimeMin) => {
  const prefs = await getNotificationPreferences(userId);
  if (!prefs.queueUpdates) return null;

  return createNotification(userId, 'QUEUE_POSITION_UPDATE', {
    position,
    waitTimeMin,
  });
};

/**
 * Alert patient of doctor delay
 */
export const notifyDoctorDelay = async (userId, doctorName, delayMin) => {
  const prefs = await getNotificationPreferences(userId);
  if (!prefs.delayAlerts) return null;

  return createNotification(userId, 'DOCTOR_RUNNING_LATE', {
    doctorName,
    delayMin,
  }, 'sms'); // High priority = send SMS too
};

/**
 * Send high no-show risk reminder
 */
export const notifyHighNoshowRisk = async (userId, doctorName, time) => {
  const prefs = await getNotificationPreferences(userId);
  if (!prefs.noshowReminders) return null;

  return createNotification(userId, 'HIGH_NOSHOW_RISK_REMINDER', {
    doctorName,
    time,
  }, 'sms'); // Send as SMS for high-risk
};

/**
 * Suggest alternative doctor with shorter wait
 */
export const notifyAlternativeDoctorAvailable = async (userId, alternativeDoctor, minutesEarlier) => {
  const prefs = await getNotificationPreferences(userId);
  if (!prefs.alternativeDoctorSuggestions) return null;

  return createNotification(userId, 'ALTERNATIVE_DOCTOR_SUGGESTION', {
    alternativeDoctor,
    minutesEarlier,
  });
};

/**
 * Notify doctor of new patient in queue
 */
export const notifyDoctorNewPatientInQueue = async (doctorId, patientName, reason, waitTimeMin) => {
  return createNotification(doctorId, 'NEW_PATIENT_IN_QUEUE', {
    patientName,
    reason,
    waitTimeMin,
  });
};

/**
 * Alert doctor of high no-show risk patient
 */
export const notifyDoctorHighNoshowRisk = async (doctorId, patientName, time, probability) => {
  return createNotification(doctorId, 'PATIENT_NOSHOW_RISK', {
    patientName,
    time,
    probability: Math.round(probability),
  });
};

/**
 * Alert doctor of queue overload
 */
export const notifyDoctorQueueOverload = async (doctorId, patientCount, estimatedTotalMin) => {
  return createNotification(doctorId, 'QUEUE_OVERLOAD_ALERT', {
    patientCount,
    estimatedTotalMin,
  }, 'sms'); // Send SMS for critical alerts
};

/**
 * Suggest load balancing to doctor
 */
export const notifyDoctorLoadBalancingSuggestion = async (
  doctorId,
  lessLoadedDoctor,
  lesserWaitTime
) => {
  return createNotification(doctorId, 'SUGGESTED_LOAD_BALANCING', {
    lessLoadedDoctor,
    lesserWaitTime,
  });
};

/**
 * ─── Batch Notification Operations ────────────────────────────────────────
 */

/**
 * Send queue updates to all patients in queue for a doctor
 */
export const broadcastQueueUpdate = async (doctorId) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Get all queue entries
    const { data: queueEntries } = await supabase
      .from('queue')
      .select(`
        id,
        created_at,
        priority,
        appointments!inner(patient_id, patient_name, wait_time_min)
      `)
      .eq('doctor_id', doctorId)
      .gte('appointments.scheduled_at', today + 'T00:00:00')
      .lte('appointments.scheduled_at', today + 'T23:59:59')
      .in('status', ['waiting', 'in-progress'])
      .order('created_at', { ascending: true });

    // Send position updates
    if (queueEntries && queueEntries.length > 0) {
      let cumulativeWait = 0;
      for (let i = 0; i < queueEntries.length; i++) {
        const entry = queueEntries[i];
        const patientId = entry.appointments.patient_id;
        const position = i + 1;

        await notifyQueuePositionUpdate(patientId, position, cumulativeWait);
        cumulativeWait += entry.appointments.wait_time_min || 0;
      }
    }
  } catch (err) {
    console.error('Error broadcasting queue update:', err);
  }
};

/**
 * Send appointment reminders to all patients with appointments tomorrow
 */
export const sendDailyAppointmentReminders = async () => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(23, 59, 59, 999);

    const { data: appointments } = await supabase
      .from('appointments')
      .select(`
        id, scheduled_at, patient_id,
        doctors(full_name, clinic)
      `)
      .gte('scheduled_at', tomorrow.toISOString())
      .lte('scheduled_at', tomorrowEnd.toISOString())
      .eq('status', 'confirmed');

    if (appointments && appointments.length > 0) {
      for (const appt of appointments) {
        const appointmentTime = new Date(appt.scheduled_at);
        const hoursUntil = (appointmentTime - new Date()) / (1000 * 60 * 60);
        await scheduleAppointmentReminder(
          appt.patient_id,
          appt.id,
          appt.doctors.full_name,
          hoursUntil,
          appt.doctors.clinic
        );
      }
    }
  } catch (err) {
    console.error('Error sending daily reminders:', err);
  }
};

/**
 * Check for high-risk no-shows and send reminders
 */
export const checkAndNotifyHighRiskNoShows = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Get high-risk appointments for today/tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data: highRiskAppts } = await supabase
      .from('appointments')
      .select('id, patient_id, scheduled_at, noshow_probability, doctors(full_name)')
      .gte('scheduled_at', today + 'T00:00:00')
      .lte('scheduled_at', tomorrow.toISOString())
      .eq('noshow_risk', true)
      .eq('status', 'confirmed');

    if (highRiskAppts && highRiskAppts.length > 0) {
      for (const appt of highRiskAppts) {
        const time = new Date(appt.scheduled_at).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });
        await notifyHighNoshowRisk(
          appt.patient_id,
          appt.doctors.full_name,
          time
        );
      }
    }
  } catch (err) {
    console.error('Error checking high-risk no-shows:', err);
  }
};
