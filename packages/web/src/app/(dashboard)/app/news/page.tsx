import { fetchNews } from '@/lib/api'
import { NewsClient } from './news-client'

export default async function NewsPage() {
  const data = await fetchNews({ limit: 100 })

  return <NewsClient initialData={data} />
}
