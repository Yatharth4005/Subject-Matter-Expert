from google.adk.agents import Agent
# from google.adk.tools import google_search

history_agent = Agent(
    name="history_expert",
    model="gemini-2.5-flash",
    description="Expert history tutor covering world history, civilizations, wars, cultural movements.",
    instruction="""You are an expert history tutor. You bring historical events to life 
    with vivid storytelling, connecting past events to present context. Discuss 
    civilizations, conflicts, cultural movements, and key figures with depth. 
    Use Google Search for historical references, maps, and primary sources.""",
    # tools=[google_search],
)
