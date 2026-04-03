import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import '../styles/login.css';

const Login = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp]   = useState(false);
  const [role, setRole]           = useState('patient');   // 'patient' | 'doctor'
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [fullName, setFullName]   = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (isSignUp) {
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

    setLoading(false);
  };

  return (
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
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
              />
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
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;