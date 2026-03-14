"""Unit tests for ConversationStore."""

import pytest
from unittest.mock import patch, MagicMock


class TestConversationStore:
    """Tests for conversation store with mocked DB."""

    @pytest.fixture(autouse=True)
    def setup(self):
        # Mock the DB connection
        with patch("services.conversation_store.psycopg2") as mock_pg:
            mock_conn = MagicMock()
            mock_cursor = MagicMock()
            mock_cursor.fetchone.return_value = {"total": 10, "agent_slug": "math"}
            mock_cursor.fetchall.return_value = []
            mock_conn.cursor.return_value.__enter__ = MagicMock(return_value=mock_cursor)
            mock_conn.cursor.return_value.__exit__ = MagicMock(return_value=False)
            mock_conn.__enter__ = MagicMock(return_value=mock_conn)
            mock_conn.__exit__ = MagicMock(return_value=False)
            mock_pg.connect.return_value = mock_conn

            from services.conversation_store import ConversationStore
            self.store = ConversationStore()
            self.mock_conn = mock_conn
            self.mock_cursor = mock_cursor
            yield

    @pytest.mark.asyncio
    async def test_create_conversation(self):
        conv_id = await self.store.create_conversation("user-1", "math", "Test Session")
        assert isinstance(conv_id, str)
        assert len(conv_id) > 0

    @pytest.mark.asyncio
    async def test_log_message(self):
        msg_id = await self.store.log_message(
            conversation_id="conv-1",
            role="user",
            content_type="text",
            content="What is 2+2?",
        )
        assert isinstance(msg_id, str)

    @pytest.mark.asyncio
    async def test_end_conversation(self):
        await self.store.end_conversation("conv-1")
        # Should not raise

    @pytest.mark.asyncio
    async def test_get_conversations(self):
        result = await self.store.get_conversations("user-1")
        assert isinstance(result, list)

    @pytest.mark.asyncio
    async def test_get_messages(self):
        result = await self.store.get_messages("conv-1")
        assert isinstance(result, list)

    @pytest.mark.asyncio
    async def test_get_stats(self):
        stats = await self.store.get_stats("user-1")
        assert "totalSessions" in stats
        assert "totalMessages" in stats
        assert "favoriteAgent" in stats
