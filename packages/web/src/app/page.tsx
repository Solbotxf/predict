import { Hero } from '@/components/landing/Hero'
import { PipelineFlow } from '@/components/landing/PipelineFlow'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { ModuleShowcase } from '@/components/landing/ModuleShowcase'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen relative">
      {/* Subtle scanline overlay for tech feel */}
      <div className="scanline-overlay" />

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-[var(--border-glass)]" style={{ background: 'rgba(6, 7, 16, 0.85)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md flex items-center justify-center text-white font-bold text-[10px]"
              style={{ background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-accent))' }}>
              PE
            </div>
            <span className="font-display font-bold text-sm tracking-wide">PREDICT<span style={{ color: 'var(--brand-accent)' }}>EDGE</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-xs font-mono text-[var(--text-secondary)] uppercase tracking-wider">
            <Link href="#pipeline" className="hover:text-[var(--brand-accent)] transition-colors">Pipeline</Link>
            <Link href="#modules" className="hover:text-[var(--brand-accent)] transition-colors">Modules</Link>
            <Link href="/pricing" className="hover:text-[var(--brand-accent)] transition-colors">Pricing</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/app" className="text-xs font-mono text-[var(--text-secondary)] hover:text-white transition-colors uppercase tracking-wider">Log in</Link>
            <Link href="/app" className="text-xs font-mono text-white px-4 py-2 rounded-md transition-all uppercase tracking-wider"
              style={{ background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-accent))', boxShadow: '0 0 15px rgba(139, 92, 246, 0.2)' }}>
              Launch App
            </Link>
          </div>
        </div>
      </nav>

      <Hero />

      <div id="pipeline">
        <PipelineFlow />
      </div>

      <HowItWorks />

      <div id="modules">
        <ModuleShowcase />
      </div>

      {/* CTA */}
      <section className="py-24 px-6 text-center border-t border-[var(--border-default)] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, var(--brand-primary) 0%, transparent 70%)`,
          }}
        />
        <div className="relative z-10">
          <h2 className="text-3xl md:text-5xl font-display font-bold">
            Stop Guessing.{' '}
            <span className="bg-gradient-to-r from-[var(--brand-accent)] to-[var(--color-success)] bg-clip-text text-transparent">
              Trade With Edge.
            </span>
          </h2>
          <p className="mt-4 text-sm text-[var(--text-secondary)] font-mono">Free tier available · No credit card · Deploy in 60 seconds</p>
          <Link
            href="/app"
            className="inline-flex items-center mt-8 rounded-lg px-10 py-4 text-white font-semibold text-lg transition-all"
            style={{
              background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-accent))',
              boxShadow: '0 0 40px rgba(139, 92, 246, 0.3), 0 0 80px rgba(0, 229, 255, 0.1)',
            }}
          >
            Launch Dashboard →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border-default)] py-8 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
          <p>© 2026 PredictEdge · All systems operational</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-[var(--text-secondary)] transition-colors">Twitter</Link>
            <Link href="#" className="hover:text-[var(--text-secondary)] transition-colors">Discord</Link>
            <Link href="#" className="hover:text-[var(--text-secondary)] transition-colors">GitHub</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
