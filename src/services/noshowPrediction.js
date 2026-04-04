// src/services/noshowPrediction.js
// ─── No-Show Probability Prediction Engine ────────────────────────────────
// Predicts likelihood a patient will not show up for appointment
// Factors: appointment history, time gap, demographics, day of week, time of day

import { supabase } from './supabase';

/**
 * ─── Logistic Regression for Binary Classification ────────────────────────
 * Predicts probability (0-1) that patient will no-show
 */

class LogisticRegression {
  constructor() {
    this.weights = null;
    this.bias = 0;
  }

  /**
   * Sigmoid function: converts any value to probability (0-1)
   */
  sigmoid(x) {
    return 1 / (1 + Math.exp(-Math.min(Math.max(x, -500), 500))); // Prevent overflow
  }

  /**
   * Simple gradient descent training
   * @param {number[][]} X - Features matrix [n_samples, n_features]
   * @param {number[]} y - Labels (0 or 1)
   * @param {number} learningRate - Typically 0.01
   * @param {number} iterations - Typically 100-1000
   */
  fit(X, y, learningRate = 0.01, iterations = 500) {
    const n = X.length;
    const m = X[0].length;

    // Initialize weights to small random values
    this.weights = Array(m).fill(0).map(() => Math.random() * 0.01);
    this.bias = 0;

    for (let iter = 0; iter < iterations; iter++) {
      let dw = Array(m).fill(0);
      let db = 0;

      // Forward pass and compute gradients
      for (let i = 0; i < n; i++) {
        let z = this.bias;
        for (let j = 0; j < m; j++) {
          z += this.weights[j] * X[i][j];
        }
        const pred = this.sigmoid(z);
        const error = pred - y[i];

        db += error / n;
        for (let j = 0; j < m; j++) {
          dw[j] += (error * X[i][j]) / n;
        }
      }

      // Update weights and bias
      this.bias -= learningRate * db;
      for (let j = 0; j < m; j++) {
        this.weights[j] -= learningRate * dw[j];
      }

      // Log progress every 100 iterations
      if ((iter + 1) % 100 === 0) {
        let loss = 0;
        for (let i = 0; i < n; i++) {
          let z = this.bias;
          for (let j = 0; j < m; j++) z += this.weights[j] * X[i][j];
          const pred = this.sigmoid(z);
          loss -= (y[i] * Math.log(pred + 1e-10) + (1 - y[i]) * Math.log(1 - pred + 1e-10)) / n;
        }
      }
    }
  }

  /**
   * Predict probability for single feature vector
   */
  predict(x) {
    if (!this.weights) return 0.1; // Default 10% if not trained
    let z = this.bias;
    for (let j = 0; j < this.weights.length; j++) {
      z += this.weights[j] * x[j];
    }
    return this.sigmoid(z);
  }
}

/**
 * ─── Feature Engineering ────────────────────────────────────────────────────
 * Extract features that correlate with no-show behavior
 */

export const computeNoshowFeature = async (appointment, patientId) => {
  const features = [];

  // 1. Days between booking and appointment (earlier booking = less likely to no-show)
  const appointmentDate = new Date(appointment.scheduled_at).getTime();
  const bookingDate = new Date(appointment.created_at).getTime();
  const daysBetween = (appointmentDate - bookingDate) / (1000 * 60 * 60 * 24);
  features.push(Math.max(0, Math.min(daysBetween / 30, 1))); // Normalize: 0-30 days → 0-1

  // 2. Patient's historical no-show rate
  const { data: patientHistory } = await supabase
    .from('appointments')
    .select('status')
    .eq('patient_id', patientId)
    .in('status', ['no_show', 'completed'])
    .limit(50);

  let noshowCount = 0;
  if (patientHistory && patientHistory.length > 0) {
    noshowCount = patientHistory.filter(a => a.status === 'no_show').length;
  }
  const noshowRate = patientHistory && patientHistory.length > 0
    ? noshowCount / patientHistory.length
    : 0.1; // Default 10% if no history
  features.push(noshowRate);

  // 3. Time of day (early morning = more likely to no-show)
  const hour = new Date(appointment.scheduled_at).getHours();
  const isMorning = hour < 10 ? 1 : 0;
  features.push(isMorning);

  // 4. Day of week (weekend appointments less likely to no-show, late week more)
  const dayOfWeek = new Date(appointment.scheduled_at).getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6 ? 1 : 0;
  const isLateWeek = dayOfWeek >= 4 ? 1 : 0;
  features.push(isWeekend);
  features.push(isLateWeek);

  // 5. Patient age group (younger patients have higher no-show rates)
  const age = appointment.patient_age || 40;
  const isYoung = age < 25 ? 1 : 0;
  features.push(isYoung);

  // 6. Has patient cancelled before?
  const { data: cancelledAppts } = await supabase
    .from('appointments')
    .select('status')
    .eq('patient_id', patientId)
    .eq('status', 'cancelled')
    .limit(10);

  const cancellationRate = (cancelledAppts?.length || 0) / Math.max((patientHistory?.length || 1), 1);
  features.push(Math.min(cancellationRate, 1));

  // 7. Specialty type (some specialties have higher no-show rates)
  const specialtyNoshowRates = {
    'Dermatology': 0.15,    // Higher no-show rate
    'General': 0.12,
    'Pediatrics': 0.18,     // Very high
    'Cardiology': 0.08,     // Lower no-show rate (serious)
    'Neurology': 0.09,
    'Orthopedics': 0.10,
  };
  const specialty = appointment.doctors?.specialty || 'General';
  features.push(specialtyNoshowRates[specialty] || 0.12);

  return features;
};

/**
 * ─── Model Management ────────────────────────────────────────────────────
 */

let noshowModel = new LogisticRegression();
let noshowModelTrainedAt = null;
let isTrainingNoshowModel = false;

/**
 * Train no-show prediction model on historical data
 */
export const trainNoshowPredictionModel = async () => {
  if (isTrainingNoshowModel) {
    console.log('No-show model training already in progress...');
    return;
  }

  isTrainingNoshowModel = true;
  try {
    // 1. Fetch historical appointments (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('*')
      .gte('created_at', sixMonthsAgo.toISOString())
      .in('status', ['no_show', 'completed', 'cancelled'])
      .limit(1000);

    if (error) {
      console.error('Error fetching appointment history:', error);
      return;
    }

    if (!appointments || appointments.length < 20) {
      console.log('Insufficient data to train no-show model (need at least 20 samples)');
      // Initialize with default model
      noshowModel.weights = [0.1, 0.5, 0.05, -0.1, 0.1, 0.15, 0.2];
      noshowModel.bias = -1;
      return;
    }

    // 2. Engineer features for each appointment
    const X = [];
    const y = [];

    for (const appt of appointments) {
      try {
        const features = await computeNoshowFeature(appt, appt.patient_id);
        X.push(features);
        y.push(appt.status === 'no_show' ? 1 : 0);
      } catch (err) {
        console.warn('Error computing features for appointment:', err);
      }
    }

    if (X.length < 20) {
      console.log('Insufficient valid feature vectors to train model');
      return;
    }

    // 3. Train logistic regression
    noshowModel.fit(X, y, 0.01, 1000);
    noshowModelTrainedAt = new Date();

    console.log(`✓ No-show prediction model trained on ${X.length} samples at ${noshowModelTrainedAt.toLocaleTimeString()}`);
  } catch (err) {
    console.error('Error training no-show model:', err);
  } finally {
    isTrainingNoshowModel = false;
  }
};

/**
 * ─── Prediction API ──────────────────────────────────────────────────────
 */

/**
 * Predict no-show probability for an appointment
 * @param {object} appointment - Appointment with patient_id, scheduled_at, etc
 * @returns {object} { risk: boolean, probability: number (0-1) }
 */
export const predictNoshowProbability = async (appointment) => {
  try {
    const features = await computeNoshowFeature(appointment, appointment.patient_id);
    const probability = noshowModel.predict(features);

    // Mark as high risk if probability > 25%
    const riskLevel = probability > 0.25 ? 'high' : probability > 0.15 ? 'medium' : 'low';
    const isRisk = riskLevel === 'high';

    return {
      risk: isRisk,
      probability: Math.round(probability * 100), // percentage
      riskLevel,
      features: {
        daysBetweenBookingAndAppointment: features[0],
        patientHistoricalNoshowRate: features[1],
        isEarlyMorning: features[2],
        isWeekend: features[3],
        isLateWeek: features[4],
      },
    };
  } catch (err) {
    console.error('Error predicting no-show probability:', err);
    return { risk: false, probability: 10, riskLevel: 'low' };
  }
};

/**
 * Update appointment no-show risk in database
 */
export const updateAppointmentNoshowRisk = async (appointmentId, risk, probability) => {
  const { data, error } = await supabase
    .from('appointments')
    .update({ noshow_risk: risk, noshow_probability: probability })
    .eq('id', appointmentId)
    .select()
    .single();

  if (error) {
    console.error('Error updating no-show risk:', error);
    throw error;
  }
  return data;
};

/**
 * Get high-risk no-show appointments for proactive notifications
 */
export const getHighRiskAppointments = async (doctorId) => {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('doctor_id', doctorId)
    .eq('noshow_risk', true)
    .gte('scheduled_at', today + 'T00:00:00')
    .lte('scheduled_at', today + 'T23:59:59')
    .in('status', ['confirmed']);

  if (error) {
    console.error('Error fetching high-risk appointments:', error);
    return [];
  }
  return data || [];
};

/**
 * Initialize no-show model training on app load
 */
export const initializeNoshowModel = async () => {
  console.log('Initializing no-show probability prediction model...');
  await trainNoshowPredictionModel();
};
