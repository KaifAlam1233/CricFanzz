import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

const CRICAPI_KEY = process.env.REACT_APP_CRICAPI_KEY;
const BACKEND = "http://localhost:3001";

const FLAG_MAP = {
  "india":"🇮🇳","ind":"🇮🇳","pakistan":"🇵🇰","pak":"🇵🇰",
  "australia":"🇦🇺","aus":"🇦🇺","england":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","eng":"🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "south africa":"🇿🇦","sa":"🇿🇦","new zealand":"🇳🇿","nz":"🇳🇿",
  "sri lanka":"🇱🇰","sl":"🇱🇰","bangladesh":"🇧🇩","ban":"🇧🇩",
  "west indies":"🏝️","wi":"🏝️","afghanistan":"🇦🇫","afg":"🇦🇫",
  "zimbabwe":"🇿🇼","zim":"🇿🇼","ireland":"🇮🇪","ire":"🇮🇪",
  "netherlands":"🇳🇱","ned":"🇳🇱","nepal":"🇳🇵","nep":"🇳🇵",
  "oman":"🇴🇲","uae":"🇦🇪","united arab emirates":"🇦🇪",
  "usa":"🇺🇸","united states":"🇺🇸","united states of america":"🇺🇸",
  "canada":"🇨🇦","namibia":"🇳🇦","uganda":"🇺🇬","tanzania":"🇹🇿",
  "rwanda":"🇷🇼","italy":"🇮🇹","scotland":"🏴󠁧󠁢󠁳󠁣󠁴󠁿","sco":"🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "kenya":"🇰🇪","malaysia":"🇲🇾","singapore":"🇸🇬","png":"🇵🇬",
  "vanuatu":"🇻🇺","cyprus":"🇨🇾","greece":"🇬🇷",
  "bahrain":"🇧🇭","qatar":"🇶🇦","kuwait":"🇰🇼",
  "hyderabad kingsmen":"🏏","multan sultans":"🏏",
  "karachi kings":"🏏","peshawar zalmi":"🏏",
  "lahore qalandars":"🏏","islamabad united":"🏏",
  "quetta gladiators":"🏏","rawalpindi rams":"🏏",
};

function getFlag(teamName) {
  if (!teamName) return "🏏";
  const key = teamName.toLowerCase().replace(/ u\d+$/i,"").replace(/ women$/i,"").trim();
  return FLAG_MAP[key] || "🏏";
}

function statusClass(status) {
  const s = (status||"").toUpperCase();
  if (s==="RESULT") return "status-result";
  if (s==="LIVE") return "status-live";
  if (s==="UPCOMING") return "status-upcoming";
  return "status-unknown";
}

function MatchCard({ match, onClick }) {
  return (
    <div className="match-card" onClick={onClick}>
      <div className="card-top">
        <span className={`match-status ${statusClass(match.status)}`}>
          {match.status==="LIVE" ? "🔴 LIVE" : match.status}
        </span>
        {match.match_type && <span className="match-type-badge">{match.match_type.toUpperCase()}</span>}
      </div>
      <div className="match-teams">
        <div className="team-row">
          <span className="team-flag">{getFlag(match.team1)}</span>
          <span className="team-name">{match.team1}</span>
          <span className="team-score">{match.score1!=="Yet to bat" ? match.score1 : ""}</span>
        </div>
        <div className="teams-divider">vs</div>
        <div className="team-row">
          <span className="team-flag">{getFlag(match.team2)}</span>
          <span className="team-name">{match.team2}</span>
          <span className="team-score">{match.score2!=="Yet to bat" ? match.score2 : ""}</span>
        </div>
      </div>
      {match.match_result && match.match_result!=="In Progress" && (
        <div className="match-result">{match.match_result}</div>
      )}
      <div className="match-meta">
        {match.venue && match.venue!=="N/A" && <span>📍 {match.venue}</span>}
        {match.date && match.date!=="N/A" && <span>📅 {match.date}</span>}
      </div>
    </div>
  );
}

const IPL_SHORTS = ["MI","CSK","RCB","KKR","DC","PBKS","RR","SRH","GT","LSG"];
const IPL_KW = ["ipl","indian premier league","super kings","knight riders","royal challengers",
  "sunrisers","rajasthan royals","mumbai indians","gujarat titans","lucknow super","punjab kings","delhi capitals"];
function isIPL(m) {
  const t1=(m.team1||"").toLowerCase(), t2=(m.team2||"").toLowerCase();
  return IPL_SHORTS.includes(m.team1)||IPL_SHORTS.includes(m.team2)||
    IPL_KW.some(k=>t1.includes(k)||t2.includes(k));
}

export default function Home() {
  const [allMatches, setAllMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [backendOk, setBackendOk] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const countdownRef = useRef(null);
  const navigate = useNavigate();

  const checkBackend = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND}/`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) { setBackendOk(true); return true; }
    } catch {}
    setBackendOk(false); return false;
  }, []);

  const loadFromDB = useCallback(async () => {
    setLoading(true); setError("");
    const alive = await checkBackend();
    if (!alive) { setError("❌ Backend not running. Run: node backend.js"); setLoading(false); return; }
    try {
      // Only get recently updated matches (last 2 days)
      const r = await fetch(`${BACKEND}/get-data?limit=60`);
      const data = await r.json();
      setAllMatches(data.filter(m => !isIPL(m)));
    } catch { setError("❌ Failed to load matches."); }
    setLoading(false);
  }, [checkBackend]);

  useEffect(() => { loadFromDB(); }, [loadFromDB]);

  // Auto-refresh countdown
  useEffect(() => {
    if (!autoRefresh) { clearInterval(countdownRef.current); setCountdown(60); return; }
    setCountdown(60);
    countdownRef.current = setInterval(() => {
      setCountdown(prev => { if (prev<=1) { loadFromDB(); return 60; } return prev-1; });
    }, 1000);
    return () => clearInterval(countdownRef.current);
  }, [autoRefresh, loadFromDB]);

  // Clear all old data from MongoDB
  const clearOldData = async () => {
    if (!window.confirm("Clear all saved match data and start fresh?")) return;
    setClearing(true);
    try {
      const res = await fetch(`${BACKEND}/clear-matches`, { method: "DELETE" });
      const data = await res.json();
      setMessage(`🗑️ ${data.message} Now click "Fetch Matches" to load fresh data.`);
      setAllMatches([]);
    } catch { setError("❌ Failed to clear data."); }
    setClearing(false);
  };

  const fetchFromCricAPI = async () => {
    setError(""); setMessage("");
    const alive = await checkBackend();
    if (!alive) { setError("❌ Backend not running. Run: node backend.js"); return; }
    if (!CRICAPI_KEY) { setError("❌ REACT_APP_CRICAPI_KEY missing in .env"); return; }

    setFetching(true);
    try {
      const res = await fetch(`https://api.cricapi.com/v1/currentMatches?apikey=${CRICAPI_KEY}&offset=0`);
      const data = await res.json();
      if (data.status!=="success") { setError(`❌ CricAPI: ${data.reason||data.status}`); setFetching(false); return; }

      const rawMatches = data.data || [];
      if (!rawMatches.length) { setMessage("⚠️ No matches right now. Try again soon."); setFetching(false); return; }

      const mapped = await Promise.all(rawMatches.map(async (m) => {
        let toss="N/A", potm="N/A", series="N/A";
        try {
          const infoRes = await fetch(`https://api.cricapi.com/v1/match_info?apikey=${CRICAPI_KEY}&id=${m.id}`);
          const infoData = await infoRes.json();
          if (infoData.status==="success" && infoData.data) {
            const d = infoData.data;
            toss = d.tossChoice ? `${d.tossWinner} chose to ${d.tossChoice}` : d.tossWinner ? `${d.tossWinner} won the toss` : "N/A";
            potm = d.playerOfMatch?.[0]?.name || "N/A";
            series = d.series_id || "N/A";
          }
        } catch {}
        const scores = m.score || [];
        return {
          cricapi_id: m.id,
          // Use CricAPI's own matchEnded/matchStarted for accurate status
          status: m.matchEnded ? "RESULT" : m.matchStarted ? "LIVE" : "UPCOMING",
          team1: m.teams?.[0]||"TBD", team2: m.teams?.[1]||"TBD",
          score1: scores[0] ? `${scores[0].r}/${scores[0].w} (${scores[0].o} ov)` : "Yet to bat",
          score2: scores[1] ? `${scores[1].r}/${scores[1].w} (${scores[1].o} ov)` : "Yet to bat",
          score_data: JSON.stringify(scores),
          match_result: m.status||"In Progress",
          match_type: m.matchType||"", venue: m.venue||"N/A",
          date: m.date ? m.date.split("T")[0] : "N/A",
          toss, player_of_the_match: potm, series, current_run_rate: "N/A",
          inning_1:{batting:[],bowling:[]}, inning_2:{batting:[],bowling:[]},
        };
      }));

      const saveRes = await fetch(`${BACKEND}/save-data`, {
        method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(mapped)
      });
      if (!saveRes.ok) throw new Error("Failed to save to backend");
      const saved = await saveRes.json();
      setMessage(`✅ Updated ${saved.saved} matches with latest data!`);
      loadFromDB();
    } catch (err) { setError(`❌ ${err.message}`); }
    setFetching(false);
  };

  const liveMatches     = allMatches.filter(m => m.status==="LIVE");
  const upcomingMatches = allMatches.filter(m => m.status==="UPCOMING");
  const recentMatches   = allMatches.filter(m => m.status==="RESULT");

  return (
    <div>
      {backendOk===false && (
        <div className="backend-warning">⚠️ <strong>Backend offline.</strong> Run: <code>node backend.js</code></div>
      )}

      <div className="home-header">
        <h1 className="page-title">🌍 International Matches</h1>
        <div className="home-actions">
          {/* Auto-refresh toggle */}
          <div className="refresh-toggle" onClick={() => setAutoRefresh(p=>!p)}>
            <div className={`toggle-switch ${autoRefresh?"toggle-on":""}`}><div className="toggle-knob"/></div>
            <span className="toggle-label">{autoRefresh ? `Auto ${countdown}s` : "Auto-refresh"}</span>
          </div>
          <button className="refresh-btn" onClick={loadFromDB}>🔄</button>
          <button className="clear-btn" onClick={clearOldData} disabled={clearing} title="Clear stale data">
            {clearing ? "..." : "🗑️ Clear"}
          </button>
          <button className="fetch-btn" onClick={fetchFromCricAPI} disabled={fetching}>
            {fetching ? "⏳ Fetching..." : "⬇️ Fetch Matches"}
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}

      {loading ? <div className="loading">⏳ Loading...</div> : <>

        {/* LIVE */}
        <div className="section-header live-header">
          <span className="section-dot live-dot"></span>
          <h2 className="section-title">Live</h2>
          <span className="section-count">{liveMatches.length}</span>
          {autoRefresh && <span className="refresh-badge">🔄 {countdown}s</span>}
        </div>
        {liveMatches.length===0
          ? <div className="section-empty">No live matches right now.</div>
          : <div className="matches-grid">{liveMatches.map(m=><MatchCard key={m._id} match={m} onClick={()=>navigate(`/match/${m._id}`)}/>)}</div>
        }

        {/* UPCOMING */}
        <div className="section-header" style={{marginTop:"28px"}}>
          <span className="section-dot upcoming-dot"></span>
          <h2 className="section-title">Upcoming</h2>
          <span className="section-count">{upcomingMatches.length}</span>
        </div>
        {upcomingMatches.length===0
          ? <div className="section-empty">No upcoming matches scheduled.</div>
          : <div className="matches-grid">{upcomingMatches.map(m=><MatchCard key={m._id} match={m} onClick={()=>navigate(`/match/${m._id}`)}/>)}</div>
        }

        {/* RECENT */}
        <div className="section-header" style={{marginTop:"28px"}}>
          <span className="section-dot recent-dot"></span>
          <h2 className="section-title">Recent Results</h2>
          <span className="section-count">{recentMatches.length}</span>
        </div>
        {recentMatches.length===0
          ? <div className="section-empty">No recent results found.</div>
          : <div className="matches-grid">{recentMatches.map(m=><MatchCard key={m._id} match={m} onClick={()=>navigate(`/match/${m._id}`)}/>)}</div>
        }
      </>}
    </div>
  );
}
