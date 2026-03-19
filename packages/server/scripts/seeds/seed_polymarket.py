"""Seed: Polymarket markets via Gamma API."""
import asyncio
import logging
from datetime import datetime, timezone
from datetime import datetime
from _utils import get_http_client, get_store, now_utc

logger = logging.getLogger("seed.polymarket")

GAMMA_BASE = "https://gamma-api.polymarket.com"


async def fetch_events(client, tag: str, limit: int = 30):
    params = {
        "tag_slug": tag, "closed": "false", "active": "true",
        "archived": "false", "order": "volume", "ascending": "false",
        "limit": str(limit),
        "end_date_min": now_utc().isoformat(),
    }
    r = await client.get(f"{GAMMA_BASE}/events", params=params)
    r.raise_for_status()
    return r.json() if isinstance(r.json(), list) else []


async def run():
    from src.models import Market, MarketEvent, EventType

    tags = [
        "politics", "geopolitics", "elections", "world", "ukraine", "china",
        "middle-east", "europe", "economy", "fed", "inflation", "crypto",
        "ai", "tech", "science", "sports", "entertainment",
    ]
    store = await get_store()
    client = get_http_client()

    seen = set()
    markets = []
    now = now_utc()

    async with client:
        for tag in tags:
            try:
                events = await fetch_events(client, tag)
                for event in events:
                    for m in event.get("markets", []):
                        mid = m.get("id") or m.get("conditionId", "")
                        if mid in seen:
                            continue
                        seen.add(mid)

                        price_str = m.get("outcomePrices", "")
                        try:
                            prices = eval(price_str) if isinstance(price_str, str) and price_str.startswith("[") else [0.5]
                            price = float(prices[0])
                        except:
                            price = 0.5

                        event_slug = event.get("slug", "")
                        market = Market(
                            id=mid, source="polymarket",
                            title=m.get("question", event.get("title", "")),
                            description=m.get("description", "")[:500],
                            category=tag,
                            current_price=price,
                            volume_24h=float(m.get("volume", 0) or 0),
                            liquidity=float(m.get("liquidity", 0) or 0),
                            end_date=datetime.fromisoformat(m["endDate"].replace("Z","+00:00")) if m.get("endDate") else None,
                            url=f"https://polymarket.com/event/{event_slug}" if event_slug else "",
                            metadata={
                                "slug": m.get("slug", ""),
                                "event_slug": event_slug,
                                "tag": tag,
                            },
                        )
                        markets.append(market)
                logger.info(f"  [{tag}] {len(events)} events")
            except Exception as e:
                logger.warning(f"  [{tag}] error: {e}")
            await asyncio.sleep(0.3)

    for market in markets:
        await store.write_market(market)
        await store.write_event(MarketEvent(
            source="polymarket", event_type=EventType.PRICE,
            market_id=market.id, timestamp=now,
            payload={"price": market.current_price, "volume_24h": market.volume_24h, "liquidity": market.liquidity},
        ))

    logger.info(f"✅ Polymarket: {len(markets)} markets stored")
    await store.close()


if __name__ == "__main__":
    asyncio.run(run())
