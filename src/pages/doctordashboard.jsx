import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import '../styles/doctordashboard.css';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeNav, setActiveNav] = useState('dashboard');

  // Mock data (replace with real Supabase later)
  const mockQueue = [
    { id: 1, name: 'Rahul Shah', initials: 'RS', time: '2:30 PM', type: 'Follow-up', status: 'in-session' },
    { id: 2, name: 'Neha Patel', initials: 'NP', time: '3:00 PM', type: 'New patient', status: 'pending' },
    { id: 3, name: 'Arjun Modi', initials: 'AM', time: '3:30 PM', type: 'Check-up', status: 'pending' },
    { id: 4, name: 'Sunita Kulkarni', initials: 'SK', time: '4:00 PM', type: 'ECG review', status: 'confirmed' },
  ];

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekCounts = [6, 8, 4, 9, 8, 3];

  const [avail, setAvail] = useState([
    { day: 'Monday',    time: '9 AM – 1 PM', on: true },
    { day: 'Tuesday',   time: '2 PM – 6 PM', on: true },
    { day: 'Wednesday', time: 'Off',          on: false },
    { day: 'Thursday',  time: '9 AM – 5 PM', on: true },
    { day: 'Friday',    time: '9 AM – 2 PM', on: true },
  ]);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setUser(user);
    };
    getUser();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const toggleAvail = (index) => {
    setAvail(prev => prev.map((a, i) => i === index ? { ...a, on: !a.on } : a));
  };

  const maxCount = Math.max(...weekCounts);

  return (
    <div className="dd-layout">
      {/* Sidebar */}
      <aside className="dd-sidebar">
        <div className="dd-logo">
          <span className="dd-logo-icon">🩺</span>
          <div>
            <div className="dd-logo-text">Healthify</div>
            <div className="dd-logo-sub">Doctor Portal</div>
          </div>
        </div>

        <nav className="dd-nav">
          {[
            { key: 'dashboard', icon: '🏠', label: 'Dashboard' },
            { key: 'schedule',  icon: '📅', label: 'Schedule' },
            { key: 'patients',  icon: '👥', label: 'Patients' },
            { key: 'analytics', icon: '📊', label: 'Analytics' },
          ].map(item => (
            <div
              key={item.key}
              className={`dd-nav-item ${activeNav === item.key ? 'active' : ''}`}
              onClick={() => setActiveNav(item.key)}
            >
              <span className="dd-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        <div className="dd-sidebar-footer">
          <div className="dd-user-chip">
            <div className="dd-avatar">
              {user?.user_metadata?.full_name?.slice(0, 2).toUpperCase() || 'DR'}
            </div>
            <div>
              <div className="dd-user-name">{user?.user_metadata?.full_name || 'Dr. Sharma'}</div>
              <div className="dd-user-role">Cardiologist</div>
            </div>
          </div>
          <button className="dd-signout-btn" onClick={handleSignOut}>Sign out</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dd-main">
        <div className="dd-header">
          <div>
            <h1 className="dd-greeting">Good morning, Doctor</h1>
            <p className="dd-greeting-sub">Friday, April 3, 2026 • 4 appointments today</p>
          </div>
          <button className="dd-primary-btn">+ New Slot</button>
        </div>

        {/* Stats */}
        <div className="dd-stats">
          {[
            { label: "Today's Appointments", value: '8', badge: '3 remaining' },
            { label: 'Pending Confirmation', value: '4', badge: 'Action needed' },
            { label: 'Total Patients', value: '312', badge: '+12 this month' },
          ].map((s, i) => (
            <div className="dd-stat-card" key={i}>
              <div className="dd-stat-label">{s.label}</div>
              <div className="dd-stat-value">{s.value}</div>
              <span className="dd-badge">{s.badge}</span>
            </div>
          ))}
        </div>

        {/* Patient Queue */}
        <div className="dd-card">
          <div className="dd-card-header">
            <span className="dd-card-title">Today's Patient Queue</span>
            <span className="dd-card-link">View full schedule →</span>
          </div>
          {mockQueue.map((patient, i) => (
            <div className="dd-queue-row" key={patient.id}>
              <div className="dd-queue-num">{i + 1}</div>
              <div className="dd-q-avatar">{patient.initials}</div>
              <div className="dd-q-info">
                <div className="dd-q-name">{patient.name}</div>
                <div className="dd-q-detail">{patient.time} • {patient.type}</div>
              </div>
              <div className="dd-q-actions">
                {patient.status === 'in-session' ? (
                  <span className="dd-status dd-status-session">In Session</span>
                ) : (
                  <button className="dd-q-btn dd-q-confirm">Confirm</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default DoctorDashboard;