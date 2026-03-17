'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/app', label: 'Overview', icon: '🏠' },
  { href: '/app/scanner', label: 'Market Scanner', icon: '🔍' },
  { href: '/app/signals', label: 'Signal Board', icon: '📡' },
  { href: '/app/arbitrage', label: 'Arbitrage', icon: '⚡' },
  { href: '/app/portfolio', label: 'Portfolio', icon: '📊' },
  { href: '/app/backtest', label: 'Backtest', icon: '🧪' },
  { href: '/app/alerts', label: 'Alerts', icon: '🔔' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 border-r border-[var(--border-default)] bg-[var(--bg-secondary)] flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-accent)] flex items-center justify-center text-white font-bold text-sm">
            PM
          </div>
          <span className="font-display font-bold text-lg">PredictEdge</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/app' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
              )}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-[var(--border-default)]">
        <Link href="/pricing" className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
          <span>⚙</span> Settings
        </Link>
      </div>
    </aside>
  )
}
