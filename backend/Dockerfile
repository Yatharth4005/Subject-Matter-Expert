FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright and its browser dependencies
RUN playwright install chromium && playwright install-deps

# Copy application code
COPY . .

# Environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=8080

# Run uvicorn on the port provided by Cloud Run
CMD uvicorn main:app --host 0.0.0.0 --port $PORT
