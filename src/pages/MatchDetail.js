import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const BACKEND = "http://localhost:3001";

function InfoBadge({ icon, label, value }) {
  if (!value || value === "N/A") return null;
  return (
    <div className="info-badge">
      <span className="info-icon">{icon}</span>
      <div>
        <div className="info-label">{label}</div>
        <div className="info-value">{value}</div>
      </div>
    </div>
  );
}

function InningScoreBlock({ teamName, scoreObj, index }) {
  if (!scoreObj) return null;
  return (
    <div className="inning-score-block">
      <div className="isb-header">
        <span className="isb-label">Innings {index + 1}</span>
        <span className="isb-team">{teamName || scoreObj.inning || `Team ${index + 1}`}</span>
      </div>
      <div className="isb-score">
        <span className="isb-runs">{scoreObj.r}<span className="isb-sep">/</span>{scoreObj.w}</span>
        <span className="isb-overs">({scoreObj.o} overs)</span>
      </div>
    </div>
  );
}

export default function MatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${BACKEND}/get-match/${id}`)
      .then((r) => r.json())
      .then((data) => { setMatch(data); setLoading(false); })
      .catch(() => { setError("Failed to load match."); setLoading(false); });
  }, [id]);

  if (loading) return <div className="loading">⏳ Loading match details...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!match) return <div className="empty">Match not found.</div>;

  // Parse score_data if available
  let scores = [];
  try {
    if (match.score_data) scores = JSON.parse(match.score_data);
  } catch {}

  const isLive = match.status === "LIVE";
  const isResult = match.status === "RESULT";

  return (
    <div>
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

      {/* Header Card */}
      <div className="detail-header">

        {/* Status + Type */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "14px", flexWrap: "wrap" }}>
          <span className={`match-status ${
            isLive ? "status-live" : isResult ? "status-result" : "status-upcoming"
          }`}>{match.status}</span>
          {match.match_type && (
            <span className="match-type-badge">{match.match_type.toUpperCase()}</span>
          )}
          {isLive && <span className="live-pulse">🔴 LIVE</span>}
        </div>

        {/* Teams */}
        <div className="detail-teams">
          {match.team1} <span className="detail-vs">vs</span> {match.team2}
        </div>

        {/* Score blocks */}
        {scores.length > 0 ? (
          <div className="inning-scores-row">
            {scores.map((sc, i) => (
              <InningScoreBlock
                key={i}
                teamName={i === 0 ? match.team1 : match.team2}
                scoreObj={sc}
                index={i}
              />
            ))}
          </div>
        ) : (
          <div className="inning-scores-row">
            {match.score1 && match.score1 !== "Yet to bat" && (
              <div className="isb-simple"><strong>{match.team1}:</strong> {match.score1}</div>
            )}
            {match.score2 && match.score2 !== "Yet to bat" && (
              <div className="isb-simple"><strong>{match.team2}:</strong> {match.score2}</div>
            )}
          </div>
        )}

        {/* Result */}
        {match.match_result && match.match_result !== "In Progress" && (
          <div className="detail-result">🏆 {match.match_result}</div>
        )}
        {match.match_result === "In Progress" && (
          <div className="detail-result" style={{ color: "#f9ca24" }}>⏳ Match in progress</div>
        )}

        {/* Info badges */}
        <div className="info-badges">
          <InfoBadge icon="📍" label="Venue" value={match.venue} />
          <InfoBadge icon="📅" label="Date" value={match.date} />
          <InfoBadge icon="🪙" label="Toss" value={match.toss} />
          <InfoBadge icon="🏅" label="Player of the Match" value={match.player_of_the_match} />
          {match.series && match.series !== "N/A" && (
            <InfoBadge icon="🏆" label="Series" value={match.series} />
          )}
        </div>
      </div>

      {/* Scorecard note */}
      <div className="scorecard-note">
        <div className="scorecard-note-icon">📋</div>
        <div>
          <div className="scorecard-note-title">Ball-by-ball scorecard</div>
          <div className="scorecard-note-text">
            Detailed batting & bowling scorecard requires CricAPI Pro plan.
            The match summary above shows all available data from the free plan —
            scores, toss winner, venue, date, and player of the match.
          </div>
          {match.cricapi_id && (
            <a
              href={`https://www.espncricinfo.com/search?search=${encodeURIComponent(match.team1 + " vs " + match.team2)}`}
              target="_blank"
              rel="noreferrer"
              className="scorecard-link"
            >
              View full scorecard on ESPNcricinfo →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
