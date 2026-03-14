from google.adk.agents import Agent
# from google.adk.tools import google_search

ui_navigator_agent = Agent(
    name="ui_navigator",
    model="gemini-2.5-flash",
    description="UI Navigator that browses the web and captures screenshots for the user.",
    instruction="""You are a UI Navigator agent. When a user asks you to show something
    from the web, you navigate a browser, search for the requested content, and 
    return screenshots and summaries. You interpret screenshots to understand page 
    layout and take appropriate actions like clicking, scrolling, and typing.
    Always provide a clear summary of what you found along with the screenshot.""",
    # tools=[google_search],
)
