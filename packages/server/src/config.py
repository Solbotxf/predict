"""Configuration management — YAML + env vars + Pydantic."""
from __future__ import annotations
import os
from pathlib import Path
from typing import Any
import yaml
from pydantic import BaseModel
from pydantic_settings import BaseSettings


class ServerConfig(BaseModel):
    host: str = "0.0.0.0"
    port: int = 8000

class PipelineConfig(BaseModel):
    bus: str = "simple"
    store: str = "sqlite"
    sqlite_path: str = "data/pmt.db"

class PolymarketConfig(BaseModel):
    enabled: bool = True
    poll_interval: int = 30
    base_url: str = "https://clob.polymarket.com"
    gamma_url: str = "https://gamma-api.polymarket.com"

class CollectorsConfig(BaseModel):
    polymarket: PolymarketConfig = PolymarketConfig()

class LLMProbConfig(BaseModel):
    enabled: bool = True
    provider: str = "anthropic"
    model: str = "claude-3-haiku-20240307"
    cache_ttl: int = 3600

class KellyConfig(BaseModel):
    enabled: bool = True
    fraction: float = 0.5
    max_position: float = 0.25

class AnalyzersConfig(BaseModel):
    llm_prob: LLMProbConfig = LLMProbConfig()
    kelly: KellyConfig = KellyConfig()

class EngineConfig(BaseModel):
    weights: dict[str, float] = {"llm_prob": 0.7, "sentiment": 0.2, "arb": 0.1}
    min_confidence: float = 0.6
    min_edge: float = 0.03

class BacktestConfig(BaseModel):
    initial_bankroll: float = 10000
    start_date: str = "2024-01-01"
    end_date: str = "2026-03-01"

class Settings(BaseSettings):
    env: str = "development"
    server: ServerConfig = ServerConfig()
    pipeline: PipelineConfig = PipelineConfig()
    collectors: CollectorsConfig = CollectorsConfig()
    analyzers: AnalyzersConfig = AnalyzersConfig()
    engine: EngineConfig = EngineConfig()
    backtest: BacktestConfig = BacktestConfig()

    # API keys from env
    anthropic_api_key: str = ""
    openai_api_key: str = ""

    model_config = {"env_prefix": "PMT_", "env_nested_delimiter": "__"}


def load_settings(config_path: str | None = None) -> Settings:
    """Load from YAML then override with env vars."""
    if config_path is None:
        config_path = os.environ.get(
            "PMT_CONFIG",
            str(Path(__file__).parent.parent / "config" / "default.yaml"),
        )

    data: dict[str, Any] = {}
    p = Path(config_path)
    if p.exists():
        with open(p) as f:
            data = yaml.safe_load(f) or {}

    return Settings(**data)
