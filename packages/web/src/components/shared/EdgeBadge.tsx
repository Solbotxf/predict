import { cn } from '@/lib/utils'

interface EdgeBadgeProps {
  edge: number
  className?: string
}

export function EdgeBadge({ edge, className }: EdgeBadgeProps) {
  const isPositive = edge > 2
  const isNegative = edge < -2
  const arrow = isPositive ? '▲' : isNegative ? '▼' : '→'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-mono font-medium',
        isPositive && 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20',
        isNegative && 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20',
        !isPositive && !isNegative && 'bg-slate-500/10 text-slate-400 ring-1 ring-slate-500/20',
        className
      )}
    >
      {arrow} {Math.abs(edge).toFixed(1)}% Edge
    </span>
  )
}
