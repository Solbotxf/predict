'use client'
import { motion } from 'framer-motion'

const steps = [
  {
    num: '01',
    title: 'Connect Data Sources',
    desc: 'Plug into 1,200+ prediction markets, news feeds, social signals, and on-chain data. Zero config for major platforms.',
    icon: '🔌',
    color: '#00E5FF',
    details: ['Polymarket', 'Kalshi', 'Reuters', 'Twitter/X', 'On-chain'],
  },
  {
    num: '02',
    title: 'AI Analyzes Everything',
    desc: 'Multi-model ensemble (LLM + statistical + sentiment) processes every data point. Finds edges humans miss.',
    icon: '🧠',
    color: '#8B5CF6',
    details: ['GPT-4 Turbo', 'Bayesian models', 'NLP sentiment', 'Volume analysis'],
  },
  {
    num: '03',
    title: 'Get Actionable Signals',
    desc: 'Receive precise trading signals with Kelly-optimal sizing. Auto-execute or review manually.',
    icon: '🎯',
    color: '#00D77E',
    details: ['Edge %', 'Kelly fraction', 'Confidence', 'Risk score'],
  },
]

export function HowItWorks() {
  return (
    <section className="py-24 px-6 relative">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold">
            Three Steps to{' '}
            <span className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-accent)] bg-clip-text text-transparent">
              Consistent Edge
            </span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              whileHover={{ y: -4 }}
              className="glass-card p-6 relative group"
            >
              {/* Number watermark */}
              <span className="absolute top-4 right-4 text-4xl font-display font-bold opacity-[0.04]"
                style={{ color: step.color }}>{step.num}</span>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                  style={{ background: `${step.color}10`, border: `1px solid ${step.color}20` }}>
                  {step.icon}
                </div>
                <span className="text-[10px] font-mono font-bold tracking-widest" style={{ color: step.color }}>
                  STEP {step.num}
                </span>
              </div>

              <h3 className="text-lg font-display font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">{step.desc}</p>

              <div className="flex flex-wrap gap-1.5">
                {step.details.map(d => (
                  <span key={d} className="text-[9px] font-mono px-2 py-0.5 rounded"
                    style={{ background: `${step.color}08`, color: `${step.color}AA`, border: `1px solid ${step.color}10` }}>
                    {d}
                  </span>
                ))}
              </div>

              {/* Bottom glow on hover */}
              <div className="absolute bottom-0 left-4 right-4 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: `linear-gradient(90deg, transparent, ${step.color}40, transparent)` }} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
