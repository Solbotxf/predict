'use client'
import { useEffect, useRef, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Newspaper, TrendingUp, BarChart3, Twitter, Link2, MessageSquare, Radio,
  Microscope, Brain, Zap, Activity, LineChart,
  Search, Target, ArrowLeftRight, PieChart, Shield,
  MonitorDot, Crosshair, Bot, Wifi
} from 'lucide-react'

/* ═══════════════════════════════════════════════
   3 VERTICAL columns + 1 horizontal bottom row
   
   ┌─────────┐    ┌─────────┐    ┌─────────┐
   │  DATA   │ →→ │STRATEGY │ →→ │ OUTPUT  │
   │ SOURCES │    │ANALYSIS │    │SCENARIOS│
   │  (7)    │    │  (5)    │    │  (5)    │
   └────┬────┘    └────┬────┘    └────┬────┘
        └──────────────┼──────────────┘
                       ↓
             ┌──── YOUR TOOLS ────┐
             │  (4, horizontal)   │
             └────────────────────┘
   ═══════════════════════════════════════════════ */

const SOURCES = [
  { label: 'News Feeds', Icon: Newspaper, color: '#00E5FF' },
  { label: 'Polymarket', Icon: TrendingUp, color: '#8B5CF6' },
  { label: 'Kalshi', Icon: BarChart3, color: '#A78BFA' },
  { label: 'Twitter/X', Icon: Twitter, color: '#FF9F43' },
  { label: 'On-chain', Icon: Link2, color: '#00D77E' },
  { label: 'Reddit', Icon: MessageSquare, color: '#FF6B6B' },
  { label: 'APIs', Icon: Radio, color: '#A78BFA' },
]

const STRATEGIES = [
  { label: 'Feature Extract', Icon: Microscope, color: '#00E5FF' },
  { label: 'Sentiment AI', Icon: Brain, color: '#FF9F43' },
  { label: 'LLM Fair Value', Icon: Activity, color: '#8B5CF6' },
  { label: 'Arb Detection', Icon: Zap, color: '#FFD166' },
  { label: 'Volume Analysis', Icon: LineChart, color: '#00D77E' },
]

const SCENARIOS = [
  { label: 'Market Scanner', Icon: Search, color: '#00E5FF' },
  { label: 'Edge Detection', Icon: Target, color: '#00D77E' },
  { label: 'Arbitrage Opps', Icon: ArrowLeftRight, color: '#FFD166' },
  { label: 'Win Rate', Icon: PieChart, color: '#8B5CF6' },
  { label: 'Risk Mgmt', Icon: Shield, color: '#FF4B5C' },
]

const USER_OUTPUTS = [
  { label: 'Real-time Feed', Icon: Wifi, color: '#00E5FF' },
  { label: 'Dashboard', Icon: MonitorDot, color: '#8B5CF6' },
  { label: 'Trading Signals', Icon: Crosshair, color: '#00D77E' },
  { label: 'AI Trading Bot', Icon: Bot, color: '#FFD166' },
]

/* ─── Canvas particle system ─── */
interface Particle {
  fromX: number; fromY: number; toX: number; toY: number
  t: number; speed: number; color: string; size: number
  trail: Array<{ x: number; y: number }>
  phase: number // 0=col1→col2, 1=col2→col3, 2=any col→bottom
}

function FlowCanvas({ width, height, colPositions, userPositions }: {
  width: number; height: number
  colPositions: Array<{ cx: number; nodes: Array<{ y: number; color: string }> }>
  userPositions: Array<{ x: number; y: number; color: string }>
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const particlesRef = useRef<Particle[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || width === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    const particles = particlesRef.current

    const bezierH = (fx: number, fy: number, tx: number, ty: number, t: number): [number, number] => {
      const mx = (fx + tx) / 2
      const u = 1 - t
      return [
        u * u * u * fx + 3 * u * u * t * mx + 3 * u * t * t * mx + t * t * t * tx,
        u * u * u * fy + 3 * u * u * t * fy + 3 * u * t * t * ty + t * t * t * ty,
      ]
    }

    const bezierV = (fx: number, fy: number, tx: number, ty: number, t: number): [number, number] => {
      const my = (fy + ty) / 2
      const u = 1 - t
      return [
        u * u * u * fx + 3 * u * u * t * fx + 3 * u * t * t * tx + t * t * t * tx,
        u * u * u * fy + 3 * u * u * t * my + 3 * u * t * t * my + t * t * t * ty,
      ]
    }

    const spawn = () => {
      const phase = Math.random() < 0.35 ? 0 : Math.random() < 0.55 ? 1 : 2

      let fx: number, fy: number, tx: number, ty: number, color: string

      if (phase === 0 && colPositions.length >= 2) {
        // Col1 → Col2
        const from = colPositions[0].nodes[Math.floor(Math.random() * colPositions[0].nodes.length)]
        const to = colPositions[1].nodes[Math.floor(Math.random() * colPositions[1].nodes.length)]
        fx = colPositions[0].cx + 30; fy = from.y
        tx = colPositions[1].cx - 30; ty = to.y
        color = from.color
      } else if (phase === 1 && colPositions.length >= 3) {
        // Col2 → Col3
        const from = colPositions[1].nodes[Math.floor(Math.random() * colPositions[1].nodes.length)]
        const to = colPositions[2].nodes[Math.floor(Math.random() * colPositions[2].nodes.length)]
        fx = colPositions[1].cx + 30; fy = from.y
        tx = colPositions[2].cx - 30; ty = to.y
        color = from.color
      } else if (userPositions.length > 0) {
        // Any col → user bottom
        const colIdx = Math.floor(Math.random() * colPositions.length)
        const from = colPositions[colIdx].nodes[Math.floor(Math.random() * colPositions[colIdx].nodes.length)]
        const to = userPositions[Math.floor(Math.random() * userPositions.length)]
        fx = colPositions[colIdx].cx; fy = from.y + 20
        tx = to.x; ty = to.y - 20
        color = from.color
      } else return

      particles.push({
        fromX: fx, fromY: fy, toX: tx, toY: ty,
        t: 0, speed: 0.005 + Math.random() * 0.015,
        color, size: 1.2 + Math.random() * 1.5,
        trail: [], phase,
      })
    }

    // Draw faint connections
    const drawConnections = () => {
      ctx.lineWidth = 0.3
      // Horizontal: col1→col2, col2→col3
      for (let ci = 0; ci < colPositions.length - 1; ci++) {
        for (const fn of colPositions[ci].nodes) {
          for (const tn of colPositions[ci + 1].nodes) {
            ctx.beginPath()
            ctx.strokeStyle = `${fn.color}04`
            const fx = colPositions[ci].cx + 30, tx = colPositions[ci + 1].cx - 30
            const mx = (fx + tx) / 2
            ctx.moveTo(fx, fn.y)
            ctx.bezierCurveTo(mx, fn.y, mx, tn.y, tx, tn.y)
            ctx.stroke()
          }
        }
      }
      // Vertical: each col → user
      for (const col of colPositions) {
        for (const fn of col.nodes) {
          for (const un of userPositions) {
            ctx.beginPath()
            ctx.strokeStyle = `${fn.color}03`
            const my = (fn.y + un.y) / 2
            ctx.moveTo(col.cx, fn.y + 20)
            ctx.bezierCurveTo(col.cx, my, un.x, my, un.x, un.y - 20)
            ctx.stroke()
          }
        }
      }
    }

    let frame = 0
    const animate = () => {
      ctx.clearRect(0, 0, width, height)
      drawConnections()

      frame++
      if (frame % 3 === 0 && particles.length < 100) spawn()

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.t += p.speed
        if (p.t > 1) { particles.splice(i, 1); continue }

        const isHorizontal = p.phase < 2
        const [nx, ny] = isHorizontal
          ? bezierH(p.fromX, p.fromY, p.toX, p.toY, p.t)
          : bezierV(p.fromX, p.fromY, p.toX, p.toY, p.t)

        p.trail.push({ x: nx, y: ny })
        if (p.trail.length > 7) p.trail.shift()

        for (let tr = 0; tr < p.trail.length; tr++) {
          const a = (tr / p.trail.length) * 0.3
          ctx.beginPath()
          ctx.arc(p.trail[tr].x, p.trail[tr].y, p.size * (0.3 + (tr / p.trail.length) * 0.7), 0, Math.PI * 2)
          ctx.fillStyle = `${p.color}${Math.floor(a * 255).toString(16).padStart(2, '0')}`
          ctx.fill()
        }

        ctx.beginPath()
        ctx.arc(nx, ny, p.size * 3.5, 0, Math.PI * 2)
        ctx.fillStyle = `${p.color}0A`
        ctx.fill()

        ctx.beginPath()
        ctx.arc(nx, ny, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `${p.color}DD`
        ctx.fill()
      }

      animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [width, height, colPositions, userPositions])

  return <canvas ref={canvasRef} style={{ width, height }} className="absolute inset-0 pointer-events-none" />
}

/* ─── Styled node ─── */
function PipelineNode({ item }: { item: { label: string; Icon: any; color: string } }) {
  const { Icon, label, color } = item
  return (
    <motion.div
      whileHover={{ scale: 1.08 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className="flex items-center gap-2.5 cursor-pointer group py-1.5"
    >
      <div className="relative flex-shrink-0">
        <div className="absolute -inset-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: `radial-gradient(circle, ${color}20, transparent)` }} />
        <div className="relative w-9 h-9 rounded-lg flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${color}12, ${color}06)`,
            border: `1px solid ${color}25`,
            boxShadow: `0 1px 8px ${color}10`,
          }}
        >
          <Icon size={16} strokeWidth={1.8} color={color} />
          <div className="absolute inset-0 rounded-lg overflow-hidden">
            <div className="absolute -top-1/2 -left-1/2 w-full h-full rotate-12 opacity-10"
              style={{ background: `linear-gradient(180deg, ${color}, transparent)` }} />
          </div>
        </div>
        <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ background: color, boxShadow: `0 0 4px ${color}` }} />
      </div>
      <span className="text-[10px] font-mono font-medium tracking-wide" style={{ color: `${color}BB` }}>
        {label}
      </span>
    </motion.div>
  )
}

/* ─── Column header ─── */
function ColHeader({ label, color, count }: { label: string; color: string; count: number }) {
  return (
    <div className="mb-4 pb-2" style={{ borderBottom: `1px solid ${color}15` }}>
      <div className="flex items-center gap-2 mb-0.5">
        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
        <span className="text-[10px] font-mono font-bold tracking-widest" style={{ color }}>{label}</span>
      </div>
      <span className="text-[8px] font-mono text-[var(--text-muted)]">{count} active modules</span>
    </div>
  )
}

/* ─── Arrow between columns ─── */
function ColArrow({ color }: { color: string }) {
  return (
    <div className="flex items-center justify-center self-center">
      <motion.div
        animate={{ x: [0, 6, 0], opacity: [0.3, 0.9, 0.3] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        className="flex items-center gap-0.5"
      >
        <div className="w-8 h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${color}40)` }} />
        <svg width="8" height="12" viewBox="0 0 8 12">
          <path d="M1 1 L6 6 L1 11" stroke={`${color}60`} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      </motion.div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   Main
   ═══════════════════════════════════════════════ */
export function PipelineFlow() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dims, setDims] = useState({ w: 0, h: 0 })

  // Refs for measuring node positions for canvas
  const col1Ref = useRef<HTMLDivElement>(null)
  const col2Ref = useRef<HTMLDivElement>(null)
  const col3Ref = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)

  const [colPositions, setColPositions] = useState<Array<{ cx: number; nodes: Array<{ y: number; color: string }> }>>([])
  const [userPositions, setUserPositions] = useState<Array<{ x: number; y: number; color: string }>>([])

  useEffect(() => {
    const measure = () => {
      if (!containerRef.current) return
      const cr = containerRef.current.getBoundingClientRect()
      setDims({ w: cr.width, h: cr.height })

      const getNodePositions = (ref: React.RefObject<HTMLDivElement | null>, items: Array<{ color: string }>) => {
        if (!ref.current) return { cx: 0, nodes: [] }
        const rect = ref.current.getBoundingClientRect()
        const cx = rect.left + rect.width / 2 - cr.left
        const nodeEls = ref.current.querySelectorAll('[data-node]')
        const nodes = Array.from(nodeEls).map((el, i) => {
          const nr = el.getBoundingClientRect()
          return { y: nr.top + nr.height / 2 - cr.top, color: items[i]?.color || '#fff' }
        })
        return { cx, nodes }
      }

      setColPositions([
        getNodePositions(col1Ref, SOURCES),
        getNodePositions(col2Ref, STRATEGIES),
        getNodePositions(col3Ref, SCENARIOS),
      ])

      if (userRef.current) {
        const nodeEls = userRef.current.querySelectorAll('[data-node]')
        setUserPositions(Array.from(nodeEls).map((el, i) => {
          const nr = el.getBoundingClientRect()
          return { x: nr.left + nr.width / 2 - cr.left, y: nr.top + nr.height / 2 - cr.top, color: USER_OUTPUTS[i]?.color || '#fff' }
        }))
      }
    }

    // Delay to let layout settle
    const timer = setTimeout(measure, 200)
    window.addEventListener('resize', measure)
    return () => { clearTimeout(timer); window.removeEventListener('resize', measure) }
  }, [])

  return (
    <section className="py-20 px-6 relative overflow-hidden" id="pipeline">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4"
            style={{ background: 'rgba(0, 229, 255, 0.06)', border: '1px solid rgba(0, 229, 255, 0.1)' }}
          >
            <span className="pulse-dot" style={{ width: 6, height: 6 }} />
            <span className="text-[10px] font-mono font-bold text-[var(--brand-accent)] uppercase tracking-widest">
              Live Intelligence Pipeline
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-display font-bold"
          >
            From Raw Data to{' '}
            <span className="bg-gradient-to-r from-[var(--brand-accent)] via-[var(--brand-primary)] to-[var(--color-success)] bg-clip-text text-transparent">
              Trading Profits
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-3 text-sm text-[var(--text-secondary)] font-mono"
          >
            Every layer is a product. Pick what you need.
          </motion.p>
        </div>

        {/* 3-column layout + canvas overlay */}
        <div ref={containerRef} className="relative">
          {/* Canvas behind everything */}
          {dims.w > 0 && dims.h > 0 && (
            <FlowCanvas width={dims.w} height={dims.h} colPositions={colPositions} userPositions={userPositions} />
          )}

          {/* 3 columns */}
          <div className="relative z-10 grid grid-cols-[1fr_auto_1fr_auto_1fr] gap-2">
            {/* Column 1: Data Sources */}
            <div ref={col1Ref} className="glass-card p-5" style={{ borderColor: 'rgba(0, 229, 255, 0.08)' }}>
              <ColHeader label="DATA COLLECTION" color="#00E5FF" count={7} />
              <div className="space-y-1">
                {SOURCES.map(s => (
                  <div key={s.label} data-node><PipelineNode item={s} /></div>
                ))}
              </div>
            </div>

            <ColArrow color="#00E5FF" />

            {/* Column 2: Strategy */}
            <div ref={col2Ref} className="glass-card p-5" style={{ borderColor: 'rgba(139, 92, 246, 0.08)' }}>
              <ColHeader label="STRATEGY & ANALYSIS" color="#8B5CF6" count={5} />
              <div className="space-y-1">
                {STRATEGIES.map(s => (
                  <div key={s.label} data-node><PipelineNode item={s} /></div>
                ))}
              </div>
            </div>

            <ColArrow color="#8B5CF6" />

            {/* Column 3: Output */}
            <div ref={col3Ref} className="glass-card p-5" style={{ borderColor: 'rgba(255, 209, 102, 0.08)' }}>
              <ColHeader label="OUTPUT SCENARIOS" color="#FFD166" count={5} />
              <div className="space-y-1">
                {SCENARIOS.map(s => (
                  <div key={s.label} data-node><PipelineNode item={s} /></div>
                ))}
              </div>
            </div>
          </div>

          {/* Converge zone */}
          <div className="relative z-10 flex items-center justify-center gap-3 py-5">
            <div className="h-[1px] w-20" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,215,126,0.25))' }} />
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="flex items-center gap-2"
            >
              <svg width="10" height="16" viewBox="0 0 10 16"><path d="M1 1 L5 8 L9 1" stroke="#00D77E60" strokeWidth="1.5" fill="none" strokeLinecap="round" /><path d="M1 8 L5 15 L9 8" stroke="#00D77E40" strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg>
              <span className="text-[9px] font-mono font-bold tracking-widest" style={{ color: '#00D77E80' }}>ALL LAYERS → YOU</span>
              <svg width="10" height="16" viewBox="0 0 10 16"><path d="M1 1 L5 8 L9 1" stroke="#00D77E60" strokeWidth="1.5" fill="none" strokeLinecap="round" /><path d="M1 8 L5 15 L9 8" stroke="#00D77E40" strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg>
            </motion.div>
            <div className="h-[1px] w-20" style={{ background: 'linear-gradient(90deg, rgba(0,215,126,0.25), transparent)' }} />
          </div>

          {/* User tools — horizontal */}
          <div ref={userRef} className="relative z-10 glass-card p-5" style={{ borderColor: 'rgba(0, 215, 126, 0.1)' }}>
            <div className="text-center mb-4 pb-2" style={{ borderBottom: '1px solid rgba(0,215,126,0.1)' }}>
              <div className="flex items-center justify-center gap-2 mb-0.5">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00D77E', boxShadow: '0 0 6px #00D77E' }} />
                <span className="text-[10px] font-mono font-bold tracking-widest text-[var(--color-success)]">YOUR TOOLS</span>
              </div>
              <span className="text-[8px] font-mono text-[var(--text-muted)]">Everything you need to trade with edge</span>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {USER_OUTPUTS.map(s => (
                <div key={s.label} data-node className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${s.color}15, ${s.color}08)`,
                        border: `1px solid ${s.color}30`,
                        boxShadow: `0 2px 16px ${s.color}15`,
                      }}
                    >
                      <s.Icon size={22} strokeWidth={1.6} color={s.color} />
                    </div>
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full animate-pulse"
                      style={{ background: s.color, boxShadow: `0 0 4px ${s.color}` }} />
                  </div>
                  <span className="text-[10px] font-mono font-medium text-center" style={{ color: `${s.color}BB` }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom stats */}
        <div className="flex items-center justify-center gap-10 mt-6 py-4 border-t border-[var(--border-default)]">
          {[
            { label: 'Data Sources', value: '7 × 13K feeds', color: '#00E5FF' },
            { label: 'AI Strategies', value: '5 models', color: '#8B5CF6' },
            { label: 'Scenarios', value: '5 outputs', color: '#FFD166' },
            { label: 'Latency', value: '<200ms e2e', color: '#00D77E' },
          ].map(m => (
            <div key={m.label} className="text-center">
              <p className="text-xs font-mono font-bold" style={{ color: m.color }}>{m.value}</p>
              <p className="text-[8px] font-mono text-[var(--text-muted)] uppercase tracking-wider mt-0.5">{m.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
