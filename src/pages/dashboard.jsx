import React from "react";
import "../styles/dashboard.css";
import AppointmentCalendar from "../components/AppointmentCalendar";


export default function Dashboard() {
  return (
    <div className="dashboard">

      {/* TOP STATS */}
      <div className="cards">
        <div className="card">
          <h3>Appointments Today</h3>
          <p>26</p>
        </div>

        <div className="card">
          <h3>Avg Waiting Time</h3>
          <p>15 min</p>
        </div> 

        <div className="card">
          <h3>No-show Rate</h3>
          <p>8%</p>
        </div>

        <div className="card">
          <h3>Active Doctors</h3>
          <p>12</p>
        </div>
      </div>

      {/* MAIN SECTION */}
      <div className="main-section">

        {/* SCHEDULE */}
        <div className="schedule">
          <h2>Today's Schedule</h2>

          <div className="appointment completed">
            <span>9:00 AM</span>
            <p>Emily Johnson</p>
          </div>

          <div className="appointment ongoing">
            <span>10:00 AM</span>
            <p>Mark Davis</p>
          </div>

          <div className="appointment upcoming">
            <span>11:30 AM</span>
            <p>Sarah Lee</p>
          </div>

          <div className="appointment missed">
            <span>12:15 PM</span>
            <p>Michael Patel</p>
          </div>
        </div>

        {/* SMART SUGGESTIONS */}
        <div className="suggestions">
          <h2>Smart Suggestions</h2>

          <div className="suggestion">
            ⚡ Best Slot: 2:30 PM
          </div>

          <div className="suggestion warning">
            ⚠️ High No-show Risk at 5 PM
          </div>

          <div className="suggestion">
            📈 Peak Hours: 10 AM - 1 PM
          </div>
        </div>

      </div>
     
        <AppointmentCalendar />

      {/* QUEUE */}
      <div className="queue">
        <h2>Live Queue</h2>
        <p>You are <strong>2nd</strong> in line</p>
        <div className="progress">
          <div className="progress-bar"></div>
        </div>
      </div>

    </div>
  );
}