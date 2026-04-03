import { useState } from 'react';
import { supabase } from '../services/supabase';
import '../styles/login.css';

const Login = ({ onBack }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (isSignUp) {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, role, phone } },
      });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }
      localStorage.setItem('userRole', role);
      window.location.href = role === 'doctor' ? '/doctor-dashboard' : '/patient-dashboard';
    } else {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }
      const savedRole = data.user?.user_metadata?.role || role;
      localStorage.setItem('userRole', savedRole);
      window.location.href = savedRole === 'doctor' ? '/doctor-dashboard' : '/patient-dashboard';
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      {/* Light subtle dashboard preview background */}
      <div className="auth-page-bg-preview"></div>

      <div className="auth-card">
        {/* Back Button - Fixed & Prominent */}
        <button className="login-back-btn" onClick={onBack || (() => window.location.href = '/')}>
          ← Back to Home
        </button>

        <div className="auth-card__header">
          <div className="auth-card__logo-icon">
            <span style={{ fontSize: '22px' }}>🟢</span>
          </div>
          <span className="auth-card__logo-text">Healthify</span>
        </div>

        <h2 className="auth-card__title">Welcome Back</h2>
        <p className="auth-card__subtitle">Sign in to your portal</p>

        <div className="role-toggle">
          <button
            type="button"
            className={`role-toggle__btn ${role === 'patient' ? 'role-toggle__btn--active-patient' : ''}`}
            onClick={() => setRole('patient')}
          >
            👤 Patient
          </button>
          <button
            type="button"
            className={`role-toggle__btn ${role === 'doctor' ? 'role-toggle__btn--active-doctor' : ''}`}
            onClick={() => setRole('doctor')}
          >
            👨‍⚕️ Doctor
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {isSignUp && (
            <>
              <input
                type="text"
                placeholder={role === 'doctor' ? "Dr. Priya Mehta" : "Full Name"}
                className="auth-input"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
              />
              <input
                type="tel"
                placeholder="+91 98765 43210"
                className="auth-input"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </>
          )}

          <input
            type="email"
            placeholder="you@example.com"
            className="auth-input"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="••••••••"
            className="auth-input"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          {error && <div className="auth-error">{error}</div>}

          <button
            type="submit"
            className={role === 'doctor' ? 'auth-submit-doctor' : 'auth-submit-patient'}
            disabled={loading}
          >
            {loading ? 'Signing in...' : isSignUp ? 'Create Account →' : 'Sign In →'}
          </button>
        </form>

        <p className="auth-footer-text">
          {isSignUp ? "Already have an account? " : "Don't have an account? "}
          <span
            className="auth-footer-link"
            onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;