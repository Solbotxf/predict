'use client'
import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ─── Animated flowing particles on SVG paths ─── */
function FlowingPath({ d, color, delay = 0, duration = 3 }: { d: string; color: string; delay?: number; duration?: number }) {
  return (
    <g>
      {/* Base path (dim) */}
      <path d={d} stroke={`${color}15`} strokeWidth={1.5} fill="none" />
      {/* Glow path */}
      <path d={d} stroke={`${color}40`} strokeWidth={1} fill="none"
        filter="url(#glow)" />
      {/* Flowing particle */}
      <circle r={3} fill={color} filter="url(#glow)">
        <animateMotion dur={`${duration}s`} repeatCount="indefinite" begin={`${delay}s`}>
          <mpath href={`#${d.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20)}`} />
        </animateMotion>
      </circle>
      <circle r={6} fill={`${color}30`}>
        <animateMotion dur={`${duration}s`} repeatCount="indefinite" begin={`${delay}s`}>
          <mpath href={`#${d.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20)}`} />
        </animateMotion>
      </circle>
      <path id={d.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20)} d={d} fill="none" />
    </g>
  )
}

/* ─── Data packet that flows through the pipeline ─── */
interface DataPacket {
  id: number
  type: 'news' | 'market' | 'social' | 'onchain' | 'api'
  text: string
  color: string
  icon: string
}

const packetPool: Omit<DataPacket, 'id'>[] = [
  { type: 'news', text: 'Reuters: Fed signals rate cut...', color: '#00E5FF', icon: '📰' },
  { type: 'market', text: 'POLY: BTC>100K → 45.2¢', color: '#8B5CF6', icon: '📊' },
  { type: 'social', text: 'X sentiment: +0.34 bullish', color: '#FF9F43', icon: '🐦' },
  { type: 'market', text: 'KALSHI: Recession → 28.1¢', color: '#8B5CF6', icon: '📊' },
  { type: 'news', text: 'WSJ: CPI falls to 2.1% YoY', color: '#00E5FF', icon: '📰' },
  { type: 'onchain', text: '🐳 500K USDC → Polymarket', color: '#00D77E', icon: '⛓' },
  { type: 'api', text: 'Orderbook depth: $2.4M', color: '#A78BFA', icon: '🔌' },
  { type: 'market', text: 'POLY: Election GOP → 52.3¢', color: '#8B5CF6', icon: '📊' },
  { type: 'social', text: 'Reddit: +180 posts/hr', color: '#FF9F43', icon: '🐦' },
  { type: 'onchain', text: 'Block 19.2M: 42 positions', color: '#00D77E', icon: '⛓' },
]

const signalOutputs: Omit<DataPacket, 'id'>[] = [
  { type: 'market', text: '🎯 BUY YES Fed Rate +9.9%', color: '#00D77E', icon: '🎯' },
  { type: 'market', text: '⚡ ARB Poly↔Kalshi 4.0%', color: '#FFD166', icon: '⚡' },
  { type: 'market', text: '📉 SELL BTC bearish -0.15', color: '#FF4B5C', icon: '📉' },
  { type: 'market', text: '🤖 BOT: 8% Kelly → Execute', color: '#00E5FF', icon: '🤖' },
]

function StreamColumn({ items, side, speed = 2000 }: { items: Omit<DataPacket, 'id'>[]; side: 'left' | 'right'; speed?: number }) {
  const [offset, setOffset] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => setOffset(o => (o + 1) % items.length), speed)
    return () => clearInterval(interval)
  }, [items.length, speed])

  if (!mounted) return <div className="h-[180px]" />

  const visible = Array.from({ length: 4 }, (_, i) => items[(offset + i) % items.length])

  return (
    <div className="space-y-1.5 overflow-hidden h-[180px] relative">
      <AnimatePresence mode="popLayout">
        {visible.map((item, i) => (
          <motion.div
            key={`${side}-${offset}-${i}`}
            initial={{ opacity: 0, x: side === 'left' ? -30 : 30, filter: 'blur(4px)' }}
            animate={{ opacity: 1 - i * 0.2, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8, filter: 'blur(2px)' }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="flex items-center gap-2 py-1.5 px-2.5 rounded-md font-mono text-[11px]"
            style={{ 
              background: `linear-gradient(90deg, ${item.color}06, ${item.color}03)`,
              borderLeft: side === 'left' ? `2px solid ${item.color}50` : 'none',
              borderRight: side === 'right' ? `2px solid ${item.color}50` : 'none',
            }}
          >
            <span className="text-sm flex-shrink-0">{item.icon}</span>
            <span className="truncate" style={{ color: `${item.color}DD` }}>{item.text}</span>
          </motion.div>
        ))}
      </AnimatePresence>
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[var(--bg-primary)] to-transparent pointer-events-none" />
    </div>
  )
}

function PipelineNode({ icon, label, sublabel, color, metrics, isActive = true }: {
  icon: string; label: string; sublabel: string; color: string; metrics?: { label: string; value: string }[]; isActive?: boolean
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -2 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="relative p-4 rounded-lg cursor-pointer group"
      style={{
        background: `linear-gradient(135deg, ${color}08, ${color}04)`,
        border: `1px solid ${color}20`,
        boxShadow: `0 0 20px ${color}08`,
      }}
    >
      {/* Corner glow */}
      <div className="absolute -top-px -right-px w-8 h-8 rounded-tr-lg opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: `radial-gradient(circle at top right, ${color}20, transparent)` }} />

      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold tracking-widest" style={{ color }}>{label}</span>
            {isActive && (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
              </span>
            )}
          </div>
          <p className="text-[9px] text-[var(--text-muted)] font-mono">{sublabel}</p>
        </div>
      </div>

      {/* Progress bar with shimmer */}
      <div className="h-1 rounded-full bg-white/5 overflow-hidden mb-2">
        <motion.div
          className="h-full rounded-full relative overflow-hidden"
          style={{ background: `linear-gradient(90deg, ${color}80, ${color})` }}
          animate={{ width: ['60%', '95%', '75%', '90%', '60%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0"
            style={{ background: `linear-gradient(90deg, transparent, ${color}40, transparent)` }}
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      </div>

      {metrics && (
        <div className="flex gap-3">
          {metrics.map(m => (
            <div key={m.label}>
              <p className="text-[8px] font-mono text-[var(--text-muted)] uppercase tracking-wider">{m.label}</p>
              <p className="text-xs font-mono font-bold" style={{ color }}>{m.value}</p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

/* ─── Animated connection lines between pipeline stages ─── */
function ConnectionBeam({ color, delay = 0 }: { color: string; delay?: number }) {
  return (
    <div className="hidden md:flex flex-col items-center justify-center gap-1 w-12 relative">
      {/* Line */}
      <div className="w-full h-[1px] relative overflow-hidden" style={{ background: `${color}15` }}>
        <motion.div
          className="absolute top-0 h-full w-8"
          style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
          animate={{ left: ['-32px', 'calc(100% + 32px)'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear', delay }}
        />
      </div>
      {/* Arrows */}
      <motion.span
        className="text-[10px] font-mono"
        style={{ color: `${color}60` }}
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity, delay }}
      >
        ›››
      </motion.span>
    </div>
  )
}

export function PipelineFlow() {
  return (
    <section className="py-24 px-6 relative overflow-hidden" id="pipeline">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            radial-gradient(circle, rgba(0,229,255,0.4) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6"
            style={{ background: 'rgba(0, 229, 255, 0.06)', border: '1px solid rgba(0, 229, 255, 0.1)' }}
          >
            <span className="pulse-dot" style={{ width: 6, height: 6 }} />
            <span className="text-[10px] font-mono font-bold text-[var(--brand-accent)] uppercase tracking-widest">
              Live Pipeline · 1,247 events/min
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-display font-bold"
          >
            Watch Your Data{' '}
            <span className="relative">
              <span className="bg-gradient-to-r from-[var(--brand-accent)] via-[var(--brand-primary)] to-[var(--color-success)] bg-clip-text text-transparent">
                Flow in Real-Time
              </span>
              {/* Underline glow */}
              <motion.span
                className="absolute -bottom-1 left-0 h-[2px] rounded-full"
                style={{ background: 'linear-gradient(90deg, var(--brand-accent), var(--brand-primary), var(--color-success))' }}
                initial={{ width: 0 }}
                whileInView={{ width: '100%' }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
              />
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-4 text-sm text-[var(--text-secondary)] max-w-2xl mx-auto font-mono"
          >
            Multi-source intelligence → AI processing → Kelly-optimal signals → Automated execution
          </motion.p>
        </div>

        {/* Pipeline visualization — 5-column flow */}
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_auto_1fr_auto_1.2fr] gap-3 items-start">
          {/* LEFT: Data Sources */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="glass-card p-4" style={{ borderColor: 'rgba(0, 229, 255, 0.08)' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[var(--brand-accent)] uppercase tracking-widest">Data Sources</span>
                  <span className="badge-live text-[8px]"><span className="pulse-dot" style={{ width: 4, height: 4 }} /> 5 ACTIVE</span>
                </div>
              </div>
              
              {/* Source type badges */}
              <div className="flex flex-wrap gap-1 mb-3">
                {[
                  { label: 'News Feeds', color: '#00E5FF', count: '435+' },
                  { label: 'Markets', color: '#8B5CF6', count: '1,200' },
                  { label: 'Social', color: '#FF9F43', count: '12K' },
                  { label: 'On-chain', color: '#00D77E', count: '8' },
                  { label: 'APIs', color: '#A78BFA', count: '24' },
                ].map(s => (
                  <span key={s.label} className="text-[9px] font-mono px-2 py-0.5 rounded flex items-center gap-1"
                    style={{ background: `${s.color}08`, border: `1px solid ${s.color}15`, color: `${s.color}CC` }}>
                    <span className="w-1 h-1 rounded-full" style={{ background: s.color }} />
                    {s.label} <span className="text-[var(--text-muted)]">({s.count})</span>
                  </span>
                ))}
              </div>

              <StreamColumn items={packetPool} side="left" speed={1600} />
            </div>
          </motion.div>

          <ConnectionBeam color="#00E5FF" delay={0} />

          {/* CENTER: AI Processing Pipeline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="space-y-3">
              <PipelineNode
                icon="📥" label="INGEST" sublabel="Parse, normalize, deduplicate"
                color="#00E5FF"
                metrics={[{ label: 'Throughput', value: '1,247/min' }, { label: 'Latency', value: '12ms' }]}
              />
              <div className="flex justify-center">
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-[var(--text-muted)] text-xs font-mono"
                >↓</motion.div>
              </div>
              <PipelineNode
                icon="🧠" label="ANALYZE" sublabel="LLM + Statistical + Ensemble"
                color="#8B5CF6"
                metrics={[{ label: 'Models', value: '4 active' }, { label: 'Accuracy', value: '68.3%' }]}
              />
              <div className="flex justify-center">
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
                  className="text-[var(--text-muted)] text-xs font-mono"
                >↓</motion.div>
              </div>
              <PipelineNode
                icon="🎯" label="SIGNAL GEN" sublabel="Edge detection, Kelly sizing"
                color="#00D77E"
                metrics={[{ label: 'Signals/hr', value: '47' }, { label: 'Avg Edge', value: '6.2%' }]}
              />
            </div>
          </motion.div>

          <ConnectionBeam color="#00D77E" delay={0.5} />

          {/* RIGHT: Signal Output & Execution */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="glass-card p-4" style={{ borderColor: 'rgba(0, 215, 126, 0.08)' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-[var(--color-success)] uppercase tracking-widest">Signals & Execution</span>
                <span className="badge-live text-[8px]"><span className="pulse-dot" style={{ width: 4, height: 4 }} /> AUTO</span>
              </div>

              <StreamColumn items={signalOutputs} side="right" speed={2800} />

              {/* Bot status panel */}
              <div className="mt-3 p-3 rounded-lg relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.04), rgba(0, 215, 126, 0.04))', border: '1px solid rgba(0, 229, 255, 0.08)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-mono font-bold text-[var(--brand-accent)] uppercase tracking-widest">Trading Bot</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00D77E', boxShadow: '0 0 6px #00D77E' }} />
                    <span className="text-[9px] font-mono text-[var(--color-success)]">ACTIVE</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'PnL Today', value: '+$2,847', color: '#00D77E' },
                    { label: 'Positions', value: '12', color: '#00E5FF' },
                    { label: 'Win Rate', value: '71%', color: '#FFD166' },
                  ].map(m => (
                    <div key={m.label} className="text-center">
                      <p className="text-[8px] font-mono text-[var(--text-muted)] uppercase">{m.label}</p>
                      <p className="text-xs font-mono font-bold" style={{ color: m.color }}>{m.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
