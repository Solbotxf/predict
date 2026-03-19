"""Shared utilities for seed scripts."""
import asyncio
import json
import logging
import os
import sys
import httpx
from datetime import datetime, timezone

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(message)s")

CHROME_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
FETCH_TIMEOUT = 15.0


def get_http_client(**kwargs) -> httpx.AsyncClient:
    return httpx.AsyncClient(
        headers={"User-Agent": CHROME_UA, "Accept": "application/json"},
        timeout=FETCH_TIMEOUT,
        **kwargs,
    )


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


async def get_store():
    """Create store based on DATABASE_URL env or fallback to SQLite."""
    db_url = os.environ.get("DATABASE_URL", "")
    if db_url:
        from src.pipeline.pg_store import PostgresStore
        store = PostgresStore(db_url)
    else:
        from src.pipeline.sqlite_store import SQLiteStore
        store = SQLiteStore(os.environ.get("SQLITE_PATH", "data/pmt.db"))
    await store.init()
    return store
