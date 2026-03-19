'use client'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { TimelineData, TimelineEvent } from '@/lib/api'
import {
  Calendar, Clock, ExternalLink, ChevronDown, ChevronUp,
  Activity, DollarSign, TrendingUp, Zap, Trophy,
  Globe, BarChart3, Gamepad2, Vote, Landmark, Bitcoin
} from 'lucide-react'

/* ─── Sport icon + color mapping ─── */
const sportConfig: Record<string, { Icon: any; color: string; label: string }> = {
  NBA: { Icon: Trophy, color: '#FF6B35', label: 'NBA' },
  UCL: { Icon: Trophy, color: '#1E90FF', label: 'Champions League' },
  EPL: { Icon: Trophy, color: '#38003c', label: 'Premier League' },
  'La Liga': { Icon: Trophy, color: '#FF4500', label: 'La Liga' },
  NHL: { Icon: Trophy, color: '#236192', label: 'NHL' },
  NCAAB: { Icon: Trophy, color: '#FFA500', label: 'March Madness' },
  NFL: { Icon: Trophy, color: '#013369', label: 'NFL' },
  MLB: { Icon: Trophy, color: '#002D72', label: 'MLB' },
  LoL: { Icon: Gamepad2, color: '#C89B3C', label: 'LoL Esports' },
  Football: { Icon: Trophy, color: '#00D77E', label: 'Football' },
  Sports: { Icon: Trophy, color: '#8B5CF6', label: 'Sports' },
  Politics: { Icon: Vote, color: '#FF4B5C', label: 'Politics' },
  Economics: { Icon: Landmark, color: '#FFD166', label: 'Economics' },
  Geopolitics: { Icon: Globe, color: '#FF9F43', label: 'Geopolitics' },
  Crypto: { Icon: Bitcoin, color: '#F7931A', label: 'Crypto' },
  Other: { Icon: Zap, color: '#00E5FF', label: 'Other' },
}

function getSportConfig(sport: string) {
  return sportConfig[sport] || sportConfig.Other
}

/* ─── Sport Filter Chip ─── */
function SportChip({ label, sport, active, count, onClick }: {
  label: string; sport: string; active: boolean; count: number; onClick: () => void
}) {
  const cfg = getSportConfig(sport)
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${
        active ? 'text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
      }`}
      style={active
        ? { background: `${cfg.color}30`, color: cfg.color, border: `1px solid ${cfg.color}40` }
        : { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }
      }
    >
      <cfg.Icon size={10} strokeWidth={2} />
      {label}
      <span className="opacity-50">{count}</span>
    </button>
  )
}

/* ─── Time Label ─── */
function TimeLabel({ dateStr }: { dateStr: string }) {
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = d.getTime() - now.getTime()
  const diffH = Math.floor(diffMs / 3600000)

  const isToday = d.toDateString() === now.toDateString()
  const isTomorrow = d.toDateString() === new Date(now.getTime() + 86400000).toDateString()

  const dayLabel = isToday ? 'TODAY' : isTomorrow ? 'TOMORROW' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  const timeLabel = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })

  const urgencyColor = diffH < 2 ? '#FF4B5C' : diffH < 6 ? '#FFD166' : diffH < 24 ? '#00D77E' : '#00E5FF'

  return (
    <div className="flex flex-col items-end min-w-[90px]">
      <span className="text-[8px] font-mono font-bold uppercase tracking-wider" style={{ color: urgencyColor }}>
        {dayLabel}
      </span>
      <span className="text-base font-mono font-bold tabular-nums text-[var(--text-primary)]">
        {timeLabel}
      </span>
      {diffH > 0 && diffH < 48 && (
        <span className="text-[8px] font-mono text-[var(--text-muted)]">
          in {diffH < 1 ? '<1' : diffH}h
        </span>
      )}
    </div>
  )
}

/* ─── Market Row inside Event ─── */
function MarketRow({ m }: { m: TimelineEvent['markets'][0] }) {
  const priceColor = m.current_price > 0.7 ? '#00D77E' : m.current_price < 0.3 ? '#FF4B5C' : '#FFD166'
  return (
    <a
      href={m.url}
      target="_blank"
      rel="noopener"
      className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-white/[0.03] transition-colors group"
    >
      <span className="text-[10px] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors flex-1 truncate mr-3">
        {m.title}
      </span>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-[11px] font-mono font-bold tabular-nums" style={{ color: priceColor }}>
          {(m.current_price * 100).toFixed(1)}¢
        </span>
        <span className="text-[9px] font-mono text-[var(--text-muted)]">
          ${(m.volume_24h / 1000).toFixed(0)}K
        </span>
        <ExternalLink size={9} className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </a>
  )
}

/* ─── Event Card on Timeline ─── */
function EventNode({ event, index }: { event: TimelineEvent; index: number }) {
  const [expanded, setExpanded] = useState(event.markets.length <= 3)
  const cfg = getSportConfig(event.sport)
  const primary = event.markets[0]

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex gap-4 relative"
    >
      {/* Timeline connector */}
      <div className="flex flex-col items-center pt-1">
        <div className="w-3 h-3 rounded-full border-2 flex-shrink-0 z-10"
          style={{ borderColor: cfg.color, background: `${cfg.color}30` }} />
        <div className="w-px flex-1 bg-[var(--border-default)]" />
      </div>

      {/* Event content */}
      <div className="flex-1 pb-5">
        <div className="glass-card p-3 hover:bg-white/[0.02] transition-colors" style={{ borderColor: `${cfg.color}10` }}>
          {/* Header row */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
                  style={{ background: `${cfg.color}12`, color: cfg.color }}>
                  {event.sport}
                </span>
                <span className="text-[8px] font-mono text-[var(--text-muted)]">
                  {event.market_count} market{event.market_count > 1 ? 's' : ''}
                </span>
              </div>
              <h3 className="text-sm font-bold text-[var(--text-primary)] leading-snug">
                {event.event_name}
              </h3>
            </div>
            <TimeLabel dateStr={event.event_time} />
          </div>

          {/* Volume bar */}
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={9} className="text-[var(--text-muted)]" />
            <span className="text-[9px] font-mono text-[var(--text-muted)]">
              ${(event.total_volume / 1000).toFixed(0)}K total volume
            </span>
          </div>

          {/* Markets */}
          <div className="space-y-0.5">
            {(expanded ? event.markets : event.markets.slice(0, 2)).map((m) => (
              <MarketRow key={m.id} m={m} />
            ))}
          </div>

          {event.markets.length > 3 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 mt-1.5 px-2 py-1 text-[9px] font-mono text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            >
              {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
              {expanded ? 'Show less' : `+${event.markets.length - 2} more markets`}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Day separator ─── */
function DaySeparator({ date }: { date: string }) {
  const d = new Date(date)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  const isTomorrow = d.toDateString() === new Date(now.getTime() + 86400000).toDateString()
  const label = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="flex items-center gap-3 py-2 pl-1">
      <Calendar size={12} className="text-[var(--brand-accent)]" />
      <span className="text-[10px] font-mono font-bold text-[var(--brand-accent)] uppercase tracking-widest">{label}</span>
      <div className="flex-1 h-px bg-[var(--border-default)]" />
    </div>
  )
}

/* ─── Main Timeline Client ─── */
export function TimelineClient({ initialData }: { initialData: TimelineData | null }) {
  const [activeSport, setActiveSport] = useState('All')

  if (!initialData || initialData.events.length === 0) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-[var(--brand-accent)]" />
          <h1 className="text-lg font-display font-bold">Event Timeline</h1>
        </div>
        <div className="glass-card p-8 text-center">
          <p className="text-[var(--text-muted)]">No upcoming events found. Connect backend to see live data.</p>
        </div>
      </div>
    )
  }

  // Filter by sport
  const filtered = useMemo(() => {
    if (activeSport === 'All') return initialData.events
    return initialData.events.filter(e => e.sport === activeSport)
  }, [activeSport, initialData.events])

  // Count per sport
  const sportCounts = useMemo(() => {
    const counts: Record<string, number> = { All: initialData.events.length }
    for (const e of initialData.events) {
      counts[e.sport] = (counts[e.sport] || 0) + 1
    }
    return counts
  }, [initialData.events])

  // Group by day
  const days = useMemo(() => {
    const groups: Array<{ date: string; events: TimelineEvent[] }> = []
    let currentDay = ''
    for (const e of filtered) {
      const day = e.event_time.slice(0, 10)
      if (day !== currentDay) {
        groups.push({ date: e.event_time, events: [] })
        currentDay = day
      }
      groups[groups.length - 1].events.push(e)
    }
    return groups
  }, [filtered])

  const sportList = ['All', ...initialData.sports]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Calendar size={18} strokeWidth={1.8} className="text-[var(--brand-accent)]" />
            <h1 className="text-lg font-display font-bold tracking-wide">Event Timeline</h1>
          </div>
          <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mt-0.5 ml-[26px]">
            Upcoming events that move prediction markets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono text-[var(--text-muted)]">
            {filtered.length} events · {filtered.reduce((s, e) => s + e.market_count, 0)} markets
          </span>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md"
            style={{ background: 'rgba(0,215,126,0.06)', border: '1px solid rgba(0,215,126,0.1)' }}>
            <Activity size={10} color="#00D77E" />
            <span className="text-[9px] font-mono font-bold text-[var(--color-success)]">LIVE</span>
          </div>
        </div>
      </div>

      {/* Sport Filters */}
      <div className="flex flex-wrap gap-1.5">
        {sportList.map(s => (
          <SportChip
            key={s}
            label={s === 'All' ? 'All' : getSportConfig(s).label}
            sport={s === 'All' ? 'Other' : s}
            active={activeSport === s}
            count={sportCounts[s] || 0}
            onClick={() => setActiveSport(s)}
          />
        ))}
      </div>

      {/* Timeline */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSport}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {days.map((day) => (
            <div key={day.date}>
              <DaySeparator date={day.date} />
              {day.events.map((event, i) => (
                <EventNode key={event.event_key} event={event} index={i} />
              ))}
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
