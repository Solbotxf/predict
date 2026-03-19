'use client'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { TimelineDataV2, TimelineEventV2 } from '@/lib/api'
import {
  Calendar, Clock, ExternalLink, ChevronDown, ChevronUp,
  Activity, DollarSign, MapPin, Trophy,
  Globe, Gamepad2, Vote, Landmark, Bitcoin, Zap, Timer, Newspaper
} from 'lucide-react'

/* ─── League config ─── */
const leagueConfig: Record<string, { color: string; emoji: string }> = {
  NBA:        { color: '#C9082A', emoji: '🏀' },
  NHL:        { color: '#236192', emoji: '🏒' },
  NFL:        { color: '#013369', emoji: '🏈' },
  MLB:        { color: '#002D72', emoji: '⚾' },
  NCAAB:      { color: '#FFA500', emoji: '🏀' },
  EPL:        { color: '#3D195B', emoji: '⚽' },
  'La Liga':  { color: '#FF4500', emoji: '⚽' },
  UCL:        { color: '#0055A4', emoji: '⚽' },
  Europa:     { color: '#F37021', emoji: '⚽' },
  'Serie A':  { color: '#024494', emoji: '⚽' },
  Bundesliga: { color: '#D20515', emoji: '⚽' },
  'Ligue 1':  { color: '#091C3E', emoji: '⚽' },
  MLS:        { color: '#80B214', emoji: '⚽' },
  'Liga MX':  { color: '#1A472A', emoji: '⚽' },
  'Brasileirão': { color: '#009739', emoji: '⚽' },
  LoL:        { color: '#C89B3C', emoji: '🎮' },
  Politics:   { color: '#FF4B5C', emoji: '🏛️' },
  Economics:  { color: '#FFD166', emoji: '📊' },
  Geopolitics:{ color: '#FF9F43', emoji: '🌍' },
  Crypto:     { color: '#F7931A', emoji: '₿' },
  Technology: { color: '#00E5FF', emoji: '🤖' },
  'News':       { color: '#A78BFA', emoji: '📰' },
  'US Politics': { color: '#3B82F6', emoji: '🏛️' },
  'Climate':    { color: '#10B981', emoji: '🌿' },
}

function cfg(league: string) {
  return leagueConfig[league] || { color: '#8B5CF6', emoji: '📌' }
}

/* ─── League Chip ─── */
function LeagueChip({ league, active, count, onClick }: {
  league: string; active: boolean; count: number; onClick: () => void
}) {
  const c = cfg(league)
  return (
    <button onClick={onClick}
      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider transition-all ${
        active ? '' : 'opacity-60 hover:opacity-90'
      }`}
      style={active
        ? { background: `${c.color}20`, color: c.color, border: `1px solid ${c.color}40`, boxShadow: `0 0 8px ${c.color}15` }
        : { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }
      }
    >
      <span className="text-[10px]">{c.emoji}</span>
      {league}
      <span className="opacity-50 ml-0.5">{count}</span>
    </button>
  )
}

/* ─── Time display ─── */
function TimeDisplay({ dateStr }: { dateStr: string }) {
  const d = new Date(dateStr)
  const now = new Date()
  const diffH = Math.max(0, Math.floor((d.getTime() - now.getTime()) / 3600000))
  const isToday = d.toDateString() === now.toDateString()
  const isTomorrow = d.toDateString() === new Date(now.getTime() + 86400000).toDateString()
  const dayLabel = isToday ? 'TODAY' : isTomorrow ? 'TMR' : d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
  const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  const urgency = diffH < 1 ? '#FF4B5C' : diffH < 3 ? '#FF9F43' : diffH < 12 ? '#FFD166' : '#00D77E'

  return (
    <div className="flex flex-col items-end min-w-[72px]">
      <span className="text-[7px] font-mono font-bold tracking-wider" style={{ color: urgency }}>{dayLabel}</span>
      <span className="text-sm font-mono font-bold tabular-nums text-[var(--text-primary)]">{timeStr}</span>
      {diffH < 48 && <span className="text-[7px] font-mono text-[var(--text-muted)]">{diffH < 1 ? 'SOON' : `${diffH}h`}</span>}
    </div>
  )
}

/* ─── Event Node ─── */
function EventNode({ event, index }: { event: TimelineEventV2; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const c = cfg(event.league)
  const hasTeams = event.home_team && event.away_team
  const isLive = event.status === 'in'
  const isNews = event.sport === 'News'

  return (
    <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }}
      className="flex gap-3 relative">
      {/* Timeline dot + line */}
      <div className="flex flex-col items-center pt-2">
        <div className={`w-2.5 h-2.5 rounded-full z-10 flex-shrink-0 ${isLive ? 'animate-pulse' : ''}`}
          style={{ background: c.color, boxShadow: `0 0 6px ${c.color}60` }} />
        <div className="w-px flex-1 bg-[var(--border-default)] opacity-40" />
      </div>

      {/* Content */}
      <div className="flex-1 pb-4 min-w-0">
        <div className="glass-card p-3" style={{ borderColor: `${c.color}10` }}>
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                <span className="text-[7px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
                  style={{ background: `${c.color}15`, color: c.color }}>
                  {c.emoji} {event.league}
                </span>
                {isLive && (
                  <span className="text-[7px] font-mono font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 animate-pulse">
                    LIVE
                  </span>
                )}
                {event.market_count > 0 && (
                  <span className="text-[7px] font-mono text-[var(--brand-accent)]">
                    {event.market_count} market{event.market_count > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {/* Event name / teams */}
              {hasTeams ? (
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-bold text-[var(--text-primary)]">{event.away_team}</span>
                  <span className="text-[9px] font-mono text-[var(--text-muted)]">@</span>
                  <span className="text-[12px] font-bold text-[var(--text-primary)]">{event.home_team}</span>
                  {event.home_score !== null && (
                    <span className="text-[11px] font-mono font-bold text-[var(--brand-accent)] ml-1">
                      {event.away_score} - {event.home_score}
                    </span>
                  )}
                </div>
              ) : isNews && event.news_url ? (
                <a href={event.news_url} target="_blank" rel="noopener noreferrer"
                   className="text-[12px] font-bold text-[var(--text-primary)] leading-snug line-clamp-2 hover:text-cyan-400 transition-colors group/title">
                  {event.event_name}
                  <ExternalLink size={10} className="inline ml-1 opacity-0 group-hover/title:opacity-60" />
                </a>
              ) : (
                <p className="text-[12px] font-bold text-[var(--text-primary)] leading-snug line-clamp-2">
                  {event.event_name}
                </p>
              )}

              {event.venue && (
                <div className="flex items-center gap-1 mt-0.5">
                  {isNews ? <Newspaper size={8} className="text-[var(--text-muted)]" /> : <MapPin size={8} className="text-[var(--text-muted)]" />}
                  <span className="text-[8px] font-mono text-[var(--text-muted)]">{event.venue}</span>
                  {isNews && event.news_url && (
                    <a href={event.news_url} target="_blank" rel="noopener noreferrer"
                       className="text-[8px] font-mono text-cyan-400/60 hover:text-cyan-400 ml-1 flex items-center gap-0.5">
                      source <ExternalLink size={7} />
                    </a>
                  )}
                </div>
              )}
            </div>
            <TimeDisplay dateStr={event.event_time} />
          </div>

          {/* Markets */}
          {event.market_count > 0 && (
            <div className="mt-2 pt-2" style={{ borderTop: `1px solid ${c.color}08` }}>
              {event.total_volume > 0 && (
                <div className="flex items-center gap-1.5 mb-1.5">
                  <DollarSign size={8} className="text-[var(--text-muted)]" />
                  <span className="text-[8px] font-mono text-[var(--text-muted)]">
                    ${(event.total_volume / 1000).toFixed(0)}K volume across {event.market_count} markets
                  </span>
                </div>
              )}
              {(expanded ? event.markets : event.markets.slice(0, 3)).map((m) => {
                const priceColor = m.current_price > 0.7 ? '#00D77E' : m.current_price < 0.3 ? '#FF4B5C' : '#FFD166'
                return (
                  <a key={m.id} href={m.url} target="_blank" rel="noopener"
                    className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-white/[0.03] transition-colors group">
                    <span className="text-[9px] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] truncate flex-1 mr-2">
                      {m.title}
                    </span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] font-mono font-bold tabular-nums" style={{ color: priceColor }}>
                        {(m.current_price * 100).toFixed(0)}¢
                      </span>
                      <span className="text-[8px] font-mono text-[var(--text-muted)]">${(m.volume_24h / 1000).toFixed(0)}K</span>
                      <ExternalLink size={8} className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100" />
                    </div>
                  </a>
                )
              })}
              {event.markets.length > 3 && (
                <button onClick={() => setExpanded(!expanded)}
                  className="flex items-center gap-1 mt-1 px-1.5 py-0.5 text-[8px] font-mono text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
                  {expanded ? <ChevronUp size={9} /> : <ChevronDown size={9} />}
                  {expanded ? 'Less' : `+${event.markets.length - 3} more`}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Day header ─── */
function DayHeader({ date }: { date: string }) {
  const d = new Date(date)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  const isTmr = d.toDateString() === new Date(now.getTime() + 86400000).toDateString()
  const label = isToday ? 'Today' : isTmr ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
  return (
    <div className="flex items-center gap-2 py-2">
      <Calendar size={11} className="text-[var(--brand-accent)]" />
      <span className="text-[9px] font-mono font-bold text-[var(--brand-accent)] uppercase tracking-widest">{label}</span>
      <div className="flex-1 h-px bg-[var(--border-default)] opacity-30" />
    </div>
  )
}

/* ─── Main ─── */
export function TimelineClient({ initialData }: { initialData: TimelineDataV2 | null }) {
  const [activeLeague, setActiveLeague] = useState('All')
  const [showNoMarkets, setShowNoMarkets] = useState(false)

  if (!initialData) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-[var(--brand-accent)]" />
          <h1 className="text-lg font-display font-bold">Event Timeline</h1>
        </div>
        <div className="glass-card p-8 text-center">
          <p className="text-[var(--text-muted)]">Connect backend for live ESPN + Polymarket data.</p>
        </div>
      </div>
    )
  }

  const filtered = useMemo(() => {
    let events = initialData.events
    if (activeLeague !== 'All') events = events.filter(e => e.league === activeLeague)
    if (!showNoMarkets) events = events.filter(e => e.market_count > 0)
    return events
  }, [activeLeague, showNoMarkets, initialData.events])

  const leagueCounts = useMemo(() => {
    const c: Record<string, number> = { All: initialData.events.length }
    for (const e of initialData.events) c[e.league] = (c[e.league] || 0) + 1
    return c
  }, [initialData.events])

  const days = useMemo(() => {
    const g: Array<{ date: string; events: TimelineEventV2[] }> = []
    let cur = ''
    for (const e of filtered) {
      const day = e.event_time.slice(0, 10)
      if (day !== cur) { g.push({ date: e.event_time, events: [] }); cur = day }
      g[g.length - 1].events.push(e)
    }
    return g
  }, [filtered])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Calendar size={18} strokeWidth={1.8} className="text-[var(--brand-accent)]" />
            <h1 className="text-lg font-display font-bold tracking-wide">Event Timeline</h1>
          </div>
          <p className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-wider mt-0.5 ml-[26px]">
            ESPN × News × Polymarket · {(initialData.total_events || 0)} events · {(initialData.total_with_markets || 0)} with markets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowNoMarkets(!showNoMarkets)}
            className={`text-[8px] font-mono px-2 py-1 rounded transition-all ${showNoMarkets ? 'bg-[var(--brand-accent)]/10 text-[var(--brand-accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
            style={showNoMarkets ? { border: '1px solid rgba(245,158,11,0.2)' } : { border: '1px solid transparent' }}>
            {showNoMarkets ? 'ALL EVENTS' : 'WITH MARKETS ONLY'}
          </button>
          <div className="flex items-center gap-1 px-2 py-1 rounded-md" style={{ background: 'rgba(0,215,126,0.06)', border: '1px solid rgba(0,215,126,0.1)' }}>
            <Activity size={9} color="#00D77E" />
            <span className="text-[8px] font-mono font-bold text-[var(--color-success)]">LIVE</span>
          </div>
        </div>
      </div>

      {/* League filters */}
      <div className="flex flex-wrap gap-1">
        {['All', ...(initialData.leagues || [])].map(l => (
          <LeagueChip key={l} league={l} active={activeLeague === l}
            count={leagueCounts[l] || 0} onClick={() => setActiveLeague(l)} />
        ))}
      </div>

      {/* Timeline */}
      <AnimatePresence mode="wait">
        <motion.div key={`${activeLeague}-${showNoMarkets}`}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
          {filtered.length === 0 ? (
            <div className="glass-card p-6 text-center">
              <p className="text-[var(--text-muted)] text-xs">No events match this filter.</p>
            </div>
          ) : (
            days.map(day => (
              <div key={day.date}>
                <DayHeader date={day.date} />
                {day.events.map((ev, i) => <EventNode key={ev.event_id} event={ev} index={i} />)}
              </div>
            ))
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
