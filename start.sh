#!/bin/bash

# Start the Backend (FastAPI)
echo "🚀 Starting Backend (uvicorn)..."
cd /app/backend
uvicorn main:app --host 0.0.0.0 --port 8000 &

# Start the Frontend (Next.js)
echo "🚀 Starting Frontend (node)..."
cd /app/frontend
node server.js
