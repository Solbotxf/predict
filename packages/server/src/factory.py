"""Factory — create components from config. Swap implementations by changing config."""
from src.config import Settings
from src.pipeline.base import BaseBus, BaseStore
from src.collectors.base import BaseCollector
from src.analyzers.base import BaseAnalyzer


def create_bus(settings: Settings) -> BaseBus:
    match settings.pipeline.bus:
        case "simple":
            from src.pipeline.simple_bus import SimpleAsyncBus
            return SimpleAsyncBus()
        # case "redis_stream":
        #     from src.pipeline.redis_bus import RedisStreamBus
        #     return RedisStreamBus(settings.redis_url)
        case _:
            raise ValueError(f"Unknown bus: {settings.pipeline.bus}")


def create_store(settings: Settings) -> BaseStore:
    match settings.pipeline.store:
        case "sqlite":
            from src.pipeline.sqlite_store import SQLiteStore
            return SQLiteStore(settings.pipeline.sqlite_path)
        case "postgres" | "postgresql":
            from src.pipeline.pg_store import PostgresStore
            return PostgresStore(settings.pipeline.database_url)
        # case "timescale":
        #     from src.pipeline.timescale_store import TimescaleStore
        #     return TimescaleStore(settings.timescale_url)
        case _:
            raise ValueError(f"Unknown store: {settings.pipeline.store}")


def create_collector(name: str, settings: Settings) -> BaseCollector:
    match name:
        case "polymarket":
            from src.collectors.polymarket import PolymarketCollector
            return PolymarketCollector(settings.collectors.polymarket)
        case _:
            raise ValueError(f"Unknown collector: {name}")


def create_analyzers(settings: Settings) -> list[BaseAnalyzer]:
    analyzers: list[BaseAnalyzer] = []
    if settings.analyzers.llm_prob.enabled:
        from src.analyzers.llm_prob import LLMProbAnalyzer
        analyzers.append(LLMProbAnalyzer(settings.analyzers.llm_prob))
    return analyzers
