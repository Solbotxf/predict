"""MVP message bus — asyncio.Queue based."""
from __future__ import annotations
import asyncio
import logging
from typing import Callable
from src.pipeline.base import BaseBus
from src.models import MarketEvent

logger = logging.getLogger(__name__)


class SimpleAsyncBus(BaseBus):
    """In-process pub/sub via asyncio queues."""

    def __init__(self):
        self._subscribers: dict[str, list[Callable]] = {}
        self._queue: asyncio.Queue[tuple[str, MarketEvent]] = asyncio.Queue()
        self._running = False

    async def publish(self, topic: str, event: MarketEvent) -> None:
        await self._queue.put((topic, event))

    async def subscribe(self, topic: str, handler: Callable) -> None:
        self._subscribers.setdefault(topic, []).append(handler)

    async def start(self):
        """Start the dispatch loop."""
        self._running = True
        while self._running:
            try:
                topic, event = await asyncio.wait_for(self._queue.get(), timeout=1.0)
                for handler in self._subscribers.get(topic, []):
                    try:
                        if asyncio.iscoroutinefunction(handler):
                            await handler(event)
                        else:
                            handler(event)
                    except Exception as e:
                        logger.error(f"Handler error on {topic}: {e}")
            except asyncio.TimeoutError:
                continue

    def stop(self):
        self._running = False
