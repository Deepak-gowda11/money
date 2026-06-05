# FAKE SHIELD 🛡️
## AI-Driven Social Network Intelligence System

**Fake News Detection · Cyber Threat Analysis · Real-Time Alerts**

---

## 🚀 Quick Start

### 1. Backend (FastAPI + Gemini AI)
```bash
cd backend
pip install -r requirements.txt
python main.py
# OR
uvicorn main:app --reload --port 8000
```

### 2. Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:3000
```

### 3. Configure Gemini AI (Optional but recommended)
Edit `backend/.env`:
```
GEMINI_API_KEY=your_api_key_here
```
Get your API key from: https://aistudio.google.com/app/apikey

> Without Gemini, the system uses the built-in heuristic NLP engine.

---

## 🏗️ Architecture

```
money/
├── frontend/          # Next.js App Router (port 3000)
│   ├── app/           # Pages & layouts
│   ├── components/    # React components
│   └── lib/api.ts     # Backend API client
│
├── backend/           # FastAPI (port 8000)
│   ├── main.py        # App entry & endpoints
│   ├── modules/
│   │   ├── fake_news.py      # Gemini AI NLP classifier
│   │   ├── cyber_threat.py   # URL phishing analyzer
│   │   └── bot_detection.py  # NetworkX graph analyzer
│   └── data/
│       └── mock_data.py      # Threat DB & alert simulation
│
├── start-backend.bat  # Windows: start backend
└── start-frontend.bat # Windows: start frontend
```

---

## 🤖 AI Modules

| Module | Technology | Function |
|--------|-----------|----------|
| **Fake News NLP** | Google Gemini AI | Classifies text as REAL/FAKE with reasoning |
| **Cyber Threat** | Heuristic Engine | Phishing URL detection & typosquatting |
| **Bot Detection** | NetworkX Graphs | Behavioral anomaly & cluster analysis |
| **Live Alerts** | AsyncIO + Mock | Simulated real-time threat stream |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analyze` | Main concurrent analysis |
| GET | `/api/alerts` | Live alert feed |
| GET | `/api/alerts/latest` | Latest alerts since ID |
| GET | `/api/threats` | Threat intelligence DB |
| GET | `/api/network` | Bot network graph data |
| GET | `/api/stats` | Dashboard statistics |
| GET | `/api/health` | System health check |

---

## 🎨 UI Features

- **Cinematic Intro** — Animated boot sequence on launch
- **Live Alert Carousel** — Auto-scrolling real-time threat feed
- **Analysis Terminal** — Submit text/URL/usernames for analysis
- **Network Hub** — Visual bot cluster graph + data grid
- **Threat Database** — Searchable & filterable threat intel
- **Toast Notifications** — CRITICAL/HIGH/LOW severity alerts

---

## ⚡ Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS v4, Lucide React
- **Backend**: Python 3.11+, FastAPI, Uvicorn, Pydantic
- **AI**: Google Gemini AI (gemini-2.0-flash)
- **Graphs**: NetworkX (behavioral bot detection)
- **Data**: In-memory store with mock threat intelligence DB
