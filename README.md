# 🏏 CricFanzz — Setup & Run Guide

## How it works
- **React frontend** calls CricAPI directly from your browser
- Saves match data to **MongoDB** via the Express backend
- View live scores, match details, and venue weather

---

## Step 1 — Your .env file (already configured)
```
MONGO_URI=mongodb://localhost:27017/CricketVerse
VISUAL_CROSSING_API_KEY=QL9VKVZYSDGSNWB767MLPZUZT
PORT=3001
REACT_APP_CRICAPI_KEY=your-cricapi-key-here
```
⚠️ The `REACT_APP_` prefix is required — React ignores variables without it.

---

## Step 2 — Install dependencies (run once)
```bash
npm install
```

---

## Step 3 — Run the project (2 terminals)

### Terminal 1 — Backend
```bash
node backend.js
```
✅ You should see:
```
✅ Connected to MongoDB
🚀 Backend running at http://localhost:3001
```

### Terminal 2 — Frontend
```bash
npm start
```
✅ Browser opens at http://localhost:3000 (or 3002 if 3000 is busy)

---

## Step 4 — Load match data
Click **"⬇️ Fetch Live Matches"** button on the homepage.

---

## API Endpoints (Backend)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/save-data` | Save matches (called by frontend) |
| GET | `/get-data?limit=30` | Get saved matches |
| GET | `/get-match/:id` | Get single match |
| DELETE | `/clear-matches` | Clear all matches |
| GET | `/fetch-weather/:city` | Get city weather |
