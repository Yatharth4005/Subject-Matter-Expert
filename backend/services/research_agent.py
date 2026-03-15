"""Research Agent Service — Finds supplementary learning materials."""

import json
from typing import List, Dict
from google.adk.agents import Agent
from google.adk.tools import google_search
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types as genai_types

# Dedicated session service for background research
research_session_service = InMemorySessionService()

researcher = Agent(
    name="researcher",
    model="gemini-2.5-flash",
    description="Finds relevant YouTube videos, documentation, and articles based on conversation context.",
    instruction="""You are an expert research assistant. Given a topic or a snippet of conversation, 
    your goal is to find high-quality learning resources. 
    You must provide exactly 3-5 resources.
    For each resource, provide:
    1. Title: Concise and descriptive.
    2. URL: A direct link (YouTube, technical docs, or educational articles).
    3. Type: Must be 'youtube', 'doc', or 'web'.
    
    Format your output as a JSON list of objects:
    [{"title": "...", "url": "...", "type": "youtube" | "doc" | "web"}]
    Exclude any markdown formatting from the JSON output.""",
    tools=[google_search],
)

class ResearchAgentService:
    def __init__(self):
        pass

    async def get_suggestions(self, context: str) -> List[Dict]:
        """Find relevant resources based on the provided context."""
        user_id = "research-system"
        session_id = "temp-research"
        app_name = "sme-researcher"

        print(f"DEBUG: ResearchAgent starting for context: {str(context)[:100]}...")

        # Initialize runner fresh for the request
        runner = Runner(
            agent=researcher,
            app_name=app_name,
            session_service=research_session_service,
        )

        # Ensure session exists (best-effort)
        try:
            await research_session_service.create_session(
                app_name="sme-researcher", user_id=user_id, session_id=session_id
            )
        except Exception:
            pass # Session likely already exists

        prompt = f"Find learning resources (YouTube videos, docs, articles) for this topic: {context}"
        
        new_message = genai_types.Content(
            role="user",
            parts=[genai_types.Part(text=prompt)],
        )

        full_text_parts = []
        try:
            async for event in runner.run_async(
                user_id=user_id,
                session_id=session_id,
                new_message=new_message,
            ):
                if event.content and event.content.parts:
                    for part in event.content.parts:
                        if part.text:
                            full_text_parts.append(part.text)
        except Exception as e:
            print(f"DEBUG: research_runner.run_async failed: {e}")
            return []

        full_text = "".join(full_text_parts).strip()
        print(f"DEBUG: Research raw response: {str(full_text)[:200]}...")

        try:
            # Clean possible markdown wrap
            clean_text = full_text
            if "```json" in clean_text:
                clean_text = clean_text.split("```json")[1].split("```")[0]
            elif "```" in clean_text:
                clean_text = clean_text.split("```")[1].split("```")[0]
            
            suggestions = json.loads(clean_text.strip())
            print(f"DEBUG: Successfully parsed {len(suggestions)} suggestions")
            return suggestions
        except Exception as e:
            print(f"DEBUG: Failed to parse research suggestions: {e}")
            # Fallback: if it's not JSON, maybe it's just text? 
            # For now, return empty to avoid breaking frontend
            return []
