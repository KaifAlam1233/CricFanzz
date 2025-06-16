import React from "react";

const VictoryProgress = ({ probability }) => {
  const containerStyle = {
    backgroundColor: "#1e1e1e",
    borderRadius: "15px",
    padding: "2rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  };

  const titleStyle = {
    fontSize: "1.8rem",
    fontWeight: "semibold",
    marginBottom: "1.5rem",
    textAlign: "center",
    color: "#bb86fc",
  };

  const progressBarStyle = {
    height: "30px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: "15px",
    overflow: "hidden",
    position: "relative",
  };

  const progressStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: `${probability}%`,
    backgroundColor: "#03dac6",
    transition: "width 1s ease-in-out",
  };

  const shineStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%)",
    animation: "shine 1.5s infinite",
  };

  const percentageStyle = {
    textAlign: "center",
    fontSize: "1.4rem",
    fontWeight: "bold",
    color: "#03dac6",
    marginTop: "1rem",
  };

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>Victory Probability</h2>
      <div style={progressBarStyle}>
        <div style={progressStyle}>
          <div style={shineStyle}></div>
        </div>
      </div>
      <p style={percentageStyle}>{probability}%</p>
    </div>
  );
};

export default VictoryProgress;
