"""ESPN Sports API collector — free, no API key required.

Provides precise fixture times for all major sports leagues.
Used to enrich Polymarket event timeline with accurate kickoff/tipoff times.
"""
from __future__ import annotations
import logging
from datetime import datetime, timedelta, timezone
from dataclasses import dataclass

import httpx

logger = logging.getLogger(__name__)

BASE = "https://site.api.espn.com/apis/site/v2/sports"

# All supported leagues with ESPN sport/league paths
LEAGUES = {
    # Basketball
    "NBA":       {"path": "basketball/nba",                        "sport": "Basketball"},
    "NCAAB":     {"path": "basketball/mens-college-basketball",    "sport": "Basketball"},
    "WNBA":      {"path": "basketball/wnba",                      "sport": "Basketball"},
    # Football (American)
    "NFL":       {"path": "football/nfl",                          "sport": "American Football"},
    "NCAAF":     {"path": "football/college-football",             "sport": "American Football"},
    # Hockey
    "NHL":       {"path": "hockey/nhl",                            "sport": "Hockey"},
    # Baseball
    "MLB":       {"path": "baseball/mlb",                          "sport": "Baseball"},
    # Soccer — Major leagues
    "EPL":       {"path": "soccer/eng.1",                          "sport": "Soccer"},
    "La Liga":   {"path": "soccer/esp.1",                          "sport": "Soccer"},
    "Serie A":   {"path": "soccer/ita.1",                          "sport": "Soccer"},
    "Bundesliga":{"path": "soccer/ger.1",                          "sport": "Soccer"},
    "Ligue 1":   {"path": "soccer/fra.1",                          "sport": "Soccer"},
    "UCL":       {"path": "soccer/uefa.champions",                 "sport": "Soccer"},
    "Europa":    {"path": "soccer/uefa.europa",                    "sport": "Soccer"},
    "MLS":       {"path": "soccer/usa.1",                          "sport": "Soccer"},
    "Liga MX":   {"path": "soccer/mex.1",                          "sport": "Soccer"},
    "Brasileirão":{"path": "soccer/bra.1",                         "sport": "Soccer"},
    # Cricket, Rugby, etc. can be added
}


@dataclass
class Fixture:
    """A scheduled sports event with precise time."""
    league: str
    sport_type: str
    home_team: str
    away_team: str
    start_time: datetime      # Precise kickoff/tipoff in UTC
    venue: str
    status: str               # "pre", "in", "post"
    home_score: int | None
    away_score: int | None
    event_id: str             # ESPN event ID
    headline: str             # e.g. "Lakers vs Heat"
    # For matching with Polymarket
    team_keywords: list[str]  # lowercased team name fragments


class ESPNCollector:
    """Fetches fixtures from ESPN's free public API."""

    def __init__(self):
        self._client: httpx.AsyncClient | None = None

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(timeout=15.0)
        return self._client

    async def close(self):
        if self._client and not self._client.is_closed:
            await self._client.aclose()

    async def fetch_fixtures(
        self,
        leagues: list[str] | None = None,
        days: int = 3,
    ) -> list[Fixture]:
        """Fetch upcoming fixtures for specified leagues (or all)."""
        target_leagues = leagues or list(LEAGUES.keys())
        now = datetime.now(timezone.utc)
        end = now + timedelta(days=days)

        # Date range string for ESPN
        date_range = f"{now.strftime('%Y%m%d')}-{end.strftime('%Y%m%d')}"

        client = await self._get_client()
        all_fixtures: list[Fixture] = []

        for league in target_leagues:
            cfg = LEAGUES.get(league)
            if not cfg:
                continue

            try:
                url = f"{BASE}/{cfg['path']}/scoreboard?dates={date_range}"
                resp = await client.get(url)
                resp.raise_for_status()
                data = resp.json()

                for event in data.get("events", []):
                    fixture = self._parse_event(event, league, cfg["sport"])
                    if fixture:
                        all_fixtures.append(fixture)

            except Exception as e:
                logger.warning(f"ESPN fetch failed for {league}: {e}")
                continue

        all_fixtures.sort(key=lambda f: f.start_time)
        logger.info(f"Fetched {len(all_fixtures)} fixtures from ESPN ({len(target_leagues)} leagues)")
        return all_fixtures

    def _parse_event(self, event: dict, league: str, sport_type: str) -> Fixture | None:
        try:
            competitions = event.get("competitions", [])
            if not competitions:
                return None

            comp = competitions[0]
            competitors = comp.get("competitors", [])
            if len(competitors) < 2:
                return None

            # ESPN: competitors[0] is usually home
            home = competitors[0]
            away = competitors[1]
            # Check homeAway field
            if away.get("homeAway") == "home":
                home, away = away, home

            home_team_name = home.get("team", {}).get("displayName", "")
            away_team_name = away.get("team", {}).get("displayName", "")
            home_short = home.get("team", {}).get("shortDisplayName", home_team_name)
            away_short = away.get("team", {}).get("shortDisplayName", away_team_name)

            # Parse time
            date_str = event.get("date", "")
            start_time = datetime.fromisoformat(date_str.replace("Z", "+00:00"))

            # Status
            status_type = comp.get("status", {}).get("type", {}).get("state", "pre")

            # Scores
            home_score = None
            away_score = None
            if status_type in ("in", "post"):
                home_score = int(home.get("score", 0))
                away_score = int(away.get("score", 0))

            # Venue
            venue_info = comp.get("venue", {})
            venue = venue_info.get("fullName", "")

            # Team keywords for matching with Polymarket
            keywords = []
            for team in [home_team_name, away_team_name, home_short, away_short]:
                for word in team.lower().split():
                    if len(word) > 2 and word not in ("fc", "cf", "sc", "the", "vs", "and", "de"):
                        keywords.append(word)
            # Add abbreviations
            for c in competitors:
                abbrev = c.get("team", {}).get("abbreviation", "")
                if abbrev:
                    keywords.append(abbrev.lower())

            headline = event.get("shortName", f"{away_short} @ {home_short}")

            return Fixture(
                league=league,
                sport_type=sport_type,
                home_team=home_team_name,
                away_team=away_team_name,
                start_time=start_time,
                venue=venue,
                status=status_type,
                home_score=home_score,
                away_score=away_score,
                event_id=event.get("id", ""),
                headline=headline,
                team_keywords=list(set(keywords)),
            )

        except Exception as e:
            logger.warning(f"Failed to parse ESPN event: {e}")
            return None

    @staticmethod
    def match_fixture_to_market(fixture: Fixture, market_title: str) -> float:
        """Score how well a fixture matches a Polymarket market title.

        Returns a score 0-1. Higher = better match.
        Uses full team names for more precise matching.
        """
        title_lower = market_title.lower()

        # Best: full team name appears in market title
        for team in [fixture.home_team, fixture.away_team]:
            team_lower = team.lower()
            if team_lower in title_lower:
                return 1.0
            # Try without common suffixes
            for suffix in [" fc", " cf", " sc", " afc"]:
                clean = team_lower.replace(suffix, "").strip()
                if len(clean) > 4 and clean in title_lower:
                    return 0.9

        # Try short names (at least 5 chars to avoid false matches)
        long_keywords = [kw for kw in fixture.team_keywords if len(kw) >= 5]
        matches = sum(1 for kw in long_keywords if kw in title_lower)
        if matches >= 2:
            return 0.8
        if matches == 1:
            # Single keyword match — require it to be substantial
            for kw in long_keywords:
                if kw in title_lower and len(kw) >= 6:
                    return 0.6
            return 0.0  # Too risky for short single matches

        return 0.0
