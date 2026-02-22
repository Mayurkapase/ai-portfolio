from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
import httpx
import os
from datetime import datetime
from contextlib import asynccontextmanager
from dotenv import load_dotenv

# ----------------------------
# Load Environment Variables
# ----------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

DATABASE = "portfolio.db"
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_MODEL = os.getenv(
    "OPENROUTER_MODEL",
    "mistralai/mistral-7b-instruct:free"
)

if not OPENROUTER_API_KEY:
    raise RuntimeError("OPENROUTER_API_KEY not found in .env file")


# ----------------------------
# Resume Context (Alex Morgan)
# ----------------------------
RESUME_CONTEXT = """
You are an AI assistant for Alex Morgan's portfolio website.

PERSONAL INFO:
- Name: Alex Morgan
- Location: San Francisco, CA
- Email: alex.morgan@email.com
- GitHub: github.com/alexmorgan
- LinkedIn: linkedin.com/in/alexmorgan

SUMMARY:
Full-stack developer with experience building scalable web applications
and AI-powered systems. Passionate about clean architecture,
performance optimization, and great user experience.

SKILLS:
- Frontend: React, TypeScript, Vue.js, Next.js, Tailwind CSS
- Backend: Python, FastAPI, Node.js, Express
- Databases: PostgreSQL, MongoDB, SQLite, Redis
- DevOps: Docker, GitHub Actions, AWS
- AI: OpenAI API, LangChain, Prompt Engineering

PROJECTS:
1. NeuralChat — AI customer support platform
2. DataFlow — Real-time ETL visualizer
3. PocketBudget — Finance tracking mobile app

Answer questions naturally and professionally.
Keep responses concise (2–4 sentences).
If information is not available, say you don't have that detail.
"""


# ----------------------------
# Database Functions
# ----------------------------
def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()

    conn.execute("""
        CREATE TABLE IF NOT EXISTS chat_sessions (
            id TEXT PRIMARY KEY,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            message_count INTEGER DEFAULT 0
        )
    """)

    conn.execute("""
        CREATE TABLE IF NOT EXISTS chat_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


# ----------------------------
# FastAPI App
# ----------------------------
app = FastAPI(title="Portfolio API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ----------------------------
# Request / Response Models
# ----------------------------
class ChatRequest(BaseModel):
    session_id: str
    message: str


class ChatResponse(BaseModel):
    response: str
    session_id: str


# ----------------------------
# Routes
# ----------------------------
@app.get("/")
def root():
    return {"status": "ok", "message": "Portfolio API running"}


@app.get("/api/health")
def health():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):

    db = get_db()

    # Create session if not exists
    db.execute(
        "INSERT OR IGNORE INTO chat_sessions (id) VALUES (?)",
        (req.session_id,)
    )

    # Save user message
    db.execute(
        "INSERT INTO chat_messages (session_id, role, content) VALUES (?, ?, ?)",
        (req.session_id, "user", req.message)
    )
    db.commit()

    # Get last 10 messages
    history = db.execute(
        """
        SELECT role, content
        FROM chat_messages
        WHERE session_id = ?
        ORDER BY created_at DESC
        LIMIT 10
        """,
        (req.session_id,)
    ).fetchall()

    history = list(reversed(history))
    messages = [{"role": row["role"], "content": row["content"]} for row in history]

    # Call OpenRouter API
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": OPENROUTER_MODEL,
                    "messages": [
                        {"role": "system", "content": RESUME_CONTEXT},
                        *messages
                    ],
                    "temperature": 0.7,
                    "max_tokens": 500
                }
            )

            response.raise_for_status()
            data = response.json()
            ai_response = data["choices"][0]["message"]["content"]

    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=502,
            detail=f"AI service error: {e.response.text}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # Save assistant response
    db.execute(
        "INSERT INTO chat_messages (session_id, role, content) VALUES (?, ?, ?)",
        (req.session_id, "assistant", ai_response)
    )

    db.execute(
        "UPDATE chat_sessions SET message_count = message_count + 2 WHERE id = ?",
        (req.session_id,)
    )

    db.commit()
    db.close()

    return ChatResponse(response=ai_response, session_id=req.session_id)


@app.get("/api/chat/history/{session_id}")
def get_history(session_id: str):
    db = get_db()
    messages = db.execute(
        """
        SELECT role, content, created_at
        FROM chat_messages
        WHERE session_id = ?
        ORDER BY created_at
        """,
        (session_id,)
    ).fetchall()
    db.close()

    return {"messages": [dict(m) for m in messages]}