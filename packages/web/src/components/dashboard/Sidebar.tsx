'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Activity, LayoutDashboard, Search, Radio, ArrowLeftRight,
  PieChart, FlaskConical, Bell, ChevronRight, Database,
  Brain, Target, Bot, Key, Settings, Calendar
} from 'lucide-react'

const mainNav = [
  { href: '/app', label: 'Overview', Icon: Activity, badge: '' },
  { href: '/app/command', label: 'Command Center', Icon: LayoutDashboard, badge: '' },
]

const toolsNav = [
  { href: '/app/scanner', label: 'Market Scanner', Icon: Search, badge: '8' },
  { href: '/app/signals', label: 'Signal Board', Icon: Radio, badge: '5' },
  { href: '/app/arbitrage', label: 'Arbitrage', Icon: ArrowLeftRight, badge: '' },
  { href: '/app/portfolio', label: 'Portfolio', Icon: PieChart, badge: '' },
  { href: '/app/backtest', label: 'Backtest', Icon: FlaskConical, badge: '' },
  { href: '/app/alerts', label: 'Alerts', Icon: Bell, badge: '3' },
]

const dataNav = [
  { href: '/app/feeds', label: 'Data Feeds', Icon: Database, badge: '' },
  { href: '/app/analysis', label: 'AI Analysis', Icon: Brain, badge: '' },
  { href: '/app/value', label: 'Value Capture', Icon: Target, badge: '' },
  { href: '/app/timeline', label: 'Event Timeline', Icon: Calendar, badge: '' },
]

function NavSection({ label, items }: { label: string; items: typeof mainNav }) {
  const pathname = usePathname()

  return (
    <div className="mb-2">
      {label && (
        <p className="text-[8px] font-mono text-[var(--text-muted)] uppercase tracking-widest px-3 mb-1">{label}</p>
      )}
      {items.map((item) => {
        const isActive = item.href === '/app'
          ? pathname === '/app'
          : pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center justify-between px-3 py-1.5 rounded-md text-[11px] font-mono transition-all group',
              isActive
                ? 'text-[var(--brand-accent)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.03]'
            )}
            style={isActive ? { background: 'rgba(0, 229, 255, 0.06)', border: '1px solid rgba(0, 229, 255, 0.1)' } : {}}
          >
            <div className="flex items-center gap-2">
              <item.Icon size={13} strokeWidth={isActive ? 2 : 1.6} />
              <span className="tracking-wider">{item.label}</span>
            </div>
            {item.badge ? (
              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-white/5 text-[var(--text-muted)]">
                {item.badge}
              </span>
            ) : (
              <ChevronRight size={10} className="opacity-0 group-hover:opacity-40 transition-opacity" />
            )}
          </Link>
        )
      })}
    </div>
  )
}

export function Sidebar() {
  return (
    <aside className="w-56 border-r border-[var(--border-default)] bg-[var(--bg-secondary)] flex flex-col h-screen sticky top-0">
      <div className="p-4 border-b border-[var(--border-default)]">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md flex items-center justify-center text-white font-bold text-[10px]"
            style={{ background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-accent))' }}>
            PE
          </div>
          <span className="font-display font-bold text-sm tracking-wide">PREDICT<span style={{ color: 'var(--brand-accent)' }}>EDGE</span></span>
        </Link>
      </div>

      <div className="px-4 py-2.5 border-b border-[var(--border-default)]">
        <div className="flex items-center gap-2">
          <span className="pulse-dot" style={{ width: 6, height: 6 }} />
          <span className="text-[9px] font-mono text-[var(--color-success)] uppercase tracking-wider">All systems online</span>
        </div>
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        <NavSection label="" items={mainNav} />
        <div className="h-px bg-[var(--border-default)] mx-2 my-2" />
        <NavSection label="Intelligence" items={dataNav} />
        <div className="h-px bg-[var(--border-default)] mx-2 my-2" />
        <NavSection label="Tools" items={toolsNav} />
      </nav>

      <div className="p-3 border-t border-[var(--border-default)] text-[8px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
        PredictEdge v0.1.0
      </div>
    </aside>
  )
}
