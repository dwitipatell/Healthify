import { useState, useEffect } from "react";
import "../styles/navbar.css";

export default function Navbar({ onLogin, onSignup }) {
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;

      setScrolled(scrollTop > 20);
      setScrollProgress(scrollPercent);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      const navbarHeight = 80; // Approximate navbar height
      const targetPosition = targetElement.offsetTop - navbarHeight - 20; // Extra padding

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      {/* Scroll Progress Indicator */}
      <div className="scroll-progress">
        <div
          className="scroll-progress-bar"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

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
          <a
            href="#features"
            className="navbar__link"
            onClick={(e) => handleNavClick(e, 'features')}
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="navbar__link"
            onClick={(e) => handleNavClick(e, 'how-it-works')}
          >
            How it works
          </a>
          <a
            href="#faq"
            className="navbar__link"
            onClick={(e) => handleNavClick(e, 'faq')}
          >
            FAQs
          </a>
        </div>

        <div className="navbar__actions">
          <button onClick={onLogin} className="btn-outline">Sign In</button>
          <button onClick={onSignup} className="btn-primary">Get Started</button>
        </div>
      </nav>
    </>
  );
}