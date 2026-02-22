#!/bin/bash
# start.sh — Run both frontend and backend

set -e

echo "🚀 Starting Alex Morgan Portfolio..."

# Check for API key
if [ -z "$OPENROUTER_API_KEY" ]; then
  echo "⚠️  Warning: OPENROUTER_API_KEY not set. AI chat will fail."
  echo "   Run: export OPENROUTER_API_KEY=sk-or-your-key-here"
fi

# Start backend in background
echo "🐍 Starting Python backend on :8000..."
cd backend
pip install -r requirements.txt -q
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!

# Start frontend
echo "⚛️  Starting React frontend on :3000..."
cd ../frontend
npm install --silent
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Running!"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo "   API docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers."

# Handle shutdown
trap "echo 'Stopping...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM

wait
