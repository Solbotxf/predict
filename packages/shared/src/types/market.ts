export type MarketSource = 'polymarket' | 'kalshi' | 'metaculus'
export type EventType = 'price' | 'trade' | 'orderbook' | 'news' | 'transfer'
export type SignalDirection = 'buy_yes' | 'buy_no' | 'hold' | 'exit'
export type SignalType = 'edge' | 'arb_opportunity' | 'sentiment_shift' | 'whale_move'

export interface MarketEvent {
  source: MarketSource
  eventType: EventType
  marketId: string
  timestamp: string
  payload: Record<string, unknown>
}

export interface Market {
  id: string
  title: string
  description: string
  source: MarketSource
  category: string
  currentPrice: number     // 0-1 probability
  previousPrice: number
  volume24h: number
  liquidity: number
  endDate: string
  resolution: 'open' | 'yes' | 'no'
}

export interface Signal {
  id: string
  analyzer: string
  marketId: string
  marketTitle: string
  timestamp: string
  signalType: SignalType
  confidence: number       // 0-1
  direction: SignalDirection
  metadata: {
    fairValue?: number
    edgePct?: number
    currentPrice?: number
    reasoning?: string
    [key: string]: unknown
  }
}

export interface TradingRecommendation {
  marketId: string
  marketTitle: string
  action: SignalDirection
  confidence: number
  positionSize: number
  edge: number
  signals: Signal[]
  reasoning: string
}

export interface Position {
  marketId: string
  marketTitle: string
  source: MarketSource
  side: 'yes' | 'no'
  shares: number
  avgPrice: number
  currentPrice: number
  pnl: number
  pnlPercent: number
}

export interface PortfolioSummary {
  totalValue: number
  totalPnl: number
  totalPnlPercent: number
  positions: Position[]
  openPositions: number
}

export interface ArbitrageOpportunity {
  eventTitle: string
  marketA: { source: MarketSource; price: number; marketId: string }
  marketB: { source: MarketSource; price: number; marketId: string }
  spread: number
  estimatedPnl: number
  confidence: number
}
