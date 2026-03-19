"""Data collection script — run periodically via K8s CronJob or cron.

Collects:
1. Polymarket market snapshots → markets table + events table
2. ESPN fixtures → fixtures table (if using PostgreSQL)

Usage:
  python scripts/collect.py              # Run once
  python scripts/collect.py --loop 30    # Run every 30 seconds
"""
import asyncio
import logging
import sys
import os
import argparse

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.config import load_settings
from src.factory import create_store
from src.collectors.polymarket import PolymarketCollector
from src.collectors.espn import ESPNCollector
from src.models import MarketEvent, EventType
from datetime import datetime, timezone

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


async def collect_once():
    settings = load_settings()

    # Override from env
    db_url = os.environ.get("DATABASE_URL", "")
    if db_url:
        settings.pipeline.database_url = db_url
        settings.pipeline.store = "postgres"

    store = create_store(settings)
    await store.init()

    poly = PolymarketCollector(settings.collectors.polymarket)

    # 1. Collect Polymarket markets
    logger.info("Collecting Polymarket markets...")
    markets = await poly.fetch_markets(limit=200)
    now = datetime.now(timezone.utc)

    for m in markets:
        await store.write_market(m)
        # Also write a price event for time series
        await store.write_event(MarketEvent(
            source="polymarket",
            event_type=EventType.PRICE,
            market_id=m.id,
            timestamp=now,
            payload={
                "price": m.current_price,
                "volume_24h": m.volume_24h,
                "liquidity": m.liquidity,
            },
        ))

    logger.info(f"Collected {len(markets)} markets + {len(markets)} price events")

    await poly.close()
    await store.close()


async def collect_loop(interval: int):
    while True:
        try:
            await collect_once()
        except Exception as e:
            logger.error(f"Collection failed: {e}")
        logger.info(f"Sleeping {interval}s...")
        await asyncio.sleep(interval)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--loop", type=int, default=0, help="Loop interval in seconds (0=run once)")
    args = parser.parse_args()

    if args.loop > 0:
        asyncio.run(collect_loop(args.loop))
    else:
        asyncio.run(collect_once())
