"""FastAPI application — REST API for frontend."""
from __future__ import annotations
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.config import load_settings
from src.collectors.polymarket import PolymarketCollector
from src.factory import create_store
from src.analyzers.llm_prob import LLMProbAnalyzer
from src.analyzers.kelly import KellySizer
from src.engine.signal_engine import SignalEngine
from src.api.routes import router

logger = logging.getLogger(__name__)

# Globals (initialized in lifespan)
settings = load_settings()
# Use DATABASE_URL env var if set, override config
import os
if os.environ.get("DATABASE_URL") and not settings.pipeline.database_url:
    settings.pipeline.database_url = os.environ["DATABASE_URL"]
    settings.pipeline.store = "postgres"
store = create_store(settings)
collector = PolymarketCollector(settings.collectors.polymarket)
llm_analyzer = LLMProbAnalyzer(settings.analyzers.llm_prob)
kelly = KellySizer(settings.analyzers.kelly)
engine = SignalEngine(analyzers=[llm_analyzer], kelly=kelly, config=settings.engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await store.init()
    logger.info("PMT Server started")
    yield
    await store.close()
    await collector.close()


def create_app() -> FastAPI:
    app = FastAPI(
        title="PredictEdge API",
        version="0.1.0",
        lifespan=lifespan,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(router, prefix="/api")
    return app
