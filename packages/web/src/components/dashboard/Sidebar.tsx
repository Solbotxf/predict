'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/app', label: 'Command Center', icon: '⚡', badge: '' },
  { href: '/app/scanner', label: 'Market Scanner', icon: '🔍', badge: '8' },
  { href: '/app/signals', label: 'Signal Board', icon: '📡', badge: '5' },
  { href: '/app/arbitrage', label: 'Arbitrage', icon: '💱', badge: '' },
  { href: '/app/portfolio', label: 'Portfolio', icon: '📊', badge: '' },
  { href: '/app/backtest', label: 'Backtest', icon: '🧪', badge: '' },
  { href: '/app/alerts', label: 'Alerts', icon: '🔔', badge: '3' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 border-r border-[var(--border-default)] bg-[var(--bg-secondary)] flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-4 border-b border-[var(--border-default)]">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md flex items-center justify-center text-white font-bold text-[10px]"
            style={{ background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-accent))' }}>
            PE
          </div>
          <span className="font-display font-bold text-sm tracking-wide">PREDICT<span style={{ color: 'var(--brand-accent)' }}>EDGE</span></span>
        </Link>
      </div>

      {/* System status */}
      <div className="px-4 py-3 border-b border-[var(--border-default)]">
        <div className="flex items-center gap-2">
          <span className="pulse-dot" style={{ width: 6, height: 6 }} />
          <span className="text-[10px] font-mono text-[var(--color-success)] uppercase tracking-wider">All systems online</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/app' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between px-3 py-2 rounded-md text-xs font-mono transition-all',
                isActive
                  ? 'text-[var(--brand-accent)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.03]'
              )}
              style={isActive ? { background: 'rgba(0, 229, 255, 0.06)', border: '1px solid rgba(0, 229, 255, 0.1)' } : {}}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-sm">{item.icon}</span>
                <span className="uppercase tracking-wider">{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/5 text-[var(--text-muted)]">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-[var(--border-default)] text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
        PredictEdge v0.1.0
      </div>
    </aside>
  )
}
