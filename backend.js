const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config(); // For environment variables

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/CricFanzz";
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => console.log("✅ Connected to MongoDB"));

// ====== 🔹 Schemas ======

// Batting and Bowling Sub-schemas

const BatterSchema = new mongoose.Schema({
  name: String,
  runs: String,
  balls: String,
  fours: String,
  sixes: String,
  strike_rate: String,
});

const BowlerSchema = new mongoose.Schema({
  name: String,
  overs: String,
  maidens: String,
  runs_conceded: String,
  wickets: String,
  economy: String,
});

// const InningSchema = new mongoose.Schema({
//   batting: [BatterSchema],
//   bowling: [BowlerSchema],
// });

const MatchDataSchema = new mongoose.Schema({
  status: String,
  team1: String,
  team2: String,
  score1: String,
  score2: String,
  match_result: String,
  match_url: String,
  venue: String,
  date: String,
  toss: String,
  player_of_the_match: String,
  current_run_rate: String,
  inning_1: {
    batting: [BatterSchema],
    bowling: [BowlerSchema],
  },
  inning_2: {
    batting: [BatterSchema],
    bowling: [BowlerSchema],
  },
});

const MatchData = mongoose.model("MatchData", MatchDataSchema, "MatchData");

// Weather Schema
const weatherSchema = new mongoose.Schema({
  city: String,
  date: String,
  temperature: Number,
  humidity: Number,
  windSpeed: Number,
  cloudCover: Number,
  conditions: String,
  fetchedAt: { type: Date, default: Date.now },
});
const WeatherData = mongoose.model("WeatherData", weatherSchema, "WeatherData");

// ====== 🔹 Routes ======

// Save match data
app.post("/save-data", async (req, res) => {
  try {
    const payload = req.body;
    if (!Array.isArray(payload)) {
      return res.status(400).send("Invalid data format. Expected an array.");
    }
    await MatchData.insertMany(payload);
    console.log("✅ Match data saved");
    res.send("✅ Match data saved successfully.");
  } catch (error) {
    console.error("❌ Error saving match data:", error);
    res.status(500).send("❌ Failed to save match data.");
  }
});

// Get latest matches
app.get("/get-data", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const matches = await MatchData.find().sort({ createdAt: -1 }).limit(limit);
    res.json(matches);
  } catch (error) {
    console.error("❌ Error fetching match data:", error);
    res.status(500).send("❌ Failed to fetch match data.");
  }
});

// Get match by ID
app.get("/get-match/:id", async (req, res) => {
  try {
    const matchId = req.params.id;
    const match = await MatchData.findById(matchId);
    if (!match) return res.status(404).json({ message: "Match not found" });
    res.json(match);
  } catch (error) {
    console.error("❌ Error fetching match:", error);
    res.status(500).send("❌ Failed to fetch match by ID.");
  }
});

// 🔹 Weather Fetch Route using Visual Crossing
app.get("/fetch-weather/:city", async (req, res) => {
  try {
    const city = req.params.city;
    const apiKey = process.env.VISUAL_CROSSING_API_KEY;

    if (!apiKey) {
      console.error("❌ API key not found in environment variables.");
      return res.status(500).json({ error: "Missing API key" });
    }

    console.log("🛠️ Using API Key:", apiKey); // Debug line

    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?unitGroup=metric&key=${apiKey}&contentType=json`;

    const response = await axios.get(url);
    const today = response.data.days[0];

    const weather = new WeatherData({
      city,
      date: today.datetime,
      temperature: today.temp,
      humidity: today.humidity,
      windSpeed: today.windspeed,
      cloudCover: today.cloudcover,
      conditions: today.conditions,
    });

    const saved = await weather.save();
    console.log("✅ Weather data saved:", saved);
    res.json(saved);
  } catch (error) {
    console.error("❌ Weather fetch error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ====== 🔹 Start Server ======
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
