// src/services/appointmentPrediction.js
// ─── Intelligent Appointment Duration Prediction Engine ─────────────────────
// Uses historical consultation data to predict appointment durations
// Factors: specialty, reason, patient age, doctor experience, time of day

import { supabase } from './supabase';

/**
 * Building blocks: Polynomial Regression model for lightweight ML
 * Trained on historical consultation data
 */

class PolynomialRegression {
  constructor(degree = 2) {
    this.degree = degree;
    this.coefficients = null;
    this.mean_x = 0;
    this.mean_y = 0;
  }

  /**
   * Train model using basic linear algebra (Vandermonde + Normal Equations)
   * @param {number[]} x - Input features (normalized)
   * @param {number[]} y - Target values (actual consultation times in minutes)
   */
  fit(x, y) {
    if (x.length < 2) {
      console.warn('Insufficient data to train regression model');
      this.coefficients = [y[0] || 15]; // Default to 15 min if no data
      return;
    }

    this.mean_x = x.reduce((a, b) => a + b) / x.length;
    this.mean_y = y.reduce((a, b) => a + b) / y.length;

    // Normalize data
    const x_norm = x.map(xi => xi - this.mean_x);
    const y_norm = y.map(yi => yi - this.mean_y);

    // Build Vandermonde matrix
    const n = x.length;
    const X = [];
    for (let i = 0; i < n; i++) {
      const row = [];
      for (let d = 0; d <= this.degree; d++) {
        row.push(Math.pow(x_norm[i], d));
      }
      X.push(row);
    }

    // Compute X^T * X
    const XTX = [];
    for (let i = 0; i <= this.degree; i++) {
      XTX[i] = [];
      for (let j = 0; j <= this.degree; j++) {
        let sum = 0;
        for (let k = 0; k < n; k++) sum += X[k][i] * X[k][j];
        XTX[i].push(sum);
      }
    }

    // Compute X^T * y
    const XTy = [];
    for (let i = 0; i <= this.degree; i++) {
      let sum = 0;
      for (let k = 0; k < n; k++) sum += X[k][i] * y_norm[k];
      XTy.push(sum);
    }

    // Solve using Gaussian elimination (simplified)
    this.coefficients = this.gaussianElimination(XTX, XTy);
  }

  /**
   * Gaussian elimination for solving linear systems
   */
  gaussianElimination(A, b) {
    const n = A.length;
    const augmented = A.map((row, i) => [...row, b[i]]);

    // Forward elimination
    for (let i = 0; i < n; i++) {
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) maxRow = k;
      }
      [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];

      for (let k = i + 1; k < n; k++) {
        const factor = augmented[k][i] / augmented[i][i];
        for (let j = i; j <= n; j++) {
          augmented[k][j] -= factor * augmented[i][j];
        }
      }
    }

    // Back substitution
    const x = new Array(n);
    for (let i = n - 1; i >= 0; i--) {
      x[i] = augmented[i][n];
      for (let j = i + 1; j < n; j++) {
        x[i] -= augmented[i][j] * x[j];
      }
      x[i] /= augmented[i][i];
    }
    return x;
  }

  /**
   * Make prediction on normalized input
   */
  predict(x_val) {
    if (!this.coefficients) return 15; // Default 15 min
    const x_norm = x_val - this.mean_x;
    let pred = 0;
    for (let d = 0; d <= this.degree; d++) {
      pred += this.coefficients[d] * Math.pow(x_norm, d);
    }
    return pred + this.mean_y;
  }
}

/**
 * ─── Feature Engineering ────────────────────────────────────────────────────
 * Convert consultation metadata into a numeric feature for prediction
 */

export const computeConsultationFeature = (record) => {
  let feature = 0;

  // Base scoring: Specialty type (0-100 scale)
  const specialtyScores = {
    'Cardiology': 45,      // Complex, longer
    'Orthopedics': 50,     // Physical exams take time
    'Dermatology': 30,     // Often shorter
    'General': 25,
    'Pediatrics': 35,
    'Neurology': 55,       // Complex assessments
    'Psychiatry': 50,      // Requires discussion time
    'Dentistry': 40,
  };
  feature += specialtyScores[record.specialty] || 30;

  // Reason for visit complexity scoring
  const reasonScores = {
    'Check-up': 20,
    'Follow-up': 25,
    'New condition': 50,
    'Chronic management': 35,
    'Emergency': 60,
    'Preventive care': 30,
    'Lab review': 20,
    'Prescription renewal': 15,
  };
  const reason_lower = record.reason?.toLowerCase() || 'check-up';
  let reasonScore = 30;
  for (const [key, score] of Object.entries(reasonScores)) {
    if (reason_lower.includes(key.toLowerCase())) {
      reasonScore = score;
      break;
    }
  }
  feature += reasonScore;

  // Patient age complexity (pediatric/geriatric takes longer)
  const age = appointment.patient_age || 40;
  if (age < 5 || age > 75) feature += 10;

  // Doctor experience (more experienced = slightly faster)
  const exp = doctorData.years_of_experience || 10;
  feature -= Math.min(exp / 2, 8); // Up to -8 points for very experienced

  // Day of week: Fatigue effect (later in week = slower)
  const dayOfWeek = new Date(appointment.scheduled_at).getDay();
  if (dayOfWeek >= 4) feature += 3; // Thursday onwards slightly longer

  // Time of day: Morning is usually faster
  const hour = new Date(appointment.scheduled_at).getHours();
  if (hour >= 14) feature += 5; // Afternoon slower

  return Math.max(0, Math.min(feature, 200)); // Normalize to 0-200 range
};

/**
 * ─── Load Historical Data & Train Model ──────────────────────────────────
 */

let consultationModel = new PolynomialRegression(2);
let modelTrainedAt = null;
let isTrainingModel = false;

/**
 * Load consultation history and retrain the prediction model
 * This should be called:
 * - On app startup
 * - Daily at off-peak hours
 * - After significant new consultation data
 */
export const trainConsultationDurationModel = async () => {
  if (isTrainingModel) {
    console.log('Model training already in progress...');
    return;
  }

  isTrainingModel = true;
  try {
    // 1. Fetch historical consultation data (last 3 months)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const { data: history, error } = await supabase
      .from('consult_history')
      .select('*')
      .gte('created_at', threeMonthsAgo.toISOString())
      .limit(500); // Recent 500 consultations for model

    if (error) {
      console.error('Error fetching consult history:', error);
      return;
    }

    if (!history || history.length < 5) {
      console.log('Insufficient data to train model (need at least 5 consultations)');
      return;
    }

    // 2. Engineer features
    const features = [];
    const targets = [];

    history.forEach(record => {
      if (record.actual_min && record.actual_min > 0 && record.actual_min < 300) { // 5 sec to 5 hours
        const feature = computeConsultationFeature(record);
        features.push(feature);
        targets.push(record.actual_min);
      }
    });

    if (features.length < 5) {
      console.log('Insufficient valid data points to train model');
      return;
    }

    // 3. Normalize features for training
    const minF = Math.min(...features);
    const maxF = Math.max(...features);
    const rangeF = maxF - minF || 1;
    const normalized_features = features.map(f => (f - minF) / rangeF);

    // 4. Train polynomial regression model
    consultationModel.fit(normalized_features, targets);
    modelTrainedAt = new Date();

    console.log(`✓ Consultation duration model trained on ${history.length} records at ${modelTrainedAt.toLocaleTimeString()}`);
  } catch (err) {
    console.error('Error training consultation model:', err);
  } finally {
    isTrainingModel = false;
  }
};

/**
 * ─── Prediction API ──────────────────────────────────────────────────────
 */

/**
 * Predict consultation duration for an appointment
 * @param {object} appointment - Appointment object with reason_for_visit, patient_age, scheduled_at
 * @param {object} doctorData - Doctor object with specialty, years_of_experience
 * @returns {number} Predicted duration in minutes (15-180)
 */
export const predictConsultationDuration = (appointment, doctorData = {}) => {
  try {
    const feature = computeConsultationFeature(appointment, doctorData);
    const normalized_feature = (feature - 0) / 200; // Scale to same range as training
    const predicted = consultationModel.predict(normalized_feature);

    // Clamp to reasonable range: 15-180 minutes
    return Math.max(15, Math.min(180, Math.round(predicted)));
  } catch (err) {
    console.error('Error predicting duration:', err);
    return 20; // Default to 20 minutes if prediction fails
  }
};

/**
 * Batch predict durations for multiple appointments
 */
export const batchPredictDurations = (appointments, doctorData = {}) => {
  return appointments.map(appt => ({
    ...appt,
    predicted_duration: predictConsultationDuration(appt, doctorData),
  }));
};

/**
 * Update appointment predicted duration in database
 */
export const updateAppointmentPredictedDuration = async (appointmentId, predictedMin) => {
  const { data, error } = await supabase
    .from('appointments')
    .update({ predicted_duration: predictedMin })
    .eq('id', appointmentId)
    .select()
    .single();

  if (error) {
    console.error('Error updating predicted duration:', error);
    throw error;
  }
  return data;
};

/**
 * Initialize model training on app load
 */
export const initializeConsultationModel = async () => {
  console.log('Initializing consultation duration prediction model...');
  await trainConsultationDurationModel();
};
