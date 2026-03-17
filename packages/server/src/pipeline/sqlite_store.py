"""MVP storage — SQLite with aiosqlite."""
from __future__ import annotations
import json
import logging
from datetime import datetime
from pathlib import Path

import aiosqlite

from src.pipeline.base import BaseStore
from src.models import MarketEvent, Market, EventType

logger = logging.getLogger(__name__)


class SQLiteStore(BaseStore):
    def __init__(self, db_path: str = "data/pmt.db"):
        self.db_path = db_path
        self._db: aiosqlite.Connection | None = None

    async def init(self) -> None:
        Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
        self._db = await aiosqlite.connect(self.db_path)
        await self._db.executescript("""
            CREATE TABLE IF NOT EXISTS events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source TEXT NOT NULL,
                event_type TEXT NOT NULL,
                market_id TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                payload TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_events_market ON events(market_id, timestamp DESC);

            CREATE TABLE IF NOT EXISTS markets (
                id TEXT PRIMARY KEY,
                source TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                category TEXT,
                current_price REAL,
                volume_24h REAL,
                liquidity REAL,
                end_date TEXT,
                url TEXT,
                metadata TEXT,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
        """)
        await self._db.commit()
        logger.info(f"SQLite store initialized at {self.db_path}")

    async def close(self):
        if self._db:
            await self._db.close()

    async def write_event(self, event: MarketEvent) -> None:
        assert self._db
        await self._db.execute(
            "INSERT INTO events (source, event_type, market_id, timestamp, payload) VALUES (?, ?, ?, ?, ?)",
            (event.source, event.event_type.value, event.market_id, event.timestamp.isoformat(), json.dumps(event.payload)),
        )
        await self._db.commit()

    async def write_market(self, market: Market) -> None:
        assert self._db
        await self._db.execute(
            """INSERT OR REPLACE INTO markets (id, source, title, description, category, current_price, volume_24h, liquidity, end_date, url, metadata, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (market.id, market.source, market.title, market.description, market.category,
             market.current_price, market.volume_24h, market.liquidity,
             market.end_date.isoformat() if market.end_date else None,
             market.url, json.dumps(market.metadata), datetime.utcnow().isoformat()),
        )
        await self._db.commit()

    async def query_events(self, market_id: str, limit: int = 100) -> list[MarketEvent]:
        assert self._db
        cursor = await self._db.execute(
            "SELECT source, event_type, market_id, timestamp, payload FROM events WHERE market_id = ? ORDER BY timestamp DESC LIMIT ?",
            (market_id, limit),
        )
        rows = await cursor.fetchall()
        return [
            MarketEvent(source=r[0], event_type=EventType(r[1]), market_id=r[2],
                        timestamp=datetime.fromisoformat(r[3]), payload=json.loads(r[4]))
            for r in rows
        ]

    async def query_markets(self, source: str | None = None, limit: int = 100) -> list[Market]:
        assert self._db
        if source:
            cursor = await self._db.execute(
                "SELECT * FROM markets WHERE source = ? ORDER BY volume_24h DESC LIMIT ?", (source, limit))
        else:
            cursor = await self._db.execute(
                "SELECT * FROM markets ORDER BY volume_24h DESC LIMIT ?", (limit,))
        rows = await cursor.fetchall()
        return [self._row_to_market(r) for r in rows]

    async def get_market(self, market_id: str) -> Market | None:
        assert self._db
        cursor = await self._db.execute("SELECT * FROM markets WHERE id = ?", (market_id,))
        row = await cursor.fetchone()
        return self._row_to_market(row) if row else None

    def _row_to_market(self, row) -> Market:
        return Market(
            id=row[0], source=row[1], title=row[2], description=row[3] or "",
            category=row[4] or "", current_price=row[5] or 0.5,
            volume_24h=row[6] or 0, liquidity=row[7] or 0,
            end_date=datetime.fromisoformat(row[8]) if row[8] else None,
            url=row[9] or "", metadata=json.loads(row[10] or "{}"),
        )
