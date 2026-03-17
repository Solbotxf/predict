"""Kelly Criterion position sizer."""
from __future__ import annotations
from src.config import KellyConfig


class KellySizer:
    """Calculate optimal position size using Kelly Criterion."""

    def __init__(self, config: KellyConfig | None = None):
        self.config = config or KellyConfig()

    def calculate(self, edge: float, odds: float, confidence: float = 1.0) -> float:
        """
        Calculate position size.

        Args:
            edge: Expected edge (e.g., 0.10 for 10%)
            odds: Market price (probability), used to compute payout odds
            confidence: Confidence multiplier (0-1)

        Returns:
            Position size as fraction of bankroll.
        """
        if edge <= 0 or odds <= 0 or odds >= 1:
            return 0.0

        # For binary markets: odds = price of YES
        # If buying YES: payout = 1/odds - 1 on win, lose stake on loss
        # Kelly: f* = (bp - q) / b where b=payout, p=true_prob, q=1-p
        true_prob = odds + edge
        true_prob = max(0.01, min(0.99, true_prob))

        if edge > 0:  # buying YES
            b = (1 / odds) - 1  # payout ratio
            p = true_prob
        else:  # buying NO
            b = (1 / (1 - odds)) - 1
            p = 1 - true_prob

        q = 1 - p
        kelly_full = (b * p - q) / b if b > 0 else 0
        kelly_full = max(0, kelly_full)

        # Apply fraction (half-kelly) and confidence
        size = kelly_full * self.config.fraction * confidence

        # Cap at max position
        return min(size, self.config.max_position)
