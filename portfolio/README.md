# Alex Morgan — AI Portfolio

A full-stack portfolio website with an AI chat assistant that answers questions about Alex's resume in real-time.

![Stack](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-61dafb?logo=react)
![Stack](https://img.shields.io/badge/Backend-Python%20%2B%20FastAPI-009688?logo=fastapi)
![Stack](https://img.shields.io/badge/DB-SQLite-003b57?logo=sqlite)
![Stack](https://img.shields.io/badge/AI-OpenRouter-ff6b6b)

## ✨ Features

- **AI Chat** — Powered by OpenRouter (free LLaMA model) with full resume context
- **Chat History** — SQLite stores conversation sessions for continuity
- **Suggested Questions** — Pre-built prompts to help users explore Alex's background
- **Responsive Design** — Works on mobile, tablet, and desktop
- **Dark Aesthetic** — Editorial dark theme with gold accents

## 🏗 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Backend | Python 3.11+ + FastAPI + Uvicorn |
| Database | SQLite (via built-in `sqlite3`) |
| AI | OpenRouter API (meta-llama/llama-3.2-3b-instruct:free) |
| Styling | Pure CSS with CSS variables |

## 📁 Project Structure

```
portfolio/
├── backend/
│   ├── main.py           # FastAPI app — chat endpoint, DB, OpenRouter
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.tsx       # Main portfolio UI
│   │   ├── App.css       # All styles
│   │   ├── index.css     # Design system & animations
│   │   ├── hooks/
│   │   │   └── useChat.ts  # Chat state management + API calls
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts    # Dev proxy → backend:8000
└── README.md
```

## 🚀 Quick Start

### 1. Get an OpenRouter API Key

1. Sign up at [openrouter.ai](https://openrouter.ai)
2. Create a free API key
3. The `meta-llama/llama-3.2-3b-instruct:free` model is free to use

### 2. Start the Backend

```bash
cd backend
pip install -r requirements.txt

# Set your API key
export OPENROUTER_API_KEY=sk-or-your-key-here

# Start server (SQLite DB auto-created)
uvicorn main:app --reload --port 8000
```

Backend runs at: `http://localhost:8000`

### 3. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:3000`

Vite proxies `/api/*` → `http://localhost:8000` automatically.

### 4. Open in browser

Visit `http://localhost:3000` — the chat is ready!

---

## 🌐 Deployment

### Cloudflare Tunnel (Free, Public URL)

```bash
# Install cloudflared
brew install cloudflare/cloudflare/cloudflared  # macOS
# or: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation

# Expose your frontend
cloudflared tunnel --url http://localhost:3000
```

This gives you a public `*.trycloudflare.com` URL instantly with no sign-up.

### Build for Production

```bash
# Build frontend
cd frontend && npm run build

# Serve static files via FastAPI (add to main.py):
# from fastapi.staticfiles import StaticFiles
# app.mount("/", StaticFiles(directory="../frontend/dist", html=True), name="static")

# Then run only the backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

---

## 🔧 Configuration

### Change the AI Model

Edit `backend/main.py`:

```python
OPENROUTER_MODEL = "meta-llama/llama-3.2-3b-instruct:free"  # free
# Other free options:
# "mistralai/mistral-7b-instruct:free"
# "google/gemma-2-9b-it:free"
# "qwen/qwen-2.5-7b-instruct:free"
```

### Customize the Resume

Update the `RESUME_CONTEXT` string in `backend/main.py` with real resume data.

---

## 🗄 Database Schema

```sql
-- Chat sessions (one per browser tab/user)
CREATE TABLE chat_sessions (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    message_count INTEGER DEFAULT 0
);

-- Individual messages within sessions
CREATE TABLE chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL,         -- 'user' | 'assistant'
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 📡 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/chat` | Send message, get AI response |
| GET | `/api/chat/history/{session_id}` | Get session history |

### POST /api/chat

```json
// Request
{ "session_id": "uuid", "message": "What's your tech stack?" }

// Response  
{ "response": "Alex primarily works with...", "session_id": "uuid" }
```

---

## 📦 GitHub Pages Deployment

```bash
# Build the frontend
cd frontend && npm run build

# Deploy to gh-pages branch
npm install -g gh-pages
gh-pages -d dist
```

Note: For full functionality (AI chat), the backend must also be deployed (e.g., Railway, Render, or Fly.io — all have free tiers).
