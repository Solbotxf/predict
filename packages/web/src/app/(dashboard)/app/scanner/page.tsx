import { fetchInsights, fetchMarketsWithSignals } from '@/lib/api'
import { ScannerClient } from './scanner-client'

export default async function ScannerPage() {
  const [insights, marketsWithEdge] = await Promise.all([
    fetchInsights(),
    fetchMarketsWithSignals(50),
  ])

  return <ScannerClient insights={insights} marketsWithEdge={marketsWithEdge} />
}
