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
    days: int = Query(3, le=14),
):
    """Event timeline — group markets by event, sorted by time."""
    from src.api.app import collector
    from datetime import datetime, timedelta, timezone
    import re

    markets = await collector.fetch_markets(limit=200)
    now = datetime.now(timezone.utc)
    cutoff = now + timedelta(days=days)

    # Classify sport from event slug
    def classify(m):
        events = m.metadata.get("token_id", "")  # not useful
        slug = m.url.split("/event/")[-1] if "/event/" in m.url else ""
        title = m.title.lower()
        cat = m.category.lower()

        if "nba-" in slug or "vs." in m.title and any(t in title for t in ["lakers","celtics","warriors","hawks","nuggets","clippers","rockets","mavericks","pelicans","grizzlies","76ers","bucks","nets","suns","kings","heat","bulls","cavs","thunder","spurs","jazz","pacers","wizards","hornets","pistons","blazers","timberwolves","raptors","magic","knicks","devils","rangers","penguins","hurricanes","senators","capitals","stars","avalanche","blues","flames"]):
            if any(t in title for t in ["devils","rangers","penguins","hurricanes","senators","capitals","stars","avalanche","blues","flames"]):
                return "NHL"
            return "NBA"
        if "ucl-" in slug or "champions league" in title: return "UCL"
        if "premier-league" in slug or "epl" in slug: return "EPL"
        if "laliga" in slug or "la liga" in title: return "La Liga"
        if "cbb-" in slug or "mustangs" in title or "cardinals" in title or "hawks" in title and "march madness" in title: return "NCAAB"
        if "nfl-" in slug: return "NFL"
        if "nhl-" in slug: return "NHL"
        if "mlb-" in slug: return "MLB"
        if "lol" in slug.lower() or "lol:" in title: return "LoL"
        if "fc " in title or "win on 2026" in title or "cf " in title or "united" in title: return "Football"
        if "spread" in title or "o/u" in title.lower(): return "Sports"
        if "election" in title or "president" in title or "trump" in title: return "Politics"
        if "fed " in title or "rate" in title or "gdp" in title or "cpi" in title: return "Economics"
        if "iran" in title or "israel" in title or "china" in title or "ukraine" in title: return "Geopolitics"
        if "bitcoin" in title or "btc" in title or "ethereum" in title or "eth" in title: return "Crypto"
        return "Other"

    # Build events: group markets by their parent event slug
    from collections import defaultdict
    event_groups = defaultdict(list)

    for m in markets:
        ed = m.end_date
        if not ed:
            continue
        if ed.tzinfo is None:
            ed = ed.replace(tzinfo=timezone.utc)
        if ed < now or ed > cutoff:
            continue

        sport_type = classify(m)
        if sport and sport.lower() != "all" and sport_type.lower() != sport.lower():
            continue

        # Group key: event slug (from URL) or category+date
        url_slug = m.url.split("/event/")[-1] if "/event/" in m.url else ""
        # Strip date suffix for grouping similar events
        group_key = re.sub(r'-\d{4}-\d{2}-\d{2}$', '', url_slug) or f"{m.category}-{ed.strftime('%Y%m%d')}"

        event_groups[group_key].append({
            "id": m.id,
            "title": m.title,
            "current_price": m.current_price,
            "volume_24h": m.volume_24h,
            "liquidity": m.liquidity,
            "url": m.url,
            "end_date": ed.isoformat(),
            "sport": sport_type,
            "category": m.category,
        })

    # Build timeline events
    timeline = []
    for group_key, group_markets in event_groups.items():
        # Use earliest end_date as event time
        sorted_by_time = sorted(group_markets, key=lambda x: x["end_date"])
        event_time = sorted_by_time[0]["end_date"]
        total_volume = sum(x["volume_24h"] for x in group_markets)
        sport_type = group_markets[0]["sport"]

        # Derive a clean event name from the highest-volume market
        primary = max(group_markets, key=lambda x: x["volume_24h"])
        event_name = primary["title"]
        # Clean up: remove "Will X win on..." patterns
        clean = re.sub(r"^Will\s+", "", event_name)
        clean = re.sub(r"\s+win on \d{4}-\d{2}-\d{2}\??$", "", clean)
        if clean == event_name:
            clean = re.sub(r"\?$", "", event_name)

        timeline.append({
            "event_key": group_key,
            "event_name": clean,
            "event_time": event_time,
            "sport": sport_type,
            "total_volume": total_volume,
            "market_count": len(group_markets),
            "markets": sorted(group_markets, key=lambda x: -x["volume_24h"]),
        })

    # Sort by time
    timeline.sort(key=lambda x: x["event_time"])

    # Available sports
    all_sports = set()
    for m in markets:
        s = classify(m)
        if s != "Other":
            all_sports.add(s)

    return {
        "events": timeline,
        "total_events": len(timeline),
        "sports": sorted(all_sports),
    }
