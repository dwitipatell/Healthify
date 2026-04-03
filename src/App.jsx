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
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Root → role redirect */}
        <Route path="/" element={<RoleRedirect />} />

        {/* Patient dashboard */}
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