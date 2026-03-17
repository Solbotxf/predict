"""LLM Probability Estimator — asks an LLM to estimate the true probability."""
from __future__ import annotations
import logging
import json
import re
from datetime import datetime

from src.analyzers.base import BaseAnalyzer
from src.models import Market, Signal, Direction
from src.config import LLMProbConfig

logger = logging.getLogger(__name__)

PROMPT_TEMPLATE = """You are an expert prediction market analyst. Estimate the TRUE probability of the following event occurring.

**Market:** {title}
**Description:** {description}
**Category:** {category}
**Current market price:** {price:.1%} (YES)
**End date:** {end_date}

Consider all publicly available information up to your knowledge cutoff. Think step by step:
1. What are the key factors?
2. What is the base rate for this type of event?
3. What recent evidence shifts the probability?

Respond in EXACTLY this JSON format:
{{"probability": 0.XX, "confidence": 0.XX, "reasoning": "brief explanation"}}

Where probability is 0.0-1.0 and confidence is how sure you are of your estimate (0.0-1.0)."""


class LLMProbAnalyzer(BaseAnalyzer):
    """Uses an LLM to estimate fair probability, compares to market price for edge."""

    def __init__(self, config: LLMProbConfig | None = None):
        self.config = config or LLMProbConfig()
        self._cache: dict[str, tuple[float, float, str, datetime]] = {}  # market_id → (prob, conf, reasoning, ts)

    def name(self) -> str:
        return "llm_prob"

    async def analyze(self, market: Market, context: dict | None = None) -> Signal | None:
        # Check cache
        cached = self._cache.get(market.id)
        if cached:
            _, _, _, ts = cached
            if (datetime.utcnow() - ts).total_seconds() < self.config.cache_ttl:
                prob, conf, reasoning, _ = cached
                return self._make_signal(market, prob, conf, reasoning)

        # Call LLM
        prob, conf, reasoning = await self._call_llm(market)
        if prob is None:
            return None

        # Cache
        self._cache[market.id] = (prob, conf, reasoning, datetime.utcnow())
        return self._make_signal(market, prob, conf, reasoning)

    def _make_signal(self, market: Market, fair_prob: float, confidence: float, reasoning: str) -> Signal | None:
        edge = fair_prob - market.current_price
        abs_edge = abs(edge)

        # Only signal if edge is meaningful
        if abs_edge < 0.02:
            return None

        direction = Direction.BUY_YES if edge > 0 else Direction.BUY_NO

        return Signal(
            analyzer=self.name(),
            market_id=market.id,
            timestamp=datetime.utcnow(),
            signal_type="edge",
            confidence=confidence,
            direction=direction,
            metadata={
                "fair_value": fair_prob,
                "market_price": market.current_price,
                "edge": edge,
                "edge_pct": edge * 100,
                "reasoning": reasoning,
            },
        )

    async def _call_llm(self, market: Market) -> tuple[float | None, float, str]:
        """Call the configured LLM provider."""
        prompt = PROMPT_TEMPLATE.format(
            title=market.title,
            description=market.description[:500],
            category=market.category,
            price=market.current_price,
            end_date=market.end_date.strftime("%Y-%m-%d") if market.end_date else "Unknown",
        )

        try:
            if self.config.provider == "anthropic":
                return await self._call_anthropic(prompt)
            elif self.config.provider == "openai":
                return await self._call_openai(prompt)
            else:
                logger.error(f"Unknown LLM provider: {self.config.provider}")
                return None, 0.0, ""
        except Exception as e:
            logger.error(f"LLM call failed: {e}")
            return None, 0.0, ""

    async def _call_anthropic(self, prompt: str) -> tuple[float | None, float, str]:
        import anthropic
        import os
        client = anthropic.AsyncAnthropic(api_key=os.environ.get("ANTHROPIC_API_KEY", ""))
        response = await client.messages.create(
            model=self.config.model,
            max_tokens=300,
            messages=[{"role": "user", "content": prompt}],
        )
        return self._parse_response(response.content[0].text)

    async def _call_openai(self, prompt: str) -> tuple[float | None, float, str]:
        from openai import AsyncOpenAI
        import os
        client = AsyncOpenAI(api_key=os.environ.get("OPENAI_API_KEY", ""))
        response = await client.chat.completions.create(
            model=self.config.model,
            max_tokens=300,
            messages=[{"role": "user", "content": prompt}],
        )
        return self._parse_response(response.choices[0].message.content or "")

    def _parse_response(self, text: str) -> tuple[float | None, float, str]:
        """Parse LLM JSON response."""
        try:
            # Find JSON in response
            match = re.search(r'\{[^}]+\}', text)
            if not match:
                return None, 0.0, ""
            data = json.loads(match.group())
            prob = float(data.get("probability", 0))
            conf = float(data.get("confidence", 0.5))
            reasoning = data.get("reasoning", "")
            if 0 <= prob <= 1:
                return prob, conf, reasoning
        except (json.JSONDecodeError, ValueError) as e:
            logger.warning(f"Failed to parse LLM response: {e}")
        return None, 0.0, ""
