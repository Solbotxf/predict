"""Shared data models for the prediction market tools pipeline."""
from __future__ import annotations
from dataclasses import dataclass, field, asdict
from datetime import datetime
from enum import Enum
from typing import Any
import json


class EventType(str, Enum):
    PRICE = "price"
    TRADE = "trade"
    ORDERBOOK = "orderbook"
    NEWS = "news"
    SOCIAL = "social"
    TRANSFER = "transfer"


class Direction(str, Enum):
    BUY_YES = "buy_yes"
    BUY_NO = "buy_no"
    HOLD = "hold"
    EXIT = "exit"


@dataclass
class MarketEvent:
    """Universal event from any data source."""
    source: str
    event_type: EventType
    market_id: str
    timestamp: datetime
    payload: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict:
        d = asdict(self)
        d["timestamp"] = self.timestamp.isoformat()
        d["event_type"] = self.event_type.value
        return d

    def to_json(self) -> str:
        return json.dumps(self.to_dict())

    @classmethod
    def from_dict(cls, d: dict) -> MarketEvent:
        d["timestamp"] = datetime.fromisoformat(d["timestamp"])
        d["event_type"] = EventType(d["event_type"])
        return cls(**d)


@dataclass
class Market:
    """A prediction market on any platform."""
    id: str
    source: str
    title: str
    description: str
    category: str
    current_price: float          # 0-1 (YES price)
    volume_24h: float
    liquidity: float
    end_date: datetime | None = None
    url: str = ""
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class Signal:
    """Output from an individual analyzer."""
    analyzer: str
    market_id: str
    timestamp: datetime
    signal_type: str              # "edge", "arb_opportunity", "sentiment_shift"
    confidence: float             # 0-1
    direction: Direction
    metadata: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict:
        d = asdict(self)
        d["timestamp"] = self.timestamp.isoformat()
        d["direction"] = self.direction.value
        return d


@dataclass
class TradingRecommendation:
    """Final recommendation from the signal engine."""
    market_id: str
    market_title: str
    action: Direction
    confidence: float
    position_size: float          # fraction of bankroll
    edge: float                   # expected edge %
    signals: list[Signal] = field(default_factory=list)
    reasoning: str = ""
    timestamp: datetime = field(default_factory=datetime.utcnow)

    def to_dict(self) -> dict:
        d = asdict(self)
        d["timestamp"] = self.timestamp.isoformat()
        d["action"] = self.action.value
        d["signals"] = [s.to_dict() for s in self.signals]
        return d


@dataclass
class BacktestTrade:
    market_id: str
    entry_price: float
    exit_price: float
    direction: Direction
    position_size: float
    pnl: float
    entry_time: datetime
    exit_time: datetime


@dataclass
class BacktestResult:
    total_trades: int
    wins: int
    losses: int
    win_rate: float
    total_pnl: float
    max_drawdown: float
    sharpe_ratio: float
    trades: list[BacktestTrade] = field(default_factory=list)
