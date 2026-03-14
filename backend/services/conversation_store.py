"""Conversation Store — CRUD operations for Neon DB."""

import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

from config import NEON_DATABASE_URL


class ConversationStore:
    def __init__(self):
        self.conn_str = NEON_DATABASE_URL

    def _get_conn(self):
        return psycopg2.connect(self.conn_str, cursor_factory=RealDictCursor)

    async def create_conversation(
        self, user_id: str, agent_slug: str, title: Optional[str] = None
    ) -> Optional[str]:
        conv_id = str(uuid.uuid4())
        try:
            with self._get_conn() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        """INSERT INTO conversations (id, user_id, agent_slug, title, started_at)
                           VALUES (%s, %s, %s, %s, %s)""",
                        (conv_id, user_id, agent_slug, title or f"Session with {agent_slug}", datetime.utcnow()),
                    )
                conn.commit()
            return conv_id
        except Exception as e:
            print(f"Database error in create_conversation: {e}")
            return None

    async def log_message(
        self,
        conversation_id: Optional[str],
        role: str,
        content_type: str,
        content: Optional[str] = None,
        audio_url: Optional[str] = None,
        media_url: Optional[str] = None,
    ) -> Optional[str]:
        if not conversation_id:
            return None
        msg_id = str(uuid.uuid4())
        try:
            with self._get_conn() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        """INSERT INTO messages (id, conversation_id, role, content_type, content, audio_url, media_url, created_at)
                           VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
                        (msg_id, conversation_id, role, content_type, content, audio_url, media_url, datetime.utcnow()),
                    )
                conn.commit()
            return msg_id
        except Exception as e:
            print(f"Database error in log_message: {e}")
            return None

    async def end_conversation(self, conversation_id: str):
        with self._get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "UPDATE conversations SET ended_at = %s WHERE id = %s",
                    (datetime.utcnow(), conversation_id),
                )
            conn.commit()

    async def get_conversations(self, user_id: str, limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
        with self._get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """SELECT c.*, COUNT(m.id) as message_count
                       FROM conversations c
                       LEFT JOIN messages m ON m.conversation_id = c.id
                       WHERE c.user_id = %s
                       GROUP BY c.id
                       ORDER BY c.started_at DESC
                       LIMIT %s OFFSET %s""",
                    (user_id, limit, offset),
                )
                return cur.fetchall()

    async def get_messages(self, conversation_id: str) -> List[Dict[str, Any]]:
        with self._get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT * FROM messages WHERE conversation_id = %s ORDER BY created_at ASC",
                    (conversation_id,),
                )
                return cur.fetchall()

    async def get_stats(self, user_id: str) -> Dict[str, Any]:
        with self._get_conn() as conn:
            with conn.cursor() as cur:
                # Total sessions
                cur.execute("SELECT COUNT(*) as total FROM conversations WHERE user_id = %s", (user_id,))
                total_sessions = cur.fetchone()["total"]

                # Total messages
                cur.execute(
                    """SELECT COUNT(*) as total FROM messages m
                       JOIN conversations c ON c.id = m.conversation_id
                       WHERE c.user_id = %s""",
                    (user_id,),
                )
                total_messages = cur.fetchone()["total"]

                # Favorite agent
                cur.execute(
                    """SELECT agent_slug, COUNT(*) as cnt FROM conversations
                       WHERE user_id = %s GROUP BY agent_slug ORDER BY cnt DESC LIMIT 1""",
                    (user_id,),
                )
                row = cur.fetchone()
                favorite_agent = row["agent_slug"] if row else "none"

                return {
                    "totalSessions": total_sessions,
                    "totalMessages": total_messages,
                    "avgDuration": 15,  # TODO: compute from started_at/ended_at
                    "favoriteAgent": favorite_agent,
                    "dailySessions": [],  # TODO: compute daily counts
                    "weeklyChange": {"sessions": 0, "messages": 0, "duration": 0},
                }
