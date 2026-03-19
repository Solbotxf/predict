"""API routes."""
from __future__ import annotations
from fastapi import APIRouter, Query

router = APIRouter()


@router.get("/health")
async def health():
    return {"status": "ok", "version": "0.1.0"}


@router.get("/markets/insights")
async def market_insights(limit: int = Query(100, le=500)):
    """Categorized market insights for the scanner page."""
    from src.api.app import collector, store
    from datetime import datetime, timedelta, timezone

    markets = await collector.fetch_markets(limit=limit)
    for m in markets:
        await store.write_market(m)

    now = datetime.now(timezone.utc)
    seven_days = now + timedelta(days=7)
    thirty_days = now + timedelta(days=30)

    def _ed(m):
        if not m.end_date:
            return None
        return m.end_date if m.end_date.tzinfo else m.end_date.replace(tzinfo=timezone.utc)

    def is_future(m):
        ed = _ed(m)
        return ed is None or ed > now

    def is_active(m):
        return is_future(m) and 0.05 < m.current_price < 0.95

    future_markets = [m for m in markets if is_future(m)]
    active_markets = [m for m in markets if is_active(m)]

    hot = sorted(future_markets, key=lambda m: m.volume_24h, reverse=True)[:15]

    expiring_soon, expiring_month = [], []
    for m in future_markets:
        ed = _ed(m)
        if ed is None:
            continue
        if ed <= seven_days:
            expiring_soon.append(m)
        elif ed <= thirty_days:
            expiring_month.append(m)
    expiring_soon.sort(key=lambda m: _ed(m) or now)
    expiring_month.sort(key=lambda m: _ed(m) or now)

    locked_in = sorted(
        [m for m in future_markets if m.current_price > 0.92 or m.current_price < 0.08],
        key=lambda m: m.volume_24h, reverse=True,
    )

    contested = sorted(
        [m for m in future_markets if 0.25 <= m.current_price <= 0.75],
        key=lambda m: m.volume_24h, reverse=True,
    )

    edge_potential = sorted(
        [m for m in active_markets if m.liquidity > 10000],
        key=lambda m: m.volume_24h, reverse=True,
    )

    categories: dict[str, list] = {}
    for m in future_markets:
        categories.setdefault(m.category or "Other", []).append(m)
    category_stats = [
        {"name": cat, "count": len(ms), "total_volume": sum(x.volume_24h for x in ms),
         "avg_price": sum(x.current_price for x in ms) / len(ms) if ms else 0}
        for cat, ms in sorted(categories.items(), key=lambda x: sum(m.volume_24h for m in x[1]), reverse=True)
    ]

    def ser(m):
        return {
            "id": m.id, "source": m.source, "title": m.title, "category": m.category,
            "current_price": m.current_price, "volume_24h": m.volume_24h,
            "liquidity": m.liquidity, "url": m.url,
            "end_date": m.end_date.isoformat() if m.end_date else None,
            "image": m.metadata.get("image", ""),
        }

    return {
        "total_markets": len(markets),
        "active_markets": len(active_markets),
        "hot": [ser(m) for m in hot],
        "expiring_soon": [ser(m) for m in expiring_soon],
        "expiring_month": [ser(m) for m in expiring_month],
        "locked_in": [ser(m) for m in locked_in],
        "contested": [ser(m) for m in contested],
        "edge_potential": [ser(m) for m in edge_potential],
        "categories": category_stats,
        "all": [ser(m) for m in sorted(future_markets, key=lambda m: m.volume_24h, reverse=True)],
    }


@router.get("/markets/{market_id}")
async def get_market(market_id: str):
    from src.api.app import store
    market = await store.get_market(market_id)
    if not market:
        return {"error": "Market not found"}, 404
    return {
        "id": market.id, "source": market.source, "title": market.title,
        "description": market.description, "category": market.category,
        "current_price": market.current_price, "volume_24h": market.volume_24h,
        "liquidity": market.liquidity, "url": market.url,
    }


@router.get("/markets")
async def list_markets(source: str | None = None, limit: int = Query(50, le=200)):
    from src.api.app import collector, store
    markets = await collector.fetch_markets(limit=limit)
    if markets:
        for m in markets:
            await store.write_market(m)
    else:
        markets = await store.query_markets(source=source, limit=limit)
    return [
        {"id": m.id, "source": m.source, "title": m.title, "category": m.category,
         "current_price": m.current_price, "volume_24h": m.volume_24h,
         "liquidity": m.liquidity, "end_date": m.end_date.isoformat() if m.end_date else None,
         "url": m.url}
        for m in markets
    ]


@router.get("/signals")
async def get_signals(limit: int = Query(20, le=100)):
    from src.api.app import collector, engine
    markets = await collector.fetch_markets(limit=limit)
    recommendations = await engine.scan_markets(markets)
    return [rec.to_dict() for rec in recommendations]


@router.get("/signals/{market_id}")
async def get_signal_for_market(market_id: str):
    from src.api.app import store, engine
    market = await store.get_market(market_id)
    if not market:
        return {"error": "Market not found"}, 404
    rec = await engine.evaluate(market)
    return rec.to_dict() if rec else {"market_id": market_id, "action": "hold", "edge": 0}


@router.get("/stats")
async def platform_stats():
    from src.api.app import store
    markets = await store.query_markets(limit=10000)
    return {
        "total_markets": len(markets),
        "sources": list(set(m.source for m in markets)),
        "avg_volume": sum(m.volume_24h for m in markets) / len(markets) if markets else 0,
        "total_volume": sum(m.volume_24h for m in markets),
    }



@router.get("/events/timeline")
async def event_timeline(
    sport: str | None = None,
    league: str | None = None,
    days: int = Query(3, le=14),
):
    """Event timeline — ESPN fixtures matched with Polymarket markets."""
    from src.api.app import collector
    from src.collectors.espn import ESPNCollector, LEAGUES, Fixture
    from datetime import datetime, timedelta, timezone
    from collections import defaultdict

    espn = ESPNCollector()

    # Determine which leagues to fetch
    target_leagues = None
    if league:
        target_leagues = [league]
    elif sport:
        sport_lower = sport.lower()
        target_leagues = [k for k, v in LEAGUES.items() if v["sport"].lower() == sport_lower or k.lower() == sport_lower]
        if not target_leagues:
            target_leagues = None  # fetch all

    # Fetch ESPN fixtures + Polymarket markets in parallel
    import asyncio
    fixtures_task = espn.fetch_fixtures(leagues=target_leagues, days=days)
    markets_task = collector.fetch_markets(limit=200)
    fixtures, markets = await asyncio.gather(fixtures_task, markets_task)
    await espn.close()

    # Build timeline events from ESPN fixtures
    timeline = []
    for fix in fixtures:
        # Find matching Polymarket markets
        matched_markets = []
        for m in markets:
            score = ESPNCollector.match_fixture_to_market(fix, m.title)
            # Penalize cross-sport matches
            title_lower = m.title.lower()
            if fix.sport_type == "Soccer" and "lol:" in title_lower:
                score = 0  # Don't match soccer with esports
            if fix.sport_type != "Soccer" and ("fc " in title_lower or "win on 2026" in title_lower):
                if not any(kw in title_lower for kw in [k.lower() for k in [fix.home_team, fix.away_team]]):
                    score = 0
            if score > 0.5:
                matched_markets.append({
                    "id": m.id,
                    "title": m.title,
                    "current_price": m.current_price,
                    "volume_24h": m.volume_24h,
                    "liquidity": m.liquidity,
                    "url": m.url,
                    "end_date": m.end_date.isoformat() if m.end_date else None,
                    "match_score": score,
                })

        # Sort matched markets by match score then volume
        matched_markets.sort(key=lambda x: (-x["match_score"], -x["volume_24h"]))

        timeline.append({
            "event_id": fix.event_id,
            "event_name": fix.headline,
            "home_team": fix.home_team,
            "away_team": fix.away_team,
            "event_time": fix.start_time.isoformat(),
            "league": fix.league,
            "sport": fix.sport_type,
            "venue": fix.venue,
            "status": fix.status,
            "home_score": fix.home_score,
            "away_score": fix.away_score,
            "market_count": len(matched_markets),
            "total_volume": sum(x["volume_24h"] for x in matched_markets),
            "markets": matched_markets,
        })

    # Also add unmatched Polymarket events (non-sports: politics, crypto, etc.)
    now = datetime.now(timezone.utc)
    cutoff = now + timedelta(days=days)
    matched_market_ids = set()
    for ev in timeline:
        for m in ev["markets"]:
            matched_market_ids.add(m["id"])

    # Non-sport markets with upcoming end dates
    non_sport_keywords = ["election","president","trump","fed ","rate","gdp","cpi",
                          "iran","israel","china","ukraine","bitcoin","btc","ethereum",
                          "recession","congress","senate","ai ","agi"]
    for m in markets:
        if m.id in matched_market_ids:
            continue
        if not m.end_date:
            continue
        ed = m.end_date if m.end_date.tzinfo else m.end_date.replace(tzinfo=timezone.utc)
        if ed < now or ed > cutoff:
            continue
        title_lower = m.title.lower()
        if not any(kw in title_lower for kw in non_sport_keywords):
            continue

        # Classify
        cat = "Other"
        if any(kw in title_lower for kw in ["election","president","trump","congress","senate"]): cat = "Politics"
        elif any(kw in title_lower for kw in ["fed ","rate","gdp","cpi","recession"]): cat = "Economics"
        elif any(kw in title_lower for kw in ["iran","israel","china","ukraine"]): cat = "Geopolitics"
        elif any(kw in title_lower for kw in ["bitcoin","btc","ethereum","crypto"]): cat = "Crypto"
        elif any(kw in title_lower for kw in ["ai ","agi"]): cat = "Technology"

        timeline.append({
            "event_id": f"pm-{m.id[:12]}",
            "event_name": m.title,
            "home_team": "",
            "away_team": "",
            "event_time": ed.isoformat(),
            "league": cat,
            "sport": cat,
            "venue": "",
            "status": "pre",
            "home_score": None,
            "away_score": None,
            "market_count": 1,
            "total_volume": m.volume_24h,
            "markets": [{
                "id": m.id, "title": m.title, "current_price": m.current_price,
                "volume_24h": m.volume_24h, "liquidity": m.liquidity, "url": m.url,
                "end_date": ed.isoformat(), "match_score": 1.0,
            }],
        })

    # Inject recent news events with market associations
    try:
        import re as _re
        news_categories = {"geopolitics": "Geopolitics", "economy": "Economics",
                          "crypto": "Crypto", "tech": "Technology",
                          "climate": "Climate", "politics_us": "US Politics"}
        seen_news = set()
        for source in ["gdelt", "rss"]:
            for cat_key, cat_label in news_categories.items():
                events = await store.query_events(f"{source}-{cat_key}", limit=10)
                for ev in events:
                    p = ev.payload
                    title = p.get("title", "")
                    if not title:
                        continue
                    title_key = _re.sub(r"\W+", " ", title.lower()).strip()[:60]
                    if title_key in seen_news:
                        continue
                    seen_news.add(title_key)

                    # Find related markets
                    title_lower = title.lower()
                    news_words = set(_re.findall(r"\b[a-z]{4,}\b", title_lower))
                    related = []
                    for m in markets:
                        m_words = set(_re.findall(r"\b[a-z]{4,}\b", m.title.lower()))
                        overlap = news_words & m_words
                        if len(overlap) >= 2:
                            score = len(overlap) / max(len(news_words), 1)
                            related.append({
                                "id": m.id, "title": m.title,
                                "current_price": m.current_price,
                                "volume_24h": m.volume_24h,
                                "liquidity": m.liquidity,
                                "url": m.url,
                                "end_date": m.end_date.isoformat() if m.end_date else None,
                                "match_score": round(min(score, 1.0), 2),
                            })
                    related.sort(key=lambda x: -x["match_score"])

                    pub_time = p.get("published") or p.get("seen_date") or ev.timestamp.isoformat()
                    timeline.append({
                        "event_id": f"news-{hash(title_key) % 100000}",
                        "event_name": title[:150],
                        "home_team": "",
                        "away_team": "",
                        "event_time": pub_time if isinstance(pub_time, str) else str(pub_time),
                        "league": cat_label,
                        "sport": "News",
                        "venue": p.get("source", source),
                        "status": "news",
                        "home_score": None,
                        "away_score": None,
                        "market_count": len(related[:5]),
                        "total_volume": sum(x["volume_24h"] for x in related[:5]),
                        "markets": related[:5],
                        "news_url": p.get("url", ""),
                        "news_category": cat_key,
                    })
    except Exception as e:
        import logging
        logging.getLogger(__name__).warning(f"News injection into timeline failed: {e}")

    # Sort by time
    timeline.sort(key=lambda x: x["event_time"])

    # Available leagues
    all_leagues = sorted(set(e["league"] for e in timeline))

    return {
        "events": timeline,
        "total_events": len(timeline),
        "total_with_markets": sum(1 for e in timeline if e["market_count"] > 0),
        "leagues": all_leagues,
        "sports": sorted(set(e["sport"] for e in timeline)),
    }


@router.get("/news")
async def news_feed(
    category: str = Query("all", description="Filter by category"),
    limit: int = Query(50, le=200),
    with_markets: bool = Query(False, description="Only return news linked to markets"),
):
    """News feed with prediction market associations."""
    from src.api.app import store
    import re

    # Fetch news events from store
    news_events = []
    for source in ["gdelt", "rss"]:
        for cat in ["geopolitics", "economy", "crypto", "tech", "climate", "politics_us"]:
            events = await store.query_events(f"{source}-{cat}", limit=30)
            for ev in events:
                p = ev.payload
                news_events.append({
                    "title": p.get("title", ""),
                    "url": p.get("url", ""),
                    "source": p.get("source", p.get("feed_url", "").split("/")[2] if "feed_url" in p else source),
                    "category": p.get("category", cat),
                    "timestamp": ev.timestamp.isoformat() if ev.timestamp else None,
                    "tone": p.get("tone"),
                    "country": p.get("source_country"),
                })

    if category != "all":
        news_events = [n for n in news_events if n["category"] == category]

    # Deduplicate by title similarity
    seen_titles = set()
    unique_news = []
    for n in news_events:
        key = re.sub(r'\W+', ' ', n["title"].lower()).strip()[:60]
        if key not in seen_titles:
            seen_titles.add(key)
            unique_news.append(n)
    news_events = unique_news

    # Associate with prediction markets
    markets = await store.query_markets(limit=200)

    def find_related_markets(title: str) -> list[dict]:
        title_lower = title.lower()
        related = []
        for m in markets:
            m_title = m.title.lower()
            news_words = set(re.findall(r'\b[a-z]{4,}\b', title_lower))
            market_words = set(re.findall(r'\b[a-z]{4,}\b', m_title))
            overlap = news_words & market_words
            if len(overlap) >= 2:
                score = len(overlap) / max(len(news_words), 1)
                related.append({
                    "id": m.id, "title": m.title,
                    "current_price": m.current_price,
                    "volume_24h": m.volume_24h,
                    "url": m.url,
                    "relevance": round(min(score, 1.0), 2),
                })
        return sorted(related, key=lambda x: -x["relevance"])[:5]

    for n in news_events:
        n["related_markets"] = find_related_markets(n["title"])

    if with_markets:
        news_events = [n for n in news_events if n["related_markets"]]

    news_events.sort(key=lambda x: x.get("timestamp") or "", reverse=True)

    categories = sorted(set(n["category"] for n in news_events))

    return {
        "news": news_events[:limit],
        "total": len(news_events),
        "categories": categories,
    }


@router.get("/data-sources")
async def data_sources():
    """List all active data sources and their status."""
    sources = {
        "polymarket": {"name": "Polymarket", "type": "prediction_market", "api_key": False},
        "kalshi": {"name": "Kalshi", "type": "prediction_market", "api_key": False},
        "espn": {"name": "ESPN", "type": "sports", "api_key": False},
        "coingecko": {"name": "CoinGecko", "type": "crypto", "api_key": False},
        "gdelt": {"name": "GDELT", "type": "news", "api_key": False},
        "rss": {"name": "RSS Feeds (15 sources)", "type": "news", "api_key": False},
        "usgs": {"name": "USGS Earthquakes", "type": "natural", "api_key": False},
        "fred": {"name": "FRED Economic Data", "type": "economic", "api_key": True},
    }
    return {"sources": sources, "total": len(sources)}
