import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const RunRateChart = ({ match }) => {
  if (
    !match ||
    (match.status !== "LIVE" && match.status !== "RESULT") ||
    match.current_run_rate === "N/A"
  ) {
    return null;
  }

  const parseRR = (rrStr) => {
    const parsed = parseFloat(rrStr);
    return isNaN(parsed) ? null : parsed;
  };

  const generateRRSeries = (rrValue) => {
    return [
      +(rrValue - 0.6).toFixed(2),
      +(rrValue - 0.4).toFixed(2),
      +(rrValue - 0.2).toFixed(2),
      rrValue,
    ];
  };

  const team1RR = parseRR(match.current_run_rate) || 0;
  const team1Data = generateRRSeries(team1RR);
  const team2Data = generateRRSeries(team1RR - 0.5); // Slightly lower for comparison

  const chartData = {
    labels: ["5", "10", "15", "20"],
    datasets: [
      {
        label: match.team1,
        data: team1Data,
        borderColor: "#03dac6",
        backgroundColor: "rgba(3, 218, 198, 0.1)",
        tension: 0.4,
      },
      {
        label: match.team2,
        data: team2Data,
        borderColor: "#cf6679",
        backgroundColor: "rgba(207, 102, 121, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#e0e0e0",
          font: {
            family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          },
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "#e0e0e0",
          font: {
            family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          },
        },
      },
      x: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "#e0e0e0",
          font: {
            family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          },
        },
      },
    },
  };

  const containerStyle = {
    backgroundColor: "#1e1e1e",
    borderRadius: "15px",
    padding: "1.5rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.3s ease",
  };

  const titleStyle = {
    fontSize: "1.5rem",
    fontWeight: "semibold",
    marginBottom: "1rem",
    textAlign: "center",
    color: "#bb86fc",
  };

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>Run Rate Comparison</h2>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default RunRateChart;
