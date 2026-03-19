"""Seed: ESPN sports fixtures (free, no key)."""
import asyncio
import logging
from datetime import timedelta
from _utils import get_http_client, get_store, now_utc

logger = logging.getLogger("seed.espn")

ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports"

LEAGUES = [
    ("basketball", "nba"), ("basketball", "wnba"),
    ("hockey", "nhl"), ("baseball", "mlb"),
    ("football", "nfl"),
    ("soccer", "eng.1"), ("soccer", "esp.1"), ("soccer", "ger.1"),
    ("soccer", "ita.1"), ("soccer", "fra.1"), ("soccer", "usa.1"),
    ("soccer", "mex.1"), ("soccer", "bra.1"),
    ("soccer", "uefa.champions"), ("soccer", "uefa.europa"),
]


async def fetch_league(client, sport, league, dates_str):
    url = f"{ESPN_BASE}/{sport}/{league}/scoreboard"
    try:
        r = await client.get(url, params={"dates": dates_str})
        r.raise_for_status()
        return r.json().get("events", [])
    except Exception as e:
        logger.warning(f"  [{sport}/{league}] {e}")
        return []


async def run():
    from src.models import MarketEvent, EventType

    store = await get_store()
    client = get_http_client()
    now = now_utc()

    # Fetch 7-day window
    dates = [(now + timedelta(days=i)).strftime("%Y%m%d") for i in range(7)]
    dates_str = "-".join([dates[0], dates[-1]])

    total = 0
    async with client:
        for sport, league in LEAGUES:
            events = await fetch_league(client, sport, league, dates_str)
            for ev in events:
                comps = ev.get("competitions", [{}])
                comp = comps[0] if comps else {}
                teams = comp.get("competitors", [])
                home = next((t for t in teams if t.get("homeAway") == "home"), {})
                away = next((t for t in teams if t.get("homeAway") == "away"), {})

                await store.write_event(MarketEvent(
                    source="espn", event_type=EventType.NEWS,
                    market_id=f"espn-{ev.get('id', '')}",
                    timestamp=now,
                    payload={
                        "sport": sport,
                        "league": league,
                        "name": ev.get("name", ""),
                        "start_time": ev.get("date", ""),
                        "status": ev.get("status", {}).get("type", {}).get("name", ""),
                        "home_team": home.get("team", {}).get("displayName", ""),
                        "away_team": away.get("team", {}).get("displayName", ""),
                        "home_score": home.get("score", ""),
                        "away_score": away.get("score", ""),
                        "venue": comp.get("venue", {}).get("fullName", ""),
                    },
                ))
                total += 1
            await asyncio.sleep(0.2)

    logger.info(f"✅ ESPN: {total} fixtures across {len(LEAGUES)} leagues")
    await store.close()


if __name__ == "__main__":
    asyncio.run(run())
