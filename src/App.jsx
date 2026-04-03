import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/landingpage.jsx";
import Login from "./pages/login.jsx";
import SignupPage from "./pages/signup.jsx";
import PatientDashboard from "./pages/patientdashboard.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/patient-dashboard" element={<PatientDashboard />} />
      </Routes>
    </Router>
  );
}
<Route path="/doctor-dashboard" element={<DoctorDashboard />} />
export default App;