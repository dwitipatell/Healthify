import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
<<<<<<< HEAD
import { supabase } from '../services/supabase';
=======
import { supabase } from '../services/supabase';  
>>>>>>> 4f68ca780b03aab9907770c835736ccd5115bf63
import '../styles/login.css';

const Login = () => {
  const navigate = useNavigate();
<<<<<<< HEAD
  const [isSignUp, setIsSignUp]   = useState(false);
  const [role, setRole]           = useState('patient');   // 'patient' | 'doctor'
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [fullName, setFullName]   = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
=======

  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBackToHome = () => navigate("/");
>>>>>>> 4f68ca780b03aab9907770c835736ccd5115bf63

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (isSignUp) {
<<<<<<< HEAD
      // ── SIGN UP ──
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role },   // store role in user metadata
        },
      });

      if (signUpError) { setError(signUpError.message); setLoading(false); return; }

      // Optionally insert into a 'profiles' table
      // await supabase.from('profiles').insert({ id: data.user.id, role, full_name: fullName });

      localStorage.setItem('userRole', role);
      navigate(role === 'doctor' ? '/doctor-dashboard' : '/patient-dashboard');

    } else {
      // ── SIGN IN ──
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) { setError(signInError.message); setLoading(false); return; }

      // Read role from metadata (set at signup) or fallback to selected radio
      const savedRole = data.user?.user_metadata?.role || role;
      localStorage.setItem('userRole', savedRole);
      navigate(savedRole === 'doctor' ? '/doctor-dashboard' : '/patient-dashboard');
    }

=======
      // Signup attempt
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
>>>>>>> 4f68ca780b03aab9907770c835736ccd5115bf63
    setLoading(false);
  };

  return (
<<<<<<< HEAD
    <div className="login-page">
      <div className="login-card">

        {/* Logo */}
        <div className="login-logo">
          <span className="login-logo-icon">🏥</span>
          <div>
            <div className="login-logo-name">Healthify</div>
            <div className="login-logo-sub">Smart Appointment Scheduling</div>
          </div>
        </div>

        <h2 className="login-title">{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
        <p className="login-sub">{isSignUp ? 'Sign up to get started' : 'Sign in to your portal'}</p>

        {/* ── ROLE SELECTOR ── */}
        <div className="role-selector">
          <button
            type="button"
            className={`role-btn ${role === 'patient' ? 'role-active-patient' : ''}`}
            onClick={() => setRole('patient')}
          >
            🧑‍⚕️ I'm a Patient
          </button>
          <button
            type="button"
            className={`role-btn ${role === 'doctor' ? 'role-active-doctor' : ''}`}
            onClick={() => setRole('doctor')}
          >
            👨‍⚕️ I'm a Doctor
          </button>
        </div>

        {/* ── FORM ── */}
        <form onSubmit={handleSubmit} className="login-form">
          {isSignUp && (
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder={role === 'doctor' ? 'Dr. Priya Mehta' : 'Rahul Shah'}
=======
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
>>>>>>> 4f68ca780b03aab9907770c835736ccd5115bf63
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
              />
<<<<<<< HEAD
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button
            type="submit"
            className={`login-submit-btn ${role === 'doctor' ? 'btn-doctor' : 'btn-patient'}`}
            disabled={loading}
          >
            {loading ? 'Please wait…' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <p className="login-toggle">
          {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          <span onClick={() => { setIsSignUp(!isSignUp); setError(''); }}>
=======
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
>>>>>>> 4f68ca780b03aab9907770c835736ccd5115bf63
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;