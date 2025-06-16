"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ⬅ Import for navigation

const ScoreBoard = () => {
  const [matches, setMatches] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate(); // ⬅ Hook to navigate

  useEffect(() => {
    const fetchMatchData = async () => {
      try {
        const response = await fetch("http://localhost:3001/get-data");
        const rawData = await response.json();
        const flattenedData = rawData.flat();
        const uniqueMatches = removeDuplicates(flattenedData);

        // Sort matches by status
        // const liveMatches = uniqueMatches.filter(
        //   (match) => match.status === "LIVE"
        // );
        // const resultMatches = uniqueMatches.filter(
        //   (match) => match.status !== "LIVE"
        // );

        // let sortedMatches = [];
        // if (liveMatches.length > 0) {
        //   sortedMatches = [
        //     ...liveMatches.slice(-3),
        //     ...resultMatches.slice(-1),
        //   ];
        // } else {
        //   sortedMatches = uniqueMatches.slice(-3);
        // }
        const sortedMatches = uniqueMatches.slice(-3);
        setMatches(sortedMatches);
      } catch (error) {
        console.error("Error fetching match data:", error);
      }
    };

    fetchMatchData();
    const interval = setInterval(fetchMatchData, 500);
    return () => clearInterval(interval);
  }, []);

  const removeDuplicates = (matches) => {
    const seen = new Set();
    return matches.filter((match) => {
      const identifier = `${match.team1}-${match.team2}-${match.score1}-${match.score2}`;
      if (seen.has(identifier)) {
        return false;
      }
      seen.add(identifier);
      return true;
    });
  };
  // const removeDuplicates = (matches) => {
  //   const seen = new Set();
  //   return matches.filter((match) => {
  //     if (seen.has(match._id)) return false;
  //     seen.add(match._id);
  //     return true;
  //   });
  // };

  const moveLeft = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + matches.length) % matches.length
    );
  };

  const moveRight = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % matches.length);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Recent Matches</h2>

      <button
        style={{ ...styles.arrowButton, left: "10px" }}
        onClick={moveLeft}
      >
        ⬅
      </button>
      <button
        style={{ ...styles.arrowButton, right: "10px" }}
        onClick={moveRight}
      >
        ➡
      </button>

      <div style={styles.scrollContainer}>
        {matches.map((match, index) => {
          let position =
            (index - currentIndex + matches.length) % matches.length;

          return (
            <div
              key={index}
              onClick={() => navigate(`/match/${match._id}`)} // ⬅ Navigate on click
              style={{
                ...styles.matchCard,
                cursor: "pointer",
                transform: `translateX(${(position - 1) * 500}px) scale(${
                  position === 1 ? 1.2 : 1
                })`,
                opacity: position === 1 ? 1 : 0.5,
                zIndex: position === 1 ? 10 : 5,
                transition:
                  "transform 0.5s ease-in-out, opacity 0.5s ease-in-out",
              }}
            >
              <div style={styles.cardContent}>
                <div style={styles.statusBar}>
                  <span style={styles.statusDot}></span>
                  <span style={styles.statusText}>{match.status}</span>
                </div>
                <div style={styles.teamsContainer}>
                  <div style={styles.team1Box}>
                    <span style={styles.teamName}>{match.team1}</span>
                    <span style={styles.score}>{match.score1}</span>
                  </div>
                  <span style={styles.vs}>VS</span>
                  <div style={styles.team2Box}>
                    <span style={styles.teamName}>{match.team2}</span>
                    <span style={styles.score}>{match.score2}</span>
                  </div>
                </div>

                {match.status === "RESULT" && (
                  <div style={styles.resultContainer}>
                    <span style={styles.resultLabel}>Result:</span>
                    <span style={styles.resultText}>{match.match_result}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  container: {
    marginTop: "20px",
    padding: "20px",
    backgroundColor: "#1a1a1a",
    borderRadius: "15px",
    boxShadow: "0 10px 20px rgba(0,0,0,0.2), 0 6px 6px rgba(0,0,0,0.1)",
    position: "relative",
  },
  heading: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    color: "#03dac6",
    textAlign: "center",
    marginBottom: "30px",
    textTransform: "uppercase",
    letterSpacing: "3px",
  },
  scrollContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    gap: "30px",
    padding: "20px 10px",
    width: "100%",
    position: "relative",
    height: "260px",
  },
  matchCard: {
    position: "absolute",
    minWidth: "350px",
    backgroundColor: "#292929",
    borderRadius: "15px",
    perspective: "1000px",
    transition: "transform 0.6s, opacity 0.6s",
  },
  cardContent: {
    padding: "25px",
    transformStyle: "preserve-3d",
  },
  statusBar: {
    display: "flex",
    alignItems: "center",
    marginBottom: "20px",
  },
  statusDot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    backgroundColor: "#03dac6",
    marginRight: "10px",
    animation: "pulse 1.5s infinite",
  },
  statusText: {
    fontSize: "1rem",
    color: "#03dac6",
    fontWeight: "bold",
  },
  teamsContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
    padding: "0 20px",
    width: "100%",
  },
  team1Box: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
  },
  team2Box: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
  },
  teamName: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: "10px",
  },
  vs: {
    fontSize: "2.2rem",
    color: "#bb86fc",
    margin: "0 30px",
    fontWeight: "bold",
  },
  score: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#03dac6",
  },
  resultContainer: {
    textAlign: "center",
    backgroundColor: "rgba(187, 134, 252, 0.1)",
    borderRadius: "8px",
    padding: "10px",
  },
  resultLabel: {
    fontSize: "1.1rem",
    color: "#bb86fc",
    marginRight: "8px",
  },
  resultText: {
    fontSize: "1.2rem",
    fontWeight: "bold",
    color: "#ffffff",
  },
  arrowButton: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "3rem",
    backgroundColor: "transparent",
    color: "#03dac6",
    border: "none",
    cursor: "pointer",
    zIndex: 20,
  },
};

export default ScoreBoard;
