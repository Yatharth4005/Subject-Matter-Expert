"""Unit tests for agent routing."""

import pytest

from agents.router_agent import root_agent, get_agent_by_slug, AGENT_MAP


class TestAgentRouting:
    def test_all_agents_registered(self):
        expected_slugs = ["math", "physics", "chemistry", "biology", "history", "cs", "storyteller", "ui_navigator"]
        for slug in expected_slugs:
            assert slug in AGENT_MAP, f"Agent '{slug}' not in AGENT_MAP"

    def test_get_agent_by_slug_known(self):
        agent = get_agent_by_slug("math")
        assert agent.name == "math_expert"

    def test_get_agent_by_slug_storyteller(self):
        agent = get_agent_by_slug("storyteller")
        assert agent.name == "creative_storyteller"

    def test_get_agent_by_slug_unknown_returns_router(self):
        agent = get_agent_by_slug("unknown-slug")
        assert agent is root_agent
        assert agent.name == "sme_router"

    def test_root_agent_has_sub_agents(self):
        assert len(root_agent.sub_agents) == 8

    def test_root_agent_sub_agent_names(self):
        sub_names = [a.name for a in root_agent.sub_agents]
        assert "math_expert" in sub_names
        assert "physics_expert" in sub_names
        assert "creative_storyteller" in sub_names
        assert "ui_navigator" in sub_names

    def test_each_agent_has_model(self):
        for slug, agent in AGENT_MAP.items():
            assert agent.model is not None, f"Agent '{slug}' has no model"

    def test_each_agent_has_description(self):
        for slug, agent in AGENT_MAP.items():
            assert agent.description, f"Agent '{slug}' has no description"
