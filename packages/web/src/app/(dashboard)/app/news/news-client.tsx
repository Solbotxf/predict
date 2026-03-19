'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Newspaper, ExternalLink, TrendingUp, Globe, Cpu, Bitcoin,
  CloudLightning, Landmark, Filter, Link2, ChevronDown, ChevronUp,
  Flame, Clock
} from 'lucide-react'
import type { NewsData, NewsArticle } from '@/lib/api'

const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  all:         { label: 'All',         icon: <Globe size={14} />,          color: '#8B5CF6' },
  geopolitics: { label: 'Geopolitics', icon: <Globe size={14} />,          color: '#EF4444' },
  economy:     { label: 'Economy',     icon: <Landmark size={14} />,       color: '#F59E0B' },
  tech:        { label: 'Tech',        icon: <Cpu size={14} />,            color: '#06B6D4' },
  crypto:      { label: 'Crypto',      icon: <Bitcoin size={14} />,        color: '#8B5CF6' },
  climate:     { label: 'Climate',     icon: <CloudLightning size={14} />, color: '#10B981' },
  politics_us: { label: 'US Politics', icon: <Landmark size={14} />,       color: '#3B82F6' },
}

function timeAgo(ts: string | null): string {
  if (!ts) return ''
  const diff = Date.now() - new Date(ts).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function NewsCard({ article }: { article: NewsArticle }) {
  const [expanded, setExpanded] = useState(false)
  const cat = CATEGORY_CONFIG[article.category] || CATEGORY_CONFIG.all
  const hasMarkets = article.related_markets.length > 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="rounded-xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-md p-4 hover:border-white/[0.12] transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border border-white/10"
                  style={{ color: cat.color, borderColor: `${cat.color}33` }}>
              {cat.icon} {cat.label}
            </span>
            {hasMarkets && (
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Link2 size={10} /> {article.related_markets.length} market{article.related_markets.length > 1 ? 's' : ''}
              </span>
            )}
            <span className="text-[10px] text-white/30 flex items-center gap-1">
              <Clock size={10} /> {timeAgo(article.timestamp)}
            </span>
          </div>
          <a href={article.url} target="_blank" rel="noopener noreferrer"
             className="text-sm font-medium text-white/90 hover:text-cyan-400 transition-colors leading-snug group">
            {article.title}
            <ExternalLink size={12} className="inline ml-1 opacity-0 group-hover:opacity-60 transition-opacity" />
          </a>
          <div className="text-[10px] text-white/25 mt-1">
            {article.source} {article.country ? `· ${article.country}` : ''}
          </div>
        </div>
      </div>

      {hasMarkets && (
        <div className="mt-3">
          <button onClick={() => setExpanded(!expanded)}
                  className="flex items-center gap-1 text-xs text-amber-400/70 hover:text-amber-400 transition-colors">
            <TrendingUp size={12} /> Related Markets
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-2 space-y-1.5">
                  {article.related_markets.map((m) => (
                    <a key={m.id} href={m.url} target="_blank" rel="noopener noreferrer"
                       className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:border-amber-500/20 transition-colors group">
                      <span className="text-xs text-white/70 group-hover:text-white/90 truncate flex-1 mr-3">
                        {m.title}
                      </span>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-mono text-cyan-400">
                          {(m.current_price * 100).toFixed(0)}¢
                        </span>
                        <span className="text-[10px] text-white/30">
                          rel {(m.relevance * 100).toFixed(0)}%
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}

export function NewsClient({ initialData }: { initialData: NewsData | null }) {
  const [category, setCategory] = useState('all')
  const [marketsOnly, setMarketsOnly] = useState(false)

  const filtered = useMemo(() => {
    if (!initialData) return []
    let news = initialData.news
    if (category !== 'all') news = news.filter(n => n.category === category)
    if (marketsOnly) news = news.filter(n => n.related_markets.length > 0)
    return news
  }, [initialData, category, marketsOnly])

  const withMarketsCount = initialData?.news.filter(n => n.related_markets.length > 0).length ?? 0

  if (!initialData) {
    return (
      <div className="flex items-center justify-center h-96 text-white/40">
        <Newspaper size={24} className="mr-2" /> No news data — start the backend and run seed scripts
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white/90 flex items-center gap-2">
            <Newspaper size={22} /> News Intelligence
          </h1>
          <p className="text-xs text-white/40 mt-0.5">
            {initialData.total} articles · {withMarketsCount} linked to markets
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {['all', ...(initialData.categories || [])].map((cat) => {
          const cfg = CATEGORY_CONFIG[cat] || { label: cat, icon: <Globe size={14} />, color: '#666' }
          const active = category === cat
          return (
            <button key={cat} onClick={() => setCategory(cat)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all ${
                      active
                        ? 'border-white/20 bg-white/[0.08] text-white'
                        : 'border-white/[0.06] bg-white/[0.02] text-white/50 hover:text-white/70'
                    }`}>
              {cfg.icon} {cfg.label}
            </button>
          )
        })}

        <div className="ml-auto">
          <button onClick={() => setMarketsOnly(!marketsOnly)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all ${
                    marketsOnly
                      ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                      : 'border-white/[0.06] bg-white/[0.02] text-white/50 hover:text-white/70'
                  }`}>
            <Link2 size={12} /> With Markets Only
          </button>
        </div>
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((article, i) => (
            <NewsCard key={`${article.url}-${i}`} article={article} />
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-white/30 py-16 text-sm">
          No news found for this filter
        </div>
      )}
    </div>
  )
}
