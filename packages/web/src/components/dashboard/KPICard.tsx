import { cn } from '@/lib/utils'
import { GlassCard } from '../shared/GlassCard'

interface KPICardProps {
  title: string
  value: string | number
  change?: number
  icon?: React.ReactNode
  className?: string
}

export function KPICard({ title, value, change, icon, className }: KPICardProps) {
  return (
    <GlassCard className={cn('p-4', className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-secondary)]">{title}</p>
        {icon && <div className="text-[var(--brand-primary)]">{icon}</div>}
      </div>
      <p className="mt-2 text-2xl font-bold font-mono tabular-nums">{value}</p>
      {change !== undefined && (
        <p className={cn(
          'mt-1 text-xs font-mono',
          change >= 0 ? 'text-emerald-400' : 'text-red-400'
        )}>
          {change >= 0 ? '▲' : '▼'} {Math.abs(change).toFixed(1)}%
        </p>
      )}
    </GlassCard>
  )
}
