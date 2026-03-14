"""Web Navigator — Playwright-based browser control for UI Navigator agent."""

import base64
from dataclasses import dataclass
from typing import Optional

MAX_STEPS = 10


@dataclass
class NavigationResult:
    screenshot: bytes
    url: str
    summary: str
    screenshot_base64: str = ""

    def __post_init__(self):
        if self.screenshot and not self.screenshot_base64:
            self.screenshot_base64 = base64.b64encode(self.screenshot).decode("utf-8")


class WebNavigator:
    """Navigates web pages using Playwright and Gemini Computer Use model."""

    async def navigate_and_capture(self, query: str) -> NavigationResult:
        """Navigate to find content matching the query and capture screenshot."""
        try:
            from playwright.async_api import async_playwright
            from google import genai

            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                page = await browser.new_page(viewport={"width": 1280, "height": 720})
                await page.goto("https://www.google.com")

                goal = f"Search for and find: {query}"

                for step in range(MAX_STEPS):
                    screenshot_bytes = await page.screenshot()

                    # Send screenshot to Gemini Computer Use model
                    client = genai.Client()
                    response = client.models.generate_content(
                        model="gemini-2.5-flash",
                        contents=[goal, {"mime_type": "image/png", "data": screenshot_bytes}],
                        config={"tools": [{"computer_use": {}}]},
                    )

                    # Execute actions returned by the model
                    if hasattr(response, "computer_use_actions"):
                        for action in response.computer_use_actions:
                            await self._execute_action(page, action)

                    # Check if goal is achieved
                    if hasattr(response, "text") and response.text:
                        final_screenshot = await page.screenshot()
                        await browser.close()
                        return NavigationResult(
                            screenshot=final_screenshot,
                            url=page.url,
                            summary=response.text,
                        )

                # Max steps reached
                final_screenshot = await page.screenshot()
                await browser.close()
                return NavigationResult(
                    screenshot=final_screenshot,
                    url=page.url,
                    summary="Navigation completed. Here is what was found.",
                )

        except ImportError:
            return NavigationResult(
                screenshot=b"",
                url="",
                summary="Playwright is not installed. Install with: pip install playwright && playwright install",
            )
        except Exception as e:
            return NavigationResult(
                screenshot=b"",
                url="",
                summary=f"Navigation error: {str(e)}",
            )

    async def _execute_action(self, page, action):
        """Execute a single Computer Use action on the page."""
        try:
            action_type = getattr(action, "type", None) or getattr(action, "action", None)

            if action_type == "click":
                x = getattr(action, "x", 0)
                y = getattr(action, "y", 0)
                await page.mouse.click(x, y)

            elif action_type == "type":
                text = getattr(action, "text", "")
                await page.keyboard.type(text)

            elif action_type == "key":
                key = getattr(action, "key", "")
                await page.keyboard.press(key)

            elif action_type == "scroll":
                x = getattr(action, "x", 0)
                y = getattr(action, "y", 0)
                delta_x = getattr(action, "delta_x", 0)
                delta_y = getattr(action, "delta_y", -300)
                await page.mouse.wheel(delta_x, delta_y)

            # Small delay between actions
            import asyncio
            await asyncio.sleep(0.5)

        except Exception as e:
            print(f"Action execution error: {e}")
