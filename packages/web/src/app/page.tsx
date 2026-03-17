import { Hero } from '@/components/landing/Hero'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { ModuleShowcase } from '@/components/landing/ModuleShowcase'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-[var(--border-glass)] bg-[var(--bg-primary)]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-accent)] flex items-center justify-center text-white font-bold text-sm">
              PM
            </div>
            <span className="font-display font-bold text-lg">PredictEdge</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-[var(--text-secondary)]">
            <Link href="#modules" className="hover:text-white transition-colors">Products</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/app" className="hover:text-white transition-colors">Dashboard</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/app" className="text-sm text-[var(--text-secondary)] hover:text-white transition-colors">Log in</Link>
            <Link href="/app" className="text-sm bg-[var(--brand-primary)] text-white px-4 py-2 rounded-lg hover:brightness-110 transition-all">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      <Hero />
      <HowItWorks />
      <ModuleShowcase />

      {/* CTA */}
      <section className="py-24 px-6 text-center border-t border-[var(--border-default)]">
        <h2 className="text-3xl md:text-4xl font-display font-bold">
          Stop guessing. <span className="text-[var(--brand-primary)]">Start trading with edge.</span>
        </h2>
        <p className="mt-4 text-[var(--text-secondary)]">Free tier available. No credit card required.</p>
        <Link
          href="/app"
          className="inline-flex items-center mt-8 rounded-xl bg-[var(--brand-primary)] px-10 py-4 text-white font-semibold hover:brightness-110 transition-all shadow-lg shadow-purple-500/25 text-lg"
        >
          Start Free Trial
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border-default)] py-12 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-sm text-[var(--text-muted)]">
          <p>© 2026 PredictEdge. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-[var(--text-secondary)]">Twitter</Link>
            <Link href="#" className="hover:text-[var(--text-secondary)]">Discord</Link>
            <Link href="#" className="hover:text-[var(--text-secondary)]">GitHub</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
