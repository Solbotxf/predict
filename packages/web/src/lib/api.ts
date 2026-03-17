/**
 * API client — fetches from backend when NEXT_PUBLIC_API_URL is set,
 * otherwise falls back to mock data.
 */
import type { Market, Signal } from '@pmt/shared'
import { mockMarkets, getMarketWithEdge } from './mock-data/markets'
import { mockSignals } from './mock-data/signals'

const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

function isBackendEnabled(): boolean {
  return API_URL.length > 0
}

interface BackendMarket {
  id: string; source: string; title: string; category: string
  current_price: number; volume_24h: number; liquidity: number
  end_date: string | null; url: string
}

interface BackendSignal {
  market_id: string; market_title: string; action: string
  confidence: number; position_size: number; edge: number
  signals: Array<{
    analyzer: string; market_id: string; timestamp: string
    signal_type: string; confidence: number; direction: string
    metadata: Record<string, unknown>
  }>
  reasoning: string; timestamp: string
}

function transformMarket(m: BackendMarket): Market & { fairValue: number; edge: number } {
  return {
    id: m.id, title: m.title, description: '', source: m.source as Market['source'],
    category: m.category, currentPrice: m.current_price, previousPrice: m.current_price,
    volume24h: m.volume_24h, liquidity: m.liquidity, endDate: m.end_date || '',
    resolution: 'open', fairValue: m.current_price, edge: 0,
  }
}

function transformSignal(s: BackendSignal, idx: number): Signal {
  const inner = s.signals?.[0]
  return {
    id: `sig-${idx}`, analyzer: inner?.analyzer || 'llm_prob',
    marketId: s.market_id, marketTitle: s.market_title, timestamp: s.timestamp,
    signalType: (inner?.signal_type || 'edge') as Signal['signalType'],
    confidence: s.confidence, direction: s.action as Signal['direction'],
    metadata: {
      fairValue: inner?.metadata?.fair_value as number | undefined,
      edgePct: s.edge * 100,
      currentPrice: inner?.metadata?.market_price as number | undefined,
      reasoning: s.reasoning,
    },
  }
}

export async function fetchMarkets(limit = 50): Promise<(Market & { fairValue: number; edge: number })[]> {
  if (!isBackendEnabled()) return mockMarkets.map(getMarketWithEdge)
  try {
    const res = await fetch(`${API_URL}/api/markets?limit=${limit}`, { next: { revalidate: 30 } })
    if (!res.ok) throw new Error(`API ${res.status}`)
    return (await res.json() as BackendMarket[]).map(transformMarket)
  } catch (err) {
    console.error('Backend fetch failed, using mock:', err)
    return mockMarkets.map(getMarketWithEdge)
  }
}

export async function fetchSignals(limit = 20): Promise<Signal[]> {
  if (!isBackendEnabled()) return mockSignals
  try {
    const res = await fetch(`${API_URL}/api/signals?limit=${limit}`, { next: { revalidate: 60 } })
    if (!res.ok) throw new Error(`API ${res.status}`)
    return (await res.json() as BackendSignal[]).map(transformSignal)
  } catch (err) {
    console.error('Signals fetch failed, using mock:', err)
    return mockSignals
  }
}

export async function fetchMarketsWithSignals(limit = 50): Promise<(Market & { fairValue: number; edge: number })[]> {
  if (!isBackendEnabled()) return mockMarkets.map(getMarketWithEdge)
  try {
    const [mRes, sRes] = await Promise.all([
      fetch(`${API_URL}/api/markets?limit=${limit}`, { next: { revalidate: 30 } }),
      fetch(`${API_URL}/api/signals?limit=${limit}`, { next: { revalidate: 60 } }).catch(() => null),
    ])
    if (!mRes.ok) throw new Error(`API ${mRes.status}`)
    const markets = (await mRes.json() as BackendMarket[]).map(transformMarket)
    if (sRes?.ok) {
      const signals: BackendSignal[] = await sRes.json()
      const sigMap = new Map(signals.map(s => [s.market_id, s]))
      for (const m of markets) {
        const sig = sigMap.get(m.id)
        if (sig) {
          m.edge = sig.edge * 100
          const inner = sig.signals?.[0]
          if (inner?.metadata?.fair_value != null) m.fairValue = inner.metadata.fair_value as number
        }
      }
    }
    return markets
  } catch (err) {
    console.error('Backend fetch failed, using mock:', err)
    return mockMarkets.map(getMarketWithEdge)
  }
}
