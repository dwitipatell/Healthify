import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./pages/landingpage";
import LoginPage from "./pages/login";
import SignupPage from "./pages/signup";
import DoctorDashboard from "./pages/doctordashboard";
import PatientDashboard from "./pages/patientdashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/doctordashboard" element={<DoctorDashboard />} />
        <Route path="/patientdashboard" element={<PatientDashboard />} />


        {/* Optional: redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}