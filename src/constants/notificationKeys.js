// ────────────────────────────────────────────────────────────────────────────
// src/constants/notificationKeys.js
// ────────────────────────────────────────────────────────────────────────────
// Centralized notification type keys for all system events
// Used to validate notification types in the database constraint

export const NOTIFICATION_TYPES = {
  // ── APPOINTMENT EVENTS ─────────────────────────────────────────────────────
  APPOINTMENT_CONFIRMED: 'appointment_confirmed',      // Patient books appointment
  APPOINTMENT_RESCHEDULED: 'appointment_rescheduled',  // Appointment moved to new time
  APPOINTMENT_CANCELLED: 'appointment_cancelled',      // Appointment cancelled
  APPOINTMENT_REMINDER_24H: 'appointment_reminder_24h', // 24h before appointment
  APPOINTMENT_REMINDER_1H: 'appointment_reminder_1h',  // 1h before appointment
  APPOINTMENT_COMPLETED: 'appointment_completed',      // Appointment finished
  APPOINTMENT_NOSHOW: 'appointment_noshow',           // Patient didn't show up

  // ── QUEUE EVENTS ─────────────────────────────────────────────────────────── 
  QUEUE_UPDATE: 'queue_update',                        // Patient added to queue
  QUEUE_POSITION_CHANGED: 'queue_position_changed',    // Position moved
  QUEUE_CALLED: 'queue_called',                        // Patient called to see doctor
  QUEUE_DELAY_ALERT: 'queue_delay_alert',             // Doctor running late

  // ── DOCTOR EVENTS ──────────────────────────────────────────────────────────
  NEW_PATIENT_BOOKING: 'new_patient_booking',         // Doctor: new booking
  DOCTOR_SCHEDULE_CHANGE: 'doctor_schedule_change',   // Doctor schedule updated

  // ── SYSTEM EVENTS ──────────────────────────────────────────────────────────
  PRESCRIPTION_REFILL: 'prescription_refill',         // Prescription needs refill
  LAB_RESULTS_READY: 'lab_results_ready',            // Lab reports available
  HEALTH_ALERT: 'health_alert',                      // System health alert
  APPOINTMENT_AVAILABILITY: 'appointment_availability', // New slots open

  // ── USER ACCOUNT EVENTS ────────────────────────────────────────────────────
  ACCOUNT_VERIFICATION: 'account_verification',       // Email/SMS verification
  PASSWORD_CHANGED: 'password_changed',               // Password update
  PROFILE_UPDATED: 'profile_updated',                 // Profile changed
};

// Valid notification types for database validation
export const VALID_NOTIFICATION_TYPES = Object.values(NOTIFICATION_TYPES);

// Notification type display names and icons
export const NOTIFICATION_CONFIG = {
  [NOTIFICATION_TYPES.APPOINTMENT_CONFIRMED]: {
    title: 'Appointment Confirmed',
    icon: '✅',
    color: '#10B981',
    colorBg: '#D1FAE5',
  },
  [NOTIFICATION_TYPES.APPOINTMENT_RESCHEDULED]: {
    title: 'Appointment Rescheduled',
    icon: '📅',
    color: '#0D9488',
    colorBg: '#CCFBF1',
  },
  [NOTIFICATION_TYPES.APPOINTMENT_CANCELLED]: {
    title: 'Appointment Cancelled',
    icon: '❌',
    color: '#F43F5E',
    colorBg: '#FFE4E6',
  },
  [NOTIFICATION_TYPES.APPOINTMENT_REMINDER_24H]: {
    title: 'Appointment Tomorrow',
    icon: '🔔',
    color: '#F59E0B',
    colorBg: '#FEF3C7',
  },
  [NOTIFICATION_TYPES.APPOINTMENT_REMINDER_1H]: {
    title: 'Appointment in 1 Hour',
    icon: '⏰',
    color: '#DC2626',
    colorBg: '#FEE2E2',
  },
  [NOTIFICATION_TYPES.APPOINTMENT_COMPLETED]: {
    title: 'Appointment Completed',
    icon: '✅',
    color: '#10B981',
    colorBg: '#D1FAE5',
  },
  [NOTIFICATION_TYPES.APPOINTMENT_NOSHOW]: {
    title: 'Appointment Missed',
    icon: '⚠️',
    color: '#DC2626',
    colorBg: '#FEE2E2',
  },
  [NOTIFICATION_TYPES.QUEUE_UPDATE]: {
    title: 'Queue Update',
    icon: '👥',
    color: '#0D9488',
    colorBg: '#CCFBF1',
  },
  [NOTIFICATION_TYPES.QUEUE_POSITION_CHANGED]: {
    title: 'Queue Position Changed',
    icon: '📍',
    color: '#0D9488',
    colorBg: '#CCFBF1',
  },
  [NOTIFICATION_TYPES.QUEUE_CALLED]: {
    title: 'Your Turn!',
    icon: '▶️',
    color: '#10B981',
    colorBg: '#D1FAE5',
  },
  [NOTIFICATION_TYPES.QUEUE_DELAY_ALERT]: {
    title: 'Doctor Running Late',
    icon: '⏳',
    color: '#F59E0B',
    colorBg: '#FEF3C7',
  },
  [NOTIFICATION_TYPES.NEW_PATIENT_BOOKING]: {
    title: 'New Patient Booking',
    icon: '👤',
    color: '#6366F1',
    colorBg: '#EEF2FF',
  },
  [NOTIFICATION_TYPES.PRESCRIPTION_REFILL]: {
    title: 'Prescription Refill Due',
    icon: '💊',
    color: '#F59E0B',
    colorBg: '#FEF3C7',
  },
  [NOTIFICATION_TYPES.LAB_RESULTS_READY]: {
    title: 'Lab Results Available',
    icon: '📊',
    color: '#10B981',
    colorBg: '#D1FAE5',
  },
  [NOTIFICATION_TYPES.HEALTH_ALERT]: {
    title: 'Health Alert',
    icon: '⚠️',
    color: '#DC2626',
    colorBg: '#FEE2E2',
  },
  [NOTIFICATION_TYPES.ACCOUNT_VERIFICATION]: {
    title: 'Verify Your Account',
    icon: '🔐',
    color: '#0D9488',
    colorBg: '#CCFBF1',
  },
};

// Get notification config with fallback
export const getNotificationConfig = (type) => {
  return NOTIFICATION_CONFIG[type] || {
    title: type,
    icon: 'ℹ️',
    color: '#4B7B76',
    colorBg: '#E5F7F5',
  };
};

export default NOTIFICATION_TYPES;
