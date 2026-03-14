#!/bin/bash

# Start the backend
echo "Starting Backend..."
cd /app/backend
uvicorn main:app --host 0.0.0.0 --port 8000 &

# Start the frontend
echo "Starting Frontend..."
cd /app/frontend
node server.js &

# Start Nginx in foreground
echo "Starting Nginx..."
nginx -g "daemon off;"
