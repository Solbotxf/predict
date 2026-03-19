import { fetchTimeline } from '@/lib/api'
import { TimelineClient } from './timeline-client'

export default async function TimelinePage() {
  const data = await fetchTimeline(undefined, 7)
  return <TimelineClient initialData={data} />
}
