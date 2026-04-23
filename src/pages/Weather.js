import React, { useState } from "react";

export default function Weather() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchWeather = async () => {
    if (!city.trim()) return;
    setLoading(true);
    setError("");
    setWeather(null);
    try {
      const res = await fetch(`http://localhost:3001/fetch-weather/${encodeURIComponent(city)}`);
      if (!res.ok) throw new Error("Failed to fetch weather");
      const data = await res.json();
      setWeather(data);
    } catch (e) {
      setError("❌ Could not fetch weather. Make sure backend is running and API key is valid.");
    }
    setLoading(false);
  };

  return (
    <div>
      <h1 className="page-title">Match Venue Weather</h1>
      <div className="weather-form">
        <input
          type="text"
          placeholder="Enter city (e.g. Mumbai, Delhi, Chennai)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchWeather()}
        />
        <button onClick={fetchWeather} disabled={loading}>
          {loading ? "Fetching..." : "Get Weather"}
        </button>
      </div>
      {error && <div className="error">{error}</div>}
      {weather && (
        <div className="weather-card">
          <div className="weather-city">📍 {weather.city}</div>
          <div className="weather-conditions">{weather.conditions}</div>
          <div className="weather-stats">
            <div className="weather-stat">
              <div className="weather-stat-label">🌡️ Temperature</div>
              <div className="weather-stat-value">{weather.temperature}°C</div>
            </div>
            <div className="weather-stat">
              <div className="weather-stat-label">💧 Humidity</div>
              <div className="weather-stat-value">{weather.humidity}%</div>
            </div>
            <div className="weather-stat">
              <div className="weather-stat-label">💨 Wind Speed</div>
              <div className="weather-stat-value">{weather.windSpeed} km/h</div>
            </div>
            <div className="weather-stat">
              <div className="weather-stat-label">☁️ Cloud Cover</div>
              <div className="weather-stat-value">{weather.cloudCover}%</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
