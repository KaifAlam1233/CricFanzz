import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

const CRICAPI_KEY = process.env.REACT_APP_CRICAPI_KEY;
const BACKEND = "http://localhost:3001";

// ✅ CORRECT IPL 2026 Season 19 Points Table (from screenshot)
const IPL_POINTS_TABLE = [
  { team: "Punjab Kings",                short: "PBKS", emoji: "🔴", p: 6,  w: 5, l: 0, nr: 1, pts: 11, nrr: "+1.420" },
  { team: "Rajasthan Royals",            short: "RR",   emoji: "🩷", p: 7,  w: 5, l: 2, nr: 0, pts: 10, nrr: "+0.790" },
  { team: "Royal Challengers Bengaluru", short: "RCB",  emoji: "🔴", p: 6,  w: 4, l: 2, nr: 0, pts: 8,  nrr: "+1.171" },
  { team: "Sunrisers Hyderabad",         short: "SRH",  emoji: "🟠", p: 7,  w: 4, l: 3, nr: 0, pts: 8,  nrr: "+0.820" },
  { team: "Delhi Capitals",              short: "DC",   emoji: "🔵", p: 6,  w: 3, l: 3, nr: 0, pts: 6,  nrr: "-0.130" },
  { team: "Gujarat Titans",              short: "GT",   emoji: "🩵", p: 6,  w: 3, l: 3, nr: 0, pts: 6,  nrr: "-0.821" },
  { team: "Mumbai Indians",              short: "MI",   emoji: "🔵", p: 6,  w: 2, l: 4, nr: 0, pts: 4,  nrr: "+0.067" },
  { team: "Chennai Super Kings",         short: "CSK",  emoji: "🟡", p: 6,  w: 2, l: 4, nr: 0, pts: 4,  nrr: "-0.780" },
  { team: "Lucknow Super Giants",        short: "LSG",  emoji: "🩵", p: 7,  w: 2, l: 5, nr: 0, pts: 4,  nrr: "-1.277" },
  { team: "Kolkata Knight Riders",       short: "KKR",  emoji: "🟣", p: 7,  w: 1, l: 5, nr: 1, pts: 3,  nrr: "-0.879" },
];

const IPL_TEAMS = {
  "Mumbai Indians":              { short: "MI",   color: "#004BA0", bg: "#001830" },
  "Chennai Super Kings":         { short: "CSK",  color: "#F9CD05", bg: "#1A1200" },
  "Royal Challengers Bengaluru": { short: "RCB",  color: "#EC1C24", bg: "#1A0000" },
  "Kolkata Knight Riders":       { short: "KKR",  color: "#9B59B6", bg: "#1A0030" },
  "Delhi Capitals":              { short: "DC",   color: "#17479E", bg: "#001530" },
  "Punjab Kings":                { short: "PBKS", color: "#ED1B24", bg: "#1A0000" },
  "Rajasthan Royals":            { short: "RR",   color: "#EA1A85", bg: "#1A0015" },
  "Sunrisers Hyderabad":         { short: "SRH",  color: "#F7A721", bg: "#1A0D00" },
  "Gujarat Titans":              { short: "GT",   color: "#A2DCFF", bg: "#001030" },
  "Lucknow Super Giants":        { short: "LSG",  color: "#00B4D8", bg: "#001A2A" },
};

function isIPLMatch(match) {
  const iplShorts = ["MI", "CSK", "RCB", "KKR", "DC", "PBKS", "RR", "SRH", "GT", "LSG"];
  const iplKeywords = ["ipl", "indian premier league", "super kings", "knight riders",
    "royal challengers", "sunrisers", "rajasthan royals", "mumbai indians",
    "gujarat titans", "lucknow super", "punjab kings", "delhi capitals"];
  const t1 = (match.team1 || "").toLowerCase();
  const t2 = (match.team2 || "").toLowerCase();
  const series = (match.series || "").toLowerCase();
  return (
    iplShorts.includes(match.team1) || iplShorts.includes(match.team2) ||
    iplKeywords.some(k => t1.includes(k) || t2.includes(k) || series.includes(k))
  );
}

function getTeamInfo(name) {
  const key = Object.keys(IPL_TEAMS).find(k =>
    name?.toLowerCase().includes(k.toLowerCase()) ||
    k.toLowerCase().includes(name?.toLowerCase())
  );
  return key
    ? { ...IPL_TEAMS[key], short: IPL_TEAMS[key].short }
    : { short: name?.slice(0, 3).toUpperCase() || "TBD", color: "#00d4aa", bg: "#001a15" };
}

function IPLMatchCard({ match, onClick }) {
  const t1 = getTeamInfo(match.team1);
  const t2 = getTeamInfo(match.team2);
  const isLive = match.status === "LIVE";
  const isUpcoming = match.status === "UPCOMING";

  return (
    <div className="ipl-card" onClick={onClick}>
      {isLive && <div className="ipl-live-bar">🔴 LIVE NOW</div>}
      {isUpcoming && <div className="ipl-upcoming-bar">🕐 UPCOMING</div>}
      <div className="ipl-teams">
        <div className="ipl-team">
          <div className="ipl-team-badge" style={{ background: t1.bg, border: `2px solid ${t1.color}` }}>
            <span style={{ color: t1.color, fontWeight: 800, fontSize: "1rem" }}>{t1.short}</span>
          </div>
          <div className="ipl-team-name">{match.team1}</div>
          <div className="ipl-team-score" style={{ color: t1.color }}>
            {match.score1 !== "Yet to bat" ? match.score1 : isUpcoming ? "TBD" : "—"}
          </div>
        </div>
        <div className="ipl-vs-block">
          <div className="ipl-vs">VS</div>
          {match.date && match.date !== "N/A" && (
            <div className="ipl-date">{match.date}</div>
          )}
        </div>
        <div className="ipl-team">
          <div className="ipl-team-badge" style={{ background: t2.bg, border: `2px solid ${t2.color}` }}>
            <span style={{ color: t2.color, fontWeight: 800, fontSize: "1rem" }}>{t2.short}</span>
          </div>
          <div className="ipl-team-name">{match.team2}</div>
          <div className="ipl-team-score" style={{ color: t2.color }}>
            {match.score2 !== "Yet to bat" ? match.score2 : isUpcoming ? "TBD" : "—"}
          </div>
        </div>
      </div>
      {match.match_result && match.match_result !== "In Progress" && (
        <div className="ipl-result">{match.match_result}</div>
      )}
      {match.toss && match.toss !== "N/A" && (
        <div className="ipl-toss">🪙 {match.toss}</div>
      )}
      {match.venue && match.venue !== "N/A" && (
        <div className="ipl-meta">📍 {match.venue}</div>
      )}
    </div>
  );
}

export default function IPL() {
  const [allMatches, setAllMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("matches");
  const [countdown, setCountdown] = useState(60);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const countdownRef = useRef(null);
  const navigate = useNavigate();

  const loadFromDB = useCallback(async () => {
    setError("");
    try {
      const r = await fetch(`${BACKEND}/get-data?limit=100`);
      const data = await r.json();
      setAllMatches(data.filter(isIPLMatch));
    } catch {
      setError("❌ Backend not running. Run: node backend.js");
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadFromDB(); }, [loadFromDB]);

  // Auto-refresh countdown
  useEffect(() => {
    if (!autoRefresh) {
      clearInterval(countdownRef.current);
      setCountdown(60);
      return;
    }
    setCountdown(60);
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          loadFromDB();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countdownRef.current);
  }, [autoRefresh, loadFromDB]);


  const clearOldData = async () => {
    if (!window.confirm("Clear all IPL match data and start fresh?")) return;
    setClearing(true);
    try {
      const res = await fetch(`${BACKEND}/clear-matches`, { method: "DELETE" });
      const data = await res.json();
      setMessage(`🗑️ ${data.message} Now click "Fetch IPL" to reload.`);
      setAllMatches([]);
    } catch { setError("❌ Failed to clear."); }
    setClearing(false);
  };

  const fetchIPL = async () => {
    setError(""); setMessage("");
    if (!CRICAPI_KEY) { setError("❌ REACT_APP_CRICAPI_KEY missing in .env"); return; }
    setFetching(true);
    try {
      const res = await fetch(`https://api.cricapi.com/v1/currentMatches?apikey=${CRICAPI_KEY}&offset=0`);
      const data = await res.json();
      if (data.status !== "success") { setError(`❌ CricAPI: ${data.reason}`); setFetching(false); return; }

      const allRaw = data.data || [];
      const iplRaw = allRaw.filter(isIPLMatch);

      if (iplRaw.length === 0) {
        setMessage("⚠️ No IPL matches live right now. Upcoming matches will appear here when scheduled.");
        setFetching(false);
        return;
      }

      const mapped = await Promise.all(iplRaw.map(async (m) => {
        let toss = "N/A", potm = "N/A";
        try {
          const infoRes = await fetch(`https://api.cricapi.com/v1/match_info?apikey=${CRICAPI_KEY}&id=${m.id}`);
          const infoData = await infoRes.json();
          if (infoData.status === "success" && infoData.data) {
            const d = infoData.data;
            toss = d.tossChoice ? `${d.tossWinner} chose to ${d.tossChoice}` : d.tossWinner ? `${d.tossWinner} won the toss` : "N/A";
            potm = d.playerOfMatch?.[0]?.name || "N/A";
          }
        } catch {}
        const scores = m.score || [];
        return {
          cricapi_id: m.id,
          status: m.matchEnded ? "RESULT" : m.matchStarted ? "LIVE" : "UPCOMING",
          team1: m.teams?.[0] || "TBD", team2: m.teams?.[1] || "TBD",
          score1: scores[0] ? `${scores[0].r}/${scores[0].w} (${scores[0].o} ov)` : "Yet to bat",
          score2: scores[1] ? `${scores[1].r}/${scores[1].w} (${scores[1].o} ov)` : "Yet to bat",
          score_data: JSON.stringify(scores),
          match_result: m.status || "In Progress",
          match_type: "IPL", venue: m.venue || "N/A",
          date: m.date ? m.date.split("T")[0] : "N/A",
          toss, player_of_the_match: potm, series: "IPL 2026",
          current_run_rate: "N/A",
          inning_1: { batting: [], bowling: [] }, inning_2: { batting: [], bowling: [] },
        };
      }));

      const saveRes = await fetch(`${BACKEND}/save-data`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(mapped) });
      if (!saveRes.ok) throw new Error("Failed to save");
      const saved = await saveRes.json();
      setMessage(`✅ Fetched ${saved.saved} IPL matches!`);
      loadFromDB();
    } catch (err) { setError(`❌ ${err.message}`); }
    setFetching(false);
  };

  const liveMatches   = allMatches.filter(m => m.status === "LIVE");
  const upcomingMatches = allMatches.filter(m => m.status === "UPCOMING");
  const recentMatches = allMatches.filter(m => m.status === "RESULT");

  return (
    <div>
      {/* IPL Banner */}
      <div className="ipl-banner">
        <div className="ipl-banner-text">
          <div className="ipl-banner-title">🏆 IPL 2026</div>
          <div className="ipl-banner-sub">Indian Premier League • Season 19</div>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          {/* Auto Refresh Toggle */}
          <div className="refresh-toggle" onClick={() => setAutoRefresh(p => !p)}>
            <div className={`toggle-switch ${autoRefresh ? "toggle-on" : ""}`}>
              <div className="toggle-knob" />
            </div>
            <span className="toggle-label">
              {autoRefresh ? `Auto-refresh ${countdown}s` : "Auto-refresh"}
            </span>
          </div>
          <button className="refresh-btn" onClick={loadFromDB}>🔄 Refresh</button>
          <button className="clear-btn" onClick={clearOldData} disabled={clearing} title="Clear stale data">{clearing ? "..." : "🗑️ Clear"}</button>
          <button className="fetch-btn" onClick={fetchIPL} disabled={fetching}>
            {fetching ? "⏳ Fetching..." : "⬇️ Fetch IPL"}
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}

      {/* Tabs */}
      <div className="ipl-tabs">
        <button className={`ipl-tab ${activeTab === "matches" ? "ipl-tab-active" : ""}`} onClick={() => setActiveTab("matches")}>🏏 Matches</button>
        <button className={`ipl-tab ${activeTab === "table" ? "ipl-tab-active" : ""}`} onClick={() => setActiveTab("table")}>📊 Points Table</button>
      </div>

      {activeTab === "matches" && (
        loading ? <div className="loading">⏳ Loading...</div> : <>

          {/* LIVE */}
          <div className="section-header live-header">
            <span className="section-dot live-dot"></span>
            <h2 className="section-title">Live</h2>
            <span className="section-count">{liveMatches.length} matches</span>
            {autoRefresh && <span className="refresh-badge">🔄 Next refresh in {countdown}s</span>}
          </div>
          {liveMatches.length === 0
            ? <div className="section-empty">No IPL matches live right now.</div>
            : <div className="ipl-grid">{liveMatches.map(m => <IPLMatchCard key={m._id} match={m} onClick={() => navigate(`/match/${m._id}`)} />)}</div>
          }

          {/* UPCOMING */}
          <div className="section-header" style={{ marginTop: "32px" }}>
            <span className="section-dot upcoming-dot"></span>
            <h2 className="section-title">Upcoming</h2>
            <span className="section-count">{upcomingMatches.length} matches</span>
          </div>
          {upcomingMatches.length === 0
            ? <div className="section-empty">No upcoming IPL matches scheduled yet. Fetch to check.</div>
            : <div className="ipl-grid">{upcomingMatches.map(m => <IPLMatchCard key={m._id} match={m} onClick={() => navigate(`/match/${m._id}`)} />)}</div>
          }

          {/* RECENT */}
          <div className="section-header" style={{ marginTop: "32px" }}>
            <span className="section-dot recent-dot"></span>
            <h2 className="section-title">Recent Results</h2>
            <span className="section-count">{recentMatches.length} matches</span>
          </div>
          {recentMatches.length === 0
            ? <div className="section-empty">No recent IPL results yet.</div>
            : <div className="ipl-grid">{recentMatches.map(m => <IPLMatchCard key={m._id} match={m} onClick={() => navigate(`/match/${m._id}`)} />)}</div>
          }
        </>
      )}

      {activeTab === "table" && (
        <div className="points-table-wrapper">
          <div className="points-table-title">📊 IPL 2026 Points Table</div>
          <div className="points-note">Season 19 • Updated as of latest matches</div>
          <div className="table-wrapper">
            <table className="points-table">
              <thead>
                <tr><th>#</th><th>Team</th><th>P</th><th>W</th><th>L</th><th>NR</th><th>Pts</th><th>NRR</th></tr>
              </thead>
              <tbody>
                {IPL_POINTS_TABLE.map((row, i) => (
                  <tr key={row.short} className={i < 4 ? "playoff-row" : ""}>
                    <td className="pos-cell">{i + 1}</td>
                    <td className="team-cell">
                      <span className="pt-emoji">{row.emoji}</span>
                      <span className="pt-team-name">{row.team}</span>
                      <span className="pt-short">({row.short})</span>
                    </td>
                    <td>{row.p}</td>
                    <td className="win-cell">{row.w}</td>
                    <td>{row.l}</td>
                    <td>{row.nr}</td>
                    <td className="pts-cell"><strong>{row.pts}</strong></td>
                    <td className={`nrr-cell ${row.nrr.startsWith("+") ? "nrr-pos" : "nrr-neg"}`}>{row.nrr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="playoff-legend">🟢 Top 4 qualify for playoffs</div>
        </div>
      )}
    </div>
  );
}
