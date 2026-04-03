import { useState } from "react";
import LandingPage from "./pages/landingpage";
import LoginPage from "./pages/login";
import SignupPage from "./pages/signup";
import { Route } from "lucide-react";
import { BrowserRouter,Routes,Navigate }  from "react-router-dom";
import docDashboard from "./pages/doctordashboard";
/**
 * App entry point.
 * Pages: "landing" | "login" | "signup"
 */
export default function App() {
  const [page, setPage] = useState("landing");

  return (
    <>
      {page === "landing" && (
        <LandingPage
          onLogin={() => setPage("login")}
          onSignup={() => setPage("signup")}
        />
      )}
      {page === "login" && (
        <LoginPage onSwitchToSignup={() => setPage("signup")} />
      )}
      {page === "signup" && (
        <SignupPage onSwitchToLogin={() => setPage("login")} />
      )}
     
    </>
  );
}