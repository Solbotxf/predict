"""Quick test: fetch markets from Polymarket."""
import asyncio
import sys
sys.path.insert(0, ".")

from src.collectors.polymarket import PolymarketCollector


async def main():
    collector = PolymarketCollector()
    print("Fetching markets from Polymarket...")
    markets = await collector.fetch_markets(limit=10)
    for m in markets:
        print(f"  [{m.category}] {m.title}")
        print(f"    Price: {m.current_price:.1%} | Vol: ${m.volume_24h:,.0f} | Liq: ${m.liquidity:,.0f}")
        print()
    await collector.close()
    print(f"Total: {len(markets)} markets")


if __name__ == "__main__":
    asyncio.run(main())
