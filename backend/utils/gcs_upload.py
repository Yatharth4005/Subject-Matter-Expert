"""GCS Upload Utility — uploads files to Google Cloud Storage."""

import uuid
from pathlib import Path
from typing import Optional

from google.cloud import storage

from config import GCS_BUCKET_NAME, GOOGLE_CLOUD_PROJECT


def upload_file(file_bytes: bytes, filename: str, content_type: str = "video/mp4") -> str:
    """Upload bytes to GCS and return the public URL."""
    client = storage.Client(project=GOOGLE_CLOUD_PROJECT)
    bucket = client.bucket(GCS_BUCKET_NAME)

    # Generate unique object name
    ext = Path(filename).suffix or ".bin"
    object_name = f"uploads/{uuid.uuid4()}{ext}"

    blob = bucket.blob(object_name)
    blob.upload_from_string(file_bytes, content_type=content_type)

    return f"https://storage.googleapis.com/{GCS_BUCKET_NAME}/{object_name}"


def upload_screenshot(screenshot_bytes: bytes) -> str:
    """Upload a PNG screenshot to GCS and return the public URL."""
    return upload_file(screenshot_bytes, "screenshot.png", "image/png")
