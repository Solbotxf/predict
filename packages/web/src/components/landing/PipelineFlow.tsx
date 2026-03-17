'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface DataPacket {
  id: number
  type: 'news' | 'market' | 'social' | 'onchain' | 'api'
  text: string
  color: string
}

const packetTemplates: Omit<DataPacket, 'id'>[] = [
  { type: 'news', text: 'Reuters: Fed signals rate cut path...', color: '#00E5FF' },
  { type: 'market', text: 'Polymarket: BTC>100K → 45.2¢', color: '#8B5CF6' },
  { type: 'social', text: 'Twitter sentiment: +0.34 bullish', color: '#FF9F43' },
  { type: 'market', text: 'Kalshi: Recession 2026 → 28.1¢', color: '#8B5CF6' },
  { type: 'news', text: 'WSJ: CPI falls to 2.1% YoY', color: '#00E5FF' },
  { type: 'onchain', text: '🐳 Whale: 500K USDC → Polymarket', color: '#00D77E' },
  { type: 'api', text: 'API: orderbook depth $2.4M', color: '#A78BFA' },
  { type: 'market', text: 'Polymarket: Election GOP → 52.3¢', color: '#8B5CF6' },
  { type: 'social', text: 'Reddit: r/prediction +180 posts/hr', color: '#FF9F43' },
  { type: 'news', text: 'Bloomberg: ECB holds rates steady', color: '#00E5FF' },
  { type: 'onchain', text: '⛓ Block 19.2M: 42 new positions', color: '#00D77E' },
  { type: 'market', text: 'Kalshi: S&P>6K → 63.0¢', color: '#8B5CF6' },
]

const signalOutputs = [
  { text: '🎯 SIGNAL: Fed Rate +9.9% edge → BUY YES', color: '#00D77E' },
  { text: '⚡ ARB: Poly vs Kalshi spread 4.0%', color: '#FFD166' },
  { text: '📉 SENTIMENT: BTC bearish shift -0.15', color: '#FF4B5C' },
  { text: '🎯 SIGNAL: Recession -21.4% edge → SELL', color: '#FF4B5C' },
  { text: '🤖 BOT: Execute BUY Fed-Yes 8% Kelly', color: '#00E5FF' },
]

function DataStream({ items, side }: { items: typeof packetTemplates; side: 'left' | 'right' }) {
  const [visibleIdx, setVisibleIdx] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleIdx(prev => (prev + 1) % items.length)
    }, side === 'left' ? 1800 : 2200)
    return () => clearInterval(interval)
  }, [items.length, side])

  return (
    <div className="space-y-1 overflow-hidden h-[200px] relative">
      <AnimatePresence mode="popLayout">
        {items.slice(visibleIdx, visibleIdx + 5).map((item, i) => (
          <motion.div
            key={`${side}-${visibleIdx}-${i}`}
            initial={{ opacity: 0, x: side === 'left' ? -20 : 20, scale: 0.95 }}
            animate={{ opacity: 1 - i * 0.18, x: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="flex items-center gap-2 text-xs font-mono py-1.5 px-3 rounded"
            style={{ background: `${item.color}08`, borderLeft: `2px solid ${item.color}40` }}
          >
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: item.color, boxShadow: `0 0 6px ${item.color}80` }} />
            <span className="truncate text-[var(--text-secondary)]" style={{ color: `${item.color}CC` }}>{item.text}</span>
          </motion.div>
        ))}
      </AnimatePresence>
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[var(--bg-primary)] to-transparent" />
    </div>
  )
}

export function PipelineFlow() {
  return (
    <section className="py-20 px-6 border-t border-[var(--border-default)] relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="badge-live mb-4 inline-flex">
            <span className="pulse-dot" style={{ width: 6, height: 6 }} />
            LIVE PIPELINE
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold mt-4">
            Watch Your Data <span style={{ color: 'var(--brand-accent)' }}>Flow in Real-Time</span>
          </h2>
          <p className="mt-3 text-sm text-[var(--text-secondary)] max-w-xl mx-auto">
            Multi-source data streams → AI processing pipeline → Actionable signals for your trading bot
          </p>
        </div>

        {/* Pipeline visualization */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-4 items-start">
          {/* LEFT: Data Sources */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono font-bold text-[var(--brand-accent)] uppercase tracking-wider">Data Sources</span>
              <span className="badge-live text-[9px]"><span className="pulse-dot" style={{ width: 5, height: 5 }} /> LIVE</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {['News', 'Markets', 'Social', 'On-chain', 'APIs'].map((src) => (
                <span key={src} className="chip chip-active text-[10px]">{src}</span>
              ))}
            </div>
            <DataStream items={packetTemplates} side="left" />
          </div>

          {/* Arrow */}
          <div className="hidden md:flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-1">
              <motion.div
                animate={{ x: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="text-[var(--brand-accent)] text-lg font-mono"
              >
                →→
              </motion.div>
              <span className="text-[9px] text-[var(--text-muted)] font-mono">STREAM</span>
            </div>
          </div>

          {/* CENTER: Processing Pipeline */}
          <div className="glass-card p-4" style={{ borderColor: 'rgba(139, 92, 246, 0.15)' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono font-bold text-[var(--brand-primary)] uppercase tracking-wider">AI Pipeline</span>
              <span className="text-[9px] font-mono text-[var(--text-muted)]">3 STAGES</span>
            </div>
            <div className="space-y-2">
              {[
                { label: 'INGEST', desc: 'Parse & normalize', icon: '📥', color: '#00E5FF', load: 92 },
                { label: 'ANALYZE', desc: 'LLM + Statistical', icon: '🧠', color: '#8B5CF6', load: 78 },
                { label: 'SIGNAL', desc: 'Edge detection', icon: '🎯', color: '#00D77E', load: 85 },
              ].map((stage, i) => (
                <motion.div
                  key={stage.label}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.2 }}
                  className="p-3 rounded-md relative overflow-hidden"
                  style={{ background: `${stage.color}06`, border: `1px solid ${stage.color}15` }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span>{stage.icon}</span>
                      <span className="text-[10px] font-mono font-bold tracking-wider" style={{ color: stage.color }}>{stage.label}</span>
                    </div>
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">{stage.load}%</span>
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)]">{stage.desc}</p>
                  {/* Load bar */}
                  <div className="mt-2 h-0.5 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: stage.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${stage.load}%` }}
                      transition={{ duration: 1.5, delay: i * 0.3 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Pipeline metrics */}
            <div className="grid grid-cols-3 gap-2 mt-3">
              {[
                { label: 'Latency', value: '< 200ms', color: '#00D77E' },
                { label: 'Events/s', value: '1,247', color: '#00E5FF' },
                { label: 'Models', value: '4 active', color: '#A78BFA' },
              ].map((m) => (
                <div key={m.label} className="text-center p-2 rounded" style={{ background: `${m.color}06` }}>
                  <p className="text-[9px] font-mono text-[var(--text-muted)] uppercase">{m.label}</p>
                  <p className="text-xs font-mono font-bold mt-0.5" style={{ color: m.color }}>{m.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Arrow */}
          <div className="hidden md:flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-1">
              <motion.div
                animate={{ x: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="text-[var(--color-success)] text-lg font-mono"
              >
                →→
              </motion.div>
              <span className="text-[9px] text-[var(--text-muted)] font-mono">OUTPUT</span>
            </div>
          </div>

          {/* RIGHT: Signal Output */}
          <div className="glass-card p-4" style={{ borderColor: 'rgba(0, 215, 126, 0.15)' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono font-bold text-[var(--color-success)] uppercase tracking-wider">Signals & Actions</span>
              <span className="badge-live text-[9px]"><span className="pulse-dot" style={{ width: 5, height: 5 }} /> LIVE</span>
            </div>
            <DataStream items={signalOutputs} side="right" />
            
            <div className="mt-3 p-3 rounded-md" style={{ background: 'rgba(0, 229, 255, 0.04)', border: '1px solid rgba(0, 229, 255, 0.1)' }}>
              <p className="text-[10px] font-mono text-[var(--brand-accent)] uppercase tracking-wider mb-1">Trading Bot Status</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="pulse-dot" />
                  <span className="text-xs font-mono text-[var(--text-primary)]">Active</span>
                </div>
                <span className="text-xs font-mono text-[var(--color-success)]">+$2,847 today</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
