"""Seed: Kalshi prediction markets (public API, no key needed)."""
import asyncio
import logging
from datetime import datetime
from _utils import get_http_client, get_store, now_utc

logger = logging.getLogger("seed.kalshi")

KALSHI_BASE = "https://api.elections.kalshi.com/trade-api/v2"


async def run():
    from src.models import Market, MarketEvent, EventType

    store = await get_store()
    client = get_http_client()
    now = now_utc()
    markets = []

    async with client:
        try:
            r = await client.get(f"{KALSHI_BASE}/events", params={
                "status": "open", "with_nested_markets": "true", "limit": "100",
            })
            r.raise_for_status()
            events = r.json().get("events", [])
        except Exception as e:
            logger.error(f"Kalshi fetch failed: {e}")
            await store.close()
            return

        for event in events:
            if not event.get("markets"):
                continue

            binary_active = [m for m in event["markets"]
                            if m.get("market_type") == "binary" and m.get("status") == "active"]
            if not binary_active:
                continue

            top = max(binary_active, key=lambda m: float(m.get("volume_fp", 0) or 0))
            volume = float(top.get("volume_fp", 0) or 0)
            if volume <= 1000:
                continue

            raw_price = float(top.get("last_price_dollars", 0.5) or 0.5)
            price = min(max(raw_price, 0.01), 0.99)

            title = top.get("yes_sub_title") or top.get("title") or event.get("title", "")
            if event.get("title") and title != event["title"] and len(title) < 60:
                title = f"{event['title']}: {title}"

            ticker = top.get("ticker", "")
            market = Market(
                id=f"kalshi-{ticker}",
                source="kalshi",
                title=title,
                description=str(event.get("sub_title", "") or ""),
                category=event.get("category", ""),
                current_price=price,
                volume_24h=volume,
                liquidity=0,
                end_date=datetime.fromisoformat(top["close_time"].replace("Z","+00:00")) if top.get("close_time") else None,
                url=f"https://kalshi.com/markets/{ticker}" if ticker else "",
                metadata={"ticker": ticker, "event_ticker": event.get("event_ticker", "")},
            )
            markets.append(market)

    for market in markets:
        await store.write_market(market)
        await store.write_event(MarketEvent(
            source="kalshi", event_type=EventType.PRICE,
            market_id=market.id, timestamp=now,
            payload={"price": market.current_price, "volume_24h": market.volume_24h},
        ))

    logger.info(f"✅ Kalshi: {len(markets)} markets stored")
    await store.close()


if __name__ == "__main__":
    asyncio.run(run())
