'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { KPICard } from '@/components/dashboard/KPICard'
import { mockMarkets, getMarketWithEdge } from '@/lib/mock-data/markets'
import { mockSignals } from '@/lib/mock-data/signals'
import Link from 'next/link'

function PipelineStatus() {
  const stages = [
    { id: 'collect', label: 'COLLECT', icon: '📥', status: 'active', throughput: 1247, color: '#00E5FF' },
    { id: 'process', label: 'PROCESS', icon: '⚙️', status: 'active', throughput: 1198, color: '#8B5CF6' },
    { id: 'analyze', label: 'ANALYZE', icon: '🧠', status: 'active', throughput: 892, color: '#A78BFA' },
    { id: 'signal', label: 'SIGNAL', icon: '🎯', status: 'active', throughput: 47, color: '#00D77E' },
    { id: 'execute', label: 'EXECUTE', icon: '🤖', status: 'idle', throughput: 12, color: '#FFD166' },
  ]

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-mono font-bold text-[var(--text-primary)] uppercase tracking-wider">Pipeline Overview</h2>
          <span className="badge-live text-[9px]"><span className="pulse-dot" style={{ width: 5, height: 5 }} /> LIVE</span>
        </div>
        <span className="text-[10px] font-mono text-[var(--text-muted)]">LATENCY: <span className="text-[var(--color-success)]">142ms</span></span>
      </div>

      <div className="flex items-center gap-2">
        {stages.map((stage, i) => (
          <div key={stage.id} className="flex items-center gap-2 flex-1">
            <Link
              href={stage.id === 'collect' ? '/app/scanner' : stage.id === 'signal' ? '/app/signals' : '/app'}
              className="flex-1 p-3 rounded-md transition-all hover:scale-[1.02] cursor-pointer"
              style={{
                background: `${stage.color}08`,
                border: `1px solid ${stage.color}20`,
              }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-sm">{stage.icon}</span>
                <span className="text-[9px] font-mono font-bold tracking-wider" style={{ color: stage.color }}>{stage.label}</span>
              </div>
              <p className="text-base font-mono font-bold text-[var(--text-primary)]">{stage.throughput.toLocaleString()}</p>
              <p className="text-[9px] font-mono text-[var(--text-muted)]">events/min</p>
              {/* Mini load bar */}
              <div className="mt-1.5 h-0.5 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: stage.color }}
                  animate={{ width: [`${stage.throughput / 15}%`, `${stage.throughput / 12}%`, `${stage.throughput / 15}%`] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </Link>
            {i < stages.length - 1 && (
              <motion.span
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                className="text-[var(--text-muted)] text-xs font-mono"
              >→</motion.span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function LiveSignalFeed() {
  const [signals, setSignals] = useState(mockSignals.slice(0, 4))

  return (
    <div className="glass-card p-4 h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider">Signal Feed</h2>
          <span className="badge-live text-[9px]"><span className="pulse-dot" style={{ width: 5, height: 5 }} /> LIVE</span>
        </div>
        <Link href="/app/signals" className="text-[10px] font-mono text-[var(--brand-accent)] hover:underline">VIEW ALL →</Link>
      </div>

      <div className="space-y-2">
        {signals.map((sig, i) => {
          const timeAgo = Math.floor((Date.now() - new Date(sig.timestamp).getTime()) / 60000)
          const isPositive = sig.direction === 'buy_yes'
          return (
            <motion.div
              key={sig.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-3 rounded-md transition-all hover:bg-white/[0.02]"
              style={{
                borderLeft: `2px solid ${isPositive ? 'var(--color-success)' : 'var(--color-danger)'}`,
                background: isPositive ? 'rgba(0, 215, 126, 0.03)' : 'rgba(255, 75, 92, 0.03)',
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider"
                      style={{ color: sig.analyzer === 'llm_prob' ? '#8B5CF6' : sig.analyzer === 'arb' ? '#FFD166' : '#00E5FF' }}>
                      {sig.analyzer === 'llm_prob' ? '🧠 AI EDGE' : sig.analyzer === 'arb' ? '⚡ ARB' : '📊 SENTIMENT'}
                    </span>
                    <span className="text-[9px] font-mono text-[var(--text-muted)]">{timeAgo}m ago</span>
                  </div>
                  <p className="text-sm text-[var(--text-primary)]">{sig.marketTitle}</p>
                </div>
                <span className={`text-sm font-mono font-bold ${isPositive ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
                  {isPositive ? '▲' : '▼'} {Math.abs(sig.metadata.edgePct as number).toFixed(1)}%
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function TopEdgeMarkets() {
  const marketsWithEdge = mockMarkets.map(getMarketWithEdge)
    .sort((a, b) => Math.abs(b.edge) - Math.abs(a.edge))
    .slice(0, 5)

  return (
    <div className="glass-card p-4 h-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider">Top Edge</h2>
        <Link href="/app/scanner" className="text-[10px] font-mono text-[var(--brand-accent)] hover:underline">SCANNER →</Link>
      </div>

      <div className="space-y-2">
        {marketsWithEdge.map((m, i) => (
          <div key={m.id} className="flex items-center justify-between p-2.5 rounded-md hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-[var(--text-muted)] w-4">{i + 1}</span>
              <div>
                <p className="text-sm text-[var(--text-primary)]">{m.title.substring(0, 30)}...</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${m.source === 'polymarket' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                    {m.source === 'polymarket' ? 'POLY' : 'KALSHI'}
                  </span>
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">{m.category}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-mono font-bold">{(m.currentPrice * 100).toFixed(1)}¢</p>
              <p className={`text-[10px] font-mono ${m.edge > 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
                {m.edge > 0 ? '▲' : '▼'} {Math.abs(m.edge).toFixed(1)}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DashboardOverview() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-display font-bold tracking-wide">COMMAND CENTER</h1>
          <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mt-0.5">
            Real-time prediction market intelligence · Last update: <span className="text-[var(--color-success)]">2s ago</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {['1H', '6H', '24H', '7D'].map((t) => (
            <span key={t} className={`chip ${t === '24H' ? 'chip-active' : ''}`}>{t}</span>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard title="ACTIVE MARKETS" value="1,247" change={3.2} />
        <KPICard title="LIVE SIGNALS" value={mockSignals.length.toString()} change={8.3} />
        <KPICard title="AVG EDGE" value="6.2%" change={1.4} />
        <KPICard title="WIN RATE" value="68.3%" change={3.1} />
      </div>

      {/* Pipeline Status */}
      <PipelineStatus />

      {/* Bottom grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LiveSignalFeed />
        <TopEdgeMarkets />
      </div>
    </div>
  )
}
