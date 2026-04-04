<<<<<<< HEAD
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './services/supabase';
import Login from './pages/login';
import PatientDashboard from './pages/patientdashboard';
import DoctorDashboard from './pages/doctordashboard';
import AppointmentCalendar from './components/AppointmentCalendar';
import './App.css';

// ── Protect routes: redirect to /login if not authenticated ──
const PrivateRoute = ({ children }) => {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => listener.subscription.unsubscribe();
  }, []);

  if (session === undefined) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', fontFamily:'sans-serif', color:'#888' }}>Loading…</div>;
  return session ? children : <Navigate to="/login" replace />;
};

// ── Auto-redirect from / based on saved role ──
const RoleRedirect = () => {
  const role = localStorage.getItem('userRole'); // 'patient' or 'doctor'
  if (role === 'doctor')  return <Navigate to="/doctor-dashboard"  replace />;
  if (role === 'patient') return <Navigate to="/patient-dashboard" replace />;
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    // <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RoleRedirect />} />
        <Route
          path="/patient-dashboard"
          element={
            <PrivateRoute>
              <PatientDashboard />
            </PrivateRoute>
          }
        />
        {/* Doctor dashboard */}
        <Route
          path="/doctor-dashboard"
          element={
            <PrivateRoute>
              <DoctorDashboard />
            </PrivateRoute>
          }
        />
        {/* Calendar (shared component) */}
        <Route
          path="/calendar"
          element={
            <PrivateRoute>
              <AppointmentCalendar />
            </PrivateRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    // </BrowserRouter>
  );
}

export default App;
=======
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
>>>>>>> 4f68ca780b03aab9907770c835736ccd5115bf63
