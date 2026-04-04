import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import "../styles/global.css";
import "../styles/login.css";
import "../styles/signup.css";

const BENEFITS = [
  "Book appointments in under 60 seconds",
  "Automated reminders — never miss a visit",
  "Access your full medical history anytime",
];

export default function SignupPage() {
  const navigate = useNavigate();

  const [role, setRole] = useState("patient");
  const [fullName, setFullName] = useState("");
  const [license, setLicense] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isDoctor = role === "doctor";

  const handleBackToHome = () => navigate("/");
  const handleGoToLogin = () => navigate("/login");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
            ...(isDoctor && license ? { license } : {}),
          },
        },
      });

      if (signUpError) {
        // If error is about existing user, check their role
        if (signUpError.message?.includes("already registered")) {
          setError("This email is already registered. Please try logging in instead.");
        } else {
          setError(signUpError.message);
        }
        setLoading(false);
        return;
      }

      localStorage.setItem("userRole", role);
      window.location.href = isDoctor ? "/doctor-dashboard" : "/patient-dashboard";
    } catch (err) {
      setError("Something went wrong. Please check your connection and try again.");
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Blurred Dashboard Background */}
      <div className="auth-bg">
        <div className="auth-bg-dashboard" />
      </div>

      <style>{`
        .auth-card {
          background: rgba(255, 255, 255, 0.88);
          border: 1.5px solid rgba(255, 255, 255, 0.6);
        }

        .role-toggle__btn--active-doctor {
          background: #6366F1 !important;
          color: white !important;
          border-color: #6366F1 !important;
        }

        .auth-submit-doctor {
          background: #6366F1 !important;
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.35) !important;
        }

        .auth-submit-doctor:hover {
          background: #4F46E5 !important;
        }

        ${isDoctor ? `
          .auth-card__logo-text { color: #1E1B4B; }
          .auth-card__title { color: #1E1B4B; }
          .auth-card__subtitle { color: #6B7FBD; }
          .signup-benefit { color: #6B7FBD; }
          .signup-benefit__icon { background: #EEF2FF; }
          .signup-benefit__icon svg path { stroke: #6366F1; }
          .auth-input { border-color: rgba(99, 102, 241, 0.2); }
          .auth-input:focus { border-color: rgba(99, 102, 241, 0.5); box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
          .auth-footer-link { color: #6366F1; }
          .auth-error { background: #FEE2E2; color: #991B1B; }
        ` : `
          .auth-card__logo-text { color: #134E4A; }
          .auth-card__title { color: #134E4A; }
          .auth-card__subtitle { color: #4B7B76; }
          .signup-benefit { color: #4B7B76; }
          .signup-benefit__icon { background: #CCFBF1; }
          .signup-benefit__icon svg path { stroke: #0D9488; }
          .auth-input { border-color: rgba(13, 148, 136, 0.2); }
          .auth-input:focus { border-color: rgba(13, 148, 136, 0.5); box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1); }
          .auth-footer-link { color: #0D9488; }
        `}
      `}</style>

      <div className="auth-card">

        {/* Back Button */}
        <button
          className="login-back-btn"
          onClick={handleBackToHome}
          type="button"
        >
          ← Back to Home
        </button>

        {/* Brand */}
        <div className="auth-card__header">
          <div className="auth-card__logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="4" fill="white" opacity=".2" />
              <path d="M12 8v8M8 12h8" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
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
          {[
            ["patient", "Patient"],
            ["doctor", "Doctor / Staff"],
          ].map(([val, label]) => (
            <button
              key={val}
              type="button"
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
        <form className="auth-form" onSubmit={handleSubmit}>
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
            placeholder="Password (min. 6 characters)"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />

          {error && <div className="auth-error">{error}</div>}

          <button
            type="submit"
            className={isDoctor ? "auth-submit-doctor" : "auth-submit-patient"}
            disabled={loading}
          >
            {loading ? "Creating account…" : "Create Account →"}
          </button>
        </form>

        <p className="signup-terms">
          By signing up you agree to our{" "}
          <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
        </p>

        <p className="auth-footer-text">
          Already have an account?{" "}
          <span className="auth-footer-link" onClick={handleGoToLogin}>
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
}