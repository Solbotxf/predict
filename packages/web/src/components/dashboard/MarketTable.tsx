'use client'
import { cn } from '@/lib/utils'
import { PriceFlash } from '../shared/PriceFlash'
import { EdgeBadge } from '../shared/EdgeBadge'
import { formatCurrency } from '@/lib/utils'

interface MarketRow {
  id: string
  title: string
  source: string
  category: string
  currentPrice: number
  previousPrice: number
  volume24h: number
  fairValue: number
  edge: number
}

export function MarketTable({ markets }: { markets: MarketRow[] }) {
  const sorted = [...markets].sort((a, b) => Math.abs(b.edge) - Math.abs(a.edge))

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border-default)] text-[var(--text-secondary)]">
              <th className="text-left p-4 font-medium">Market</th>
              <th className="text-left p-4 font-medium">Source</th>
              <th className="text-right p-4 font-medium">Price</th>
              <th className="text-right p-4 font-medium">Fair Value</th>
              <th className="text-right p-4 font-medium">Edge</th>
              <th className="text-right p-4 font-medium">Volume 24h</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((m) => (
              <tr
                key={m.id}
                className="border-b border-[var(--border-default)] hover:bg-white/[0.02] transition-colors cursor-pointer"
              >
                <td className="p-4">
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">{m.title}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{m.category}</p>
                  </div>
                </td>
                <td className="p-4">
                  <span className={cn(
                    'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                    m.source === 'polymarket' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'
                  )}>
                    {m.source === 'polymarket' ? 'Poly' : 'Kalshi'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <PriceFlash value={m.currentPrice} previousValue={m.previousPrice} />
                </td>
                <td className="p-4 text-right font-mono text-[var(--text-secondary)]">
                  {(m.fairValue * 100).toFixed(1)}¢
                </td>
                <td className="p-4 text-right">
                  <EdgeBadge edge={m.edge} />
                </td>
                <td className="p-4 text-right font-mono text-[var(--text-secondary)]">
                  {formatCurrency(m.volume24h)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
