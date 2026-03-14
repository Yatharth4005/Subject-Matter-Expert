# --- Build Stage: Frontend ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# --- Build Stage: Backend ---
FROM python:3.11-slim AS backend-builder
WORKDIR /app/backend
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .

# --- Final Production Image ---
FROM python:3.11-slim

# Install Node.js, Nginx, and Chrome dependencies
RUN apt-get update && apt-get install -y \
    curl \
    nginx \
    gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy Backend
COPY --from=backend-builder /app/backend /app/backend
RUN pip install --no-cache-dir -r /app/backend/requirements.txt
RUN playwright install chromium && playwright install-deps

# Copy Frontend Standalone
COPY --from=frontend-builder /app/frontend/.next/standalone /app/frontend
COPY --from=frontend-builder /app/frontend/.next/static /app/frontend/.next/static
COPY --from=frontend-builder /app/frontend/public /app/frontend/public

# Setup Nginx
COPY nginx.conf /etc/nginx/sites-available/default
RUN ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

# Copy Start Script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Environment Variables
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["/app/start.sh"]
