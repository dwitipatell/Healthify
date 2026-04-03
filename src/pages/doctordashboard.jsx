import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import '../styles/doctordashboard.css';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeNav, setActiveNav] = useState('dashboard');
  const chartRef = useRef(null);

  // ---------- mock data (replace with real Supabase queries) ----------
  const mockQueue = [
    { id: 1, name: 'Rahul Shah', initials: 'RS', time: '2:30 PM', type: 'Follow-up', status: 'in-session' },
    { id: 2, name: 'Neha Patel', initials: 'NP', time: '3:00 PM', type: 'New patient', status: 'pending' },
    { id: 3, name: 'Arjun Modi', initials: 'AM', time: '3:30 PM', type: 'Check-up', status: 'pending' },
    { id: 4, name: 'Sunita Kulkarni', initials: 'SK', time: '4:00 PM', type: 'ECG review', status: 'confirmed' },
  ];
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekCounts = [6, 8, 4, 9, 8, 3];
  const availability = [
    { day: 'Monday',    time: '9 AM – 1 PM', on: true },
    { day: 'Tuesday',   time: '2 PM – 6 PM', on: true },
    { day: 'Wednesday', time: 'Off',          on: false },
    { day: 'Thursday',  time: '9 AM – 5 PM', on: true },
    { day: 'Friday',    time: '9 AM – 2 PM', on: true },
  ];
  // -------------------------------------------------------------------

  const [avail, setAvail] = useState(availability);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login'); return; }
      setUser(user);
    };
    getUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const toggleAvail = (index) => {
    setAvail(prev => prev.map((a, i) => i === index ? { ...a, on: !a.on } : a));
  };

  const maxCount = Math.max(...weekCounts);

  const navItems = [
    { key: 'dashboard', icon: '🏠', label: 'Dashboard' },
    { key: 'schedule',  icon: '📅', label: 'My Schedule' },
    { key: 'patients',  icon: '👥', label: 'Patients' },
    { key: 'analytics', icon: '📊', label: 'Analytics' },
    { key: 'availability', icon: '🕐', label: 'Availability' },
    { key: 'alerts',    icon: '🔔', label: 'Alerts', badge: 5 },
    { key: 'settings',  icon: '⚙️', label: 'Settings' },
  ];

  return (
    <div className="dd-layout">
      {/* ── SIDEBAR ── */}
      <aside className="dd-sidebar">
        <div className="dd-logo">
          <span className="dd-logo-icon">🏥</span>
          <div>
            <div className="dd-logo-text">MediBook</div>
            <div className="dd-logo-sub">Doctor Portal</div>
          </div>
        </div>

        <nav className="dd-nav">
          {navItems.map(item => (
            <div
              key={item.key}
              className={`dd-nav-item ${activeNav === item.key ? 'active' : ''}`}
              onClick={() => setActiveNav(item.key)}
            >
              <span className="dd-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge && <span className="dd-nav-badge">{item.badge}</span>}
            </div>
          ))}
        </nav>

        <div className="dd-sidebar-footer">
          <div className="dd-user-chip">
            <div className="dd-avatar">
              {user?.user_metadata?.full_name?.slice(0, 2).toUpperCase() || 'DR'}
            </div>
            <div>
              <div className="dd-user-name">{user?.user_metadata?.full_name || 'Doctor'}</div>
              <div className="dd-user-role">Cardiologist</div>
            </div>
          </div>
          <button className="dd-signout-btn" onClick={handleSignOut}>Sign out</button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="dd-main">
        {/* Header */}
        <div className="dd-header">
          <div>
            <h1 className="dd-greeting">Today's Overview 📋</h1>
            <p className="dd-greeting-sub">Friday, 3 Apr 2026 · {mockQueue.length} appointments scheduled</p>
          </div>
          <button className="dd-primary-btn">+ Block Time Slot</button>
        </div>

        {/* Stats */}
        <div className="dd-stats">
          {[
            { icon: '📅', label: "Today's Appts",   value: '8',   badge: '3 remaining',   badgeClass: 'red' },
            { icon: '⏳', label: 'Pending Confirm',  value: '4',   badge: 'Action needed', badgeClass: 'amber' },
            { icon: '👥', label: 'Total Patients',   value: '312', badge: '+6 this week',  badgeClass: 'green' },
          ].map((s, i) => (
            <div className="dd-stat-card" key={i}>
              <span className="dd-stat-icon">{s.icon}</span>
              <div className="dd-stat-label">{s.label}</div>
              <div className="dd-stat-value">{s.value}</div>
              <span className={`dd-badge dd-badge-${s.badgeClass}`}>{s.badge}</span>
            </div>
          ))}
        </div>

        {/* Now Serving Hero */}
        <div className="dd-hero">
          <div className="dd-hero-deco1"></div>
          <div className="dd-hero-deco2"></div>
          <div className="dd-hero-label">Now Serving</div>
          <div className="dd-hero-title">{mockQueue[0].name} — Consultation</div>
          <div className="dd-hero-sub">Follow-up visit · Cardiac monitoring · Patient #P4821</div>
          <div className="dd-hero-meta">
            <span>🕑 {mockQueue[0].time} slot</span>
            <span>⏱ 30 min</span>
            <span>🔁 Follow-up</span>
          </div>
          <div className="dd-hero-actions">
            <button className="dd-hero-btn-solid">View Patient File</button>
            <button className="dd-hero-btn-outline">Write Prescription</button>
            <button className="dd-hero-btn-outline">Mark Complete</button>
          </div>
        </div>

        {/* Two Col */}
        <div className="dd-two-col">
          {/* Patient Queue */}
          <div className="dd-card">
            <div className="dd-card-header">
              <span className="dd-card-title">Today's Patient Queue</span>
              <span className="dd-card-link">Full schedule →</span>
            </div>
            {mockQueue.map((patient, i) => (
              <div className="dd-queue-row" key={patient.id}>
                <div className="dd-queue-num">{i + 1}</div>
                <div className="dd-q-avatar">{patient.initials}</div>
                <div className="dd-q-info">
                  <div className="dd-q-name">{patient.name}</div>
                  <div className="dd-q-detail">{patient.time} · {patient.type}</div>
                </div>
                <div className="dd-q-actions">
                  {patient.status === 'in-session' && (
                    <span className="dd-status dd-status-session">In session</span>
                  )}
                  {patient.status === 'pending' && (
                    <button className="dd-q-btn dd-q-confirm">Confirm</button>
                  )}
                  {patient.status !== 'in-session' && (
                    <button className="dd-q-btn dd-q-view">View</button>
                  )}
                  {patient.status === 'in-session' && (
                    <button className="dd-q-btn dd-q-view">File</button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Availability */}
          <div className="dd-card">
            <div className="dd-card-header">
              <span className="dd-card-title">Weekly Availability</span>
              <span className="dd-card-link">Edit slots →</span>
            </div>
            {avail.map((a, i) => (
              <div className="dd-avail-row" key={i}>
                <div>
                  <div className="dd-avail-day">{a.day}</div>
                  <div className="dd-avail-time">{a.time}</div>
                </div>
                <div
                  className={`dd-toggle ${a.on ? 'on' : 'off'}`}
                  onClick={() => toggleAvail(i)}
                >
                  <div className="dd-toggle-thumb"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Analytics Chart */}
        <div className="dd-card dd-full-card">
          <div className="dd-card-header">
            <span className="dd-card-title">Appointments This Week</span>
            <span className="dd-card-link">Full analytics →</span>
          </div>
          <div className="dd-chart-wrap">
            <div className="dd-chart">
              {weekCounts.map((count, i) => (
                <div key={i} className="dd-chart-col">
                  <div className="dd-chart-val">{count}</div>
                  <div
                    className={`dd-chart-bar ${i === 4 ? 'today' : ''}`}
                    style={{ height: `${Math.round((count / maxCount) * 100)}%` }}
                  ></div>
                  <div className="dd-chart-lbl">{weekDays[i]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DoctorDashboard;