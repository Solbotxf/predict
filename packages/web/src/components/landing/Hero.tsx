'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useState } from 'react'

function LiveTicker() {
  const tickers = [
    { label: 'Fed Rate Cut', price: 71.0, edge: 9.9, dir: 'up' },
    { label: 'S&P > 6K', price: 63.0, edge: 11.1, dir: 'up' },
    { label: 'BTC > $100K', price: 45.2, edge: -6.7, dir: 'down' },
    { label: 'US Recession', price: 28.1, edge: -21.4, dir: 'down' },
    { label: 'Election GOP', price: 52.3, edge: -7.7, dir: 'down' },
    { label: 'AGI < 2028', price: 12.0, edge: -33.3, dir: 'down' },
  ]

  return (
    <div className="overflow-hidden py-3 border-y border-[var(--border-default)]">
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      >
        {[...tickers, ...tickers].map((t, i) => (
          <div key={i} className="flex items-center gap-3 text-xs font-mono">
            <span className="text-[var(--text-muted)]">{t.label}</span>
            <span className="text-[var(--text-primary)] font-bold">{t.price.toFixed(1)}¢</span>
            <span className={t.dir === 'up' ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}>
              {t.dir === 'up' ? '▲' : '▼'} {Math.abs(t.edge).toFixed(1)}%
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}

function FloatingParticles() {
  const [particles, setParticles] = useState<Array<{id:number;x:number;y:number;size:number;duration:number;delay:number;color:string}>>([])

  useEffect(() => {
    setParticles(
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 1 + Math.random() * 2,
        duration: 3 + Math.random() * 4,
        delay: Math.random() * 3,
        color: ['#8B5CF6', '#00E5FF', '#00D77E', '#FFD166'][Math.floor(Math.random() * 4)],
      }))
    )
  }, [])

  if (particles.length === 0) return null

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}60`,
          }}
          animate={{
            y: [-10, -30, -10],
            opacity: [0, 0.7, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

export function Hero() {
  const [count, setCount] = useState(1247)
  useEffect(() => {
    const interval = setInterval(() => setCount(c => c + Math.floor(Math.random() * 3)), 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <section className="relative min-h-[90vh] flex flex-col justify-center overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,229,255,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,229,255,0.3) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />
        <FloatingParticles />

        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-[var(--brand-primary)] opacity-[0.03] blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[var(--brand-accent)] opacity-[0.04] blur-[100px]" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-24">
          {/* Status bar */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 rounded-full px-4 py-1.5 text-xs font-mono mb-8"
            style={{ background: 'rgba(0, 215, 126, 0.06)', border: '1px solid rgba(0, 215, 126, 0.15)' }}
          >
            <span className="pulse-dot" style={{ width: 6, height: 6 }} />
            <span className="text-[var(--color-success)]">SYSTEM ONLINE</span>
            <span className="text-[var(--text-muted)]">·</span>
            <span className="text-[var(--text-secondary)]">{count.toLocaleString()} events/min</span>
            <span className="text-[var(--text-muted)]">·</span>
            <span className="text-[var(--text-secondary)]">8 markets tracked</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-display font-bold leading-[0.95] tracking-tight"
          >
            <span className="text-[var(--text-primary)]">Prediction Markets</span>
            <br />
            <span className="bg-gradient-to-r from-[var(--brand-accent)] via-[var(--brand-primary)] to-[var(--brand-secondary)] bg-clip-text text-transparent">
              Decoded by AI
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-base md:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed"
          >
            Real-time data pipelines. AI-powered edge detection. Kelly-optimal sizing.
            <br />
            <span className="text-[var(--text-primary)] font-medium">From raw data to trading signals in &lt;200ms.</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex items-center justify-center gap-4"
          >
            <Link
              href="/app"
              className="group inline-flex items-center gap-2 rounded-lg px-8 py-3.5 font-semibold text-white transition-all"
              style={{
                background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-accent))',
                boxShadow: '0 0 30px rgba(139, 92, 246, 0.3), 0 0 60px rgba(0, 229, 255, 0.1)',
              }}
            >
              Launch Dashboard
              <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>→</motion.span>
            </Link>
            <Link
              href="#pipeline"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-hover)] px-8 py-3.5 text-[var(--text-secondary)] hover:text-white hover:border-[var(--border-glow)] transition-all font-medium"
            >
              See It Live
            </Link>
          </motion.div>

          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16 grid grid-cols-4 gap-4 max-w-2xl mx-auto"
          >
            {[
              { label: 'Markets Tracked', value: '1,200+', color: '#8B5CF6' },
              { label: 'Avg Latency', value: '<200ms', color: '#00E5FF' },
              { label: 'Win Rate', value: '68.3%', color: '#00D77E' },
              { label: 'Daily Signals', value: '340+', color: '#FFD166' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-lg md:text-2xl font-mono font-bold" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <LiveTicker />
    </>
  )
}
