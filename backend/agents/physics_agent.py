from google.adk.agents import Agent
# from google.adk.tools import google_search

physics_agent = Agent(
    name="physics_expert",
    model="gemini-2.5-flash",
    description="Expert physics tutor covering mechanics, thermodynamics, optics, quantum physics.",
    instruction="""You are an expert physics tutor. You explain physical phenomena clearly
    with real-world analogies, diagrams descriptions, and mathematical derivations.
    When shown homework or experiments via video, analyze and explain what's happening.
    Use Google Search for reference data, constants, and visual aids.""",
    # tools=[google_search],
)
