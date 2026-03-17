'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ═══════════════════════════════════════════════════
   Canvas-based animated particle flow background
   ═══════════════════════════════════════════════════ */
function FlowCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    // Define flow paths (bezier curves from left → center → right)
    const W = () => canvas.getBoundingClientRect().width
    const H = () => canvas.getBoundingClientRect().height

    interface Particle {
      path: number    // which path (0-4)
      t: number       // 0..1 progress along path
      speed: number
      size: number
      color: string
      glow: number
    }

    const colors = ['#00E5FF', '#8B5CF6', '#FF9F43', '#00D77E', '#A78BFA']
    const particles: Particle[] = []

    // Spawn particles
    const spawn = () => {
      if (particles.length < 60) {
        particles.push({
          path: Math.floor(Math.random() * 5),
          t: 0,
          speed: 0.001 + Math.random() * 0.003,
          size: 1.5 + Math.random() * 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          glow: 8 + Math.random() * 12,
        })
      }
    }

    // Get point on path
    const getPoint = (pathIdx: number, t: number, w: number, h: number): [number, number] => {
      // 5 paths: fan in from left to center, then fan out to right
      const startY = [h * 0.15, h * 0.3, h * 0.5, h * 0.7, h * 0.85][pathIdx]
      const midY = h * 0.5
      const endY = [h * 0.2, h * 0.35, h * 0.5, h * 0.65, h * 0.8][pathIdx]

      if (t <= 0.45) {
        // Left → Center (converge)
        const lt = t / 0.45
        const x = lt * w * 0.45
        const y = startY + (midY - startY) * (lt * lt) // ease in
        return [x, y]
      } else if (t <= 0.55) {
        // Center zone (processing)
        const lt = (t - 0.45) / 0.1
        const x = w * 0.45 + lt * w * 0.1
        const y = midY + Math.sin(lt * Math.PI * 3) * 8 // wiggle
        return [x, y]
      } else {
        // Center → Right (diverge)
        const lt = (t - 0.55) / 0.45
        const x = w * 0.55 + lt * w * 0.45
        const y = midY + (endY - midY) * (lt * lt) // ease in
        return [x, y]
      }
    }

    let spawnTimer = 0
    const animate = () => {
      const w = canvas.getBoundingClientRect().width
      const h = canvas.getBoundingClientRect().height
      ctx.clearRect(0, 0, w, h)

      // Draw flow paths (very subtle)
      for (let i = 0; i < 5; i++) {
        ctx.beginPath()
        ctx.strokeStyle = `${colors[i]}08`
        ctx.lineWidth = 1
        for (let t = 0; t <= 1; t += 0.01) {
          const [x, y] = getPoint(i, t, w, h)
          if (t === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
      }

      // Draw center zone glow
      const gradient = ctx.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, w * 0.15)
      gradient.addColorStop(0, 'rgba(139, 92, 246, 0.06)')
      gradient.addColorStop(1, 'transparent')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, w, h)

      // Spawn
      spawnTimer++
      if (spawnTimer % 4 === 0) spawn()

      // Update & draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.t += p.speed

        if (p.t > 1) {
          particles.splice(i, 1)
          continue
        }

        const [x, y] = getPoint(p.path, p.t, w, h)

        // Outer glow
        ctx.beginPath()
        ctx.arc(x, y, p.glow, 0, Math.PI * 2)
        ctx.fillStyle = `${p.color}08`
        ctx.fill()

        // Inner glow
        ctx.beginPath()
        ctx.arc(x, y, p.size * 2, 0, Math.PI * 2)
        ctx.fillStyle = `${p.color}30`
        ctx.fill()

        // Core
        ctx.beginPath()
        ctx.arc(x, y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `${p.color}CC`
        ctx.fill()

        // Trail
        for (let tr = 1; tr <= 4; tr++) {
          const tt = p.t - p.speed * tr * 3
          if (tt < 0) continue
          const [tx, ty] = getPoint(p.path, tt, w, h)
          ctx.beginPath()
          ctx.arc(tx, ty, p.size * (1 - tr * 0.2), 0, Math.PI * 2)
          ctx.fillStyle = `${p.color}${Math.floor(20 - tr * 5).toString(16).padStart(2, '0')}`
          ctx.fill()
        }
      }

      animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.9 }}
    />
  )
}

/* ═══════════════════════════════════════════════════
   Floating data labels that appear/disappear
   ═══════════════════════════════════════════════════ */
const dataLabels = [
  { text: 'Reuters: Fed rate cut signal', color: '#00E5FF', icon: '📰' },
  { text: 'POLY: BTC>100K @ 45.2¢', color: '#8B5CF6', icon: '📊' },
  { text: 'X: sentiment +0.34', color: '#FF9F43', icon: '🐦' },
  { text: 'Whale: 500K USDC inflow', color: '#00D77E', icon: '🐳' },
  { text: 'KALSHI: Recession @ 28.1¢', color: '#8B5CF6', icon: '📊' },
  { text: 'WSJ: CPI 2.1% YoY', color: '#00E5FF', icon: '📰' },
  { text: 'Reddit: +180 posts/hr', color: '#FF9F43', icon: '💬' },
  { text: 'API: depth $2.4M', color: '#A78BFA', icon: '🔌' },
]

const signalLabels = [
  { text: 'BUY YES Fed Rate · +9.9% edge', color: '#00D77E', icon: '🎯' },
  { text: 'ARB: Poly↔Kalshi 4.0%', color: '#FFD166', icon: '⚡' },
  { text: 'SELL BTC · bearish shift', color: '#FF4B5C', icon: '📉' },
  { text: 'BOT: Execute 8% Kelly', color: '#00E5FF', icon: '🤖' },
]

function FloatingLabels({ items, side }: { items: typeof dataLabels; side: 'left' | 'right' }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => setActiveIdx(i => (i + 1) % items.length), side === 'left' ? 1800 : 2400)
    return () => clearInterval(interval)
  }, [items.length, side])

  if (!mounted) return null

  const visible = Array.from({ length: Math.min(3, items.length) }, (_, i) => ({
    ...items[(activeIdx + i) % items.length],
    idx: i,
  }))

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {visible.map((item, i) => (
          <motion.div
            key={`${side}-${activeIdx}-${i}`}
            initial={{ opacity: 0, x: side === 'left' ? -20 : 20, scale: 0.9, filter: 'blur(4px)' }}
            animate={{ opacity: 1 - i * 0.25, x: 0, scale: 1 - i * 0.02, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="flex items-center gap-2 text-[11px] font-mono px-3 py-2 rounded-md whitespace-nowrap"
            style={{
              background: `linear-gradient(${side === 'left' ? '90deg' : '270deg'}, ${item.color}0A, transparent)`,
              border: `1px solid ${item.color}12`,
              [side === 'left' ? 'borderLeft' : 'borderRight']: `2px solid ${item.color}50`,
            }}
          >
            <span className="text-sm">{item.icon}</span>
            <span style={{ color: `${item.color}CC` }}>{item.text}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   Central node visualization
   ═══════════════════════════════════════════════════ */
function CentralNode() {
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer ring - pulsing */}
      <motion.div
        className="absolute w-32 h-32 rounded-full"
        style={{ border: '1px solid rgba(139, 92, 246, 0.15)' }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-24 h-24 rounded-full"
        style={{ border: '1px solid rgba(0, 229, 255, 0.2)' }}
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Core */}
      <div className="relative w-16 h-16 rounded-full flex items-center justify-center z-10"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2), rgba(6, 7, 16, 0.9))',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          boxShadow: '0 0 40px rgba(139, 92, 246, 0.2), inset 0 0 20px rgba(139, 92, 246, 0.1)',
        }}
      >
        <span className="text-2xl">🧠</span>
      </div>

      {/* Labels around the core */}
      <div className="absolute -bottom-10 text-center">
        <p className="text-[10px] font-mono font-bold text-[var(--brand-primary)] tracking-widest">AI ENGINE</p>
        <p className="text-[8px] font-mono text-[var(--text-muted)]">4 models · 68.3% accuracy</p>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   Main Pipeline Flow Section
   ═══════════════════════════════════════════════════ */
export function PipelineFlow() {
  return (
    <section className="py-24 px-6 relative overflow-hidden" id="pipeline">
      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6"
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
            Watch Your Data{' '}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-[var(--brand-accent)] via-[var(--brand-primary)] to-[var(--color-success)] bg-clip-text text-transparent">
                Flow in Real-Time
              </span>
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
        </div>

        {/* ───── THE VISUALIZATION ───── */}
        <div className="relative mt-8" style={{ height: '520px' }}>
          {/* Canvas particle flow (the hero visual) */}
          <FlowCanvas />

          {/* Overlay: Left labels (data sources) */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-64">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-[9px] font-mono font-bold text-[var(--brand-accent)] uppercase tracking-widest">Data Sources</span>
              <span className="badge-live text-[8px]"><span className="pulse-dot" style={{ width: 4, height: 4 }} /> 5 FEEDS</span>
            </div>
            <FloatingLabels items={dataLabels} side="left" />

            {/* Source badges */}
            <div className="flex flex-wrap gap-1 mt-3">
              {['News 435+', 'Markets 1.2K', 'Social 12K', 'Chain 8', 'API 24'].map(s => {
                const c = s.startsWith('News') ? '#00E5FF' : s.startsWith('Mar') ? '#8B5CF6' : s.startsWith('Soc') ? '#FF9F43' : s.startsWith('Ch') ? '#00D77E' : '#A78BFA'
                return (
                  <span key={s} className="text-[8px] font-mono px-1.5 py-0.5 rounded"
                    style={{ background: `${c}08`, border: `1px solid ${c}12`, color: `${c}99` }}>
                    {s}
                  </span>
                )
              })}
            </div>
          </div>

          {/* Overlay: Center node */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <CentralNode />
          </div>

          {/* Processing stage labels (around center) */}
          <div className="absolute left-1/2 -translate-x-1/2 z-10" style={{ top: '60px' }}>
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md"
              style={{ background: 'rgba(0, 229, 255, 0.06)', border: '1px solid rgba(0, 229, 255, 0.1)' }}
            >
              <span className="text-sm">📥</span>
              <span className="text-[9px] font-mono font-bold text-[var(--brand-accent)] tracking-widest">INGEST</span>
              <span className="text-[8px] font-mono text-[var(--text-muted)]">1,247/min</span>
            </motion.div>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 z-10" style={{ bottom: '60px' }}>
            <motion.div
              animate={{ y: [0, 3, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md"
              style={{ background: 'rgba(0, 215, 126, 0.06)', border: '1px solid rgba(0, 215, 126, 0.1)' }}
            >
              <span className="text-sm">🎯</span>
              <span className="text-[9px] font-mono font-bold text-[var(--color-success)] tracking-widest">SIGNAL GEN</span>
              <span className="text-[8px] font-mono text-[var(--text-muted)]">47 signals/hr</span>
            </motion.div>
          </div>

          {/* Overlay: Right labels (signals/output) */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-60">
            <div className="mb-3 flex items-center gap-2 justify-end">
              <span className="text-[9px] font-mono font-bold text-[var(--color-success)] uppercase tracking-widest">Signals</span>
              <span className="badge-live text-[8px]"><span className="pulse-dot" style={{ width: 4, height: 4 }} /> AUTO</span>
            </div>
            <FloatingLabels items={signalLabels} side="right" />

            {/* Bot status */}
            <motion.div
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="mt-3 p-2.5 rounded-md text-right"
              style={{ background: 'rgba(0, 229, 255, 0.04)', border: '1px solid rgba(0, 229, 255, 0.08)' }}
            >
              <div className="flex items-center justify-end gap-1.5 mb-1">
                <span className="text-[8px] font-mono font-bold text-[var(--brand-accent)] tracking-widest">TRADING BOT</span>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00D77E', boxShadow: '0 0 6px #00D77E' }} />
              </div>
              <p className="text-sm font-mono font-bold text-[var(--color-success)]">+$2,847 today</p>
              <p className="text-[8px] font-mono text-[var(--text-muted)]">12 positions · 71% win</p>
            </motion.div>
          </div>

          {/* Bottom metrics bar */}
          <div className="absolute bottom-0 left-0 right-0 z-10">
            <div className="flex items-center justify-center gap-8 py-3 border-t border-[var(--border-default)]"
              style={{ background: 'linear-gradient(to top, var(--bg-primary), transparent)' }}>
              {[
                { label: 'Total Latency', value: '<200ms', color: '#00D77E' },
                { label: 'Events/min', value: '1,247', color: '#00E5FF' },
                { label: 'Models Active', value: '4', color: '#8B5CF6' },
                { label: 'Edge Detected', value: '6.2% avg', color: '#FFD166' },
              ].map(m => (
                <div key={m.label} className="text-center">
                  <p className="text-[8px] font-mono text-[var(--text-muted)] uppercase tracking-wider">{m.label}</p>
                  <p className="text-xs font-mono font-bold" style={{ color: m.color }}>{m.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
