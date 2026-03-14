from google.adk.agents import Agent

from agents.math_agent import math_agent
from agents.physics_agent import physics_agent
from agents.chemistry_agent import chemistry_agent
from agents.biology_agent import biology_agent
from agents.history_agent import history_agent
from agents.cs_agent import cs_agent
from agents.storyteller_agent import storyteller_agent
from agents.ui_navigator_agent import ui_navigator_agent

# Root router agent — delegates to specialist sub-agents via LLM-driven routing
root_agent = Agent(
    name="sme_router",
    model="gemini-2.5-flash",
    description="Routes user queries to the appropriate subject matter expert.",
    instruction="""You are the central coordinator of the Subject Matter Expert platform.
    Based on the user's selected subject or the content of their query, delegate to 
    the appropriate specialist agent. 
    
    Available specialists:
    - math_expert: Mathematics (algebra, calculus, geometry, statistics)
    - physics_expert: Physics (mechanics, thermodynamics, quantum)
    - chemistry_expert: Chemistry (organic, inorganic, physical)
    - biology_expert: Biology (cell biology, genetics, ecology)
    - history_expert: History (world history, civilizations, cultural movements)
    - cs_expert: Computer Science (algorithms, data structures, programming)
    - creative_storyteller: For stories, visual narratives, and creative content
    - ui_navigator: When user asks to show something from the web
    
    If the user asks to show something from the web, delegate to the UI Navigator.
    If the user wants a story, visual narrative, or creative content, delegate to 
    the Creative Storyteller.""",
    sub_agents=[
        math_agent,
        physics_agent,
        chemistry_agent,
        biology_agent,
        history_agent,
        cs_agent,
        storyteller_agent,
        ui_navigator_agent,
    ],
)

# Mapping of agent slugs to agent instances
AGENT_MAP = {
    "math": math_agent,
    "physics": physics_agent,
    "chemistry": chemistry_agent,
    "biology": biology_agent,
    "history": history_agent,
    "cs": cs_agent,
    "storyteller": storyteller_agent,
    "ui_navigator": ui_navigator_agent,
}


def get_agent_by_slug(slug: str) -> Agent:
    """Get agent by slug, falling back to root router."""
    return AGENT_MAP.get(slug, root_agent)
