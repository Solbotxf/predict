"""Simple backtester — sequential event replay."""
from __future__ import annotations
import logging
from datetime import datetime
from dataclasses import dataclass

from src.models import Market, Signal, BacktestResult, BacktestTrade, Direction
from src.analyzers.base import BaseAnalyzer
from src.analyzers.kelly import KellySizer

logger = logging.getLogger(__name__)


@dataclass
class HistoricalMarket:
    """A market snapshot with known resolution."""
    market: Market
    resolved_price: float   # 1.0 if YES resolved, 0.0 if NO
    resolution_date: datetime


class SimpleBacktester:
    """Replays historical markets through an analyzer and computes performance."""

    def __init__(self, analyzer: BaseAnalyzer, kelly: KellySizer, initial_bankroll: float = 10000):
        self.analyzer = analyzer
        self.kelly = kelly
        self.initial_bankroll = initial_bankroll

    async def run(self, historical: list[HistoricalMarket]) -> BacktestResult:
        bankroll = self.initial_bankroll
        peak = bankroll
        max_drawdown = 0.0
        trades: list[BacktestTrade] = []
        returns: list[float] = []

        for hm in historical:
            signal = await self.analyzer.analyze(hm.market)
            if not signal:
                continue

            edge = signal.metadata.get("edge", 0)
            if abs(edge) < 0.02:
                continue

            # Calculate position
            position_size = self.kelly.calculate(
                edge=abs(edge), odds=hm.market.current_price, confidence=signal.confidence
            )
            if position_size <= 0:
                continue

            stake = bankroll * position_size
            entry_price = hm.market.current_price

            # Resolve trade
            if signal.direction == Direction.BUY_YES:
                pnl = stake * ((hm.resolved_price / entry_price) - 1)
                exit_price = hm.resolved_price
            else:
                # Buying NO = betting against YES
                no_price = 1 - entry_price
                no_resolved = 1 - hm.resolved_price
                pnl = stake * ((no_resolved / no_price) - 1)
                exit_price = 1 - hm.resolved_price

            bankroll += pnl
            peak = max(peak, bankroll)
            drawdown = (peak - bankroll) / peak if peak > 0 else 0
            max_drawdown = max(max_drawdown, drawdown)
            returns.append(pnl / stake if stake > 0 else 0)

            trades.append(BacktestTrade(
                market_id=hm.market.id,
                entry_price=entry_price,
                exit_price=exit_price,
                direction=signal.direction,
                position_size=position_size,
                pnl=pnl,
                entry_time=signal.timestamp,
                exit_time=hm.resolution_date,
            ))

        wins = sum(1 for t in trades if t.pnl > 0)
        losses = len(trades) - wins
        total_pnl = bankroll - self.initial_bankroll

        # Sharpe (simplified)
        if returns:
            import statistics
            mean_r = statistics.mean(returns)
            std_r = statistics.stdev(returns) if len(returns) > 1 else 1
            sharpe = (mean_r / std_r) * (252 ** 0.5) if std_r > 0 else 0
        else:
            sharpe = 0

        return BacktestResult(
            total_trades=len(trades),
            wins=wins,
            losses=losses,
            win_rate=wins / len(trades) if trades else 0,
            total_pnl=total_pnl,
            max_drawdown=max_drawdown,
            sharpe_ratio=sharpe,
            trades=trades,
        )
