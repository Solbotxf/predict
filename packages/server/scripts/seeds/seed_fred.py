"""Seed: FRED economic indicators (free key from fred.stlouisfed.org).
Set FRED_API_KEY env to enable. Skips gracefully if not set.
"""
import asyncio
import logging
import os
from _utils import get_http_client, get_store, now_utc

logger = logging.getLogger("seed.fred")

FRED_BASE = "https://api.stlouisfed.org/fred/series/observations"

# Key indicators that affect prediction markets
INDICATORS = {
    "CPIAUCSL": "CPI (Consumer Price Index)",
    "UNRATE": "Unemployment Rate",
    "GDP": "GDP",
    "FEDFUNDS": "Federal Funds Rate",
    "T10Y2Y": "10Y-2Y Treasury Spread (recession indicator)",
    "DCOILWTICO": "WTI Crude Oil Price",
    "VIXCLS": "VIX Volatility Index",
    "DGS10": "10-Year Treasury Yield",
}


async def run():
    from src.models import MarketEvent, EventType

    api_key = os.environ.get("FRED_API_KEY", "")
    if not api_key:
        logger.info("⏭ FRED: skipped (no FRED_API_KEY)")
        return

    store = await get_store()
    client = get_http_client()
    now = now_utc()
    count = 0

    async with client:
        for series_id, name in INDICATORS.items():
            try:
                r = await client.get(FRED_BASE, params={
                    "series_id": series_id,
                    "api_key": api_key,
                    "file_type": "json",
                    "sort_order": "desc",
                    "limit": "5",
                })
                r.raise_for_status()
                obs = r.json().get("observations", [])
                if not obs:
                    continue

                latest = obs[0]
                value = latest.get("value", ".")
                if value == ".":
                    continue

                await store.write_event(MarketEvent(
                    source="fred", event_type=EventType.PRICE,
                    market_id=f"fred-{series_id}",
                    timestamp=now,
                    payload={
                        "series_id": series_id,
                        "name": name,
                        "value": float(value),
                        "date": latest.get("date", ""),
                        "recent": [
                            {"date": o["date"], "value": float(o["value"])}
                            for o in obs if o.get("value", ".") != "."
                        ],
                    },
                ))
                count += 1
                logger.info(f"  {series_id}: {value}")
            except Exception as e:
                logger.warning(f"  {series_id}: {e}")
            await asyncio.sleep(0.3)

    logger.info(f"✅ FRED: {count} indicators stored")
    await store.close()


if __name__ == "__main__":
    asyncio.run(run())
