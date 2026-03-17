'use client'
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Newspaper, TrendingUp, BarChart3, Twitter, Link2, MessageSquare, Radio,
  Microscope, Brain, Zap, Activity, LineChart,
  Search, Target, ArrowLeftRight, PieChart, Shield,
  MonitorDot, Crosshair, Bot, Wifi
} from 'lucide-react'

/* ═══════════════════════════════════════════════
   Layout: 3 horizontal rows + 1 user row at bottom
   Row 1: Data Sources   (7 nodes)
   Row 2: Strategies     (5 nodes)
   Row 3: Scenarios      (5 nodes)
   ─── all converge ───
   Row 4: User           (4 nodes, centered)
   ═══════════════════════════════════════════════ */

const SOURCES = [
  { label: 'News Feeds', Icon: Newspaper, color: '#00E5FF', x: 0.07 },
  { label: 'Polymarket', Icon: TrendingUp, color: '#8B5CF6', x: 0.21 },
  { label: 'Kalshi', Icon: BarChart3, color: '#A78BFA', x: 0.35 },
  { label: 'Twitter/X', Icon: Twitter, color: '#FF9F43', x: 0.49 },
  { label: 'On-chain', Icon: Link2, color: '#00D77E', x: 0.63 },
  { label: 'Reddit', Icon: MessageSquare, color: '#FF6B6B', x: 0.77 },
  { label: 'APIs', Icon: Radio, color: '#A78BFA', x: 0.91 },
]

const STRATEGIES = [
  { label: 'Feature Extract', Icon: Microscope, color: '#00E5FF', x: 0.11 },
  { label: 'Sentiment AI', Icon: Brain, color: '#FF9F43', x: 0.30 },
  { label: 'LLM Fair Value', Icon: Activity, color: '#8B5CF6', x: 0.49 },
  { label: 'Arb Detection', Icon: Zap, color: '#FFD166', x: 0.68 },
  { label: 'Volume Analysis', Icon: LineChart, color: '#00D77E', x: 0.87 },
]

const SCENARIOS = [
  { label: 'Market Scanner', Icon: Search, color: '#00E5FF', x: 0.09 },
  { label: 'Edge Detection', Icon: Target, color: '#00D77E', x: 0.27 },
  { label: 'Arbitrage Opps', Icon: ArrowLeftRight, color: '#FFD166', x: 0.45 },
  { label: 'Win Rate', Icon: PieChart, color: '#8B5CF6', x: 0.63 },
  { label: 'Risk Mgmt', Icon: Shield, color: '#FF4B5C', x: 0.81 },
]

const USER_OUTPUTS = [
  { label: 'Real-time Feed', Icon: Wifi, color: '#00E5FF', x: 0.19 },
  { label: 'Dashboard', Icon: MonitorDot, color: '#8B5CF6', x: 0.40 },
  { label: 'Trading Signals', Icon: Crosshair, color: '#00D77E', x: 0.60 },
  { label: 'AI Trading Bot', Icon: Bot, color: '#FFD166', x: 0.81 },
]

const LAYER_Y = { sources: 0.10, strategies: 0.35, scenarios: 0.60, user: 0.88 }
const CANVAS_H = 680

/* ─── Canvas particle system ─── */
interface Particle {
  fromX: number; fromY: number
  toX: number; toY: number
  t: number; speed: number
  color: string; size: number
  trail: Array<{ x: number; y: number }>
}

function FlowCanvas({ width }: { width: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const particlesRef = useRef<Particle[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || width === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const h = CANVAS_H
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = h * dpr
    ctx.scale(dpr, dpr)

    const particles = particlesRef.current

    const bezier = (fx: number, fy: number, tx: number, ty: number, t: number): [number, number] => {
      const my = (fy + ty) / 2
      const u = 1 - t
      return [
        u * u * u * fx + 3 * u * u * t * fx + 3 * u * t * t * tx + t * t * t * tx,
        u * u * u * fy + 3 * u * u * t * my + 3 * u * t * t * my + t * t * t * ty,
      ]
    }

    const allLayers = [
      { items: SOURCES, y: LAYER_Y.sources },
      { items: STRATEGIES, y: LAYER_Y.strategies },
      { items: SCENARIOS, y: LAYER_Y.scenarios },
      { items: USER_OUTPUTS, y: LAYER_Y.user },
    ]

    const spawn = () => {
      const layerIdx = Math.random() < 0.35 ? 0 : Math.random() < 0.55 ? 1 : 2
      const from = allLayers[layerIdx].items[Math.floor(Math.random() * allLayers[layerIdx].items.length)]
      const to = allLayers[layerIdx + 1].items[Math.floor(Math.random() * allLayers[layerIdx + 1].items.length)]
      particles.push({
        fromX: from.x * width, fromY: allLayers[layerIdx].y * h + 20,
        toX: to.x * width, toY: allLayers[layerIdx + 1].y * h - 20,
        t: 0, speed: 0.006 + Math.random() * 0.014,
        color: from.color, size: 1.2 + Math.random() * 1.8,
        trail: [],
      })
    }

    let frame = 0
    const animate = () => {
      ctx.clearRect(0, 0, width, h)

      // Faint connection lines
      ctx.lineWidth = 0.4
      for (let li = 0; li < 3; li++) {
        const fromLayer = allLayers[li]
        const toLayer = allLayers[li + 1]
        for (const fi of fromLayer.items) {
          for (const ti of toLayer.items) {
            ctx.beginPath()
            ctx.strokeStyle = `${fi.color}05`
            const fx = fi.x * width, fy = fromLayer.y * h + 20
            const tx = ti.x * width, ty = toLayer.y * h - 20
            const my = (fy + ty) / 2
            ctx.moveTo(fx, fy)
            ctx.bezierCurveTo(fx, my, tx, my, tx, ty)
            ctx.stroke()
          }
        }
      }

      // Spawn
      frame++
      if (frame % 2 === 0 && particles.length < 120) spawn()

      // Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.t += p.speed
        if (p.t > 1) { particles.splice(i, 1); continue }

        const [nx, ny] = bezier(p.fromX, p.fromY, p.toX, p.toY, p.t)
        p.trail.push({ x: nx, y: ny })
        if (p.trail.length > 8) p.trail.shift()

        // Trail
        for (let tr = 0; tr < p.trail.length; tr++) {
          const a = (tr / p.trail.length) * 0.35
          ctx.beginPath()
          ctx.arc(p.trail[tr].x, p.trail[tr].y, p.size * (0.3 + (tr / p.trail.length) * 0.7), 0, Math.PI * 2)
          ctx.fillStyle = `${p.color}${Math.floor(a * 255).toString(16).padStart(2, '0')}`
          ctx.fill()
        }

        // Glow
        ctx.beginPath()
        ctx.arc(nx, ny, p.size * 4, 0, Math.PI * 2)
        ctx.fillStyle = `${p.color}0C`
        ctx.fill()

        // Core
        ctx.beginPath()
        ctx.arc(nx, ny, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `${p.color}EE`
        ctx.fill()
      }

      animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [width])

  return <canvas ref={canvasRef} style={{ width, height: CANVAS_H }} className="absolute inset-0" />
}

/* ─── Styled node component ─── */
function PipelineNode({ item, style }: {
  item: { label: string; Icon: any; color: string }
  style?: React.CSSProperties
}) {
  const { Icon, label, color } = item
  return (
    <motion.div
      whileHover={{ scale: 1.08, y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className="flex flex-col items-center gap-1.5 cursor-pointer group"
      style={style}
    >
      {/* Icon container — rounded square with glow */}
      <div className="relative">
        {/* Glow ring */}
        <div className="absolute -inset-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: `radial-gradient(circle, ${color}20, transparent)` }} />

        <div className="relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200"
          style={{
            background: `linear-gradient(135deg, ${color}12, ${color}06)`,
            border: `1px solid ${color}25`,
            boxShadow: `0 2px 12px ${color}10`,
          }}
        >
          <Icon size={18} strokeWidth={1.8} color={color} className="relative z-10" />

          {/* Subtle inner shine */}
          <div className="absolute inset-0 rounded-xl overflow-hidden">
            <div className="absolute -top-1/2 -left-1/2 w-full h-full rotate-12 opacity-10"
              style={{ background: `linear-gradient(180deg, ${color}, transparent)` }} />
          </div>
        </div>

        {/* Activity indicator */}
        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full animate-pulse"
          style={{ background: color, boxShadow: `0 0 4px ${color}` }} />
      </div>

      <span className="text-[9px] font-mono font-medium text-center leading-tight tracking-wide max-w-[70px]"
        style={{ color: `${color}AA` }}>
        {label}
      </span>
    </motion.div>
  )
}

/* ─── Layer label ─── */
function LayerBadge({ label, color, desc }: { label: string; color: string; desc: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="h-[1px] flex-1" style={{ background: `linear-gradient(90deg, transparent, ${color}15)` }} />
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
        <span className="text-[10px] font-mono font-bold tracking-widest" style={{ color: `${color}80` }}>{label}</span>
        <span className="text-[9px] font-mono text-[var(--text-muted)]">— {desc}</span>
      </div>
      <div className="h-[1px] flex-1" style={{ background: `linear-gradient(90deg, ${color}15, transparent)` }} />
    </div>
  )
}

/* ─── Convergence arrow zone ─── */
function ConvergeArrow({ color }: { color: string }) {
  return (
    <div className="flex justify-center py-3">
      <motion.div
        animate={{ y: [0, 4, 0], opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="flex flex-col items-center gap-0"
      >
        <div className="w-[1px] h-4" style={{ background: `linear-gradient(to bottom, transparent, ${color}40)` }} />
        <svg width="12" height="8" viewBox="0 0 12 8">
          <path d="M1 1 L6 6 L11 1" stroke={`${color}60`} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      </motion.div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════ */
export function PipelineFlow() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerW, setContainerW] = useState(0)

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) setContainerW(containerRef.current.getBoundingClientRect().width)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
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

        {/* Canvas + HTML overlay */}
        <div ref={containerRef} className="relative" style={{ height: CANVAS_H }}>
          {containerW > 0 && <FlowCanvas width={containerW} />}

          {/* Layer 1: Data Sources */}
          <div className="absolute left-0 right-0" style={{ top: 0 }}>
            <LayerBadge label="DATA COLLECTION" color="#00E5FF" desc="Real-time multi-source ingestion" />
            <div className="flex justify-around px-2">
              {SOURCES.map(s => <PipelineNode key={s.label} item={s} />)}
            </div>
          </div>

          {/* Layer 2: Strategies */}
          <div className="absolute left-0 right-0" style={{ top: CANVAS_H * 0.25 }}>
            <LayerBadge label="STRATEGY & ANALYSIS" color="#8B5CF6" desc="AI-powered signal generation" />
            <div className="flex justify-around px-8">
              {STRATEGIES.map(s => <PipelineNode key={s.label} item={s} />)}
            </div>
          </div>

          {/* Layer 3: Scenarios */}
          <div className="absolute left-0 right-0" style={{ top: CANVAS_H * 0.50 }}>
            <LayerBadge label="OUTPUT SCENARIOS" color="#FFD166" desc="Actionable market intelligence" />
            <div className="flex justify-around px-8">
              {SCENARIOS.map(s => <PipelineNode key={s.label} item={s} />)}
            </div>
          </div>

          {/* Converge arrow */}
          <div className="absolute left-0 right-0" style={{ top: CANVAS_H * 0.72 }}>
            <div className="flex items-center gap-2 justify-center">
              <div className="h-[1px] w-24" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,215,126,0.2))' }} />
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-[10px] font-mono font-bold tracking-widest" style={{ color: '#00D77E80' }}
              >
                ALL LAYERS CONVERGE TO YOU
              </motion.span>
              <div className="h-[1px] w-24" style={{ background: 'linear-gradient(90deg, rgba(0,215,126,0.2), transparent)' }} />
            </div>
            <ConvergeArrow color="#00D77E" />
          </div>

          {/* Layer 4: User outputs */}
          <div className="absolute left-0 right-0" style={{ top: CANVAS_H * 0.79 }}>
            <LayerBadge label="YOUR TOOLS" color="#00D77E" desc="Everything to trade with edge" />
            <div className="flex justify-around px-16">
              {USER_OUTPUTS.map(s => <PipelineNode key={s.label} item={s} />)}
            </div>
          </div>
        </div>

        {/* Bottom stats */}
        <div className="flex items-center justify-center gap-10 mt-2 py-4 border-t border-[var(--border-default)]">
          {[
            { label: 'Data Sources', value: '7 × 13K feeds', color: '#00E5FF' },
            { label: 'AI Strategies', value: '5 models', color: '#8B5CF6' },
            { label: 'Scenarios', value: '5 outputs', color: '#FFD166' },
            { label: 'Latency', value: '<200ms end-to-end', color: '#00D77E' },
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
