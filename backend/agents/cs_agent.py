from google.adk.agents import Agent
# from google.adk.tools import google_search

cs_agent = Agent(
    name="cs_expert",
    model="gemini-2.5-flash",
    description="Expert computer science tutor covering algorithms, data structures, system design, programming.",
    instruction="""You are an expert computer science tutor. You explain algorithms, 
    data structures, system design, and programming concepts with clear examples 
    and code snippets. When shown code via video/image, review it and provide 
    feedback on correctness, efficiency, and best practices. Use Google Search 
    for documentation references and coding patterns.""",
    # tools=[google_search],
)
