const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || origin.includes("localhost") || origin.includes("127.0.0.1"))|| origin.includes("vercel.app") {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  }
}));
app.use(bodyParser.json({ limit: "10mb" }));

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/CricFanzz";
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "❌ MongoDB connection error:"));
db.once("open", () => console.log("✅ Connected to MongoDB"));

const BatterSchema = new mongoose.Schema({ name: String, runs: String, balls: String, fours: String, sixes: String, strike_rate: String });
const BowlerSchema = new mongoose.Schema({ name: String, overs: String, maidens: String, runs_conceded: String, wickets: String, economy: String });

const MatchDataSchema = new mongoose.Schema({
  cricapi_id: { type: String, unique: true },  // ← unique prevents duplicates
  status: String, team1: String, team2: String,
  score1: String, score2: String, score_data: String,
  match_result: String, match_url: String,
  venue: String, date: String, toss: String,
  player_of_the_match: String, current_run_rate: String,
  match_type: String, series: String,
  inning_1: { batting: [BatterSchema], bowling: [BowlerSchema] },
  inning_2: { batting: [BatterSchema], bowling: [BowlerSchema] },
}, { timestamps: true });

const MatchData = mongoose.model("MatchData", MatchDataSchema, "MatchData");

const weatherSchema = new mongoose.Schema({
  city: String, date: String, temperature: Number,
  humidity: Number, windSpeed: Number, cloudCover: Number, conditions: String,
}, { timestamps: true });
const WeatherData = mongoose.model("WeatherData", weatherSchema, "WeatherData");

// ====== Routes ======

app.get("/", (req, res) => {
  res.json({ status: "✅ CricFanzz backend is running", mongodb: db.readyState === 1 ? "connected" : "disconnected" });
});

// Save/Update matches — uses upsert so same match updates instead of duplicating
app.post("/save-data", async (req, res) => {
  try {
    const payload = req.body;
    if (!Array.isArray(payload) || payload.length === 0)
      return res.status(400).json({ error: "Expected a non-empty array." });

    let saved = 0;
    for (const match of payload) {
      if (match.cricapi_id) {
        // Upsert: update if exists, insert if new
        await MatchData.findOneAndUpdate(
          { cricapi_id: match.cricapi_id },
          { $set: match },
          { upsert: true, new: true }
        );
      } else {
        await MatchData.create(match);
      }
      saved++;
    }
    console.log(`✅ Upserted ${saved} matches`);
    res.json({ saved });
  } catch (error) {
    console.error("❌ Error saving:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get matches — only return matches from last 2 days to avoid stale data
app.get("/get-data", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    const matches = await MatchData.find({
      updatedAt: { $gte: twoDaysAgo }  // only recently updated matches
    }).sort({ updatedAt: -1 }).limit(limit);

    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch matches." });
  }
});

// Get all matches including old ones (for history)
app.get("/get-all", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const matches = await MatchData.find().sort({ updatedAt: -1 }).limit(limit);
    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch." });
  }
});

// Get single match
app.get("/get-match/:id", async (req, res) => {
  try {
    const match = await MatchData.findById(req.params.id);
    if (!match) return res.status(404).json({ message: "Match not found" });
    res.json(match);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch match." });
  }
});

// Clear ALL matches (clean slate)
app.delete("/clear-matches", async (req, res) => {
  try {
    const result = await MatchData.deleteMany({});
    console.log(`🗑️ Cleared ${result.deletedCount} matches`);
    res.json({ message: `✅ Cleared ${result.deletedCount} matches.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Weather
app.get("/fetch-weather/:city", async (req, res) => {
  try {
    const city = req.params.city;
    const apiKey = process.env.VISUAL_CROSSING_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Missing VISUAL_CROSSING_API_KEY" });
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(city)}?unitGroup=metric&key=${apiKey}&contentType=json`;
    const response = await axios.get(url);
    const today = response.data.days[0];
    const weather = new WeatherData({
      city, date: today.datetime, temperature: today.temp,
      humidity: today.humidity, windSpeed: today.windspeed,
      cloudCover: today.cloudcover, conditions: today.conditions,
    });
    const saved = await weather.save();
    res.json(saved);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log("\n====================================");
  console.log(`🚀 Backend running on port ${PORT}`);
  console.log(`🔍 Health: http://localhost:${PORT}/`);
  console.log("====================================\n");
});
