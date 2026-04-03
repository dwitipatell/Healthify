import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import '../styles/patientDashboard.css';

const PatientIntelligentDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [nextAppt, setNextAppt] = useState(null);
  const [queuePosition, setQueuePosition] = useState(3);
  const [estimatedWait, setEstimatedWait] = useState(18);
  const [noShowRisk, setNoShowRisk] = useState(12);
  const [activeNav, setActiveNav] = useState('dashboard');

  const todayAppointments = [
    {
      id: 1,
      doctor: "Dr. Priya Sharma",
      specialty: "Cardiology",
      time: "10:30 AM",
      status: "confirmed",
      predictedDuration: "25 min",
      delay: 8
    },
    {
      id: 2,
      doctor: "Dr. Rohan Mehta",
      specialty: "Orthopedics",
      time: "02:00 PM",
      status: "pending",
      predictedDuration: "35 min",
      delay: 0
    }
  ];

  const notifications = [
    { id: 1, message: "Your appointment with Dr. Sharma is confirmed. Estimated wait: 18 min", time: "Just now", color: "#10B981" },
    { id: 2, message: "No-show risk detected for future visits. Please confirm appointments.", time: "Yesterday", color: "#F59E0B" },
    { id: 3, message: "Average wait time improved by 22% this week due to smart scheduling.", time: "2 days ago", color: "#3B82F6" },
  ];

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setUser(user);
      setNextAppt(todayAppointments[0]);
    };
    getUser();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const suggestReschedule = () => {
    alert("Smart suggestion: Move to 11:15 AM slot (reduces predicted wait by 12 min and balances doctor load).");
  };

  const navItems = [
    { key: 'dashboard', icon: '🏠', label: 'Dashboard' },
    { key: 'book', icon: '📅', label: 'Book Appointment' },
    { key: 'appointments', icon: '📋', label: 'My Appointments' },
    { key: 'insights', icon: '📊', label: 'Smart Insights' },
    { key: 'notifications', icon: '🔔', label: 'Alerts', badge: notifications.length },
  ];

  return (
    <div className="pd-layout" style={{ background: 'linear-gradient(145deg, #F0FDFA 0%, #ECFDF5 100%)' }}>
      {/* Sidebar */}
      <aside className="pd-sidebar">
        <div className="pd-logo">
          <span className="pd-logo-icon">🏥</span>
          <div>
            <div className="pd-logo-text">Healthify</div>
            <div className="pd-logo-sub">Smart Scheduling</div>
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
              <div className="pd-user-name">
                {user?.user_metadata?.full_name || 'Rahul Shah'}
              </div>
              <div className="pd-user-role">Patient • Ahmedabad</div>
            </div>
          </div>
          <button className="pd-signout-btn" onClick={handleSignOut}>Sign out</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pd-main">
        <div className="pd-header">
          <div>
            <h1 className="pd-greeting">
              Good morning, {user?.user_metadata?.full_name?.split(' ')[0] || 'Rahul'} 👋
            </h1>
            <p className="pd-greeting-sub">
              Friday, 3 Apr 2026 • Smart system optimized your schedule
            </p>
          </div>
          <button className="pd-primary-btn" onClick={() => setActiveNav('book')}>
            + Book New Appointment
          </button>
        </div>

        {/* Stats */}
        <div className="pd-stats">
          {[
            { icon: '⏱️', label: "Est. Wait Today", value: `${estimatedWait} min`, badge: "↓ 22% this week", badgeClass: "green" },
            { icon: '📍', label: "Queue Position", value: `#${queuePosition}`, badge: "Optimized", badgeClass: "blue" },
            { icon: '📉', label: "No-Show Risk", value: `${noShowRisk}%`, badge: "Low", badgeClass: "amber" },
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
        {nextAppt && (
          <div className="pd-hero">
            <div className="pd-hero-deco1"></div>
            <div className="pd-hero-deco2"></div>
            <div className="pd-hero-label">NEXT • Intelligent Slot</div>
            <div className="pd-hero-title">{nextAppt.doctor} — {nextAppt.specialty}</div>
            <div className="pd-hero-sub">
              Predicted duration: {nextAppt.predictedDuration} • Current delay: +{nextAppt.delay} min
            </div>
            <div className="pd-hero-meta">
              <span>🕐 Today, {nextAppt.time}</span>
              <span>📍 In-clinic</span>
              <span>⚡ Smart optimized</span>
            </div>
            <div className="pd-hero-actions">
              <button className="pd-hero-btn-solid">View Details</button>
              <button className="pd-hero-btn-outline" onClick={suggestReschedule}>
                Suggest Better Slot
              </button>
              <button className="pd-hero-btn-outline">Reschedule</button>
            </div>
          </div>
        )}

        {/* Two Column */}
        <div className="pd-two-col">
          <div className="pd-card">
            <div className="pd-card-header">
              <span className="pd-card-title">Today's Appointments • AI Predicted</span>
              <span className="pd-card-link">Full calendar →</span>
            </div>
            {todayAppointments.map(appt => (
              <div className="pd-appt-row" key={appt.id}>
                <div className="pd-appt-time">{appt.time}</div>
                <div className={`pd-appt-dot ${appt.status === 'pending' ? 'amber' : 'blue'}`}></div>
                <div className="pd-appt-info">
                  <div className="pd-appt-name">{appt.doctor}</div>
                  <div className="pd-appt-detail">
                    {appt.specialty} • Predicted: {appt.predictedDuration} 
                    {appt.delay > 0 && ` (+${appt.delay} min delay)`}
                  </div>
                </div>
                <span className={`pd-status pd-status-${appt.status}`}>
                  {appt.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                </span>
              </div>
            ))}
          </div>

          <div className="pd-card">
            <div className="pd-card-header">
              <span className="pd-card-title">Smart System Alerts</span>
              <span className="pd-card-link">Mark all read</span>
            </div>
            {notifications.map(n => (
              <div className="pd-notif" key={n.id}>
                <div className="pd-notif-dot" style={{ background: n.color }}></div>
                <div>
                  <div className="pd-notif-text">{n.message}</div>
                  <div className="pd-notif-time">{n.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Queue Optimization */}
        <div className="pd-card pd-full-card">
          <div className="pd-card-header">
            <span className="pd-card-title">Queue Optimization • Today</span>
          </div>
          <p style={{ fontSize: '15px', color: '#4B7B76', lineHeight: 1.6 }}>
            Our AI system reduced average waiting time by <strong>22%</strong> today by dynamically 
            adjusting slots based on historical consultation durations and no-show patterns.
          </p>
          <div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ background: '#CCFBF1', padding: '10px 16px', borderRadius: '10px', fontSize: '13px' }}>
              ✅ 3 no-shows predicted & slots re-allocated
            </div>
            <div style={{ background: '#E0F2FE', padding: '10px 16px', borderRadius: '10px', fontSize: '13px' }}>
              📈 Doctor utilization balanced at 87%
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientIntelligentDashboard;