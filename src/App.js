import React, { useState } from "react";
import VictoryProgress from "./components/VictoryProgress";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RunRateChart from "./components/RunRateChart";
import WicketsChart from "./components/WicketsChart";
import ScoreBoard from "./components/ScoreBoard"; // Import the new component
import MatchDetails from "./components/MatchDetails";

const App = () => {
  const [currentMatch, setCurrentMatch] = useState(null);

  return (
    <Router>
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.title}>Cricfanzz</h1>
        </header>

        <Routes>
          <Route
            path="/"
            element={
              <>
                <ScoreBoard onCurrentMatchChange={setCurrentMatch} />
                <div style={styles.chartsContainer}>
                  <RunRateChart match={currentMatch} />
                  <WicketsChart match={currentMatch} />
                </div>
              </>
            }
          />
          <Route path="/match/:id" element={<MatchDetails />} />
        </Routes>
      </div>
    </Router>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#121212",
    color: "#e0e0e0",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    padding: "2rem",
  },
  header: {
    textAlign: "center",
    marginBottom: "2rem",
  },
  title: {
    fontSize: "3rem",
    fontWeight: "bold",
    color: "#bb86fc",
    textTransform: "uppercase",
    letterSpacing: "2px",
    marginBottom: "0.5rem",
  },
  subtitle: {
    fontSize: "1.2rem",
    color: "#03dac6",
  },
  chartsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "2rem",
    marginTop: "2rem",
  },
};

export default App;
