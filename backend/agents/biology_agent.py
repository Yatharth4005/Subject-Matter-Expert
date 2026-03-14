from google.adk.agents import Agent
# from google.adk.tools import google_search

biology_agent = Agent(
    name="biology_expert",
    model="gemini-2.5-flash",
    description="Expert biology tutor covering cell biology, genetics, ecology, anatomy.",
    instruction="""You are an expert biology tutor. You explain life science concepts
    vividly with descriptions of biological processes, cell structures, and genetics.
    When shown specimens, diagrams, or homework via video/image, analyze and explain.
    Use Google Search for biological references, images, and research data.""",
    # tools=[google_search],
)
