import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import '../styles/patientDashboard.css';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [activeNav, setActiveNav] = useState('dashboard');

  // ---------- mock data (replace with real Supabase queries later) ----------
  const mockAppointments = [
    { id: 1, doctor: 'Dr. Priya Mehta', specialty: 'Cardiology', clinic: 'Apollo Clinic', date: 'Today', time: '2:30 PM', status: 'confirmed' },
    { id: 2, doctor: 'Dr. Suresh Iyer', specialty: 'Dermatology', clinic: 'Skin Care Hub', date: 'Mon', time: '10:00 AM', status: 'pending' },
    { id: 3, doctor: 'Dr. Anita Roy', specialty: 'General Physician', clinic: 'City Health', date: 'Wed', time: '4:00 PM', status: 'confirmed' },
  ];
  const mockNotifs = [
    { id: 1, text: 'Reminder: Appointment with Dr. Mehta at 2:30 PM today', time: '10 min ago', color: '#3B7DD8' },
    { id: 2, text: 'Prescription refill due: Metformin 500mg', time: 'Yesterday', color: '#F0A500' },
    { id: 3, text: 'Lab report ready: Blood test (CBC)', time: '2 days ago', color: '#3CB55A' },
  ];
  const mockPastVisits = [
    { date: 'Mar 18, 2026', doctor: 'Dr. Priya Mehta', type: 'Follow-up · Cardiology' },
    { date: 'Mar 5, 2026', doctor: 'Dr. Suresh Iyer', type: 'Consultation · Derma' },
    { date: 'Feb 20, 2026', doctor: 'Dr. Anita Roy', type: 'Check-up · General' },
  ];
  // -------------------------------------------------------------------------

  useEffect(() => {
    // Get logged-in user from Supabase
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login'); return; }
      setUser(user);
    };
    getUser();

    // SUPABASE: fetch real appointments
    // const fetchAppointments = async () => {
    //   const { data, error } = await supabase
    //     .from('appointments')
    //     .select('*, doctors(name, specialty)')
    //     .eq('patient_id', user.id)
    //     .gte('date', new Date().toISOString())
    //     .order('date', { ascending: true });
    //   if (!error) setAppointments(data);
    // };

    setAppointments(mockAppointments);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { key: 'dashboard', icon: '🏠', label: 'Dashboard' },
    { key: 'book', icon: '📅', label: 'Book Appointment' },
    { key: 'appointments', icon: '📋', label: 'My Appointments' },
    { key: 'records', icon: '📁', label: 'Health Records' },
    { key: 'prescriptions', icon: '💊', label: 'Prescriptions' },
    { key: 'notifications', icon: '🔔', label: 'Notifications', badge: 3 },
    { key: 'settings', icon: '⚙️', label: 'Settings' },
  ];

  const nextAppt = mockAppointments[0];

  return (
    <div className="pd-layout">
      {/* ── SIDEBAR ── */}
      <aside className="pd-sidebar">
        <div className="pd-logo">
          <span className="pd-logo-icon">🏥</span>
          <div>
            <div className="pd-logo-text">MediBook</div>
            <div className="pd-logo-sub">Patient Portal</div>
          </div>
        </div>

        <nav className="pd-nav">
          {navItems.map(item => (
            <div
              key={item.key}
              className={`pd-nav-item ${activeNav === item.key ? 'active' : ''}`}
              onClick={() => setActiveNav(item.key)}
            >
              <span className="pd-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge && <span className="pd-nav-badge">{item.badge}</span>}
            </div>
          ))}
        </nav>

        <div className="pd-sidebar-footer">
          <div className="pd-user-chip">
            <div className="pd-avatar">
              {user?.email?.slice(0, 2).toUpperCase() || 'RS'}
            </div>
            <div>
              <div className="pd-user-name">{user?.user_metadata?.full_name || 'Patient'}</div>
              <div className="pd-user-role">{user?.email || ''}</div>
            </div>
          </div>
          <button className="pd-signout-btn" onClick={handleSignOut}>Sign out</button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="pd-main">
        {/* Header */}
        <div className="pd-header">
          <div>
            <h1 className="pd-greeting">Good Morning 👋</h1>
            <p className="pd-greeting-sub">Friday, 3 Apr 2026 · Your next appointment is today</p>
          </div>
          <button className="pd-primary-btn" onClick={() => setActiveNav('book')}>
            + Book Appointment
          </button>
        </div>

        {/* Stats */}
        <div className="pd-stats">
          {[
            { icon: '📅', label: 'Upcoming', value: '2', badge: 'This week', badgeClass: 'blue' },
            { icon: '✅', label: 'Completed', value: '14', badge: 'All time', badgeClass: 'green' },
            { icon: '💊', label: 'Active Rx', value: '3', badge: '1 refill due', badgeClass: 'amber' },
          ].map((s, i) => (
            <div className="pd-stat-card" key={i}>
              <span className="pd-stat-icon">{s.icon}</span>
              <div className="pd-stat-label">{s.label}</div>
              <div className="pd-stat-value">{s.value}</div>
              <span className={`pd-badge pd-badge-${s.badgeClass}`}>{s.badge}</span>
            </div>
          ))}
        </div>

        {/* Next Appointment Hero */}
        <div className="pd-hero">
          <div className="pd-hero-deco1"></div>
          <div className="pd-hero-deco2"></div>
          <div className="pd-hero-label">Next Appointment</div>
          <div className="pd-hero-title">{nextAppt.doctor} — {nextAppt.specialty}</div>
          <div className="pd-hero-sub">{nextAppt.clinic} · Floor 3, Room 12</div>
          <div className="pd-hero-meta">
            <span>🕐 {nextAppt.date}, {nextAppt.time}</span>
            <span>⏱ 30 min</span>
            <span>📍 In-person</span>
          </div>
          <div className="pd-hero-actions">
            <button className="pd-hero-btn-solid">View Details</button>
            <button className="pd-hero-btn-outline">Reschedule</button>
            <button className="pd-hero-btn-outline">Cancel</button>
          </div>
        </div>

        {/* Two Column */}
        <div className="pd-two-col">
          {/* Upcoming Appointments */}
          <div className="pd-card">
            <div className="pd-card-header">
              <span className="pd-card-title">Upcoming Appointments</span>
              <span className="pd-card-link">View all →</span>
            </div>
            {mockAppointments.map(appt => (
              <div className="pd-appt-row" key={appt.id}>
                <div className="pd-appt-time">{appt.date}<br />{appt.time}</div>
                <div className={`pd-appt-dot ${appt.status === 'pending' ? 'amber' : 'blue'}`}></div>
                <div className="pd-appt-info">
                  <div className="pd-appt-name">{appt.doctor}</div>
                  <div className="pd-appt-detail">{appt.specialty} · {appt.clinic}</div>
                </div>
                <span className={`pd-status pd-status-${appt.status}`}>
                  {appt.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                </span>
              </div>
            ))}
          </div>

          {/* Notifications */}
          <div className="pd-card">
            <div className="pd-card-header">
              <span className="pd-card-title">Notifications</span>
              <span className="pd-card-link">Mark all read</span>
            </div>
            {mockNotifs.map(n => (
              <div className="pd-notif" key={n.id}>
                <div className="pd-notif-dot" style={{ background: n.color }}></div>
                <div>
                  <div className="pd-notif-text">{n.text}</div>
                  <div className="pd-notif-time">{n.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Visits */}
        <div className="pd-card pd-full-card">
          <div className="pd-card-header">
            <span className="pd-card-title">Recent Visits</span>
            <span className="pd-card-link">Download records →</span>
          </div>
          <div className="pd-visits-grid">
            {mockPastVisits.map((v, i) => (
              <div className="pd-visit-card" key={i}>
                <div className="pd-visit-date">{v.date}</div>
                <div className="pd-visit-doctor">{v.doctor}</div>
                <div className="pd-visit-type">{v.type}</div>
                <span className="pd-badge pd-badge-green" style={{ marginTop: 6, display: 'inline-block' }}>Completed</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;