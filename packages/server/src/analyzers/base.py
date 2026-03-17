"""Base analyzer interface."""
from abc import ABC, abstractmethod
from src.models import Market, Signal


class BaseAnalyzer(ABC):
    @abstractmethod
    async def analyze(self, market: Market, context: dict | None = None) -> Signal | None:
        """Analyze a single market, return Signal or None if no signal."""
        ...

    @abstractmethod
    def name(self) -> str: ...
