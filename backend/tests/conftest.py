"""Shared test fixtures for backend unit tests."""

import pytest
from unittest.mock import AsyncMock, MagicMock
from fastapi import WebSocket


@pytest.fixture
def mock_websocket():
    """Create a mock WebSocket for testing."""
    ws = AsyncMock(spec=WebSocket)
    ws.accept = AsyncMock()
    ws.send_json = AsyncMock()
    ws.receive_text = AsyncMock()
    ws.close = AsyncMock()
    return ws


@pytest.fixture
def mock_db_connection():
    """Create a mock database connection."""
    conn = MagicMock()
    cursor = MagicMock()
    cursor.fetchone.return_value = {"total": 5}
    cursor.fetchall.return_value = []
    conn.cursor.return_value.__enter__ = MagicMock(return_value=cursor)
    conn.cursor.return_value.__exit__ = MagicMock(return_value=False)
    conn.__enter__ = MagicMock(return_value=conn)
    conn.__exit__ = MagicMock(return_value=False)
    return conn


@pytest.fixture
def session_manager():
    """Create a fresh SessionManager instance."""
    from services.session_manager import SessionManager
    return SessionManager()


@pytest.fixture
def audio_processor():
    """Create an AudioProcessor instance."""
    from services.audio_processor import AudioProcessor
    return AudioProcessor()
