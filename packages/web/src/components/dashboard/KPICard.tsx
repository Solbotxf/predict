import { cn } from '@/lib/utils'

interface KPICardProps {
  title: string
  value: string | number
  change?: number
  className?: string
}

export function KPICard({ title, value, change, className }: KPICardProps) {
  return (
    <div className={cn('glass-card p-3', className)}>
      <p className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-wider">{title}</p>
      <p className="mt-1 text-xl font-mono font-bold tabular-nums">{value}</p>
      {change !== undefined && (
        <div className="flex items-center gap-1 mt-1">
          <span className={cn(
            'text-[10px] font-mono font-bold',
            change >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'
          )}>
            {change >= 0 ? '▲' : '▼'} {Math.abs(change).toFixed(1)}%
          </span>
          <span className="text-[9px] font-mono text-[var(--text-muted)]">24h</span>
        </div>
      )}
    </div>
  )
}
