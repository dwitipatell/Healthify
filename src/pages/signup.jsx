import { useState } from "react";
import "../styles/global.css";
import "../styles/login.css";   // shared auth styles
import "../styles/signup.css";  // signup-specific additions

const BENEFITS = [
  "Book appointments in under 60 seconds",
  "Automated reminders — never miss a visit",
  "Access your full medical history anytime",
];

export default function SignupPage({ onSwitchToLogin, onBack }) {
  const [role, setRole] = useState("patient");
  const [fullName, setFullName] = useState("");
  const [license, setLicense] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isDoctor = role === "doctor";

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* Back Button - Consistent with Login page */}
        <button className="login-back-btn" onClick={onBack}>
          ← Back to Home
        </button>

        {/* Brand */}
        <div className="auth-card__header">
          <div className="auth-card__logo-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2a10 10 0 100 20A10 10 0 0012 2z" fill="white" opacity=".2" />
              <path d="M8 12h8M12 8v8" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span className="auth-card__logo-text">Healthify</span>
        </div>

        <h1 className="auth-card__title">Create your account</h1>
        <p className="auth-card__subtitle">Join 50,000+ patients and 200+ hospitals today</p>

        {/* Benefits */}
        <ul className="signup-benefits">
          {BENEFITS.map((b) => (
            <li key={b} className="signup-benefit">
              <div className="signup-benefit__icon">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="#0D9488" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              {b}
            </li>
          ))}
        </ul>

        {/* Role Toggle */}
        <div className="role-toggle">
          {[["patient", "Patient"], ["doctor", "Doctor / Staff"]].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setRole(val)}
              className={`role-toggle__btn ${
                role === val
                  ? val === "doctor"
                    ? "role-toggle__btn--active-doctor"
                    : "role-toggle__btn--active-patient"
                  : ""
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="auth-form">
          <input
            type="text"
            placeholder={isDoctor ? "Dr. Priya Mehta" : "Full Name"}
            className="auth-input"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          {isDoctor && (
            <input
              type="text"
              placeholder="Medical license / Hospital ID"
              className="auth-input"
              value={license}
              onChange={(e) => setLicense(e.target.value)}
              required
            />
          )}

          <input
            type="email"
            placeholder="Email address"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button 
            className={isDoctor ? "auth-submit-doctor" : "auth-submit-patient"}
            type="button"   // Change to "submit" when you connect to Supabase
          >
            Create Account →
          </button>
        </div>

        <p className="signup-terms">
          By signing up you agree to our{" "}
          <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
        </p>

        <p className="auth-footer-text">
          Already have an account?{" "}
          <span className="auth-footer-link" onClick={onSwitchToLogin}>
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
}