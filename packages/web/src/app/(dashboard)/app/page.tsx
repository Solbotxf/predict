'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Database, Brain, Target, TrendingUp, Users, Cpu, Zap, ArrowLeftRight,
  ChevronRight, Lock, Clock, Wifi, Activity, Eye
} from 'lucide-react'

/* ─── Simulated real-time feed items ─── */
const dataFeedItems = [
  { text: 'Reuters: Fed officials hint at September rate cut', source: 'NEWS', color: '#00E5FF', time: '2s' },
  { text: 'Polymarket: "BTC > $100K by Dec" volume +$240K', source: 'POLY', color: '#8B5CF6', time: '5s' },
  { text: 'Twitter/X: #prediction trending, sentiment +0.42', source: 'SOCIAL', color: '#FF9F43', time: '8s' },
  { text: 'Kalshi: "US Recession 2026" price moved 28.1→29.3¢', source: 'KALSHI', color: '#A78BFA', time: '12s' },
  { text: 'On-chain: Whale deposited 820K USDC to Polymarket', source: 'CHAIN', color: '#00D77E', time: '15s' },
  { text: 'Reddit: r/predictionmarkets +312 posts in 1hr', source: 'SOCIAL', color: '#FF9F43', time: '18s' },
  { text: 'Bloomberg: ECB holds rates, EUR/USD drops 0.3%', source: 'NEWS', color: '#00E5FF', time: '22s' },
  { text: 'Polymarket: "Election GOP Win" new limit orders $1.2M', source: 'POLY', color: '#8B5CF6', time: '25s' },
]

const pipelineItems = [
  { text: 'LLM ensemble: Fed Rate Cut fair value → 80.9%', model: 'GPT-4 + Claude', color: '#8B5CF6', time: '3s' },
  { text: 'Sentiment shift detected: BTC markets -0.15 bearish', model: 'NLP Engine', color: '#FF9F43', time: '7s' },
  { text: 'Cross-platform correlation: Kalshi↔Poly divergence 4.2%', model: 'Arb Scanner', color: '#FFD166', time: '11s' },
  { text: 'Volume anomaly: Recession market 3x avg volume', model: 'Stats Engine', color: '#00E5FF', time: '16s' },
  { text: 'Bayesian update: S&P>6K posterior moved +2.1%', model: 'Bayesian Net', color: '#A78BFA', time: '20s' },
  { text: 'Feature extraction: 14 new signals from news batch', model: 'Feature Eng.', color: '#00E5FF', time: '24s' },
]

const valueItems = [
  { text: 'EDGE: Fed Rate Cut YES — +9.9% edge, Kelly 8.2%', type: 'SIGNAL', color: '#00D77E', pnl: '+$420' },
  { text: 'ARB: Poly vs Kalshi "Recession" — 4.2% risk-free', type: 'ARBITRAGE', color: '#FFD166', pnl: '+$180' },
  { text: 'EDGE: S&P > 6K — +11.1% edge, high confidence', type: 'SIGNAL', color: '#00D77E', pnl: '+$310' },
  { text: 'ALERT: BTC market sentiment reversal detected', type: 'ALERT', color: '#FF4B5C', pnl: 'Saved $850' },
  { text: 'ARB: Election GOP cross-platform — 2.7% spread', type: 'ARBITRAGE', color: '#FFD166', pnl: '+$95' },
  { text: 'EDGE: AGI Timeline — +33.3% edge, low liquidity', type: 'SIGNAL', color: '#00D77E', pnl: '+$60' },
]

/* ─── Live scrolling feed column ─── */
function LiveColumn({ title, Icon, items, accentColor, showLock = false }: {
  title: string; Icon: any; items: Array<any>; accentColor: string; showLock?: boolean
}) {
  const [offset, setOffset] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => setOffset(o => (o + 1) % items.length), 2200)
    return () => clearInterval(interval)
  }, [items.length])

  if (!mounted) return <div className="h-[300px]" />

  const visible = Array.from({ length: 4 }, (_, i) => ({
    ...items[(offset + i) % items.length],
    key: `${offset}-${i}`,
  }))

  return (
    <div className="glass-card p-4 flex flex-col h-full" style={{ borderColor: `${accentColor}10` }}>
      <div className="flex items-center justify-between mb-3 pb-2" style={{ borderBottom: `1px solid ${accentColor}10` }}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: `${accentColor}12` }}>
            <Icon size={13} strokeWidth={1.8} color={accentColor} />
          </div>
          <span className="text-[10px] font-mono font-bold tracking-widest" style={{ color: accentColor }}>{title}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="badge-live text-[8px]"><span className="pulse-dot" style={{ width: 4, height: 4 }} /> LIVE</span>
        </div>
      </div>

      <div className="space-y-2 flex-1 overflow-hidden relative">
        <AnimatePresence mode="popLayout">
          {visible.map((item, i) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 15, filter: 'blur(3px)' }}
              animate={{ opacity: 1 - i * 0.15, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(2px)' }}
              transition={{ duration: 0.3 }}
              className="p-2.5 rounded-md"
              style={{
                background: `${item.color || accentColor}04`,
                borderLeft: `2px solid ${item.color || accentColor}40`,
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[8px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded"
                      style={{ background: `${item.color || accentColor}10`, color: `${item.color || accentColor}CC` }}>
                      {item.source || item.model || item.type}
                    </span>
                    <span className="text-[8px] font-mono text-[var(--text-muted)] flex items-center gap-0.5">
                      <Clock size={7} /> {item.time || ''}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-primary)] leading-snug">{item.text}</p>
                </div>
                {item.pnl && (
                  <span className="text-[10px] font-mono font-bold flex-shrink-0"
                    style={{ color: item.pnl.startsWith('+') ? 'var(--color-success)' : 'var(--brand-accent)' }}>
                    {item.pnl}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[var(--bg-panel)] to-transparent pointer-events-none" />
      </div>

      {/* Delayed data notice for free users */}
      {showLock && (
        <div className="mt-3 p-2 rounded-md flex items-center justify-between"
          style={{ background: 'rgba(255, 209, 102, 0.04)', border: '1px solid rgba(255, 209, 102, 0.1)' }}>
          <div className="flex items-center gap-1.5">
            <Clock size={10} color="#FFD166" />
            <span className="text-[9px] font-mono text-[#FFD166CC]">Delayed T+1hr · Free tier</span>
          </div>
          <Link href="/pricing" className="flex items-center gap-0.5 text-[9px] font-mono font-bold text-[var(--brand-accent)]">
            Upgrade <ChevronRight size={8} />
          </Link>
        </div>
      )}
    </div>
  )
}

/* ─── Platform stats ─── */
function PlatformStats() {
  const stats = [
    { label: 'AI Agents Active', value: '2,847', Icon: Cpu, color: '#8B5CF6', change: '+124 today' },
    { label: 'Data Points / Day', value: '18.4M', Icon: Database, color: '#00E5FF', change: '+2.1M vs last week' },
    { label: 'Signals Generated', value: '12,340', Icon: Target, color: '#00D77E', change: '+890 today' },
    { label: 'Arbitrage Found', value: '847', Icon: ArrowLeftRight, color: '#FFD166', change: '$124K total value' },
    { label: 'Markets Monitored', value: '1,247', Icon: Eye, color: '#A78BFA', change: 'across 4 platforms' },
    { label: 'Platform Win Rate', value: '68.3%', Icon: TrendingUp, color: '#00D77E', change: '+2.1% this month' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="glass-card p-3 group cursor-default"
        >
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: `${s.color}10` }}>
              <s.Icon size={12} strokeWidth={1.8} color={s.color} />
            </div>
          </div>
          <p className="text-xl font-mono font-bold tabular-nums" style={{ color: s.color }}>{s.value}</p>
          <p className="text-[8px] font-mono text-[var(--text-muted)] uppercase tracking-wider mt-0.5">{s.label}</p>
          <p className="text-[8px] font-mono text-[var(--text-muted)] mt-1">{s.change}</p>
        </motion.div>
      ))}
    </div>
  )
}

/* ─── Main Overview Page ─── */
export default function OverviewPage() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Activity size={18} strokeWidth={1.8} className="text-[var(--brand-accent)]" />
            <h1 className="text-lg font-display font-bold tracking-wide">Overview</h1>
          </div>
          <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mt-0.5 ml-[26px]">
            Platform intelligence at a glance · <span className="text-[var(--color-success)]">All systems operational</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md"
            style={{ background: 'rgba(0,215,126,0.06)', border: '1px solid rgba(0,215,126,0.1)' }}>
            <Wifi size={11} color="#00D77E" />
            <span className="text-[9px] font-mono font-bold text-[var(--color-success)]">LIVE</span>
          </div>
        </div>
      </div>

      {/* 3-column real-time feed */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <LiveColumn
          title="DATA COLLECTION"
          Icon={Database}
          items={dataFeedItems}
          accentColor="#00E5FF"
          showLock={true}
        />
        <LiveColumn
          title="AI ANALYSIS"
          Icon={Brain}
          items={pipelineItems}
          accentColor="#8B5CF6"
          showLock={true}
        />
        <LiveColumn
          title="VALUE DISCOVERY"
          Icon={Target}
          items={valueItems}
          accentColor="#00D77E"
        />
      </div>

      {/* Platform-wide stats */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={14} strokeWidth={1.8} className="text-[var(--text-muted)]" />
          <span className="text-[10px] font-mono font-bold text-[var(--text-secondary)] uppercase tracking-widest">Platform Statistics</span>
        </div>
        <PlatformStats />
      </div>
    </div>
  )
}
