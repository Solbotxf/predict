'use client'
import { motion } from 'framer-motion'
import { GlassCard } from '../shared/GlassCard'

const modules = [
  {
    icon: '🔍',
    title: 'Market Scanner',
    desc: 'Real-time monitoring of all prediction markets. Filter by edge, volume, category.',
    tier: 'Free',
    tierColor: 'text-emerald-400 bg-emerald-400/10',
  },
  {
    icon: '📡',
    title: 'Signal Engine',
    desc: 'AI-powered probability estimation. Get fair value + edge for every market.',
    tier: 'Pro',
    tierColor: 'text-purple-400 bg-purple-400/10',
  },
  {
    icon: '⚡',
    title: 'Arbitrage Detector',
    desc: 'Cross-platform price discrepancies. Spot risk-free profit opportunities.',
    tier: 'Pro+',
    tierColor: 'text-amber-400 bg-amber-400/10',
  },
  {
    icon: '🧪',
    title: 'Backtest Engine',
    desc: 'Validate strategies with historical data. Know your real edge before trading.',
    tier: 'Pro',
    tierColor: 'text-purple-400 bg-purple-400/10',
  },
]

export function ModuleShowcase() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold">
            Modular Tools, <span className="text-[var(--brand-primary)]">Your Choice</span>
          </h2>
          <p className="mt-4 text-[var(--text-secondary)] max-w-xl mx-auto">
            Pick the tools you need. Each module works standalone or together as a complete suite.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((mod, i) => (
            <motion.div
              key={mod.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <GlassCard variant="interactive" glow="primary" className="h-full">
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{mod.icon}</span>
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${mod.tierColor}`}>
                    {mod.tier}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mt-4">{mod.title}</h3>
                <p className="text-[var(--text-secondary)] mt-2 text-sm leading-relaxed">{mod.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
