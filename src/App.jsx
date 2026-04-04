import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { SettingsProvider } from "./context/SettingsContext";

import LandingPage from "./pages/landingpage";
import LoginPage from "./pages/login";
import SignupPage from "./pages/signup";
import DoctorLogin from "./pages/DoctorLogin";
import DoctorDashboard from "./pages/doctordashboard";
import PatientDashboard from "./pages/patientdashboard";

// Initialize intelligent appointment prediction models
import { initializeConsultationModel } from "./services/appointmentPrediction";
import { initializeNoshowModel } from "./services/noshowPrediction";

export default function App() {
  // Initialize ML models on app startup
  useEffect(() => {
    const initModels = async () => {
      try {
        console.log('🚀 Initializing Intelligent Appointment System...');
        await Promise.all([
          initializeConsultationModel(),
          initializeNoshowModel(),
        ]);
        console.log('✓ Prediction models ready');
      } catch (err) {
        console.error('Error initializing prediction models:', err);
        // Continue anyway - models have fallbacks
      }
    };

    initModels();
  }, []);

  return (
    <SettingsProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/doctor-login" element={<DoctorLogin />} />
          <Route path="/doctordashboard" element={<DoctorDashboard />} />
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          <Route path="/patientdashboard" element={<PatientDashboard />} />
          <Route path="/patient-dashboard" element={<PatientDashboard />} />
          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </SettingsProvider>
  );
}