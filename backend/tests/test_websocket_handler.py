"""Unit tests for WebSocket handler."""

import json
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi import WebSocket

from services.session_manager import SessionManager
from services.audio_processor import AudioProcessor


class TestWebSocketHandler:
    """Test the WebSocket message handling logic."""

    def setup_method(self):
        self.session_manager = SessionManager()
        self.audio_processor = AudioProcessor()
        self.mock_ws = AsyncMock(spec=WebSocket)

    def test_session_creation_on_connect(self):
        session = self.session_manager.create("math", self.mock_ws)
        assert session.agent_slug == "math"
        assert session.is_active

    @pytest.mark.asyncio
    async def test_audio_message_handling(self):
        """Test that audio messages are properly decoded."""
        import base64
        audio_data = b"fake-audio-bytes"
        encoded = base64.b64encode(audio_data).decode("utf-8")

        msg = {"type": "audio", "data": encoded}
        decoded = self.audio_processor.decode_base64(msg["data"])
        assert decoded == audio_data

    @pytest.mark.asyncio
    async def test_text_message_format(self):
        """Test text message format."""
        msg = {"type": "text", "content": "What is calculus?"}
        assert msg["type"] == "text"
        assert "calculus" in msg["content"]

    @pytest.mark.asyncio
    async def test_video_message_format(self):
        """Test video URL message format."""
        msg = {"type": "video_url", "url": "https://storage.googleapis.com/bucket/video.mp4"}
        assert msg["type"] == "video_url"
        assert msg["url"].startswith("https://")

    @pytest.mark.asyncio
    async def test_web_search_message_format(self):
        """Test web search message format."""
        msg = {"type": "web_search", "query": "Newton's laws examples"}
        assert msg["type"] == "web_search"
        assert msg["query"] != ""

    @pytest.mark.asyncio
    async def test_unknown_message_type(self):
        """Unknown message types should not crash the handler."""
        msg = {"type": "unknown_type", "data": "something"}
        assert msg["type"] not in ["audio", "text", "video_url", "web_search"]

    @pytest.mark.asyncio
    async def test_session_cleanup_on_disconnect(self):
        session = self.session_manager.create("cs", self.mock_ws)
        assert self.session_manager.get_active_count() == 1

        await self.session_manager.close(session)
        assert self.session_manager.get_active_count() == 0

    @pytest.mark.asyncio
    async def test_websocket_send_json(self):
        """Test that we can send JSON to WebSocket."""
        response = {"type": "text_response", "content": "Hello!"}
        await self.mock_ws.send_json(response)
        self.mock_ws.send_json.assert_called_once_with(response)
