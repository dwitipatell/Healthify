import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../styles/Calendar.css";

export default function AppointmentCalendar() {
  const [date, setDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);

  const timeSlots = [
    "9:00 AM",
    "10:00 AM",
    "11:30 AM",
    "2:00 PM",
    "3:30 PM",
    "5:00 PM",
  ];

  return (
    <div className="calendar-container">
      
      {/* Calendar */}
      <Calendar onChange={setDate} value={date} />

      {/* Selected Date */}
      <h3>Selected: {date.toDateString()}</h3>

      {/* Time Slots */}
      <div className="slots">
        {timeSlots.map((slot, index) => (
          <button
            key={index}
            className={`slot ${selectedSlot === slot ? "active" : ""}`}
            onClick={() => setSelectedSlot(slot)}
          >
            {slot}
          </button>
        ))}
      </div>

      {/* Book Button */}
      <button className="book-btn">
        Book Appointment
      </button>

    </div>
  );
}