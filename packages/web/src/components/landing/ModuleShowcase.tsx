'use client'
import { motion } from 'framer-motion'

const modules = [
  {
    title: 'Market Scanner',
    desc: 'Real-time scanning of 1,200+ markets across Polymarket, Kalshi, and more. Instant edge detection with AI fair value.',
    icon: '🔍',
    color: '#00E5FF',
    tier: 'FREE',
    stats: [
      { label: 'Markets', value: '1,200+' },
      { label: 'Refresh', value: '<1s' },
    ],
  },
  {
    title: 'Signal Board',
    desc: 'AI-generated trading signals with confidence scores, Kelly sizing, and multi-model ensemble agreement.',
    icon: '📡',
    color: '#8B5CF6',
    tier: 'PRO',
    stats: [
      { label: 'Signals/day', value: '340+' },
      { label: 'Win Rate', value: '68%' },
    ],
  },
  {
    title: 'Arbitrage Engine',
    desc: 'Cross-platform price discrepancy detection. Auto-calculate risk-free returns across prediction markets.',
    icon: '⚡',
    color: '#FFD166',
    tier: 'PRO+',
    stats: [
      { label: 'Platforms', value: '4' },
      { label: 'Avg Spread', value: '2.3%' },
    ],
  },
  {
    title: 'Trading Bot',
    desc: 'Fully automated execution. Kelly-optimal sizing, portfolio constraints, and real-time risk management.',
    icon: '🤖',
    color: '#00D77E',
    tier: 'ENTERPRISE',
    stats: [
      { label: 'Execution', value: '<50ms' },
      { label: 'Uptime', value: '99.9%' },
    ],
  },
]

const tierColors: Record<string, string> = {
  FREE: '#00D77E',
  PRO: '#8B5CF6',
  'PRO+': '#FFD166',
  ENTERPRISE: '#00E5FF',
}

export function ModuleShowcase() {
  return (
    <section className="py-24 px-6 relative" id="modules">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold">
            Modular Intelligence{' '}
            <span className="bg-gradient-to-r from-[var(--brand-secondary)] to-[var(--brand-accent)] bg-clip-text text-transparent">
              Stack
            </span>
          </h2>
          <p className="mt-3 text-sm text-[var(--text-secondary)] font-mono">
            Use what you need. Each module works independently.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4">
          {modules.map((mod, i) => (
            <motion.div
              key={mod.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -3, scale: 1.01 }}
              className="glow-card p-6 group cursor-pointer"
              style={{ borderColor: `${mod.color}10` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                    style={{ background: `${mod.color}08`, border: `1px solid ${mod.color}15` }}>
                    {mod.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-display font-semibold">{mod.title}</h3>
                    <span className="text-[8px] font-mono font-bold px-2 py-0.5 rounded tracking-widest"
                      style={{ background: `${tierColors[mod.tier]}10`, color: tierColors[mod.tier], border: `1px solid ${tierColors[mod.tier]}20` }}>
                      {mod.tier}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">{mod.desc}</p>

              <div className="flex gap-4">
                {mod.stats.map(s => (
                  <div key={s.label}>
                    <p className="text-[8px] font-mono text-[var(--text-muted)] uppercase tracking-wider">{s.label}</p>
                    <p className="text-sm font-mono font-bold" style={{ color: mod.color }}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Bottom line glow */}
              <div className="absolute bottom-0 left-6 right-6 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(90deg, transparent, ${mod.color}40, transparent)` }} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
