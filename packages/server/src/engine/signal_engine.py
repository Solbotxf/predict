"""Signal Engine — aggregates analyzer outputs into trading recommendations."""
from __future__ import annotations
import logging
from datetime import datetime

from src.models import Market, Signal, TradingRecommendation, Direction
from src.analyzers.base import BaseAnalyzer
from src.analyzers.kelly import KellySizer
from src.config import EngineConfig

logger = logging.getLogger(__name__)


class SignalEngine:
    def __init__(self, analyzers: list[BaseAnalyzer], kelly: KellySizer, config: EngineConfig | None = None):
        self.analyzers = analyzers
        self.kelly = kelly
        self.config = config or EngineConfig()

    async def evaluate(self, market: Market) -> TradingRecommendation | None:
        """Run all analyzers on a market and produce a recommendation."""
        signals: list[Signal] = []

        for analyzer in self.analyzers:
            try:
                sig = await analyzer.analyze(market)
                if sig:
                    signals.append(sig)
            except Exception as e:
                logger.error(f"Analyzer {analyzer.name()} failed: {e}")

        if not signals:
            return None

        # Weighted aggregation
        total_weight = 0
        weighted_edge = 0
        weighted_conf = 0
        direction_votes: dict[Direction, float] = {}

        for sig in signals:
            w = self.config.weights.get(sig.analyzer, 0.1)
            edge = sig.metadata.get("edge", 0)
            weighted_edge += edge * w
            weighted_conf += sig.confidence * w
            total_weight += w
            direction_votes[sig.direction] = direction_votes.get(sig.direction, 0) + w

        if total_weight == 0:
            return None

        avg_edge = weighted_edge / total_weight
        avg_conf = weighted_conf / total_weight
        best_direction = max(direction_votes, key=direction_votes.get)  # type: ignore

        # Filter
        if avg_conf < self.config.min_confidence or abs(avg_edge) < self.config.min_edge:
            return None

        # Position sizing
        position_size = self.kelly.calculate(
            edge=abs(avg_edge), odds=market.current_price, confidence=avg_conf
        )

        # Build reasoning
        reasoning_parts = []
        for sig in signals:
            r = sig.metadata.get("reasoning", "")
            if r:
                reasoning_parts.append(f"[{sig.analyzer}] {r}")

        return TradingRecommendation(
            market_id=market.id,
            market_title=market.title,
            action=best_direction,
            confidence=avg_conf,
            position_size=position_size,
            edge=avg_edge,
            signals=signals,
            reasoning=" | ".join(reasoning_parts),
            timestamp=datetime.utcnow(),
        )

    async def scan_markets(self, markets: list[Market]) -> list[TradingRecommendation]:
        """Evaluate all markets, return actionable recommendations."""
        recs = []
        for market in markets:
            rec = await self.evaluate(market)
            if rec:
                recs.append(rec)
        recs.sort(key=lambda r: abs(r.edge), reverse=True)
        return recs
