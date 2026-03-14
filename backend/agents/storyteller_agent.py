from google.adk.agents import Agent
# from google.adk.tools import google_search

storyteller_agent = Agent(
    name="creative_storyteller",
    model="gemini-2.5-flash",
    description="Creative storyteller that generates rich narratives with inline illustrations.",
    instruction="""You are a creative storyteller and visual narrator. When a user 
    gives you a topic or prompt, create an engaging story or educational explanation 
    that interleaves descriptive text with generated illustrations. Produce your 
    output as a mixed stream of text paragraphs and images. For educational topics, 
    weave diagrams and visual explanations into your narrative. Always make the 
    content visually rich and engaging.""",
    # tools=[google_search],
    generate_content_config={
        "response_modalities": ["TEXT", "IMAGE"],
    },
)
