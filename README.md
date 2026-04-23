# 🏏 CricFanzz — Live Cricket Score Websites

CricFanzz is a full-stack web application that provides live cricket scores, match details, and venue weather using a secure API-based architecture.

The project uses **CricketData API (formerly CricAPI)** and avoids web scraping for reliable and scalable performance.

---

## 🚀 Features

* 📊 Live cricket scores
* 🏟 Match details
* 🌦 Venue weather information
* 🔐 Secure backend API integration
* ⚡ Fast and responsive UI

---

## 🧠 How It Works

* React frontend sends requests to the backend
* Node.js (Express) backend fetches data from CricketData API
* API keys are stored securely in `.env`
* No sensitive data is exposed to the frontend

---

## 🛠 Tech Stack

* **Frontend:** React.js
* **Backend:** Node.js, Express.js
* **Cricket API:** CricketData (CricAPI)
* **Weather API:** Visual Crossing
* **Other Tools:** Axios, dotenv

---

## ⚙️ Setup & Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/CricFanzz.git
cd CricFanzz
```

---

### 2. Install dependencies

```bash
npm install
```

---

### 3. Create `.env` file

```env
CRICKET_API_KEY=your_cricketdata_api_key
VISUAL_CROSSING_API_KEY=your_weather_api_key
PORT=5000
```

---

## ▶️ Run the Project

### 🖥 Terminal 1 — Backend

```bash
node backend.js
```

You should see:

* Connected to MongoDB
* Backend running at http://localhost:3001

---

### 🌐 Terminal 2 — Frontend

```bash
npm start
```

* App runs at: http://localhost:3000

---

## 📊 Load Match Data

Click **⬇️ Fetch Live Matches** button on the homepage.

---

## 🔌 API Endpoints (Backend)

| Method | Endpoint               | Description                       |
| ------ | ---------------------- | --------------------------------- |
| GET    | `/`                    | Health check                      |
| POST   | `/save-data`           | Save matches (called by frontend) |
| GET    | `/get-data?limit=30`   | Get saved matches                 |
| GET    | `/get-match/:id`       | Get single match                  |
| DELETE | `/clear-matches`       | Clear all matches                 |
| GET    | `/fetch-weather/:city` | Get city weather                  |

---

## 🔐 Security

* API keys stored in `.env` (not uploaded)
* `.env` protected via `.gitignore`
* All API calls handled in backend

---

## 📦 Project Structure

```
CricFanzz/
 ├── src/              # React frontend
 ├── public/
 ├── backend.js        # Express backend
 ├── package.json
 ├── .gitignore
 ├── .env (not uploaded)
```

---

## 🚀 Future Improvements

* 🔎 Match search and filtering
* 📱 Improved responsive UI
* 🎨 Better UI/UX (cards, animations)
* 📊 Advanced match statistics
* 🌐 Deployment with custom domain

---

## 👨‍💻 Author

Developed by Md Kaif Alam
