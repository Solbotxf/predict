"""Pipeline interfaces — message bus and storage."""
from abc import ABC, abstractmethod
from typing import Callable
from src.models import MarketEvent, Market


class BaseBus(ABC):
    @abstractmethod
    async def publish(self, topic: str, event: MarketEvent) -> None: ...

    @abstractmethod
    async def subscribe(self, topic: str, handler: Callable) -> None: ...


class BaseStore(ABC):
    @abstractmethod
    async def init(self) -> None: ...

    @abstractmethod
    async def write_event(self, event: MarketEvent) -> None: ...

    @abstractmethod
    async def write_market(self, market: Market) -> None: ...

    @abstractmethod
    async def query_events(self, market_id: str, limit: int = 100) -> list[MarketEvent]: ...

    @abstractmethod
    async def query_markets(self, source: str | None = None, limit: int = 100) -> list[Market]: ...

    @abstractmethod
    async def get_market(self, market_id: str) -> Market | None: ...
