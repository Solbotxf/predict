"""Seed: USGS earthquakes (free, no key)."""
import asyncio
import logging
from _utils import get_http_client, get_store, now_utc

logger = logging.getLogger("seed.earthquakes")

USGS_URL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson"


async def run():
    from src.models import MarketEvent, EventType

    store = await get_store()
    client = get_http_client()
    now = now_utc()

    async with client:
        r = await client.get(USGS_URL)
        r.raise_for_status()
        features = r.json().get("features", [])

    count = 0
    for f in features:
        props = f.get("properties", {})
        coords = f.get("geometry", {}).get("coordinates", [0, 0, 0])
        await store.write_event(MarketEvent(
            source="usgs", event_type=EventType.NEWS,
            market_id=f"earthquake-{f.get('id', '')}",
            timestamp=now,
            payload={
                "place": props.get("place", ""),
                "magnitude": props.get("mag", 0),
                "depth_km": coords[2] if len(coords) > 2 else 0,
                "lat": coords[1] if len(coords) > 1 else 0,
                "lon": coords[0] if len(coords) > 0 else 0,
                "time": props.get("time", 0),
                "url": props.get("url", ""),
            },
        ))
        count += 1

    logger.info(f"✅ Earthquakes: {count} events (M4.5+ last 24h)")
    await store.close()


if __name__ == "__main__":
    asyncio.run(run())
