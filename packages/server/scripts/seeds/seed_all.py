"""Run all seed scripts. Use as K8s CronJob entrypoint."""
import asyncio
import importlib
import logging
import sys
import time

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(message)s")
logger = logging.getLogger("seed_all")

SEEDS = [
    "seed_polymarket",
    "seed_kalshi",
    "seed_espn",
    "seed_crypto",
    "seed_gdelt",
    "seed_news_rss",
    "seed_earthquakes",
    "seed_fred",
]


async def main():
    start = time.time()
    results = {}

    for name in SEEDS:
        t0 = time.time()
        try:
            mod = importlib.import_module(name)
            await mod.run()
            results[name] = f"✅ {time.time()-t0:.1f}s"
        except Exception as e:
            results[name] = f"❌ {e}"
            logger.error(f"{name} failed: {e}", exc_info=True)

    logger.info("=" * 50)
    logger.info(f"Seed run complete in {time.time()-start:.1f}s:")
    for name, status in results.items():
        logger.info(f"  {name}: {status}")


if __name__ == "__main__":
    asyncio.run(main())
