import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';  
import '../styles/login.css';

const Login = () => {
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBackToHome = () => navigate("/");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (isSignUp) {
      // Check if email already exists with a different role
      const { data: existingUsers } = await supabase.auth.admin.listUsers() || { data: [] };
      const existingUser = existingUsers?.find(u => u.email === email);
      
      if (existingUser?.user_metadata?.role && existingUser.user_metadata.role !== role) {
        setError(`This email is already registered as a ${existingUser.user_metadata.role}. Please login with that role instead.`);
        setLoading(false);
        return;
      }

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
      // Login: Check if role matches
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      // Verify that the user's registered role matches the role they're trying to login with
      const registeredRole = data.user?.user_metadata?.role;
      if (registeredRole && registeredRole !== role) {
        // Sign them out immediately
        await supabase.auth.signOut();
        setError(`This email is registered as a ${registeredRole}. Please select "${registeredRole}" to login.`);
        setLoading(false);
        return;
      }

      const savedRole = registeredRole || role;
      localStorage.setItem('userRole', savedRole);
      window.location.href = savedRole === 'doctor' ? '/doctor-dashboard' : '/patient-dashboard';
    }
    setLoading(false);
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

        ${role === 'doctor' ? `
          .auth-card__logo-text { color: #1E1B4B; }
          .auth-card__title { color: #1E1B4B; }
          .auth-card__subtitle { color: #6B7FBD; }
          .auth-input { border-color: rgba(99, 102, 241, 0.2); }
          .auth-input:focus { border-color: rgba(99, 102, 241, 0.5); box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
          .auth-footer-link { color: #6366F1; }
          .auth-error { background: #FEE2E2; color: #991B1B; }
        ` : `
          .auth-card__logo-text { color: #134E4A; }
          .auth-card__title { color: #134E4A; }
          .auth-card__subtitle { color: #4B7B76; }
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
        >
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