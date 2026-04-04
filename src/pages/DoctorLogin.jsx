import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import '../styles/login.css';

const DoctorLogin = () => {
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [specialty, setSpecialty] = useState('Cardiology');
  const [hospital, setHospital] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBackToHome = () => navigate("/");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        // Validation for signup
        if (!fullName || !licenseNumber || !hospital || !yearsOfExperience) {
          setError('Please fill in all doctor details');
          setLoading(false);
          return;
        }

        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: 'doctor',
              phone,
              license_number: licenseNumber,
              specialty,
              hospital,
              years_of_experience: yearsOfExperience,
            },
          },
        });

        if (signUpError) {
          setError(signUpError.message);
          setLoading(false);
          return;
        }

        // Also create doctor profile in doctors table
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('doctors').insert({
            id: user.id,
            full_name: fullName,
            email,
            phone,
            specialty,
            hospital,
            license_number: licenseNumber,
            years_of_experience: parseInt(yearsOfExperience),
            status: 'active',
          });
        }

        localStorage.setItem('userRole', 'doctor');
        navigate('/doctor-dashboard');
      } else {
        // Login
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message);
          setLoading(false);
          return;
        }

        // Verify role is doctor
        const registeredRole = data.user?.user_metadata?.role;
        if (registeredRole && registeredRole !== 'doctor') {
          await supabase.auth.signOut();
          setError('This email is not registered as a doctor. Please use your doctor credentials.');
          setLoading(false);
          return;
        }

        localStorage.setItem('userRole', 'doctor');
        navigate('/doctor-dashboard');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    }

    setLoading(false);
  };

  const SPECIALTIES = [
    'Cardiology',
    'Dermatology',
    'Orthopedics',
    'Neurology',
    'Pediatrics',
    'General Practice',
    'Psychiatry',
    'ENT',
    'Ophthalmology',
    'Gynecology',
  ];

  return (
    <div className="auth-page doctor-auth-page">
      {/* Blurred Dashboard Background */}
      <div className="auth-bg">
        <div className="auth-bg-dashboard doctor-bg" />
      </div>

      <style>{`
        .doctor-auth-page {
          background: linear-gradient(135deg, #E0E7FF 0%, #F0F9FF 100%);
        }

        .auth-card.doctor-card {
          background: rgba(255, 255, 255, 0.95);
          border: 1.5px solid rgba(99, 102, 241, 0.2);
          box-shadow: 0 20px 60px rgba(99, 102, 241, 0.1);
          max-width: 520px;
        }

        .doctor-auth-page .auth-card__logo-icon {
          background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
        }

        .doctor-auth-page .auth-card__logo-text {
          color: #1E1B4B;
        }

        .doctor-auth-page .auth-card__title {
          color: #1E1B4B;
          font-weight: 700;
        }

        .doctor-auth-page .auth-card__subtitle {
          color: #6B7FBD;
        }

        .doctor-auth-page .auth-input {
          border-color: rgba(99, 102, 241, 0.2);
          background: rgba(99, 102, 241, 0.02);
        }

        .doctor-auth-page .auth-input:focus {
          border-color: #6366F1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
          background: white;
        }

        .doctor-auth-page .auth-submit {
          background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
          color: white;
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.35);
        }

        .doctor-auth-page .auth-submit:hover:not(:disabled) {
          background: linear-gradient(135deg, #4F46E5 0%, #4338CA 100%);
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(99, 102, 241, 0.45);
        }

        .doctor-auth-page .auth-footer-link {
          color: #6366F1;
        }

        .doctor-auth-page .auth-footer-link:hover {
          color: #4F46E5;
        }

        .doctor-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .doctor-form-full {
          grid-column: 1 / -1;
        }

        .doctor-form-section {
          margin-bottom: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(99, 102, 241, 0.1);
        }

        .doctor-form-section:last-of-type {
          border-bottom: none;
        }

        .form-section-title {
          font-size: 11px;
          font-weight: 700;
          color: #6B7FBD;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 10px;
        }

        .doctor-auth-page select {
          width: 100%;
          padding: 10px 12px;
          border: 1.5px solid rgba(99, 102, 241, 0.2);
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          background: rgba(99, 102, 241, 0.02);
          color: #1E1B4B;
          cursor: pointer;
          transition: all 0.2s;
        }

        .doctor-auth-page select:focus {
          outline: none;
          border-color: #6366F1;
          background: white;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .doctor-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #EEF2FF;
          color: #6366F1;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .doctor-signup-note {
          background: #DBEAFE;
          border-left: 3px solid #3B82F6;
          padding: 12px;
          border-radius: 6px;
          font-size: 12px;
          color: #1E40AF;
          margin-bottom: 16px;
        }

        .toggle-mode {
          text-align: center;
          font-size: 13px;
          color: #4B7B76;
          margin-top: 16px;
        }

        .toggle-mode button {
          background: none;
          border: none;
          color: #6366F1;
          font-weight: 600;
          cursor: pointer;
          text-decoration: underline;
        }

        .toggle-mode button:hover {
          color: #4F46E5;
        }

        @media (max-width: 600px) {
          .doctor-form-grid {
            grid-template-columns: 1fr;
          }

          .doctor-form-full {
            grid-column: 1;
          }

          .auth-card.doctor-card {
            margin: 20px;
            max-width: none;
          }
        }
      `}</style>

      <div className="auth-card doctor-card">
        {/* Back Button */}
        <button className="login-back-btn" onClick={handleBackToHome}>
          ← Back to Home
        </button>

        {/* Header */}
        <div className="auth-card__header">
          <div className="auth-card__logo-icon" style={{ fontSize: '22px' }}>
            👨‍⚕️
          </div>
          <span className="auth-card__logo-text">Healthify</span>
        </div>

        <h2 className="auth-card__title">Doctor Portal</h2>
        <p className="auth-card__subtitle">
          {isSignUp ? 'Create your professional account' : 'Welcome back, Doctor'}
        </p>

        {/* Badge */}
        <div className="doctor-badge">🔐 Secure Medical Professional Portal</div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {isSignUp && (
            <>
              <div className="doctor-signup-note">
                ℹ️ Please provide accurate medical credentials. Your information will be verified before account activation.
              </div>

              <div className="doctor-form-section">
                <div className="form-section-title">Personal Information</div>
                <div className="doctor-form-grid">
                  <input
                    type="text"
                    placeholder="Dr. [Full Name]"
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
                </div>
              </div>

              <div className="doctor-form-section">
                <div className="form-section-title">Medical Credentials</div>
                <div className="doctor-form-grid">
                  <input
                    type="text"
                    placeholder="Medical License Number"
                    className="auth-input"
                    value={licenseNumber}
                    onChange={e => setLicenseNumber(e.target.value)}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Years of Experience"
                    className="auth-input"
                    value={yearsOfExperience}
                    onChange={e => setYearsOfExperience(e.target.value)}
                    min="0"
                    max="70"
                    required
                  />
                  <select
                    value={specialty}
                    onChange={e => setSpecialty(e.target.value)}
                    className="doctor-form-full"
                  >
                    <option value="">Select Specialty</option>
                    {SPECIALTIES.map(spec => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Hospital / Clinic Name"
                    className="auth-input doctor-form-full"
                    value={hospital}
                    onChange={e => setHospital(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="doctor-form-section">
                <div className="form-section-title">Login Credentials</div>
                <div className="doctor-form-grid doctor-form-full">
                  <input
                    type="email"
                    placeholder="Professional Email"
                    className="auth-input doctor-form-full"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                  <input
                    type="password"
                    placeholder="Create a strong password"
                    className="auth-input doctor-form-full"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </>
          )}

          {!isSignUp && (
            <>
              <input
                type="email"
                placeholder="your@hospitalemail.com"
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
            </>
          )}

          {error && <div className="auth-error">{error}</div>}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
            style={{
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? (
              <>
                <span style={{ animation: 'spin 0.6s linear infinite', display: 'inline-block' }}>
                  ⚙️
                </span>
                {' '}
                {isSignUp ? 'Creating Account...' : 'Signing In...'}
              </>
            ) : isSignUp ? (
              '✓ Create Doctor Account'
            ) : (
              '🔓 Doctor Login'
            )}
          </button>
        </form>

        {/* Toggle Sign Up / Login */}
        <div className="toggle-mode">
          {isSignUp ? (
            <>
              Already have an account?{' '}
              <button onClick={() => { setIsSignUp(false); setError(''); }}>
                Sign In
              </button>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <button onClick={() => { setIsSignUp(true); setError(''); }}>
                Register Here
              </button>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default DoctorLogin;
