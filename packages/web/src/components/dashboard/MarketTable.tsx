'use client'
import { cn } from '@/lib/utils'
import { PriceFlash } from '../shared/PriceFlash'
import { EdgeBadge } from '../shared/EdgeBadge'
import { formatCurrency } from '@/lib/utils'
import { ExternalLink } from 'lucide-react'

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
  url?: string
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
            {sorted.map((m) => {
              const href = m.url || `https://polymarket.com`
              return (
                <tr
                  key={m.id}
                  className="border-b border-[var(--border-default)] hover:bg-white/[0.04] transition-colors cursor-pointer group"
                  onClick={() => window.open(href, '_blank')}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[var(--text-primary)] group-hover:text-[var(--brand-accent)] transition-colors">
                          {m.title}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">{m.category}</p>
                      </div>
                      <ExternalLink
                        size={12}
                        className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      />
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
                    {m.fairValue !== m.currentPrice
                      ? <span style={{ color: 'var(--brand-accent)' }}>{(m.fairValue * 100).toFixed(1)}¢</span>
                      : <span className="text-[var(--text-muted)]">—</span>
                    }
                  </td>
                  <td className="p-4 text-right">
                    {m.edge !== 0 ? <EdgeBadge edge={m.edge} /> : <span className="text-[var(--text-muted)] text-xs">—</span>}
                  </td>
                  <td className="p-4 text-right font-mono text-[var(--text-secondary)]">
                    {formatCurrency(m.volume24h)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
