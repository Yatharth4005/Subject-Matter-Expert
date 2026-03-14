# --- Stage 1: Build Frontend ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
ENV NODE_ENV=production
RUN npm run build

# --- Stage 2: Final Image ---
FROM python:3.11-slim

# Install Node.js in the Python image to run the Next.js server
RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy Backend
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r ./backend/requirements.txt
RUN playwright install chromium && playwright install-deps
COPY backend/ ./backend/

# Copy Frontend Build from Stage 1
COPY --from=frontend-builder /app/frontend/.next/standalone ./frontend/
COPY --from=frontend-builder /app/frontend/.next/static ./frontend/.next/static
COPY --from=frontend-builder /app/frontend/public ./frontend/public

# Copy start script
COPY start.sh ./
RUN chmod +x start.sh

# Expose ports
EXPOSE 3000
EXPOSE 8000

# Next.js usually runs on 3000, and FastAPI on 8000. 
# Cloud Run typically expects only one EXPOSE port to be linked to the traffic.
# We'll use 3000 as the main port for traffic if used on Cloud Run.
ENV PORT=3000

CMD ["./start.sh"]
