"""API routes."""
from __future__ import annotations
from fastapi import APIRouter, Query

router = APIRouter()


@router.get("/health")
async def health():
    return {"status": "ok", "version": "0.1.0"}


@router.get("/markets")
async def list_markets(
    source: str | None = None,
    limit: int = Query(50, le=200),
):
    """Fetch markets — live from collector or cached from store."""
    from src.api.app import collector, store

    # Try live fetch, fallback to cache
    markets = await collector.fetch_markets(limit=limit)
    if markets:
        for m in markets:
            await store.write_market(m)
    else:
        markets = await store.query_markets(source=source, limit=limit)

    return [
        {
            "id": m.id,
            "source": m.source,
            "title": m.title,
            "category": m.category,
            "current_price": m.current_price,
            "volume_24h": m.volume_24h,
            "liquidity": m.liquidity,
            "end_date": m.end_date.isoformat() if m.end_date else None,
            "url": m.url,
        }
        for m in markets
    ]


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


@router.get("/signals")
async def get_signals(limit: int = Query(20, le=100)):
    """Run analysis on top markets and return signals."""
    from src.api.app import collector, engine

    markets = await collector.fetch_markets(limit=limit)
    recommendations = await engine.scan_markets(markets)

    return [rec.to_dict() for rec in recommendations]


@router.get("/signals/{market_id}")
async def get_signal_for_market(market_id: str):
    """Analyze a specific market."""
    from src.api.app import store, engine

    market = await store.get_market(market_id)
    if not market:
        return {"error": "Market not found"}, 404

    rec = await engine.evaluate(market)
    return rec.to_dict() if rec else {"market_id": market_id, "action": "hold", "edge": 0}


@router.get("/stats")
async def platform_stats():
    """Platform-wide statistics."""
    from src.api.app import store
    markets = await store.query_markets(limit=10000)
    return {
        "total_markets": len(markets),
        "sources": list(set(m.source for m in markets)),
        "avg_volume": sum(m.volume_24h for m in markets) / len(markets) if markets else 0,
        "total_volume": sum(m.volume_24h for m in markets),
    }
