import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import "../styles/login.css";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: supabaseError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (supabaseError) {
      setError(supabaseError.message);
    } else {
      navigate("/dashboard");
    }
  }

  return (
    <div className="login-container">
      <div className="glass-card">
        <h1 className="logo">SplitExpense</h1>
        <p className="tagline">Split smart. Live better.</p>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="login-group">
            <input type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
            <label>Email</label>

          </div>

          <div className="login-group">
            <input type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
            <label>Password</label>
          </div>

          {error && <p style={{color: "red"}}>{error}</p>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="extra">
            Don't have an account?{" "}
            <span onClick={() => navigate("/signup")} style={{cursor: "pointer"}}>
              Sign up
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}