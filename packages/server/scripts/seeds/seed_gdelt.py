"""Seed: GDELT news events — global news with geo coordinates.
Uses GDELT DOC 2.0 API (free, no key).
"""
import asyncio
import logging
import re
from _utils import get_http_client, get_store, now_utc

logger = logging.getLogger("seed.gdelt")

GDELT_DOC = "https://api.gdeltproject.org/api/v2/doc/doc"

# Queries tuned for prediction-market-relevant news
QUERIES = [
    ("geopolitics", "election OR sanctions OR war OR conflict OR treaty OR summit"),
    ("economy", "inflation OR recession OR interest rate OR GDP OR unemployment OR tariff"),
    ("crypto", "bitcoin OR ethereum OR crypto regulation OR SEC OR stablecoin"),
    ("tech", "AI regulation OR antitrust OR tech ban OR data privacy OR semiconductor"),
    ("climate", "hurricane OR earthquake OR wildfire OR flood OR climate summit"),
]


async def fetch_articles(client, query: str, max_records: int = 30):
    r = await client.get(GDELT_DOC, params={
        "query": query,
        "mode": "ArtList",
        "maxrecords": str(max_records),
        "format": "json",
        "timespan": "24h",
        "sort": "ToneDesc",
    })
    r.raise_for_status()
    data = r.json()
    return data.get("articles", [])


def extract_coords(article: dict) -> tuple[float, float] | None:
    """Try to get lat/lon from GDELT article metadata."""
    # GDELT DOC API sometimes includes geo in seendate or sourcecountry
    # but the main geo comes from the full GKG — for DOC, we'll tag by country
    return None


async def run():
    from src.models import MarketEvent, EventType

    store = await get_store()
    client = get_http_client()
    now = now_utc()
    total = 0

    async with client:
        for category, query in QUERIES:
            try:
                articles = await fetch_articles(client, query)
                for art in articles:
                    url = art.get("url", "")
                    title = art.get("title", "")
                    if not title:
                        continue

                    await store.write_event(MarketEvent(
                        source="gdelt", event_type=EventType.NEWS,
                        market_id=f"gdelt-{category}",
                        timestamp=now,
                        payload={
                            "title": title[:300],
                            "url": url,
                            "source": art.get("domain", ""),
                            "source_country": art.get("sourcecountry", ""),
                            "language": art.get("language", ""),
                            "tone": art.get("tone", 0),
                            "category": category,
                            "seen_date": art.get("seendate", ""),
                        },
                    ))
                    total += 1

                logger.info(f"  [{category}] {len(articles)} articles")
            except Exception as e:
                logger.warning(f"  [{category}] error: {e}")
            await asyncio.sleep(1)  # Be polite

    logger.info(f"✅ GDELT: {total} news events stored")
    await store.close()


if __name__ == "__main__":
    asyncio.run(run())
