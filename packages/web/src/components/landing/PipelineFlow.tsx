'use client'
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

/* ═══════════════════════════════════════════════════
   Full-page Canvas: 4-layer data flow visualization
   Layer 1: Data Sources (top)
   Layer 2: Strategy & Analysis Pipeline (middle-top)
   Layer 3: Output Scenarios (middle-bottom)
   Layer 4: User Value (bottom)
   ═══════════════════════════════════════════════════ */

// ─── Layout constants (fractions of canvas width/height) ───
const SOURCES = [
  { label: 'News Feeds', icon: '📰', color: '#00E5FF', x: 0.08 },
  { label: 'Polymarket', icon: '🔮', color: '#8B5CF6', x: 0.22 },
  { label: 'Kalshi', icon: '📊', color: '#A78BFA', x: 0.36 },
  { label: 'Twitter/X', icon: '🐦', color: '#FF9F43', x: 0.50 },
  { label: 'On-chain', icon: '⛓️', color: '#00D77E', x: 0.64 },
  { label: 'Reddit', icon: '💬', color: '#FF6B6B', x: 0.78 },
  { label: 'APIs', icon: '🔌', color: '#A78BFA', x: 0.92 },
]

const STRATEGIES = [
  { label: 'Feature\nExtraction', icon: '🔬', color: '#00E5FF', x: 0.12 },
  { label: 'Sentiment\nAnalysis', icon: '💭', color: '#FF9F43', x: 0.30 },
  { label: 'LLM Fair\nValue', icon: '🧠', color: '#8B5CF6', x: 0.50 },
  { label: 'Arbitrage\nDetection', icon: '⚡', color: '#FFD166', x: 0.70 },
  { label: 'Volume\nAnalysis', icon: '📈', color: '#00D77E', x: 0.88 },
]

const SCENARIOS = [
  { label: 'Market\nScanner', icon: '🔍', color: '#00E5FF', x: 0.10 },
  { label: 'Edge\nDetection', icon: '🎯', color: '#00D77E', x: 0.28 },
  { label: 'Arbitrage\nOpportunities', icon: '💱', color: '#FFD166', x: 0.46 },
  { label: 'Win Rate\nAnalysis', icon: '📊', color: '#8B5CF6', x: 0.64 },
  { label: 'Risk\nManagement', icon: '🛡️', color: '#FF4B5C', x: 0.82 },
]

const USER_OUTPUTS = [
  { label: 'Real-time\nData Feed', icon: '📡', color: '#00E5FF', x: 0.14 },
  { label: 'Dashboard\nMonitoring', icon: '🖥️', color: '#8B5CF6', x: 0.34 },
  { label: 'Trading\nSignals', icon: '🎯', color: '#00D77E', x: 0.54 },
  { label: 'AI Trading\nBot', icon: '🤖', color: '#FFD166', x: 0.74 },
]

// Y positions for each layer (fraction of total height)
const LAYER_Y = { sources: 0.06, strategies: 0.32, scenarios: 0.58, user: 0.82 }
const NODE_RADIUS = 22

interface Particle {
  x: number; y: number
  targetX: number; targetY: number
  fromX: number; fromY: number
  t: number; speed: number
  color: string; size: number; glow: number
  layer: number // 0=src→strat, 1=strat→scen, 2=scen→user
  trail: Array<{x: number; y: number}>
}

function FlowCanvas({ width, height }: { width: number; height: number }) {
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

    // Bezier interpolation with curve
    const bezierPoint = (fromX: number, fromY: number, toX: number, toY: number, t: number): [number, number] => {
      // Control points create a nice S-curve
      const midY = (fromY + toY) / 2
      const cx1 = fromX
      const cy1 = midY - (toY - fromY) * 0.1
      const cx2 = toX
      const cy2 = midY + (toY - fromY) * 0.1

      const u = 1 - t
      const x = u*u*u*fromX + 3*u*u*t*cx1 + 3*u*t*t*cx2 + t*t*t*toX
      const y = u*u*u*fromY + 3*u*u*t*cy1 + 3*u*t*t*cy2 + t*t*t*toY
      return [x, y]
    }

    const spawnParticle = () => {
      const layer = Math.random() < 0.4 ? 0 : Math.random() < 0.6 ? 1 : 2
      let fromNode: typeof SOURCES[0], toNode: typeof STRATEGIES[0]

      if (layer === 0) {
        fromNode = SOURCES[Math.floor(Math.random() * SOURCES.length)]
        toNode = STRATEGIES[Math.floor(Math.random() * STRATEGIES.length)]
      } else if (layer === 1) {
        fromNode = STRATEGIES[Math.floor(Math.random() * STRATEGIES.length)] as any
        toNode = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)] as any
      } else {
        fromNode = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)] as any
        toNode = USER_OUTPUTS[Math.floor(Math.random() * USER_OUTPUTS.length)] as any
      }

      const fromY = layer === 0 ? LAYER_Y.sources : layer === 1 ? LAYER_Y.strategies : LAYER_Y.scenarios
      const toY = layer === 0 ? LAYER_Y.strategies : layer === 1 ? LAYER_Y.scenarios : LAYER_Y.user

      particles.push({
        fromX: fromNode.x * width, fromY: fromY * height + NODE_RADIUS,
        targetX: toNode.x * width, targetY: toY * height - NODE_RADIUS,
        x: fromNode.x * width, y: fromY * height + NODE_RADIUS,
        t: 0,
        speed: 0.008 + Math.random() * 0.012,
        color: fromNode.color,
        size: 1.5 + Math.random() * 1.5,
        glow: 6 + Math.random() * 10,
        layer,
        trail: [],
      })
    }

    // Draw a node (icon placeholder = circle + glow)
    const drawNode = (x: number, y: number, color: string, isActive: boolean) => {
      // Outer glow
      const grad = ctx.createRadialGradient(x, y, 0, x, y, NODE_RADIUS * 1.8)
      grad.addColorStop(0, `${color}15`)
      grad.addColorStop(1, 'transparent')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(x, y, NODE_RADIUS * 1.8, 0, Math.PI * 2)
      ctx.fill()

      // Border ring
      ctx.beginPath()
      ctx.arc(x, y, NODE_RADIUS, 0, Math.PI * 2)
      ctx.strokeStyle = `${color}40`
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Fill
      ctx.beginPath()
      ctx.arc(x, y, NODE_RADIUS - 2, 0, Math.PI * 2)
      ctx.fillStyle = `${color}0D`
      ctx.fill()

      // Inner bright dot
      if (isActive) {
        ctx.beginPath()
        ctx.arc(x, y, 3, 0, Math.PI * 2)
        ctx.fillStyle = `${color}AA`
        ctx.fill()
      }
    }

    // Draw faint connection lines
    const drawConnections = () => {
      ctx.lineWidth = 0.5

      // Sources → Strategies
      for (const src of SOURCES) {
        for (const strat of STRATEGIES) {
          ctx.beginPath()
          ctx.strokeStyle = `${src.color}06`
          const fx = src.x * width, fy = LAYER_Y.sources * height + NODE_RADIUS
          const tx = strat.x * width, ty = LAYER_Y.strategies * height - NODE_RADIUS
          const midY = (fy + ty) / 2
          ctx.moveTo(fx, fy)
          ctx.bezierCurveTo(fx, midY, tx, midY, tx, ty)
          ctx.stroke()
        }
      }

      // Strategies → Scenarios
      for (const strat of STRATEGIES) {
        for (const scen of SCENARIOS) {
          ctx.beginPath()
          ctx.strokeStyle = `${strat.color}05`
          const fx = strat.x * width, fy = LAYER_Y.strategies * height + NODE_RADIUS
          const tx = scen.x * width, ty = LAYER_Y.scenarios * height - NODE_RADIUS
          const midY = (fy + ty) / 2
          ctx.moveTo(fx, fy)
          ctx.bezierCurveTo(fx, midY, tx, midY, tx, ty)
          ctx.stroke()
        }
      }

      // Scenarios → User
      for (const scen of SCENARIOS) {
        for (const usr of USER_OUTPUTS) {
          ctx.beginPath()
          ctx.strokeStyle = `${scen.color}05`
          const fx = scen.x * width, fy = LAYER_Y.scenarios * height + NODE_RADIUS
          const tx = usr.x * width, ty = LAYER_Y.user * height - NODE_RADIUS
          const midY = (fy + ty) / 2
          ctx.moveTo(fx, fy)
          ctx.bezierCurveTo(fx, midY, tx, midY, tx, ty)
          ctx.stroke()
        }
      }
    }

    let frame = 0
    const animate = () => {
      ctx.clearRect(0, 0, width, height)

      // Background dot grid
      ctx.fillStyle = 'rgba(0, 229, 255, 0.015)'
      for (let gx = 0; gx < width; gx += 30) {
        for (let gy = 0; gy < height; gy += 30) {
          ctx.fillRect(gx, gy, 1, 1)
        }
      }

      // Draw connections
      drawConnections()

      // Draw layer labels
      const drawLayerLabel = (text: string, y: number, color: string) => {
        ctx.font = '600 9px monospace'
        ctx.fillStyle = `${color}50`
        ctx.textAlign = 'left'
        ctx.letterSpacing = '2px'
        ctx.fillText(text, 8, y * height - NODE_RADIUS - 8)
      }
      drawLayerLabel('DATA SOURCES', LAYER_Y.sources, '#00E5FF')
      drawLayerLabel('STRATEGY & ANALYSIS', LAYER_Y.strategies, '#8B5CF6')
      drawLayerLabel('OUTPUT SCENARIOS', LAYER_Y.scenarios, '#FFD166')
      drawLayerLabel('USER VALUE', LAYER_Y.user, '#00D77E')

      // Draw nodes
      const allLayers = [
        { items: SOURCES, y: LAYER_Y.sources },
        { items: STRATEGIES, y: LAYER_Y.strategies },
        { items: SCENARIOS, y: LAYER_Y.scenarios },
        { items: USER_OUTPUTS, y: LAYER_Y.user },
      ]

      for (const layer of allLayers) {
        for (const item of layer.items) {
          drawNode(item.x * width, layer.y * height, item.color, true)
        }
      }

      // Spawn particles
      frame++
      if (frame % 3 === 0 && particles.length < 100) {
        spawnParticle()
      }

      // Update & draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.t += p.speed

        if (p.t > 1) {
          particles.splice(i, 1)
          continue
        }

        const [nx, ny] = bezierPoint(p.fromX, p.fromY, p.targetX, p.targetY, p.t)

        // Trail
        p.trail.push({ x: p.x, y: p.y })
        if (p.trail.length > 6) p.trail.shift()

        p.x = nx
        p.y = ny

        // Draw trail
        for (let tr = 0; tr < p.trail.length; tr++) {
          const alpha = (tr / p.trail.length) * 0.3
          ctx.beginPath()
          ctx.arc(p.trail[tr].x, p.trail[tr].y, p.size * (0.5 + (tr / p.trail.length) * 0.5), 0, Math.PI * 2)
          ctx.fillStyle = `${p.color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`
          ctx.fill()
        }

        // Outer glow
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.glow, 0, Math.PI * 2)
        ctx.fillStyle = `${p.color}0A`
        ctx.fill()

        // Core
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `${p.color}DD`
        ctx.fill()
      }

      animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [width, height])

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height }}
      className="absolute inset-0"
    />
  )
}

/* ═══════════════════════════════════════════════════
   HTML overlay labels for nodes (crisp text + emoji)
   ═══════════════════════════════════════════════════ */
function NodeLabel({ item, yFrac, canvasH }: { item: { label: string; icon: string; color: string; x: number }; yFrac: number; canvasH: number }) {
  return (
    <div
      className="absolute flex flex-col items-center gap-0.5 pointer-events-none select-none"
      style={{
        left: `${item.x * 100}%`,
        top: `${yFrac * canvasH}px`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <span className="text-lg">{item.icon}</span>
      <span className="text-[8px] font-mono font-bold text-center leading-tight tracking-wider whitespace-pre-line"
        style={{ color: `${item.color}BB` }}>
        {item.label}
      </span>
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   Main export
   ═══════════════════════════════════════════════════ */
export function PipelineFlow() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dims, setDims] = useState({ w: 0, h: 0 })

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setDims({ w: rect.width, h: rect.height })
      }
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const canvasH = 750

  return (
    <section className="py-16 px-6 relative overflow-hidden" id="pipeline">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
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
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-[var(--brand-accent)] via-[var(--brand-primary)] to-[var(--color-success)] bg-clip-text text-transparent">
                Trading Profits
              </span>
              <motion.span
                className="absolute -bottom-1 left-0 h-[2px] rounded-full"
                style={{ background: 'linear-gradient(90deg, var(--brand-accent), var(--brand-primary), var(--color-success))' }}
                initial={{ width: 0 }}
                whileInView={{ width: '100%' }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.8 }}
              />
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-3 text-sm text-[var(--text-secondary)] font-mono max-w-2xl mx-auto"
          >
            Every layer is a product. Use what you need — from raw data feeds to fully automated AI trading.
          </motion.p>
        </div>

        {/* The visualization */}
        <div ref={containerRef} className="relative" style={{ height: canvasH }}>
          {dims.w > 0 && <FlowCanvas width={dims.w} height={canvasH} />}

          {/* HTML node labels overlay */}
          {SOURCES.map(s => <NodeLabel key={s.label} item={s} yFrac={LAYER_Y.sources} canvasH={canvasH} />)}
          {STRATEGIES.map(s => <NodeLabel key={s.label} item={s} yFrac={LAYER_Y.strategies} canvasH={canvasH} />)}
          {SCENARIOS.map(s => <NodeLabel key={s.label} item={s} yFrac={LAYER_Y.scenarios} canvasH={canvasH} />)}
          {USER_OUTPUTS.map(s => <NodeLabel key={s.label} item={s} yFrac={LAYER_Y.user} canvasH={canvasH} />)}

          {/* Layer divider labels (HTML for crisp rendering) */}
          {[
            { label: 'DATA COLLECTION', y: LAYER_Y.sources, color: '#00E5FF', desc: 'Real-time multi-source ingestion' },
            { label: 'STRATEGY & ANALYSIS', y: LAYER_Y.strategies, color: '#8B5CF6', desc: 'AI-powered signal generation' },
            { label: 'OUTPUT SCENARIOS', y: LAYER_Y.scenarios, color: '#FFD166', desc: 'Actionable market intelligence' },
            { label: 'YOUR TOOLS', y: LAYER_Y.user, color: '#00D77E', desc: 'Everything you need to trade with edge' },
          ].map(l => (
            <div key={l.label}
              className="absolute right-2 flex flex-col items-end pointer-events-none"
              style={{ top: l.y * canvasH - 32 }}
            >
              <span className="text-[9px] font-mono font-bold tracking-widest" style={{ color: `${l.color}70` }}>
                {l.label}
              </span>
              <span className="text-[8px] font-mono text-[var(--text-muted)]">{l.desc}</span>
            </div>
          ))}

          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[var(--bg-primary)] to-transparent pointer-events-none" />
        </div>

        {/* Bottom summary stats */}
        <div className="flex items-center justify-center gap-8 mt-4 py-4 border-t border-[var(--border-default)]">
          {[
            { label: '7 Data Sources', value: '13K+ feeds', color: '#00E5FF' },
            { label: '5 AI Strategies', value: '<200ms latency', color: '#8B5CF6' },
            { label: '5 Scenarios', value: '68% win rate', color: '#FFD166' },
            { label: 'Full Stack', value: 'Data → Profits', color: '#00D77E' },
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
