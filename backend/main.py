"""SME Agent Platform — FastAPI Backend with full ADK streaming integration."""

import json
import logging
import base64
import uuid
from contextlib import asynccontextmanager


from fastapi import FastAPI, WebSocket, WebSocketDisconnect, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types as genai_types

from config import FRONTEND_URL, HOST, PORT, GOOGLE_CLOUD_PROJECT, GOOGLE_CLOUD_LOCATION
from agents import get_agent_by_slug, root_agent
from services.session_manager import SessionManager
from services.audio_processor import AudioProcessor
from services.conversation_store import ConversationStore
from services.web_navigator import WebNavigator
from services.research_agent import ResearchAgentService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("sme-backend")

# ─── Global services ────────────────────────────────────────────────────────
session_manager = SessionManager()
audio_processor = AudioProcessor()
conversation_store = ConversationStore()
web_navigator = WebNavigator()
research_service = ResearchAgentService()

# ADK session service — shared across all WebSocket connections
adk_session_service = InMemorySessionService()
APP_NAME = "sme-agent-platform"


async def trigger_research(context: str, websocket: WebSocket):
    """Run research in background and send suggestions via WebSocket."""
    try:
        suggestions = await research_service.get_suggestions(context)
        if suggestions:
            await websocket.send_json({
                "type": "suggestions",
                "items": suggestions
            })
    except Exception as e:
        logger.warning(f"Background research failed: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 SME Agent Backend starting...")
    logger.info(f"   Project: {GOOGLE_CLOUD_PROJECT} | Location: {GOOGLE_CLOUD_LOCATION}")
    yield
    logger.info("👋 SME Agent Backend shutting down...")


app = FastAPI(
    title="SME Agent Platform API",
    description="Multimodal AI agent backend powered by Gemini Live API & Google ADK",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex="https://.*\\.run\\.app|http://localhost:3000|http://127\\.0\\.0\\.1:3000|http://192\\.168\\..*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Helper: run a turn through ADK ─────────────────────────────────────────

async def run_adk_turn(
    agent_slug: str,
    user_id: str,
    session_id: str,
    message_text: str,
):
    """Send a text message and yield chunks as they arrive."""
    agent = get_agent_by_slug(agent_slug)
    runner = Runner(agent=agent, app_name=APP_NAME, session_service=adk_session_service)

    existing = await adk_session_service.get_session(app_name=APP_NAME, user_id=user_id, session_id=session_id)
    if not existing:
        await adk_session_service.create_session(app_name=APP_NAME, user_id=user_id, session_id=session_id)

    new_message = genai_types.Content(role="user", parts=[genai_types.Part(text=message_text)])

    async for event in runner.run_async(user_id=user_id, session_id=session_id, new_message=new_message):
        # Prefer chunks for faster streaming; fall back to final response if no chunks
        if event.content and event.content.parts:
            for part in event.content.parts:
                if part.text:
                    yield part.text


async def run_adk_turn_with_image(
    agent_slug: str,
    user_id: str,
    session_id: str,
    message_text: str,
    image_url: str,
):
    """Send a message with an image and yield chunks."""
    agent = get_agent_by_slug(agent_slug)
    runner = Runner(agent=agent, app_name=APP_NAME, session_service=adk_session_service)

    existing = await adk_session_service.get_session(app_name=APP_NAME, user_id=user_id, session_id=session_id)
    if not existing:
        await adk_session_service.create_session(app_name=APP_NAME, user_id=user_id, session_id=session_id)

    new_message = genai_types.Content(
        role="user",
        parts=[
            genai_types.Part(text=message_text or "Please analyze this video/image."),
            genai_types.Part(
                file_data=genai_types.FileData(
                    mime_type="video/mp4",
                    file_uri=image_url,
                )
            ),
        ],
    )

    async for event in runner.run_async(user_id=user_id, session_id=session_id, new_message=new_message):
        if event.content and event.content.parts:
            for part in event.content.parts:
                if part.text:
                    yield part.text


async def run_adk_turn_with_audio(
    agent_slug: str,
    user_id: str,
    session_id: str,
    audio_bytes: bytes,
    mime_type: str = "audio/webm",
):
    """Send audio bytes and yield chunks."""
    agent = get_agent_by_slug(agent_slug)
    runner = Runner(agent=agent, app_name=APP_NAME, session_service=adk_session_service)

    existing = await adk_session_service.get_session(app_name=APP_NAME, user_id=user_id, session_id=session_id)
    if not existing:
        await adk_session_service.create_session(app_name=APP_NAME, user_id=user_id, session_id=session_id)

    new_message = genai_types.Content(
        role="user",
        parts=[
            genai_types.Part(
                inline_data=genai_types.Blob(
                    mime_type=mime_type,
                    data=audio_bytes,
                )
            ),
        ],
    )

    async for event in runner.run_async(user_id=user_id, session_id=session_id, new_message=new_message):
        if event.content and event.content.parts:
            for part in event.content.parts:
                if part.text:
                    yield part.text


# ─── Routes ──────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "active_sessions": session_manager.get_active_count(),
    }


@app.websocket("/ws/session/{agent_slug}")
async def websocket_endpoint(websocket: WebSocket, agent_slug: str, background_tasks: BackgroundTasks):
    origin = websocket.headers.get("origin")
    logger.info(f"Connecting from origin: {origin}")
    await websocket.accept()
    session = session_manager.create(agent_slug, websocket)

    # Use session ID as both user_id and ADK session_id for simplicity
    user_id = session.id
    adk_session_id = session.id

    logger.info(f"[Session {session.id[:8]}] Connected → agent: {agent_slug}")

    # Create Neon DB conversation (best-effort)
    try:
        conv_id = await conversation_store.create_conversation(
            user_id=user_id, agent_slug=agent_slug
        )
        session.conversation_id = conv_id
    except Exception as e:
        logger.warning(f"DB conversation create failed (continuing): {e}")

    try:
        while True:
            raw = await websocket.receive_text()
            data = json.loads(raw)
            msg_type = data.get("type", "")

            # ── Audio input ──────────────────────────────────────────────────
            if msg_type == "audio":
                audio_b64 = data.get("data", "")
                audio_bytes = audio_processor.decode_base64(audio_b64)

                if not audio_processor.validate_audio(audio_bytes):
                    await websocket.send_json({"type": "error", "content": "Invalid audio data"})
                    continue

                logger.info(f"[{session.id[:8]}] Audio received, processing...")

                # Notify user that we are processing
                await websocket.send_json({
                    "type": "text_response",
                    "text": "Processing your voice... 🎙️",
                })

                # Run through ADK with audio directly
                mime_type = data.get("mimeType", "audio/webm")
                full_response = []
                async for chunk in run_adk_turn_with_audio(
                    agent_slug=agent_slug,
                    user_id=user_id,
                    session_id=adk_session_id,
                    audio_bytes=audio_bytes,
                    mime_type=mime_type,
                ):
                    full_response.append(chunk)
                    await websocket.send_json({
                        "type": "text_response", # Use existing type to minimize frontend change for now
                        "text": chunk,
                        "is_chunk": True
                    })
                response_text = "".join(full_response)
                # Log agent response
                try:
                    await conversation_store.log_message(
                        conversation_id=session.conversation_id,
                        role="agent",
                        content_type="text",
                        content=response_text,
                    )
                except Exception:
                    pass

                # Signal completion and trigger research
                await websocket.send_json({"type": "text_response", "text": response_text, "is_chunk": False})
                background_tasks.add_task(trigger_research, response_text, websocket)

            # ── Text message ─────────────────────────────────────────────────
            elif msg_type == "text":
                content = data.get("content", "")
                logger.info(f"[{session.id[:8]}] Text: {content[:60]}...")

                # Log user message
                try:
                    await conversation_store.log_message(
                        conversation_id=session.conversation_id,
                        role="user",
                        content_type="text",
                        content=content,
                    )
                except Exception:
                    pass

                # Run through ADK
                full_response = []
                async for chunk in run_adk_turn(
                    agent_slug=agent_slug,
                    user_id=user_id,
                    session_id=adk_session_id,
                    message_text=content,
                ):
                    full_response.append(chunk)
                    await websocket.send_json({
                        "type": "text_response",
                        "text": chunk,
                        "is_chunk": True
                    })

                response_text = "".join(full_response)
                # Log agent response
                try:
                    await conversation_store.log_message(
                        conversation_id=session.conversation_id,
                        role="agent",
                        content_type="text",
                        content=response_text,
                    )
                except Exception:
                    pass

                # Signal completion and trigger research
                await websocket.send_json({"type": "text_response", "text": response_text, "is_chunk": False})
                background_tasks.add_task(trigger_research, response_text, websocket)

            # ── Video URL ────────────────────────────────────────────────────
            elif msg_type == "video_url":
                url = data.get("url", "")
                logger.info(f"[{session.id[:8]}] Video URL received")

                full_response = []
                async for chunk in run_adk_turn_with_image(
                    agent_slug=agent_slug,
                    user_id=user_id,
                    session_id=adk_session_id,
                    message_text="Please analyze this video and provide detailed feedback.",
                    image_url=url,
                ):
                    full_response.append(chunk)
                    await websocket.send_json({
                        "type": "text_response",
                        "text": chunk,
                        "is_chunk": True
                    })

                response_text = "".join(full_response)
                # Signal completion and trigger research
                await websocket.send_json({"type": "text_response", "text": response_text, "is_chunk": False})
                background_tasks.add_task(trigger_research, response_text, websocket)

            # ── Web search / UI Navigator ────────────────────────────────────
            elif msg_type == "web_search":
                query = data.get("query", "")
                logger.info(f"[{session.id[:8]}] Web search: {query}")

                result = await web_navigator.navigate_and_capture(query)

                screenshot_data = None
                if result.screenshot_base64:
                    screenshot_data = f"data:image/png;base64,{result.screenshot_base64}"

                await websocket.send_json({
                    "type": "web_content",
                    "screenshot": screenshot_data,
                    "url": result.url,
                    "summary": result.summary,
                })

            else:
                await websocket.send_json({
                    "type": "error",
                    "content": f"Unknown message type: {msg_type}",
                })

    except WebSocketDisconnect:
        logger.info(f"[{session.id[:8]}] Disconnected")
        try:
            if session.conversation_id:
                await conversation_store.end_conversation(session.conversation_id)
        except Exception:
            pass
        await session_manager.close(session)

    except Exception as e:
        logger.error(f"[{session.id[:8]}] Error: {e}", exc_info=True)
        try:
            await websocket.send_json({"type": "error", "content": str(e)})
        except Exception:
            pass
        await session_manager.close(session)


@app.get("/api/stats")
async def get_stats(user_id: str):
    try:
        return await conversation_store.get_stats(user_id)
    except Exception as e:
        logger.error(f"Stats error: {e}")
        return {
            "totalSessions": 0, "totalMessages": 0, "avgDuration": 0,
            "favoriteAgent": "none", "dailySessions": [],
            "weeklyChange": {"sessions": 0, "messages": 0, "duration": 0},
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)
