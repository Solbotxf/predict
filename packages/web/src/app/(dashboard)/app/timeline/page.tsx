import { fetchTimelineV2 } from '@/lib/api'
import { TimelineClient } from './timeline-client'

export default async function TimelinePage() {
  const data = await fetchTimelineV2(undefined, 7)
  return <TimelineClient initialData={data} />
}
