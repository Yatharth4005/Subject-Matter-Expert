"""Unit tests for WebNavigator."""

import pytest
from unittest.mock import AsyncMock, patch, MagicMock

from services.web_navigator import WebNavigator, NavigationResult, MAX_STEPS


class TestWebNavigator:
    def setup_method(self):
        self.navigator = WebNavigator()

    def test_navigation_result_base64(self):
        """Test NavigationResult generates base64 from screenshot bytes."""
        result = NavigationResult(
            screenshot=b"\x89PNG\r\n\x1a\n",
            url="https://example.com",
            summary="Test page",
        )
        assert result.screenshot_base64 != ""
        assert isinstance(result.screenshot_base64, str)

    def test_navigation_result_empty_screenshot(self):
        result = NavigationResult(
            screenshot=b"",
            url="",
            summary="Error occurred",
        )
        assert result.screenshot_base64 == ""

    def test_max_steps_constant(self):
        assert MAX_STEPS == 10

    @pytest.mark.asyncio
    async def test_navigate_without_playwright(self):
        """If playwright is not installed, should return graceful error."""
        with patch.dict("sys.modules", {"playwright": None, "playwright.async_api": None}):
            # This should handle ImportError gracefully
            result = await self.navigator.navigate_and_capture("test query")
            assert isinstance(result, NavigationResult)
            assert result.summary != ""
