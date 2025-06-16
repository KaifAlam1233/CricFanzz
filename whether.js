require("dotenv").config();
const axios = require("axios");
const mongoose = require("mongoose");

// MongoDB connection
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/CricketVerse";
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => console.log("Connected to MongoDB"));

// Weather schema
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

// Function to fetch and store weather
async function fetchAndStoreWeather(city, country, date) {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const url = `http://api.openweathermap.org/data/2.5/weather?q=${city},${country}&appid=${apiKey}&units=metric`;

    const response = await axios.get(url);
    const data = response.data;

    const weather = {
      city,
      country,
      date,
      temperature: data.main.temp,
      humidity: data.main.humidity,
      wind_speed: data.wind.speed,
      condition: data.weather[0].main,
    };

    const saved = await new WeatherData(weather).save();
    console.log("✅ Weather data saved:", saved);
  } catch (error) {
    console.error("❌ Failed to fetch/store weather:", error.message);
  } finally {
    mongoose.connection.close();
  }
}

// 🧪 Example call
const city = "Delhi"; // Replace with dynamic city
const country = "IN"; // ISO country code
const date = new Date().toISOString().split("T")[0]; // today
fetchAndStoreWeather(city, country, date);
