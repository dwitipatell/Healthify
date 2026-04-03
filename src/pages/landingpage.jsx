import { useState } from "react";
import Navbar from "./navbar";
import "../styles/global.css";
import "../styles/landingPage.css";

/* ── Get Started Modal ── */
function GetStartedModal({ onClose, onLogin }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="modal-back" onClick={onClose}>← Back</button>
        <div className="modal-title">Get started</div>
        <div className="modal-sub">Create your free patient account</div>
        <div className="modal-form-row">
          <div className="modal-form-group">
            <label className="modal-label">First name</label>
            <input className="modal-input" placeholder="Daksh" />
          </div>
          <div className="modal-form-group">
            <label className="modal-label">Last name</label>
            <input className="modal-input" placeholder="Patel" />
          </div>
        </div>
        <div className="modal-form-group">
          <label className="modal-label">Email address</label>
          <input className="modal-input" type="email" placeholder="you@email.com" />
        </div>
        <div className="modal-form-group">
          <label className="modal-label">Phone number</label>
          <input className="modal-input" type="tel" placeholder="+91 99999 00000" />
        </div>
        <div className="modal-form-group">
          <label className="modal-label">Password</label>
          <input className="modal-input" type="password" placeholder="••••••••" />
        </div>
        <button className="modal-submit">Create account</button>
        <div className="modal-signin">
          Already have an account?{" "}
          <span onClick={onLogin}>Sign in</span>
        </div>
      </div>
    </div>
  );
}

/* ── Hero Section ── */
function HeroSection({ onCTA }) {
  const stats = [
    { val: "50K+", label: "Appointments booked" },
    { val: "200+", label: "Hospitals onboard" },
    { val: "98%", label: "Patient satisfaction" },
  ];

  const appointments = [
    { name: "Dr. Priya Sharma", dept: "Cardiology", time: "Today, 10:30 AM", avatar: "PS", color: "#0D9488", dotColor: "#10B981" },
    { name: "Dr. Rohan Mehta", dept: "Orthopedics", time: "Tomorrow, 2:00 PM", avatar: "RM", color: "#6366F1", dotColor: "#D1FAE5" },
    { name: "Dr. Anjali Nair", dept: "Dermatology", time: "Apr 7, 11:00 AM", avatar: "AN", color: "#F59E0B", dotColor: "#D1FAE5" },
  ];

  return (
    <section className="hero">
      <div className="hero__blob-top" />
      <div className="hero__blob-bottom" />

      <div className="hero__grid">
        {/* Left column */}
        <div>
          <div className="hero__badge">
            <div className="hero__badge-dot" />
            <span className="hero__badge-text">Smart Healthcare Scheduling</span>
          </div>

          <h1 className="hero__title">
            Book smarter,<br />
            <span>heal faster.</span>
          </h1>

          <p className="hero__desc">
            Healthify connects patients with the right doctors at the right time — no waiting, no
            confusion. Smart scheduling for modern hospitals.
          </p>

          <div className="hero__cta-group">
            <button onClick={onCTA} className="hero__cta-primary">
              Book an Appointment →
            </button>
            <button onClick={onCTA} className="hero__cta-secondary">
              Doctor Portal
            </button>
          </div>

          <div className="hero__stats">
            {stats.map((s) => (
              <div key={s.val}>
                <p className="hero__stat-val">{s.val}</p>
                <p className="hero__stat-label">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right column – dashboard card */}
        <div className="hero__card-wrap">
          <div className="hero__card">
            <div className="hero__card-header">
              <p className="hero__card-title">Your Appointments</p>
              <span className="hero__card-badge">3 upcoming</span>
            </div>

            {appointments.map((appt, i) => (
              <div key={i} className="appt-row">
                <div
                  className="appt-avatar"
                  style={{ background: appt.color + "20", color: appt.color }}
                >
                  {appt.avatar}
                </div>
                <div className="appt-info">
                  <p className="appt-name">{appt.name}</p>
                  <p className="appt-meta">
                    {appt.dept} · {appt.time}
                  </p>
                </div>
                <div className="appt-dot" style={{ background: appt.dotColor }} />
              </div>
            ))}

            <button onClick={onCTA} className="hero__card-add-btn">
              + Schedule new appointment
            </button>
          </div>

          {/* Floating badge – confirmed */}
          <div className="hero__float-badge hero__float-badge--top">
            <div className="hero__float-inner">
              <div className="hero__float-icon" style={{ background: "#D1FAE5" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12l2 2 4-4" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <p className="hero__float-label">Confirmed!</p>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#4B7B76", margin: 0 }}>
                  Reminder sent via SMS
                </p>
              </div>
            </div>
          </div>

          {/* Floating badge – wait time */}
          <div className="hero__float-badge hero__float-badge--bottom">
            <div className="hero__float-inner">
              <div className="hero__float-icon" style={{ background: "#EEF2FF" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="#6366F1" strokeWidth="2" />
                  <path d="M12 7v5l3 3" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <p className="hero__float-label">avg. wait time</p>
                <p className="hero__float-value" style={{ color: "#6366F1" }}>~6 min</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Features Section ── */
function FeaturesSection() {
  const features = [
    { icon: "📅", title: "Smart Scheduling", desc: "AI-powered slot suggestions based on doctor availability and patient history.", color: "#CCFBF1" },
    { icon: "🔔", title: "Reminders & Alerts", desc: "Automated SMS and in-app reminders to reduce no-shows by up to 60%.", color: "#EEF2FF" },
    { icon: "👨‍⚕️", title: "Doctor Dashboard", desc: "Manage daily schedules, patient queue, and medical notes from one screen.", color: "#FEF3C7" },
    { icon: "📊", title: "Hospital Analytics", desc: "Real-time insights on bed occupancy, appointment trends, and staff load.", color: "#FCE7F3" },
  ];

  return (
    <section className="features">
      <div className="features__inner">
        <p className="section-eyebrow">Why Healthify</p>
        <h2 className="section-heading">Everything your hospital needs</h2>
        <div className="features__grid">
          {features.map((f, i) => (
            <div key={i} className="feature-card" style={{ background: f.color }}>
              <div className="feature-card__icon">{f.icon}</div>
              <h3 className="feature-card__title">{f.title}</h3>
              <p className="feature-card__desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── How It Works ── */
function HowItWorks({ onCTA }) {
  const steps = [
    { num: "01", title: "Create your account", desc: "Sign up as a patient or doctor. Hospitals can onboard their entire team in minutes." },
    { num: "02", title: "Find & book a slot", desc: "Browse available doctors by specialty, check real-time slots, and book instantly." },
    { num: "03", title: "Show up & get care", desc: "Get reminded, check in digitally, and receive a complete visit summary after." },
  ];

  return (
    <section className="how-it-works">
      <div className="how-it-works__inner">
        <p className="section-eyebrow">Simple Process</p>
        <h2 className="section-heading">Up and running in 3 steps</h2>

        <div className="how-it-works__grid">
          {steps.map((s, i) => (
            <div key={i} className="step">
              <div className="step__inner">
                <span className="step__num">{s.num}</span>
                <div className="step__content">
                  <h3 className="step__title">{s.title}</h3>
                  <p className="step__desc">{s.desc}</p>
                </div>
              </div>
              {i < 2 && <div className="step__divider" />}
            </div>
          ))}
        </div>

        <div className="how-it-works__cta">
          <button onClick={onCTA} className="btn-cta">
            Get started for free →
          </button>
        </div>
      </div>
    </section>
  );
}

/* ── Footer ── */
function Footer({ onLogin }) {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div>
          <span className="footer__brand-name">
            Health<span>ify</span>
          </span>
          <p className="footer__tagline">Smart appointment scheduling for hospitals</p>
        </div>
        <div className="footer__links">
          {["Privacy Policy", "Terms of Service", "Contact"].map((l) => (
            <a key={l} href="#" className="footer__link">{l}</a>
          ))}
        </div>
        <button onClick={onLogin} className="footer__signin">Sign In</button>
      </div>
    </footer>
  );
}

/* ── Page Entry ── */
export default function LandingPage({ onLogin, onSignup }) {
  const [showModal, setShowModal] = useState(false);

  const handleCTA = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  return (
    <div>
      <Navbar onLogin={onLogin} onSignup={handleCTA} />
      <HeroSection onCTA={handleCTA} />
      <FeaturesSection />
      <HowItWorks onCTA={handleCTA} />
      <Footer onLogin={onLogin} />

      {showModal && (
        <GetStartedModal onClose={handleClose} onLogin={onLogin} />
      )}
    </div>
  );
}