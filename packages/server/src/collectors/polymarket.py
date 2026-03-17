"""Polymarket data collector — REST API polling (MVP)."""
from __future__ import annotations
import asyncio
import logging
from datetime import datetime
from typing import Callable

import httpx

from src.collectors.base import BaseCollector
from src.models import Market, MarketEvent, EventType
from src.config import PolymarketConfig

logger = logging.getLogger(__name__)


class PolymarketCollector(BaseCollector):
    """Fetches data from Polymarket's public Gamma API."""

    def __init__(self, config: PolymarketConfig | None = None):
        self.config = config or PolymarketConfig()
        self._client: httpx.AsyncClient | None = None

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(timeout=30.0)
        return self._client

    async def close(self):
        if self._client and not self._client.is_closed:
            await self._client.aclose()

    async def fetch_markets(self, limit: int = 50, active: bool = True) -> list[Market]:
        """Fetch active markets from Gamma API."""
        client = await self._get_client()
        params = {
            "limit": limit,
            "active": str(active).lower(),
            "order": "volume24hr",
            "ascending": "false",
        }

        try:
            resp = await client.get(f"{self.config.gamma_url}/markets", params=params)
            resp.raise_for_status()
            raw_markets = resp.json()
        except Exception as e:
            logger.error(f"Failed to fetch Polymarket markets: {e}")
            return []

        markets = []
        for m in raw_markets:
            try:
                # Gamma API returns outcomes with prices
                outcomes = m.get("outcomePrices", "[]")
                if isinstance(outcomes, str):
                    import json
                    outcomes = json.loads(outcomes)

                yes_price = float(outcomes[0]) if outcomes else 0.5

                markets.append(Market(
                    id=m.get("conditionId", m.get("id", "")),
                    source="polymarket",
                    title=m.get("question", ""),
                    description=m.get("description", ""),
                    category=m.get("groupItemTitle", m.get("category", "other")),
                    current_price=yes_price,
                    volume_24h=float(m.get("volume24hr", 0)),
                    liquidity=float(m.get("liquidityNum", 0)),
                    end_date=datetime.fromisoformat(m["endDate"].replace("Z", "+00:00")) if m.get("endDate") else None,
                    url=f"https://polymarket.com/event/{m.get('events', [{}])[0].get('slug', m.get('slug', ''))}",
                    metadata={
                        "token_id": m.get("clobTokenIds", ""),
                        "outcomes": m.get("outcomes", ""),
                        "volume_total": float(m.get("volumeNum", 0)),
                        "competitive": float(m.get("events", [{}])[0].get("competitive", 0)) if m.get("events") else 0,
                        "image": m.get("image", ""),
                        "start_date": m.get("startDateIso", ""),
                        "closed": m.get("closed", False),
                    },
                ))
            except Exception as e:
                logger.warning(f"Skipping market parse error: {e}")
                continue

        logger.info(f"Fetched {len(markets)} markets from Polymarket")
        return markets

    async def fetch_events(self, market_ids: list[str] | None = None) -> list[MarketEvent]:
        """Fetch price snapshots as events."""
        markets = await self.fetch_markets()
        events = []
        now = datetime.utcnow()

        for m in markets:
            if market_ids and m.id not in market_ids:
                continue
            events.append(MarketEvent(
                source="polymarket",
                event_type=EventType.PRICE,
                market_id=m.id,
                timestamp=now,
                payload={
                    "title": m.title,
                    "price": m.current_price,
                    "volume_24h": m.volume_24h,
                    "liquidity": m.liquidity,
                },
            ))

        return events

    async def stream(self, callback: Callable[[MarketEvent], None]) -> None:
        """MVP: poll loop."""
        logger.info(f"Starting Polymarket poll loop (interval={self.config.poll_interval}s)")
        while True:
            try:
                events = await self.fetch_events()
                for event in events:
                    await callback(event) if asyncio.iscoroutinefunction(callback) else callback(event)
            except Exception as e:
                logger.error(f"Poll error: {e}")
            await asyncio.sleep(self.config.poll_interval)
