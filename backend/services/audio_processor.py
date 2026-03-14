"""Audio Processor — Encode/decode PCM audio for Gemini Live API."""

import base64
from typing import Optional


class AudioProcessor:
    """Handles audio encoding/decoding between frontend and Gemini Live API.
    
    Input format: 16-bit PCM, 16kHz, mono
    Output format: PCM at 24kHz
    """

    @staticmethod
    def decode_base64(audio_base64: str) -> bytes:
        """Decode base64-encoded audio from frontend."""
        return base64.b64decode(audio_base64)

    @staticmethod
    def encode_base64(audio_bytes: bytes) -> str:
        """Encode audio bytes to base64 for frontend."""
        return base64.b64encode(audio_bytes).decode("utf-8")

    @staticmethod
    def validate_audio(audio_bytes: bytes) -> bool:
        """Basic validation of audio data."""
        if not audio_bytes:
            return False
        # Max 10MB per chunk
        if len(audio_bytes) > 10 * 1024 * 1024:
            return False
        return True
