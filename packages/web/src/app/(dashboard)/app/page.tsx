import { KPICard } from '@/components/dashboard/KPICard'
import { mockMarkets, getMarketWithEdge } from '@/lib/mock-data/markets'
import { mockSignals } from '@/lib/mock-data/signals'

export default function DashboardOverview() {
  const marketsWithEdge = mockMarkets.map(getMarketWithEdge)
  const topEdge = marketsWithEdge.sort((a, b) => Math.abs(b.edge) - Math.abs(a.edge)).slice(0, 3)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Dashboard</h1>
        <p className="text-[var(--text-secondary)] mt-1">Overview of your prediction market intelligence</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard title="Total Markets" value={mockMarkets.length} />
        <KPICard title="Active Signals" value={mockSignals.length} change={8.3} />
        <KPICard title="Avg Edge" value="6.2%" change={1.4} />
        <KPICard title="Win Rate" value="68%" change={3.1} />
      </div>

      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-4">Top Edge Opportunities</h2>
        <div className="space-y-3">
          {topEdge.map((m) => (
            <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
              <div>
                <p className="font-medium">{m.title}</p>
                <p className="text-xs text-[var(--text-muted)]">{m.category} · {m.source}</p>
              </div>
              <div className="text-right">
                <p className="font-mono">{(m.currentPrice * 100).toFixed(1)}¢</p>
                <p className={`text-xs font-mono ${m.edge > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {m.edge > 0 ? '▲' : '▼'} {Math.abs(m.edge).toFixed(1)}% edge
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
