'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { mockMarkets, getMarketWithEdge } from '@/lib/mock-data/markets'
import { mockSignals } from '@/lib/mock-data/signals'
import Link from 'next/link'
import {
  Activity, Gauge, TrendingUp, Signal, Database,
  Cpu, Brain, Crosshair, Bot, ChevronRight,
  ArrowUpRight, ArrowDownRight, Clock, Zap
} from 'lucide-react'

/* ─── Pipeline mini-visualization (horizontal strip) ─── */
function PipelineStrip() {
  const stages = [
    { id: 'collect', label: 'COLLECT', Icon: Database, throughput: 1247, color: '#00E5FF', href: '/app/scanner' },
    { id: 'process', label: 'PROCESS', Icon: Cpu, throughput: 1198, color: '#8B5CF6', href: '/app' },
    { id: 'analyze', label: 'ANALYZE', Icon: Brain, throughput: 892, color: '#A78BFA', href: '/app' },
    { id: 'signal', label: 'SIGNAL', Icon: Crosshair, throughput: 47, color: '#00D77E', href: '/app/signals' },
    { id: 'execute', label: 'EXECUTE', Icon: Bot, throughput: 12, color: '#FFD166', href: '/app' },
  ]

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity size={14} strokeWidth={2} className="text-[var(--brand-accent)]" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--text-primary)]">Pipeline Status</span>
          <span className="badge-live text-[8px]"><span className="pulse-dot" style={{ width: 4, height: 4 }} /> LIVE</span>
        </div>
        <div className="flex items-center gap-3 text-[9px] font-mono text-[var(--text-muted)]">
          <span>LATENCY: <span className="text-[var(--color-success)] font-bold">142ms</span></span>
          <span>UPTIME: <span className="text-[var(--color-success)] font-bold">99.9%</span></span>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {stages.map((stage, i) => (
          <div key={stage.id} className="flex items-center gap-1.5 flex-1">
            <Link href={stage.href} className="flex-1 p-3 rounded-lg transition-all hover:scale-[1.02] group"
              style={{ background: `${stage.color}06`, border: `1px solid ${stage.color}12` }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center"
                    style={{ background: `${stage.color}12` }}>
                    <stage.Icon size={13} strokeWidth={1.8} color={stage.color} />
                  </div>
                  <span className="text-[8px] font-mono font-bold tracking-widest" style={{ color: stage.color }}>{stage.label}</span>
                </div>
                <ChevronRight size={10} className="opacity-0 group-hover:opacity-50 transition-opacity" color={stage.color} />
              </div>
              <p className="text-lg font-mono font-bold text-[var(--text-primary)] tabular-nums">{stage.throughput.toLocaleString()}</p>
              <p className="text-[8px] font-mono text-[var(--text-muted)]">events/min</p>
              <div className="mt-2 h-[3px] rounded-full bg-white/5 overflow-hidden">
                <motion.div className="h-full rounded-full relative overflow-hidden"
                  style={{ background: `linear-gradient(90deg, ${stage.color}80, ${stage.color})` }}
                  animate={{ width: [`${60 + Math.random() * 30}%`, `${70 + Math.random() * 25}%`] }}
                  transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
                >
                  <motion.div className="absolute inset-0"
                    style={{ background: `linear-gradient(90deg, transparent, ${stage.color}40, transparent)` }}
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  />
                </motion.div>
              </div>
            </Link>
            {i < stages.length - 1 && (
              <motion.div
                animate={{ opacity: [0.2, 0.7, 0.2] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
              >
                <ChevronRight size={12} className="text-[var(--text-muted)]" />
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── KPI Card with icon ─── */
function KPITile({ label, value, change, Icon, color }: {
  label: string; value: string; change: number; Icon: any; color: string
}) {
  const isUp = change >= 0
  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${color}10`, border: `1px solid ${color}15` }}>
          <Icon size={16} strokeWidth={1.8} color={color} />
        </div>
        <div className={`flex items-center gap-0.5 text-[10px] font-mono font-bold ${isUp ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
          {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {Math.abs(change).toFixed(1)}%
        </div>
      </div>
      <p className="text-2xl font-mono font-bold tabular-nums">{value}</p>
      <p className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-wider mt-1">{label}</p>
    </div>
  )
}

/* ─── Signal feed ─── */
function SignalFeed() {
  return (
    <div className="glass-card p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Signal size={14} strokeWidth={2} className="text-[var(--brand-primary)]" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Latest Signals</span>
          <span className="badge-live text-[8px]"><span className="pulse-dot" style={{ width: 4, height: 4 }} /> LIVE</span>
        </div>
        <Link href="/app/signals" className="flex items-center gap-1 text-[10px] font-mono text-[var(--brand-accent)] hover:underline">
          ALL <ChevronRight size={10} />
        </Link>
      </div>

      <div className="space-y-2 flex-1">
        {mockSignals.slice(0, 4).map((sig, i) => {
          const isPositive = sig.direction === 'buy_yes'
          const edge = sig.metadata.edgePct as number
          const analyzerConfig: Record<string, { label: string; Icon: any; color: string }> = {
            llm_prob: { label: 'AI EDGE', Icon: Brain, color: '#8B5CF6' },
            arb: { label: 'ARBITRAGE', Icon: Zap, color: '#FFD166' },
            sentiment: { label: 'SENTIMENT', Icon: Activity, color: '#00E5FF' },
          }
          const analyzer = analyzerConfig[sig.analyzer] || analyzerConfig.sentiment

          return (
            <motion.div
              key={sig.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="p-3 rounded-lg group hover:bg-white/[0.02] transition-all cursor-pointer"
              style={{
                borderLeft: `2px solid ${isPositive ? 'var(--color-success)' : 'var(--color-danger)'}`,
                background: isPositive ? 'rgba(0, 215, 126, 0.02)' : 'rgba(255, 75, 92, 0.02)',
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex items-center gap-1 text-[9px] font-mono font-bold tracking-wider" style={{ color: analyzer.color }}>
                      <analyzer.Icon size={10} strokeWidth={2} />
                      {analyzer.label}
                    </div>
                    <div className="flex items-center gap-1 text-[8px] font-mono text-[var(--text-muted)]">
                      <Clock size={8} />
                      {Math.floor(Math.random() * 10 + 1)}m
                    </div>
                  </div>
                  <p className="text-[13px] text-[var(--text-primary)] truncate">{sig.marketTitle}</p>
                </div>
                <div className="flex flex-col items-end ml-3">
                  <span className={`text-sm font-mono font-bold ${isPositive ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
                    {isPositive ? '+' : ''}{edge.toFixed(1)}%
                  </span>
                  <span className="text-[8px] font-mono text-[var(--text-muted)]">EDGE</span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Top Edge Markets ─── */
function TopEdge() {
  const markets = mockMarkets.map(getMarketWithEdge)
    .sort((a, b) => Math.abs(b.edge) - Math.abs(a.edge))
    .slice(0, 5)

  return (
    <div className="glass-card p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} strokeWidth={2} className="text-[var(--color-success)]" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Top Edge Markets</span>
        </div>
        <Link href="/app/scanner" className="flex items-center gap-1 text-[10px] font-mono text-[var(--brand-accent)] hover:underline">
          SCANNER <ChevronRight size={10} />
        </Link>
      </div>

      <div className="space-y-1 flex-1">
        {markets.map((m, i) => (
          <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/[0.02] transition-colors cursor-pointer group">
            {/* Rank */}
            <span className="text-[11px] font-mono font-bold w-5 text-center"
              style={{ color: i === 0 ? '#FFD166' : i === 1 ? '#A78BFA' : i === 2 ? '#FF9F43' : 'var(--text-muted)' }}>
              {i + 1}
            </span>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-[var(--text-primary)] truncate group-hover:text-white transition-colors">{m.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[8px] font-mono px-1.5 py-0.5 rounded font-bold tracking-wider"
                  style={{
                    background: m.source === 'polymarket' ? 'rgba(139,92,246,0.1)' : 'rgba(0,229,255,0.1)',
                    color: m.source === 'polymarket' ? '#A78BFA' : '#00E5FF',
                  }}>
                  {m.source === 'polymarket' ? 'POLY' : 'KALSHI'}
                </span>
                <span className="text-[8px] font-mono text-[var(--text-muted)] uppercase">{m.category}</span>
              </div>
            </div>

            {/* Price + Edge */}
            <div className="text-right">
              <p className="text-sm font-mono font-bold tabular-nums">{(m.currentPrice * 100).toFixed(1)}¢</p>
              <p className={`text-[10px] font-mono font-bold ${m.edge > 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
                {m.edge > 0 ? '+' : ''}{m.edge.toFixed(1)}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Main page ─── */
export default function DashboardOverview() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <LayoutDashboard size={18} strokeWidth={1.8} className="text-[var(--brand-accent)]" />
            <h1 className="text-lg font-display font-bold tracking-wide">Command Center</h1>
          </div>
          <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mt-0.5 ml-[26px]">
            Real-time prediction market intelligence · <span className="text-[var(--color-success)]">Updated 2s ago</span>
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {['1H', '6H', '24H', '7D'].map((t) => (
            <span key={t} className={`chip ${t === '24H' ? 'chip-active' : ''}`}>{t}</span>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-3">
        <KPITile label="Active Markets" value="1,247" change={3.2} Icon={Activity} color="#00E5FF" />
        <KPITile label="Live Signals" value="47" change={8.3} Icon={Signal} color="#8B5CF6" />
        <KPITile label="Avg Edge" value="6.2%" change={1.4} Icon={TrendingUp} color="#00D77E" />
        <KPITile label="Win Rate" value="68.3%" change={3.1} Icon={Gauge} color="#FFD166" />
      </div>

      {/* Pipeline */}
      <PipelineStrip />

      {/* Bottom: Signals + Top Edge side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SignalFeed />
        <TopEdge />
      </div>
    </div>
  )
}
