"""Unit tests for SessionManager."""

import pytest
from unittest.mock import AsyncMock
from fastapi import WebSocket

from services.session_manager import SessionManager, Session


class TestSessionManager:
    def setup_method(self):
        self.manager = SessionManager()
        self.mock_ws = AsyncMock(spec=WebSocket)

    def test_create_session(self):
        session = self.manager.create("math", self.mock_ws)
        assert isinstance(session, Session)
        assert session.agent_slug == "math"
        assert session.is_active is True
        assert session.id in self.manager.active_sessions

    def test_create_session_with_user_id(self):
        session = self.manager.create("physics", self.mock_ws, user_id="user-123")
        assert session.user_id == "user-123"
        assert session.agent_slug == "physics"

    def test_get_session(self):
        session = self.manager.create("chemistry", self.mock_ws)
        retrieved = self.manager.get(session.id)
        assert retrieved is session

    def test_get_nonexistent_session(self):
        result = self.manager.get("nonexistent-id")
        assert result is None

    @pytest.mark.asyncio
    async def test_close_session(self):
        session = self.manager.create("biology", self.mock_ws)
        assert self.manager.get_active_count() == 1

        await self.manager.close(session)
        assert session.is_active is False
        assert self.manager.get_active_count() == 0
        assert self.manager.get(session.id) is None

    def test_multiple_sessions(self):
        ws1 = AsyncMock(spec=WebSocket)
        ws2 = AsyncMock(spec=WebSocket)
        ws3 = AsyncMock(spec=WebSocket)

        self.manager.create("math", ws1)
        self.manager.create("physics", ws2)
        self.manager.create("cs", ws3)

        assert self.manager.get_active_count() == 3

    @pytest.mark.asyncio
    async def test_close_session_idempotent(self):
        session = self.manager.create("history", self.mock_ws)
        await self.manager.close(session)
        # Closing again should not raise an error
        await self.manager.close(session)
        assert self.manager.get_active_count() == 0
