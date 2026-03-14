"""Session Manager — Manages active WebSocket sessions."""

import uuid
from dataclasses import dataclass, field
from typing import Dict, Optional
from fastapi import WebSocket


@dataclass
class Session:
    id: str
    agent_slug: str
    websocket: WebSocket
    user_id: Optional[str] = None
    conversation_id: Optional[str] = None
    is_active: bool = True


class SessionManager:
    def __init__(self):
        self.active_sessions: Dict[str, Session] = {}

    def create(self, agent_slug: str, websocket: WebSocket, user_id: Optional[str] = None) -> Session:
        session_id = str(uuid.uuid4())
        session = Session(
            id=session_id,
            agent_slug=agent_slug,
            websocket=websocket,
            user_id=user_id,
        )
        self.active_sessions[session_id] = session
        return session

    def get(self, session_id: str) -> Optional[Session]:
        return self.active_sessions.get(session_id)

    async def close(self, session: Session):
        session.is_active = False
        self.active_sessions.pop(session.id, None)

    def get_active_count(self) -> int:
        return len(self.active_sessions)
