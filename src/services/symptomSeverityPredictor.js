/**
 * Symptom Severity Based Consultation Duration Predictor
 * Uses patient-reported symptoms and their severity to predict accurate consultation times
 */

// ─── Symptom Database by Specialty ──────────────────────────────────────────────
const SYMPTOM_DATABASE = {
  Cardiology: {
    'Chest pain': { base: 40, mild: 25, moderate: 45, severe: 60 },
    'Shortness of breath': { base: 35, mild: 20, moderate: 40, severe: 55 },
    'Palpitations': { base: 30, mild: 15, moderate: 30, severe: 45 },
    'High BP': { base: 25, mild: 15, moderate: 25, severe: 40 },
    'Dizziness': { base: 28, mild: 15, moderate: 30, severe: 45 },
    'Fatigue': { base: 20, mild: 10, moderate: 20, severe: 35 },
    'Heart murmur': { base: 35, mild: 25, moderate: 40, severe: 55 },
  },
  
  Dermatology: {
    'Severe rash': { base: 30, mild: 15, moderate: 30, severe: 45 },
    'Acne': { base: 20, mild: 10, moderate: 20, severe: 35 },
    'Psoriasis': { base: 35, mild: 20, moderate: 35, severe: 50 },
    'Eczema': { base: 28, mild: 15, moderate: 28, severe: 40 },
    'Fungal infection': { base: 25, mild: 15, moderate: 25, severe: 40 },
    'Skin lesion': { base: 32, mild: 20, moderate: 35, severe: 50 },
    'Hair loss': { base: 25, mild: 15, moderate: 25, severe: 40 },
    'Warts': { base: 20, mild: 10, moderate: 20, severe: 30 },
  },
  
  Orthopedics: {
    'Severe fracture': { base: 50, mild: 30, moderate: 45, severe: 60 },
    'Joint pain': { base: 30, mild: 15, moderate: 30, severe: 45 },
    'Arthritis': { base: 35, mild: 20, moderate: 35, severe: 50 },
    'Back pain': { base: 40, mild: 20, moderate: 35, severe: 50 },
    'Knee injury': { base: 35, mild: 20, moderate: 35, severe: 50 },
    'Shoulder pain': { base: 30, mild: 15, moderate: 30, severe: 45 },
    'Sprain': { base: 25, mild: 15, moderate: 25, severe: 40 },
    'Muscle strain': { base: 25, mild: 15, moderate: 25, severe: 40 },
  },
  
  Neurology: {
    'Severe headache': { base: 40, mild: 20, moderate: 35, severe: 55 },
    'Migraine': { base: 45, mild: 25, moderate: 40, severe: 55 },
    'Seizure': { base: 60, mild: 45, moderate: 55, severe: 75 },
    'Dizziness': { base: 30, mild: 15, moderate: 30, severe: 45 },
    'Numbness': { base: 35, mild: 20, moderate: 35, severe: 50 },
    'Memory loss': { base: 45, mild: 30, moderate: 45, severe: 60 },
    'Tremor': { base: 35, mild: 20, moderate: 35, severe: 50 },
    'Neuropathy': { base: 40, mild: 25, moderate: 40, severe: 55 },
  },
  
  General: {
    'Fever': { base: 20, mild: 10, moderate: 20, severe: 35 },
    'Cold': { base: 15, mild: 10, moderate: 15, severe: 25 },
    'Cough': { base: 20, mild: 10, moderate: 20, severe: 35 },
    'Sore throat': { base: 15, mild: 10, moderate: 15, severe: 25 },
    'Body aches': { base: 20, mild: 10, moderate: 20, severe: 35 },
    'Nausea': { base: 25, mild: 15, moderate: 25, severe: 40 },
    'Vomiting': { base: 30, mild: 20, moderate: 30, severe: 45 },
    'Fatigue': { base: 20, mild: 10, moderate: 20, severe: 35 },
    'General checkup': { base: 15, mild: 10, moderate: 15, severe: 20 },
  },
};

// ─── Symptom Complexity Modifiers ─────────────────────────────────────────────
const COMPLEXITY_MODIFIERS = {
  // Number of symptoms affects duration
  'single_symptom': 1.0,
  'two_symptoms': 1.3,
  'three_symptoms': 1.6,
  'four_or_more': 2.0,
  
  // Duration of condition
  'acute_less_than_week': 0.9,
  'subacute_1_2_weeks': 1.0,
  'chronic_more_than_month': 1.4,
  
  // Patient history
  'first_time': 0.9,
  'follow_up': 1.1,
  'chronic_patient': 1.3,
};

const SEVERITY_LEVELS = {
  mild: 'Mild - Barely noticeable to slightly uncomfortable',
  moderate: 'Moderate - Definitely noticeable and bothersome',
  severe: 'Severe - Very painful, significantly impacting daily activities',
};

/**
 * Parse symptoms from patient notes and calculate severity
 */
export function parseSymptomSeverity(symptomText, specialty = 'General') {
  if (!symptomText) return { symptoms: [], severity: 'mild', score: 0 };
  
  const text = symptomText.toLowerCase();
  const specialtySymptoms = SYMPTOM_DATABASE[specialty] || SYMPTOM_DATABASE.General;
  
  // Find matching symptoms
  const matchedSymptoms = [];
  let maxSeverityScore = 0;
  
  for (const [symptom, timings] of Object.entries(specialtySymptoms)) {
    if (text.includes(symptom.toLowerCase())) {
      // Detect severity keywords
      let severity = 'base';
      let severityScore = 2; // moderate baseline
      
      if (text.includes('severe') || text.includes('very') || text.includes('extreme')) {
        severity = 'severe';
        severityScore = 3;
      } else if (text.includes('mild') || text.includes('slight') || text.includes('minor')) {
        severity = 'mild';
        severityScore = 1;
      } else if (text.includes('moderate') || text.includes('significant')) {
        severity = 'moderate';
        severityScore = 2;
      }
      
      // Also check for pain indicators
      if (text.includes('agony') || text.includes('unbearable') || text.includes('can\'t')) {
        severity = 'severe';
        severityScore = 3;
      } else if (text.includes('tolerable') || text.includes('manageable')) {
        severity = 'mild';
        severityScore = 1;
      }
      
      maxSeverityScore = Math.max(maxSeverityScore, severityScore);
      
      matchedSymptoms.push({
        symptom,
        severity,
        estimatedDuration: timings[severity] || timings.base,
      });
    }
  }
  
  // Default severity based on scoring
  let detectedSeverity = 'moderate';
  if (maxSeverityScore === 1) detectedSeverity = 'mild';
  if (maxSeverityScore === 3) detectedSeverity = 'severe';
  
  return {
    symptoms: matchedSymptoms,
    severity: detectedSeverity,
    score: maxSeverityScore,
  };
}

/**
 * Calculate predicted consultation duration based on symptoms and severity
 */
export function calculateDurationFromSymptoms(
  symptomText,
  specialty = 'General',
  doctorExperience = 5,
  patientAge = 45
) {
  const parsed = parseSymptomSeverity(symptomText, specialty);
  
  if (parsed.symptoms.length === 0) {
    // No symptoms matched, use generic estimates
    return calculateGenericDuration(specialty, patientAge, doctorExperience);
  }
  
  // 1. Base duration: average of matched symptoms
  let baseDuration = parsed.symptoms.reduce((sum, s) => sum + s.estimatedDuration, 0) / parsed.symptoms.length;
  
  // 2. Complexity multiplier based on symptom count
  let complexityMultiplier = COMPLEXITY_MODIFIERS.single_symptom;
  if (parsed.symptoms.length === 2) {
    complexityMultiplier = COMPLEXITY_MODIFIERS.two_symptoms;
  } else if (parsed.symptoms.length === 3) {
    complexityMultiplier = COMPLEXITY_MODIFIERS.three_symptoms;
  } else if (parsed.symptoms.length >= 4) {
    complexityMultiplier = COMPLEXITY_MODIFIERS['four_or_more'];
  }
  
  baseDuration *= complexityMultiplier;
  
  // 3. Age factor: older patients often need more time
  let ageFactor = 1.0;
  if (patientAge > 65) ageFactor = 1.2;
  else if (patientAge > 50) ageFactor = 1.1;
  else if (patientAge < 18) ageFactor = 0.9; // Pediatric cases might be faster
  
  baseDuration *= ageFactor;
  
  // 4. Doctor experience factor: more experienced = might be slightly faster
  let experienceFactor = 1.0;
  if (doctorExperience > 15) experienceFactor = 0.95;
  else if (doctorExperience > 10) experienceFactor = 0.98;
  
  baseDuration *= experienceFactor;
  
  // 5. Severity multiplier
  let severityMultiplier = 1.0;
  if (parsed.severity === 'mild') severityMultiplier = 0.85;
  if (parsed.severity === 'severe') severityMultiplier = 1.25;
  
  baseDuration *= severityMultiplier;
  
  // Clamp to reasonable range: 10-180 minutes
  const finalDuration = Math.max(10, Math.min(180, Math.round(baseDuration)));
  
  return {
    duration: finalDuration,
    breakdown: {
      baseDuration: Math.round(baseDuration / complexityMultiplier / ageFactor / experienceFactor / severityMultiplier),
      complexity: complexityMultiplier,
      age: ageFactor,
      experience: experienceFactor,
      severity: severityMultiplier,
    },
    symptoms: parsed.symptoms,
    severity: parsed.severity,
    reasoning: generateReasoning(
      parsed.symptoms,
      parsed.severity,
      finalDuration,
      specialty,
      doctorExperience,
      patientAge
    ),
  };
}

/**
 * Generic duration calculation when no symptoms are matched
 */
function calculateGenericDuration(specialty, patientAge, doctorExperience) {
  const baseBySpecialty = {
    Cardiology: 30,
    Dermatology: 20,
    Orthopedics: 25,
    Neurology: 35,
    General: 20,
  };
  
  let duration = baseBySpecialty[specialty] || 20;
  
  // Age adjustments
  if (patientAge > 65) duration *= 1.2;
  else if (patientAge < 18) duration *= 0.9;
  
  // Experience adjustment
  if (doctorExperience > 15) duration *= 0.95;
  
  return {
    duration: Math.round(duration),
    breakdown: { base: Math.round(duration) },
    symptoms: [],
    severity: 'moderate',
    reasoning: `Standard ${specialty} consultation`,
  };
}

/**
 * Generate explanation for the predicted duration
 */
function generateReasoning(symptoms, severity, duration, specialty, doctorExperience, patientAge) {
  let reason = `${duration}-min ${specialty} consultation. `;
  
  if (symptoms.length > 0) {
    reason += `${severity.charAt(0).toUpperCase() + severity.slice(1)} ${symptoms.length === 1 ? 'symptom' : symptoms.length + ' symptoms'}: `;
    reason += symptoms.map(s => s.symptom).join(', ');
    reason += '. ';
  }
  
  if (patientAge > 65) reason += 'Senior patient (60+min factor). ';
  if (patientAge < 18) reason += 'Pediatric (faster assessment). ';
  if (doctorExperience > 15) reason += `Experienced doctor (${doctorExperience}y). `;
  
  return reason;
}

/**
 * Export severity levels for UI display
 */
export function getSeverityLevels() {
  return SEVERITY_LEVELS;
}

/**
 * Get symptoms for a specific specialty
 */
export function getSymptomsBySpecialty(specialty = 'General') {
  return Object.keys(SYMPTOM_DATABASE[specialty] || SYMPTOM_DATABASE.General);
}

export default {
  parseSymptomSeverity,
  calculateDurationFromSymptoms,
  getSeverityLevels,
  getSymptomsBySpecialty,
};
