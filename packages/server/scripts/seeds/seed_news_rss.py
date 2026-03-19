"""Seed: RSS news feeds — curated for prediction market relevance."""
import asyncio
import logging
import xml.etree.ElementTree as ET
from datetime import datetime
from email.utils import parsedate_to_datetime
from _utils import get_http_client, get_store, now_utc

logger = logging.getLogger("seed.rss")

# Curated RSS feeds grouped by category
FEEDS = {
    "geopolitics": [
        "https://feeds.bbci.co.uk/news/world/rss.xml",
        "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
        "https://www.aljazeera.com/xml/rss/all.xml",
        "https://feeds.reuters.com/Reuters/worldNews",
    ],
    "economy": [
        "https://feeds.reuters.com/reuters/businessNews",
        "https://rss.nytimes.com/services/xml/rss/nyt/Economy.xml",
        "https://feeds.bbci.co.uk/news/business/rss.xml",
        "https://www.cnbc.com/id/100003114/device/rss/rss.html",
    ],
    "tech": [
        "https://feeds.arstechnica.com/arstechnica/technology-lab",
        "https://www.theverge.com/rss/index.xml",
        "https://techcrunch.com/feed/",
    ],
    "crypto": [
        "https://cointelegraph.com/rss",
        "https://www.coindesk.com/arc/outboundfeeds/rss/",
    ],
    "politics_us": [
        "https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml",
        "https://feeds.reuters.com/Reuters/PoliticsNews",
    ],
    "climate": [
        "https://www.nasa.gov/rss/dyn/earth.rss",
    ],
}


def parse_rss(xml_text: str) -> list[dict]:
    """Parse RSS/Atom feed XML into list of articles."""
    items = []
    try:
        root = ET.fromstring(xml_text)
    except ET.ParseError:
        return []

    # RSS 2.0
    for item in root.iter("item"):
        title = (item.findtext("title") or "").strip()
        link = (item.findtext("link") or "").strip()
        desc = (item.findtext("description") or "").strip()[:300]
        pub_date = item.findtext("pubDate") or ""

        ts = None
        if pub_date:
            try:
                ts = parsedate_to_datetime(pub_date).isoformat()
            except:
                pass

        if title:
            items.append({"title": title, "url": link, "description": desc, "published": ts})

    # Atom
    if not items:
        ns = {"atom": "http://www.w3.org/2005/Atom"}
        for entry in root.findall(".//atom:entry", ns) + root.findall(".//entry"):
            title = ""
            link = ""
            for child in entry:
                tag = child.tag.split("}")[-1] if "}" in child.tag else child.tag
                if tag == "title":
                    title = (child.text or "").strip()
                elif tag == "link":
                    link = child.get("href", "")

            if title:
                items.append({"title": title, "url": link, "description": "", "published": None})

    return items[:20]  # Cap per feed


async def run():
    from src.models import MarketEvent, EventType

    store = await get_store()
    client = get_http_client()
    now = now_utc()
    total = 0

    async with client:
        for category, urls in FEEDS.items():
            for url in urls:
                try:
                    r = await client.get(url, follow_redirects=True)
                    r.raise_for_status()
                    articles = parse_rss(r.text)

                    for art in articles:
                        await store.write_event(MarketEvent(
                            source="rss", event_type=EventType.NEWS,
                            market_id=f"rss-{category}",
                            timestamp=now,
                            payload={
                                "title": art["title"][:300],
                                "url": art["url"],
                                "description": art["description"],
                                "published": art["published"],
                                "category": category,
                                "feed_url": url,
                            },
                        ))
                        total += 1

                    logger.info(f"  [{category}] {url.split('/')[2]}: {len(articles)} articles")
                except Exception as e:
                    logger.warning(f"  [{category}] {url}: {e}")
                await asyncio.sleep(0.5)

    logger.info(f"✅ RSS: {total} articles from {sum(len(v) for v in FEEDS.values())} feeds")
    await store.close()


if __name__ == "__main__":
    asyncio.run(run())
