import { KPICard } from '@/components/dashboard/KPICard'
import { MarketTable } from '@/components/dashboard/MarketTable'
import { mockMarkets, getMarketWithEdge } from '@/lib/mock-data/markets'

export default function ScannerPage() {
  const marketsWithEdge = mockMarkets.map(getMarketWithEdge)
  const edgeMarkets = marketsWithEdge.filter(m => Math.abs(m.edge) > 5)
  const hotMarkets = marketsWithEdge.filter(m => m.volume24h > 3_000_000)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Market Scanner</h1>
        <p className="text-[var(--text-secondary)] mt-1">Real-time prediction market monitoring with AI edge detection</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard title="Active Markets" value={mockMarkets.length} change={3.2} />
        <KPICard title="Edge > 5%" value={edgeMarkets.length} change={12.5} />
        <KPICard title="Hot Markets" value={hotMarkets.length} change={-2.1} />
      </div>

      <MarketTable markets={marketsWithEdge} />
    </div>
  )
}
