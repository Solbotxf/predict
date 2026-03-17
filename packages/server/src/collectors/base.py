"""Base collector interface — all data sources implement this."""
from abc import ABC, abstractmethod
from typing import AsyncIterator, Callable
from src.models import MarketEvent, Market


class BaseCollector(ABC):
    """Abstract base for data collectors."""

    @abstractmethod
    async def fetch_markets(self) -> list[Market]:
        """Fetch active markets from the source."""
        ...

    @abstractmethod
    async def fetch_events(self, market_ids: list[str] | None = None) -> list[MarketEvent]:
        """Fetch latest events/price updates."""
        ...

    @abstractmethod
    async def stream(self, callback: Callable[[MarketEvent], None]) -> None:
        """Continuous streaming (MVP: poll loop)."""
        ...
