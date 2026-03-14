import os
from dotenv import load_dotenv

load_dotenv()

# Google Cloud
GOOGLE_CLOUD_PROJECT = os.getenv("GOOGLE_CLOUD_PROJECT", "")
GOOGLE_CLOUD_LOCATION = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")
GOOGLE_GENAI_USE_VERTEXAI = os.getenv("GOOGLE_GENAI_USE_VERTEXAI", "True")

# Neon DB
NEON_DATABASE_URL = os.getenv("NEON_DATABASE_URL", "")

# GCS
GCS_BUCKET_NAME = os.getenv("GCS_BUCKET_NAME", "sme-agent-uploads")

# Server
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))

# CORS
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
