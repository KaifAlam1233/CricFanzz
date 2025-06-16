import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const WicketsChart = ({ match }) => {
  console.log("WicketsChart match data:", match);
  if (!match || !match.inning_1 || !match.inning_2) return null;

  const countWickets = (batting) => {
    return (batting || []).reduce((wickets, batter) => {
      const isOut = batter.status?.toLowerCase().includes("not out") ? 0 : 1;
      return wickets + isOut;
    }, 0);
  };

  const team1Wickets = countWickets(match.inning_1.batting);
  const team2Wickets = countWickets(match.inning_2.batting);

  const chartData = {
    labels: [match.team1, match.team2],
    datasets: [
      {
        label: "Wickets Lost",
        data: [team1Wickets, team2Wickets],
        backgroundColor: ["rgba(3, 218, 198, 0.6)", "rgba(207, 102, 121, 0.6)"],
        borderColor: ["rgba(3, 218, 198, 1)", "rgba(207, 102, 121, 1)"],
        borderWidth: 1,
        borderRadius: 5,
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
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        ticks: { color: "#e0e0e0" },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
      x: {
        ticks: { color: "#e0e0e0" },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
    },
  };

  const containerStyle = {
    backgroundColor: "#1e1e1e",
    borderRadius: "15px",
    padding: "1.5rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
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
      <h2 style={titleStyle}>Wickets Lost</h2>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default WicketsChart;
