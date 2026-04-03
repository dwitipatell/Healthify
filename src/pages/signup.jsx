import { useState } from "react";
import "../components/Global.css";
import "../styles/login.css";   // shared auth styles
import "../styles/signup.css";  // signup-specific additions

const BENEFITS = [
  "Book appointments in under 60 seconds",
  "Automated reminders — never miss a visit",
  "Access your full medical history anytime",
];

export default function SignupPage({ onSwitchToLogin }) {
  const [role, setRole] = useState("patient");

  const isDoctor = role === "doctor";

  return (
    <div className="auth-page">
      <div className="auth-card">
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

        {/* Role toggle */}
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
            placeholder="Full name"
            type="text"
            className="auth-input"
          />

          {isDoctor && (
            <input
              placeholder="Medical license / Hospital ID"
              type="text"
              className="auth-input"
            />
          )}

          <input
            placeholder="Email address"
            type="email"
            className="auth-input"
          />
          <input
            placeholder="Password"
            type="password"
            className="auth-input"
          />

          <button className={isDoctor ? "auth-submit-doctor" : "auth-submit-patient"}>
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