import { useState, useEffect } from "react";
import "../styles/navbar.css";

export default function Navbar({ onLogin, onSignup }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar__logo">
        <div className="navbar__logo-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="4" fill="white" opacity=".2" />
            <path d="M12 8v8M8 12h8" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
        <span className="navbar__logo-text">
          Health<span>ify</span>
        </span>
      </div>

      <div className="navbar__links">
        {["Features", "How it works", "For Hospitals"].map((item) => (
          <a key={item} href="#" className="navbar__link">
            {item}
          </a>
        ))}
      </div>

      <div className="navbar__actions">
        <button onClick={onLogin} className="btn-outline">Sign In</button>
        <button onClick={onSignup} className="btn-primary">Get Started</button>
      </div>
    </nav>
  );
}