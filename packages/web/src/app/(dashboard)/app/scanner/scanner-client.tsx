'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { MarketInsights, InsightMarket } from '@/lib/api'
import type { Market } from '@pmt/shared'
import { MarketTable } from '@/components/dashboard/MarketTable'
import {
  Flame, Clock, Lock, Scale, TrendingUp, LayoutGrid, Crosshair,
  ChevronRight, ExternalLink, Activity, BarChart3, Timer, Globe
} from 'lucide-react'

/* ─── Types ─── */
type Tab = 'hot' | 'contested' | 'expiring' | 'locked' | 'edge' | 'all'

interface Props {
  insights: MarketInsights | null
  marketsWithEdge: (Market & { fairValue: number; edge: number })[]
}

/* ─── KPI Stat ─── */
function StatCard({ label, value, sub, color, Icon }: {
  label: string; value: string | number; sub?: string; color: string; Icon: any
}) {
  return (
    <div className="glass-card p-3">
      <div className="flex items-center gap-1.5 mb-1.5">
        <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: `${color}12` }}>
          <Icon size={11} strokeWidth={1.8} color={color} />
        </div>
        <span className="text-[8px] font-mono text-[var(--text-muted)] uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xl font-mono font-bold tabular-nums" style={{ color }}>{value}</p>
      {sub && <p className="text-[8px] font-mono text-[var(--text-muted)] mt-0.5">{sub}</p>}
    </div>
  )
}

/* ─── Market Card (compact) ─── */
function MarketCard({ m, accent = '#00E5FF' }: { m: InsightMarket; accent?: string }) {
  const priceColor = m.current_price > 0.7 ? '#00D77E' : m.current_price < 0.3 ? '#FF4B5C' : '#FFD166'
  const daysLeft = m.end_date ? Math.max(0, Math.ceil((new Date(m.end_date).getTime() - Date.now()) / 86400000)) : null

  return (
    <motion.a
      href={m.url || '#'}
      target="_blank"
      rel="noopener"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-3 block hover:bg-white/[0.03] transition-all group cursor-pointer"
      style={{ borderColor: `${accent}08` }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-[11px] text-[var(--text-primary)] leading-snug font-medium group-hover:text-[var(--brand-accent)] transition-colors line-clamp-2 flex-1">
          {m.title}
        </p>
        <ExternalLink size={10} className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-mono font-bold tabular-nums" style={{ color: priceColor }}>
            {(m.current_price * 100).toFixed(1)}¢
          </span>
          <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400">
            {m.source === 'polymarket' ? 'POLY' : m.source.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[8px] font-mono text-[var(--text-muted)]">
          {daysLeft !== null && (
            <span className="flex items-center gap-0.5">
              <Timer size={8} />
              {daysLeft}d
            </span>
          )}
          <span>${(m.volume_24h / 1000).toFixed(0)}K</span>
        </div>
      </div>
      {m.category && (
        <span className="text-[7px] font-mono text-[var(--text-muted)] uppercase tracking-wider mt-1 block">
          {m.category}
        </span>
      )}
    </motion.a>
  )
}

/* ─── Tab Button ─── */
function TabBtn({ active, label, count, Icon, color, onClick }: {
  active: boolean; label: string; count: number; Icon: any; color: string; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${
        active ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
      }`}
      style={active ? { background: `${color}12`, color, border: `1px solid ${color}20` } : { border: '1px solid transparent' }}
    >
      <Icon size={11} strokeWidth={1.8} />
      {label}
      <span className="ml-0.5 opacity-60">{count}</span>
    </button>
  )
}

/* ─── Category Chips ─── */
function CategoryBar({ categories }: { categories: MarketInsights['categories'] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {categories.slice(0, 12).map((c) => (
        <div key={c.name} className="glass-card px-2.5 py-1.5 flex items-center gap-2">
          <span className="text-[9px] font-mono font-bold text-[var(--text-primary)]">{c.name}</span>
          <span className="text-[8px] font-mono text-[var(--text-muted)]">{c.count} mkts</span>
          <span className="text-[8px] font-mono text-[var(--brand-accent)]">${(c.total_volume / 1e6).toFixed(1)}M</span>
        </div>
      ))}
    </div>
  )
}

/* ─── Main Scanner Client ─── */
export function ScannerClient({ insights, marketsWithEdge }: Props) {
  const [tab, setTab] = useState<Tab>('hot')

  // Fallback when no backend
  if (!insights) {
    return (
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <Crosshair size={18} strokeWidth={1.8} className="text-[var(--brand-accent)]" />
            <h1 className="text-lg font-display font-bold tracking-wide">Market Scanner</h1>
          </div>
          <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mt-0.5 ml-[26px]">
            Real-time prediction market monitoring
          </p>
        </div>
        <MarketTable markets={marketsWithEdge} />
      </div>
    )
  }

  const tabs: Array<{ key: Tab; label: string; Icon: any; color: string; data: InsightMarket[] }> = [
    { key: 'hot', label: 'Hot Now', Icon: Flame, color: '#FF4B5C', data: insights.hot },
    { key: 'contested', label: 'Contested', Icon: Scale, color: '#FFD166', data: insights.contested },
    { key: 'edge', label: 'Edge Potential', Icon: TrendingUp, color: '#00D77E', data: insights.edge_potential },
    { key: 'expiring', label: 'Expiring Soon', Icon: Clock, color: '#FF9F43', data: [...insights.expiring_soon, ...insights.expiring_month] },
    { key: 'locked', label: 'Locked In', Icon: Lock, color: '#8B5CF6', data: insights.locked_in },
    { key: 'all', label: 'All Markets', Icon: LayoutGrid, color: '#00E5FF', data: insights.all },
  ]

  const activeTab = tabs.find(t => t.key === tab)!

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Crosshair size={18} strokeWidth={1.8} className="text-[var(--brand-accent)]" />
            <h1 className="text-lg font-display font-bold tracking-wide">Market Scanner</h1>
          </div>
          <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mt-0.5 ml-[26px]">
            Real-time prediction market intelligence · Polymarket
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md"
          style={{ background: 'rgba(0,215,126,0.06)', border: '1px solid rgba(0,215,126,0.1)' }}>
          <Activity size={10} color="#00D77E" />
          <span className="text-[9px] font-mono font-bold text-[var(--color-success)]">LIVE</span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Markets" value={insights.total_markets} sub="monitored" color="#00E5FF" Icon={Globe} />
        <StatCard label="Active / Undecided" value={insights.active_markets} sub="price 5%-95%" color="#00D77E" Icon={Activity} />
        <StatCard label="Contested (25-75%)" value={insights.contested.length} sub="highest edge potential" color="#FFD166" Icon={Scale} />
        <StatCard label="Expiring < 7 Days" value={insights.expiring_soon.length} sub="decision time" color="#FF9F43" Icon={Timer} />
      </div>

      {/* Category Breakdown */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 size={12} strokeWidth={1.8} className="text-[var(--text-muted)]" />
          <span className="text-[9px] font-mono font-bold text-[var(--text-secondary)] uppercase tracking-widest">Categories</span>
        </div>
        <CategoryBar categories={insights.categories} />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5">
        {tabs.map(t => (
          <TabBtn
            key={t.key}
            active={tab === t.key}
            label={t.label}
            count={t.data.length}
            Icon={t.Icon}
            color={t.color}
            onClick={() => setTab(t.key)}
          />
        ))}
      </div>

      {/* Market Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeTab.data.slice(0, 30).map((m) => (
                <MarketCard key={m.id} m={m} accent={activeTab.color} />
              ))}
            </div>
          ) : (
            <div className="glass-card p-8 text-center">
              <p className="text-[var(--text-muted)] text-sm">No markets in this category</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
