import React from "react";
import { Bell, Search } from "lucide-react";
import "../styles/navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      {/* LEFT: Logo */}
      <div className="logo">
        <div className="logo-icon">+</div>
        <span>Healthify</span>
      </div>

      {/* CENTER: Search */}
      <div className="search-bar">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Search patients or doctors..."
        />
      </div>

      {/* RIGHT: Icons + Profile */}
      <div className="nav-right">
        <div className="notification">
          <Bell size={20} />
          <span className="badge">2</span>
        </div>

        <div className="profile">
          <img
            src="https://i.pravatar.cc/40"
            alt="profile"
          />
          <span>Dr. Smith</span>
        </div>
      </div>
    </nav>
  );
}