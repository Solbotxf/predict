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
    resolution: 'open', fairValue: m.current_price, edge: 0, url: m.url || '',
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
    const res = await fetch(`${API_URL}/api/signals?limit=10`, { next: { revalidate: 60 } })
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

export interface InsightMarket {
  id: string; source: string; title: string; category: string
  current_price: number; volume_24h: number; liquidity: number
  url: string; end_date: string | null; image: string
}

export interface MarketInsights {
  total_markets: number
  active_markets: number
  hot: InsightMarket[]
  expiring_soon: InsightMarket[]
  expiring_month: InsightMarket[]
  locked_in: InsightMarket[]
  contested: InsightMarket[]
  edge_potential: InsightMarket[]
  categories: Array<{ name: string; count: number; total_volume: number; avg_price: number }>
  all: InsightMarket[]
}

export async function fetchInsights(): Promise<MarketInsights | null> {
  if (!isBackendEnabled()) return null
  try {
    const res = await fetch(`${API_URL}/api/markets/insights`, { next: { revalidate: 60 } })
    if (!res.ok) throw new Error(`API ${res.status}`)
    return await res.json()
  } catch (err) {
    console.error('Insights fetch failed:', err)
    return null
  }
}

export interface TimelineMarket {
  id: string; title: string; current_price: number; volume_24h: number
  liquidity: number; url: string; end_date: string; sport: string; category: string
}

export interface TimelineEvent {
  event_key: string; event_name: string; event_time: string; sport: string
  total_volume: number; market_count: number; markets: TimelineMarket[]
}

export interface TimelineData {
  events: TimelineEvent[]; total_events: number; sports: string[]
}

export async function fetchTimeline(sport?: string, days = 3): Promise<TimelineData | null> {
  if (!isBackendEnabled()) return null
  try {
    const params = new URLSearchParams({ days: String(days) })
    if (sport && sport !== 'All') params.set('sport', sport)
    const res = await fetch(`${API_URL}/api/events/timeline?${params}`, { next: { revalidate: 120 } })
    if (!res.ok) throw new Error(`API ${res.status}`)
    return await res.json()
  } catch (err) {
    console.error('Timeline fetch failed:', err)
    return null
  }
}

// Updated types for ESPN-enriched timeline
export interface TimelineEventV2 {
  news_url?: string; news_category?: string
  event_id: string; event_name: string; home_team: string; away_team: string
  event_time: string; league: string; sport: string; venue: string
  status: string; home_score: number | null; away_score: number | null
  total_volume: number; market_count: number; markets: TimelineMarket[]
}

export interface TimelineDataV2 {
  events: TimelineEventV2[]; total_events: number; total_with_markets: number
  leagues: string[]; sports: string[]
}

export async function fetchTimelineV2(league?: string, days = 3): Promise<TimelineDataV2 | null> {
  if (!isBackendEnabled()) return null
  try {
    const params = new URLSearchParams({ days: String(days) })
    if (league && league !== 'All') params.set('league', league)
    const res = await fetch(`${API_URL}/api/events/timeline?${params}`, { next: { revalidate: 120 } })
    if (!res.ok) throw new Error(`API ${res.status}`)
    return await res.json()
  } catch (err) {
    console.error('Timeline V2 fetch failed:', err)
    return null
  }
}

// --- News Feed ---
export interface NewsArticle {
  title: string; url: string; source: string; category: string
  timestamp: string | null; tone: number | null; country: string | null
  related_markets: { id: string; title: string; current_price: number; volume_24h: number; url: string; relevance: number }[]
}

export interface NewsData {
  news: NewsArticle[]; total: number; categories: string[]
}

export async function fetchNews(opts?: { category?: string; withMarkets?: boolean; limit?: number }): Promise<NewsData | null> {
  if (!isBackendEnabled()) return null
  try {
    const params = new URLSearchParams()
    if (opts?.category && opts.category !== 'all') params.set('category', opts.category)
    if (opts?.withMarkets) params.set('with_markets', 'true')
    if (opts?.limit) params.set('limit', String(opts.limit))
    const res = await fetch(`${API_URL}/api/news?${params}`, { next: { revalidate: 120 } })
    if (!res.ok) throw new Error(`API ${res.status}`)
    return await res.json()
  } catch (err) {
    console.error('News fetch failed:', err)
    return null
  }
}

export interface DataSource {
  name: string; type: string; api_key: boolean; feed_count?: number
}

export async function fetchDataSources(): Promise<Record<string, DataSource> | null> {
  if (!isBackendEnabled()) return null
  try {
    const res = await fetch(`${API_URL}/api/data-sources`, { next: { revalidate: 300 } })
    if (!res.ok) throw new Error(`API ${res.status}`)
    const data = await res.json()
    return data.sources
  } catch {
    return null
  }
}
