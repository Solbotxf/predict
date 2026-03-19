"""Seed: Crypto prices from CoinGecko (free, no key)."""
import asyncio
import logging
from _utils import get_http_client, get_store, now_utc

logger = logging.getLogger("seed.crypto")

COINGECKO = "https://api.coingecko.com/api/v3"
COINS = ["bitcoin", "ethereum", "solana", "dogecoin", "ripple", "cardano",
         "polkadot", "avalanche-2", "chainlink", "uniswap"]


async def run():
    from src.models import MarketEvent, EventType

    store = await get_store()
    client = get_http_client()
    now = now_utc()
    count = 0

    async with client:
        try:
            ids = ",".join(COINS)
            r = await client.get(f"{COINGECKO}/simple/price", params={
                "ids": ids,
                "vs_currencies": "usd",
                "include_24hr_vol": "true",
                "include_24hr_change": "true",
                "include_market_cap": "true",
            })
            r.raise_for_status()
            data = r.json()
        except Exception as e:
            logger.error(f"CoinGecko fetch failed: {e}")
            await store.close()
            return

        for coin_id, info in data.items():
            await store.write_event(MarketEvent(
                source="coingecko", event_type=EventType.PRICE,
                market_id=f"crypto-{coin_id}", timestamp=now,
                payload={
                    "coin": coin_id,
                    "price_usd": info.get("usd", 0),
                    "volume_24h": info.get("usd_24h_vol", 0),
                    "change_24h": info.get("usd_24h_change", 0),
                    "market_cap": info.get("usd_market_cap", 0),
                },
            ))
            count += 1

    logger.info(f"✅ Crypto: {count} coin prices stored")
    await store.close()


if __name__ == "__main__":
    asyncio.run(run())
