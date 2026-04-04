// src/services/queueOptimization.js
// ─── Queue Optimization & Load Balancing Engine ──────────────────────────
// Suggests optimal scheduling, alternative doctors, and prevents overload

import { supabase } from './supabase';
import { predictConsultationDuration } from './appointmentPrediction';

/**
 * ─── Queue Analytics ────────────────────────────────────────────────────
 */

/**
 * Calculate current wait time for a specific doctor
 * Includes queued patients + in-progress + predicted durations
 */
export const calculateCurrentQueueWaitTime = async (doctorId) => {
  const today = new Date().toISOString().split('T')[0];

  // Get all queue entries for today (waiting + in-progress)
  const { data: queueEntries, error } = await supabase
    .from('queue')
    .select(`
      id,
      status,
      predicted_duration,
      appointments!inner(scheduled_at, status)
    `)
    .eq('doctor_id', doctorId)
    .in('status', ['waiting', 'in-progress'])
    .gte('appointments.scheduled_at', today + 'T00:00:00')
    .lte('appointments.scheduled_at', today + 'T23:59:59')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error calculating queue wait time:', error);
    return 0;
  }

  let totalWaitMin = 0;
  if (queueEntries && queueEntries.length > 0) {
    totalWaitMin = queueEntries.reduce((sum, entry) => {
      const duration = entry.predicted_duration || 15;
      return sum + duration;
    }, 0);
  }

  return totalWaitMin;
};

/**
 * Get doctor utilization metrics
 * Returns how loaded each doctor is at a given time
 */
export const getDoctorUtilizationMetrics = async (doctorId) => {
  const today = new Date().toISOString().split('T')[0];

  // Get today's appointments
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select('scheduled_at, predicted_duration, status')
    .eq('doctor_id', doctorId)
    .gte('scheduled_at', today + 'T00:00:00')
    .lte('scheduled_at', today + 'T23:59:59')
    .in('status', ['confirmed', 'in_progress', 'completed']);

  if (error) {
    console.error('Error fetching appointments:', error);
    return { utilizationPercent: 0, availableMinutes: 480 };
  }

  // Assume 8-hour working day = 480 minutes
  let totalScheduledMin = 0;
  if (appointments && appointments.length > 0) {
    totalScheduledMin = appointments.reduce((sum, appt) => {
      const duration = appt.predicted_duration || 20;
      return sum + duration;
    }, 0);
  }

  const totalMinutesInDay = 480;
  const utilizationPercent = Math.round((totalScheduledMin / totalMinutesInDay) * 100);
  const availableMinutes = Math.max(0, totalMinutesInDay - totalScheduledMin);

  return {
    utilizationPercent: Math.min(100, utilizationPercent),
    availableMinutes,
    scheduledMinutes: totalScheduledMin,
    totalDayMinutes: totalMinutesInDay,
  };
};

/**
 * ─── Load Balancing ─────────────────────────────────────────────────────
 */

/**
 * Find alternative doctors with similar specialty but shorter queue
 * @param {string} requestedDoctorId - Doctor patient requested
 * @param {array} allDoctors - List of available doctors
 * @param {number} maxQueueThreshold - If requested doctor queue > this, suggest alternatives
 */
export const suggestAlternativeDoctors = async (requestedDoctorId, allDoctors, maxQueueThreshold = 60) => {
  try {
    // Get requested doctor info
    const { data: requestedDoctor, error: docError } = await supabase
      .from('doctors')
      .select('*')
      .eq('id', requestedDoctorId)
      .single();

    if (docError || !requestedDoctor) return [];

    // Calculate wait time for requested doctor
    const requestedWaitTime = await calculateCurrentQueueWaitTime(requestedDoctorId);

    if (requestedWaitTime <= maxQueueThreshold) {
      return []; // No need to suggest alternatives
    }

    // Find doctors with same specialty and shorter queues
    const alternatives = [];
    for (const doctor of allDoctors) {
      if (doctor.id === requestedDoctorId || !doctor.is_active) continue;
      if (doctor.specialty !== requestedDoctor.specialty) continue;

      const doctorWaitTime = await calculateCurrentQueueWaitTime(doctor.id);
      const utilizationMetrics = await getDoctorUtilizationMetrics(doctor.id);

      alternatives.push({
        doctorId: doctor.id,
        name: doctor.full_name,
        specialty: doctor.specialty,
        clinic: doctor.clinic,
        currentWaitTimeMin: doctorWaitTime,
        utilizationPercent: utilizationMetrics.utilizationPercent,
        availableMinutes: utilizationMetrics.availableMinutes,
        timesSavingMin: requestedWaitTime - doctorWaitTime,
      });
    }

    // Sort by shortest wait time
    alternatives.sort((a, b) => a.currentWaitTimeMin - b.currentWaitTimeMin);

    return alternatives.slice(0, 3); // Return top 3 alternatives
  } catch (err) {
    console.error('Error suggesting alternative doctors:', err);
    return [];
  }
};

/**
 * ─── Optimal Slot Recommendation ────────────────────────────────────────
 */

/**
 * Find best appointment slots based on queue load distribution
 * Recommends slots that minimize overall wait times
 */
export const findOptimalAppointmentSlots = async (doctorId, preferredDate, slotDurationMin = 20) => {
  try {
    // Get available slots for the day
    const { data: availability } = await supabase
      .from('doctor_availability')
      .select('start_time, end_time')
      .eq('doctor_id', doctorId)
      .eq('day_of_week', new Date(preferredDate).getDay())
      .eq('is_active', true)
      .single();

    if (!availability) return [];

    const [startH, startM] = availability.start_time.split(':').map(Number);
    const [endH, endM] = availability.end_time.split(':').map(Number);

    // Get booked slots for the day
    const { data: bookedAppointments } = await supabase
      .from('appointments')
      .select('scheduled_at, predicted_duration')
      .eq('doctor_id', doctorId)
      .gte('scheduled_at', new Date(preferredDate).toISOString())
      .lt('scheduled_at', new Date(new Date(preferredDate).getTime() + 86400000).toISOString())
      .in('status', ['confirmed', 'in_progress']);

    // Generate candidate slots
    const slots = [];
    const cursor = new Date(preferredDate);
    cursor.setHours(startH, startM, 0, 0);
    const endTime = new Date(preferredDate);
    endTime.setHours(endH, endM, 0, 0);

    while (cursor < endTime) {
      const slotEnd = new Date(cursor.getTime() + slotDurationMin * 60000);
      
      // Check overlap
      const hasOverlap = bookedAppointments?.some(appt => {
        const apptStart = new Date(appt.scheduled_at);
        const apptEnd = new Date(apptStart.getTime() + (appt.predicted_duration || 20) * 60000);
        return cursor < apptEnd && slotEnd > apptStart;
      });

      if (!hasOverlap) {
        // Score this slot based on queue load and time of day
        const score = calculateSlotScore(cursor, bookedAppointments || []);
        slots.push({
          slotTime: new Date(cursor),
          score,
          timeoutOfService: false,
        });
      }

      cursor.setMinutes(cursor.getMinutes() + slotDurationMin);
    }

    // Sort by score (higher = better)
    slots.sort((a, b) => b.score - a.score);

    return slots.slice(0, 5); // Return top 5 slots
  } catch (err) {
    console.error('Error finding optimal slots:', err);
    return [];
  }
};

/**
 * Score appointment slots based on queue distribution
 * Higher score = better slot (less wait time)
 */
function calculateSlotScore(slotTime, bookedAppointments) {
  const hour = slotTime.getHours();
  let score = 100; // Base score

  // Morning slots preferred (less fatigue) but not too early
  if (hour >= 9 && hour < 12) score += 20;
  if (hour >= 14 && hour < 17) score += 10;
  if (hour < 9 || hour >= 18) score -= 15;

  // Count how many patients already booked near this time (30-min window)
  const windowStart = new Date(slotTime.getTime() - 30 * 60000);
  const windowEnd = new Date(slotTime.getTime() + 30 * 60000);
  const nearbyCount = bookedAppointments.filter(appt => {
    const apptTime = new Date(appt.scheduled_at);
    return apptTime > windowStart && apptTime < windowEnd;
  }).length;

  // Distribute load: penalize if too many nearby
  score -= nearbyCount * 10;

  return Math.max(0, score);
}

/**
 * ─── Dynamic Rescheduling ──────────────────────────────────────────────
 */

/**
 * Suggest rescheduling for high no-show risk appointments
 * Moves them to slots closer to appointment time (reduces abandonment)
 */
export const suggestRescheduleForHighRisk = async (appointmentId, doctorId) => {
  try {
    const { data: appointment, error } = await supabase
      .from('appointments')
      .select('scheduled_at, patient_id, predicted_duration')
      .eq('id', appointmentId)
      .single();

    if (error || !appointment) return null;

    const originalTime = new Date(appointment.scheduled_at);
    const today = new Date();

    // Only reschedule if appointment is > 1 day away
    const daysUntilAppointment = (originalTime - today) / (1000 * 60 * 60 * 24);
    if (daysUntilAppointment < 1) {
      return null; // Too close, don't reschedule
    }

    // Suggest moving to 2-3 days out (sweet spot for no-show prediction)
    const suggestedDate = new Date(today);
    suggestedDate.setDate(suggestedDate.getDate() + Math.ceil(Math.random() * 2 + 1));

    const optimalSlots = await findOptimalAppointmentSlots(
      doctorId,
      suggestedDate,
      appointment.predicted_duration || 20
    );

    return {
      originalTime,
      suggestedSlots: optimalSlots.slice(0, 3).map(slot => ({
        time: slot.slotTime,
        score: Math.round(slot.score),
      })),
      reason: 'Rescheduling closer to appointment reduces no-shows',
    };
  } catch (err) {
    console.error('Error suggesting reschedule:', err);
    return null;
  }
};

/**
 * ─── Peak Hour Detection ────────────────────────────────────────────────
 */

/**
 * Detect if doctor is at peak capacity and returning slow down
 */
export const detectPeakHours = async (doctorId) => {
  const today = new Date().toISOString().split('T')[0];

  // Group appointments by hour
  const { data: appointments } = await supabase
    .from('appointments')
    .select('scheduled_at, predicted_duration')
    .eq('doctor_id', doctorId)
    .gte('scheduled_at', today + 'T00:00:00')
    .lte('scheduled_at', today + 'T23:59:59')
    .in('status', ['confirmed', 'in_progress']);

  const hourlyLoad = {};
  if (appointments && appointments.length > 0) {
    appointments.forEach(appt => {
      const hour = new Date(appt.scheduled_at).getHours();
      const duration = appt.predicted_duration || 20;
      hourlyLoad[hour] = (hourlyLoad[hour] || 0) + duration;
    });
  }

  // Identify peak hours (> 90 minutes scheduled in that hour)
  const peakHours = Object.entries(hourlyLoad)
    .filter(([_, load]) => load > 90)
    .map(([hour, load]) => ({ hour: parseInt(hour), load }));

  return peakHours;
};

/**
 * ─── Queue Health Monitoring ────────────────────────────────────────────
 */

/**
 * Get comprehensive queue health report for all doctors
 */
export const getQueueHealthReport = async (allDoctors) => {
  const report = {
    timestamp: new Date().toISOString(),
    doctors: [],
    systemHealthScore: 0,
  };

  let totalUtilization = 0;

  for (const doctor of allDoctors) {
    if (!doctor.is_active) continue;

    const waitTime = await calculateCurrentQueueWaitTime(doctor.id);
    const metrics = await getDoctorUtilizationMetrics(doctor.id);
    const peakHours = await detectPeakHours(doctor.id);

    const doctorHealth = {
      doctorId: doctor.id,
      name: doctor.full_name,
      specialty: doctor.specialty,
      currentWaitTimeMin: waitTime,
      utilizationPercent: metrics.utilizationPercent,
      healthStatus: metrics.utilizationPercent > 90 ? 'overloaded' : metrics.utilizationPercent > 70 ? 'heavy' : 'normal',
      peakHours: peakHours.length,
      recommendedAction:
        metrics.utilizationPercent > 90
          ? 'URGENT: Load balance required'
          : metrics.utilizationPercent > 70
            ? 'Consider load balancing'
            : 'Operating normally',
    };

    report.doctors.push(doctorHealth);
    totalUtilization += metrics.utilizationPercent;
  }

  // Calculate system health score (0-100)
  const avgUtilization = allDoctors.length > 0 ? totalUtilization / allDoctors.length : 0;
  report.systemHealthScore = 100 - Math.abs(avgUtilization - 70); // Target is 70% utilization

  return report;
};

/**
 * Recompute all queue wait times (call after appointment changes)
 */
export const recomputeAllQueueWaitTimes = async (doctorId) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Get all queue entries for this doctor today
    const { data: queueEntries, error } = await supabase
      .from('queue')
      .select('id, created_at')
      .eq('doctor_id', doctorId)
      .gte('updated_at', today + 'T00:00:00')
      .in('status', ['waiting', 'in-progress'])
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Update each entry's wait time
    if (queueEntries && queueEntries.length > 0) {
      let cumulativeWait = 0;
      for (const entry of queueEntries) {
        await supabase
          .from('queue')
          .update({ wait_time_min: cumulativeWait })
          .eq('id', entry.id);

        // Fetch predicted duration and add to cumulative
        const { data: appt } = await supabase
          .from('appointments')
          .select('predicted_duration')
          .eq('appointment_id', entry.id)
          .single();

        if (appt) {
          cumulativeWait += appt.predicted_duration || 15;
        }
      }
    }
  } catch (err) {
    console.error('Error recomputing queue wait times:', err);
  }
};

export { calculateSlotScore };
