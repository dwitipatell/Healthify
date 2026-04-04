// ────────────────────────────────────────────────────────────────────────────
// src/services/smsReminder.js
// ────────────────────────────────────────────────────────────────────────────
// SMS reminder service for appointment notifications
// Integrates with Supabase edge functions for SMS delivery

import { supabase } from './supabase';
import { NOTIFICATION_TYPES } from '../constants/notificationKeys';

/**
 * Send appointment confirmation SMS
 * @param {string} phone - Patient phone number (format: +91XXXXXXXXXX for India)
 * @param {object} appointment - Appointment details
 * @param {string} doctorName - Doctor's full name
 */
export const sendAppointmentConfirmationSMS = async (phone, appointment, doctorName) => {
  if (!phone) {
    console.warn('SMS: No phone number provided');
    return { success: false, error: 'No phone number' };
  }

  try {
    const message = `Hi! Your appointment with Dr. ${doctorName} is confirmed for ${formatAppointmentTime(appointment.scheduled_at)} at ${appointment.clinic || 'our clinic'}. Reply or call to confirm.`;
    
    return await sendSMS(phone, message, {
      type: NOTIFICATION_TYPES.APPOINTMENT_CONFIRMED,
      appointmentId: appointment.id,
    });
  } catch (err) {
    console.error('SMS confirmation error:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Send appointment reminder SMS (24 hours before)
 */
export const sendAppointmentReminder24H = async (phone, appointment, doctorName) => {
  if (!phone) return { success: false, error: 'No phone number' };

  try {
    const message = `Reminder: Your appointment with Dr. ${doctorName} is tomorrow at ${formatAppointmentTime(appointment.scheduled_at)}. Arrive 10 minutes early.`;
    
    return await sendSMS(phone, message, {
      type: NOTIFICATION_TYPES.APPOINTMENT_REMINDER_24H,
      appointmentId: appointment.id,
    });
  } catch (err) {
    console.error('SMS reminder 24h error:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Send appointment reminder SMS (1 hour before)
 */
export const sendAppointmentReminder1H = async (phone, appointment, doctorName) => {
  if (!phone) return { success: false, error: 'No phone number' };

  try {
    const message = `Your appointment with Dr. ${doctorName} is in 1 hour at ${formatAppointmentTime(appointment.scheduled_at)}. Please be on your way!`;
    
    return await sendSMS(phone, message, {
      type: NOTIFICATION_TYPES.APPOINTMENT_REMINDER_1H,
      appointmentId: appointment.id,
    });
  } catch (err) {
    console.error('SMS reminder 1h error:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Send appointment reschedule SMS
 */
export const sendAppointmentRescheduleNotificationSMS = async (phone, appointment, doctorName) => {
  if (!phone) return { success: false, error: 'No phone number' };

  try {
    const message = `Your appointment with Dr. ${doctorName} has been rescheduled to ${formatAppointmentTime(appointment.scheduled_at)}.`;
    
    return await sendSMS(phone, message, {
      type: NOTIFICATION_TYPES.APPOINTMENT_RESCHEDULED,
      appointmentId: appointment.id,
    });
  } catch (err) {
    console.error('SMS reschedule error:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Send appointment cancellation SMS
 */
export const sendAppointmentCancellationSMS = async (phone, appointment, doctorName) => {
  if (!phone) return { success: false, error: 'No phone number' };

  try {
    const message = `Your appointment with Dr. ${doctorName} on ${formatAppointmentTime(appointment.scheduled_at)} has been cancelled. Contact us to reschedule.`;
    
    return await sendSMS(phone, message, {
      type: NOTIFICATION_TYPES.APPOINTMENT_CANCELLED,
      appointmentId: appointment.id,
    });
  } catch (err) {
    console.error('SMS cancellation error:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Send queue position update SMS
 */
export const sendQueueUpdateSMS = async (phone, position, waitTime, doctorName) => {
  if (!phone) return { success: false, error: 'No phone number' };

  try {
    const message = `You are #${position} in queue with Dr. ${doctorName}. Estimated wait: ${waitTime} minutes.`;
    
    return await sendSMS(phone, message, {
      type: NOTIFICATION_TYPES.QUEUE_POSITION_CHANGED,
    });
  } catch (err) {
    console.error('SMS queue update error:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Send "your turn" SMS
 */
export const sendYourTurnSMS = async (phone, doctorName) => {
  if (!phone) return { success: false, error: 'No phone number' };

  try {
    const message = `Your turn! Please come to the consultation room for Dr. ${doctorName}.`;
    
    return await sendSMS(phone, message, {
      type: NOTIFICATION_TYPES.QUEUE_CALLED,
    });
  } catch (err) {
    console.error('SMS "your turn" error:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Send delay notification SMS
 */
export const sendDelayNotificationSMS = async (phone, delayMins, doctorName) => {
  if (!phone) return { success: false, error: 'No phone number' };

  try {
    const message = `Dr. ${doctorName} is running ${delayMins} minutes late. We'll notify you when ready.`;
    
    return await sendSMS(phone, message, {
      type: NOTIFICATION_TYPES.QUEUE_DELAY_ALERT,
    });
  } catch (err) {
    console.error('SMS delay notification error:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Core SMS sending function - calls Supabase edge function
 * Fallback: If no phone provided or service unavailable, creates in-app notification
 */
export const sendSMS = async (phone, message, metadata = {}) => {
  try {
    // Validate phone format
    if (!phone || typeof phone !== 'string') {
      console.warn('SMS: Invalid phone format:', phone);
      return { success: false, error: 'Invalid phone number' };
    }

    // In production, call Supabase edge function
    // For now, log the SMS for development
    console.log('📱 SMS to', phone, ':', message);

    // Optionally call a real SMS endpoint when configured
    // For production, uncomment and configure:
    /*
    const { data, error } = await supabase.functions.invoke('send-sms', {
      body: {
        phone,
        message,
        metadata,
      },
    });
    if (error) throw error;
    return { success: true, data };
    */

    // Development: Just log and return success
    return { 
      success: true, 
      message: 'SMS logged (development mode)',
      sent_to: phone,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    console.error('SMS send error:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Helper: Format appointment time for SMS
 */
const formatAppointmentTime = (isoString) => {
  try {
    const date = new Date(isoString);
    const dayMonthYear = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });
    const time = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${dayMonthYear} at ${time}`;
  } catch {
    return isoString;
  }
};

/**
 * Batch send reminders to multiple patients (for scheduled jobs)
 * Called by backend cron jobs
 */
export const sendBatchReminders = async (appointments, reminderType = '24h') => {
  const results = {
    sent: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };

  for (const appointment of appointments) {
    try {
      const patient = appointment.patients;
      const doctor = appointment.doctors;
      const phone = patient?.phone;

      if (!phone) {
        results.skipped++;
        continue;
      }

      let smsResult;
      if (reminderType === '24h') {
        smsResult = await sendAppointmentReminder24H(phone, appointment, doctor?.full_name);
      } else if (reminderType === '1h') {
        smsResult = await sendAppointmentReminder1H(phone, appointment, doctor?.full_name);
      }

      if (smsResult.success) {
        results.sent++;
      } else {
        results.failed++;
        results.errors.push({ appointmentId: appointment.id, error: smsResult.error });
      }
    } catch (err) {
      results.failed++;
      results.errors.push({ appointmentId: appointment?.id, error: err.message });
    }
  }

  return results;
};

export default {
  sendAppointmentConfirmationSMS,
  sendAppointmentReminder24H,
  sendAppointmentReminder1H,
  sendAppointmentCancellationSMS,
  sendQueueUpdateSMS,
  sendYourTurnSMS,
  sendDelayNotificationSMS,
  sendSMS,
  sendBatchReminders,
};
