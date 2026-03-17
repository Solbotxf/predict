'use client'
import { motion } from 'framer-motion'

const steps = [
  { num: '01', title: 'Collect', desc: 'Multi-source real-time data from Polymarket, Kalshi, news, social media, and on-chain.', icon: '📥' },
  { num: '02', title: 'Analyze', desc: 'AI + statistical algorithms process data to estimate true probabilities and detect edges.', icon: '🧠' },
  { num: '03', title: 'Signal', desc: 'Get actionable trading signals with confidence scores and Kelly-optimal position sizing.', icon: '🎯' },
]

export function HowItWorks() {
  return (
    <section className="py-24 px-6 border-t border-[var(--border-default)]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold">How It Works</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="text-center"
            >
              <div className="text-4xl mb-4">{step.icon}</div>
              <div className="text-xs font-mono text-[var(--brand-primary)] mb-2">{step.num}</div>
              <h3 className="text-xl font-semibold">{step.title}</h3>
              <p className="text-[var(--text-secondary)] mt-2 text-sm leading-relaxed">{step.desc}</p>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute right-0 top-1/2 text-[var(--text-muted)]">→</div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
