"""Production storage — PostgreSQL with asyncpg."""
from __future__ import annotations
import json
import logging
from datetime import datetime

import asyncpg

from src.pipeline.base import BaseStore
from src.models import MarketEvent, Market, EventType

logger = logging.getLogger(__name__)


class PostgresStore(BaseStore):
    def __init__(self, database_url: str):
        self.database_url = database_url
        self._pool: asyncpg.Pool | None = None

    async def init(self) -> None:
        self._pool = await asyncpg.create_pool(self.database_url, min_size=2, max_size=10)
        async with self._pool.acquire() as conn:
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS events (
                    id BIGSERIAL PRIMARY KEY,
                    source TEXT NOT NULL,
                    event_type TEXT NOT NULL,
                    market_id TEXT NOT NULL,
                    timestamp TIMESTAMPTZ NOT NULL,
                    payload JSONB NOT NULL,
                    created_at TIMESTAMPTZ DEFAULT NOW()
                );
                CREATE INDEX IF NOT EXISTS idx_events_market_ts
                    ON events(market_id, timestamp DESC);

                CREATE TABLE IF NOT EXISTS markets (
                    id TEXT PRIMARY KEY,
                    source TEXT NOT NULL,
                    title TEXT NOT NULL,
                    description TEXT DEFAULT '',
                    category TEXT DEFAULT '',
                    current_price REAL,
                    volume_24h REAL,
                    liquidity REAL,
                    end_date TIMESTAMPTZ,
                    url TEXT DEFAULT '',
                    metadata JSONB DEFAULT '{}',
                    updated_at TIMESTAMPTZ DEFAULT NOW()
                );

                CREATE TABLE IF NOT EXISTS signals (
                    id BIGSERIAL PRIMARY KEY,
                    analyzer TEXT NOT NULL,
                    market_id TEXT NOT NULL,
                    timestamp TIMESTAMPTZ NOT NULL,
                    signal_type TEXT NOT NULL,
                    confidence REAL,
                    direction TEXT,
                    metadata JSONB DEFAULT '{}',
                    created_at TIMESTAMPTZ DEFAULT NOW()
                );
                CREATE INDEX IF NOT EXISTS idx_signals_market_ts
                    ON signals(market_id, timestamp DESC);

                CREATE TABLE IF NOT EXISTS fixtures (
                    id BIGSERIAL PRIMARY KEY,
                    league TEXT NOT NULL,
                    home_team TEXT NOT NULL,
                    away_team TEXT NOT NULL,
                    start_time TIMESTAMPTZ NOT NULL,
                    venue TEXT DEFAULT '',
                    status TEXT DEFAULT 'pre',
                    home_score INT,
                    away_score INT,
                    espn_event_id TEXT UNIQUE,
                    metadata JSONB DEFAULT '{}',
                    updated_at TIMESTAMPTZ DEFAULT NOW()
                );
                CREATE INDEX IF NOT EXISTS idx_fixtures_time
                    ON fixtures(start_time);
            """)
        logger.info("PostgreSQL store initialized")

    async def close(self):
        if self._pool:
            await self._pool.close()

    async def write_event(self, event: MarketEvent) -> None:
        assert self._pool
        await self._pool.execute(
            "INSERT INTO events (source, event_type, market_id, timestamp, payload) VALUES ($1, $2, $3, $4, $5)",
            event.source, event.event_type.value, event.market_id,
            event.timestamp, json.dumps(event.payload),
        )

    async def write_market(self, market: Market) -> None:
        assert self._pool
        await self._pool.execute("""
            INSERT INTO markets (id, source, title, description, category, current_price, volume_24h, liquidity, end_date, url, metadata, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
            ON CONFLICT (id) DO UPDATE SET
                current_price = EXCLUDED.current_price,
                volume_24h = EXCLUDED.volume_24h,
                liquidity = EXCLUDED.liquidity,
                url = EXCLUDED.url,
                metadata = EXCLUDED.metadata,
                updated_at = NOW()
        """,
            market.id, market.source, market.title, market.description,
            market.category, market.current_price, market.volume_24h,
            market.liquidity, market.end_date, market.url,
            json.dumps(market.metadata),
        )

    async def query_events(self, market_id: str, limit: int = 100) -> list[MarketEvent]:
        assert self._pool
        rows = await self._pool.fetch(
            "SELECT source, event_type, market_id, timestamp, payload FROM events WHERE market_id = $1 ORDER BY timestamp DESC LIMIT $2",
            market_id, limit,
        )
        return [
            MarketEvent(source=r["source"], event_type=EventType(r["event_type"]),
                        market_id=r["market_id"], timestamp=r["timestamp"],
                        payload=json.loads(r["payload"]) if isinstance(r["payload"], str) else r["payload"])
            for r in rows
        ]

    async def query_markets(self, source: str | None = None, limit: int = 100) -> list[Market]:
        assert self._pool
        if source:
            rows = await self._pool.fetch(
                "SELECT * FROM markets WHERE source = $1 ORDER BY volume_24h DESC LIMIT $2", source, limit)
        else:
            rows = await self._pool.fetch(
                "SELECT * FROM markets ORDER BY volume_24h DESC LIMIT $1", limit)
        return [self._row_to_market(r) for r in rows]

    async def get_market(self, market_id: str) -> Market | None:
        assert self._pool
        row = await self._pool.fetchrow("SELECT * FROM markets WHERE id = $1", market_id)
        return self._row_to_market(row) if row else None

    def _row_to_market(self, row) -> Market:
        meta = row["metadata"]
        if isinstance(meta, str):
            meta = json.loads(meta)
        return Market(
            id=row["id"], source=row["source"], title=row["title"],
            description=row["description"] or "", category=row["category"] or "",
            current_price=row["current_price"] or 0.5,
            volume_24h=row["volume_24h"] or 0, liquidity=row["liquidity"] or 0,
            end_date=row["end_date"], url=row["url"] or "",
            metadata=meta or {},
        )
