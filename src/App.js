import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import IPL from "./pages/IPL";
import MatchDetail from "./pages/MatchDetail";
import Weather from "./pages/Weather";
import "./App.css";

function Navbar({ theme, toggleTheme }) {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? "active" : "";
  return (
    <nav className="navbar">
      <div className="nav-brand">🏏 CricFanzz</div>
      <div className="nav-links">
        <Link to="/" className={isActive("/")}>🌍 Matches</Link>
        <Link to="/ipl" className={isActive("/ipl")}>🏆 IPL 2026</Link>
        <Link to="/weather" className={isActive("/weather")}>🌤️ Weather</Link>
      </div>
      <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
        {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
      </button>
    </nav>
  );
}

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("cf-theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("cf-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  return (
    <Router>
      <div className="app">
        <Navbar theme={theme} toggleTheme={toggleTheme} />
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/ipl" element={<IPL />} />
            <Route path="/match/:id" element={<MatchDetail />} />
            <Route path="/weather" element={<Weather />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
