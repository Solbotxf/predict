'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-mesh">
      {/* Animated grid */}
      <div className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(139,92,246,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-glass)] bg-white/5 px-4 py-1.5 text-sm text-[var(--text-secondary)] mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live — Tracking 1,200+ prediction markets
          </div>

          <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight">
            Prediction Markets,
            <br />
            <span className="bg-gradient-to-r from-[var(--brand-primary)] via-[var(--brand-accent)] to-[var(--brand-secondary)] bg-clip-text text-transparent">
              Decoded by AI.
            </span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
            Real-time data collection + AI-powered analysis = Higher win rate for traders.
            From edge detection to position sizing, all in one platform.
          </p>

          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/app"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-8 py-3.5 text-white font-semibold hover:brightness-110 transition-all shadow-lg shadow-purple-500/25"
            >
              Start Free Trial
            </Link>
            <Link
              href="/app/scanner"
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-hover)] px-8 py-3.5 text-[var(--text-secondary)] hover:text-white hover:border-white/20 transition-all"
            >
              Watch Demo →
            </Link>
          </div>
        </motion.div>

        {/* Dashboard preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          className="mt-16 glass-card p-1 rounded-2xl shadow-2xl shadow-purple-500/10"
        >
          <div className="rounded-xl bg-[var(--bg-secondary)] p-6 min-h-[300px] flex items-center justify-center">
            <div className="grid grid-cols-3 gap-4 w-full max-w-2xl">
              {[
                { label: 'Fed Rate Cut', price: '71.0¢', edge: '+9.9%', color: 'text-emerald-400' },
                { label: 'S&P 500 > 6K', price: '63.0¢', edge: '+11.1%', color: 'text-emerald-400' },
                { label: 'BTC > $100K', price: '45.0¢', edge: '-6.7%', color: 'text-red-400' },
              ].map((item) => (
                <div key={item.label} className="glass-card p-4 text-left">
                  <p className="text-xs text-[var(--text-muted)]">{item.label}</p>
                  <p className="text-xl font-mono font-bold mt-1">{item.price}</p>
                  <p className={`text-xs font-mono mt-1 ${item.color}`}>{item.edge} edge</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
