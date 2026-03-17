'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Bot, Brain, Zap, TrendingUp, ChevronRight, Settings,
  Key, Plus, Copy, Eye, EyeOff, ArrowUpRight, ArrowDownRight,
  LayoutDashboard, Activity, Target, Clock, Shield
} from 'lucide-react'

/* ─── Agent cards ─── */
const agents = [
  {
    name: 'Alpha Scanner',
    type: 'Edge Detection',
    Icon: Target,
    color: '#00D77E',
    status: 'active',
    trades: 142,
    winRate: 71.2,
    pnl: '+$4,280',
    pnlPositive: true,
    avgEdge: 7.8,
    lastSignal: '2m ago',
    markets: ['Polymarket', 'Kalshi'],
  },
  {
    name: 'Arb Hunter',
    type: 'Cross-Platform Arbitrage',
    Icon: Zap,
    color: '#FFD166',
    status: 'active',
    trades: 89,
    winRate: 94.3,
    pnl: '+$1,920',
    pnlPositive: true,
    avgEdge: 3.1,
    lastSignal: '8m ago',
    markets: ['Polymarket', 'Kalshi', 'Metaculus'],
  },
  {
    name: 'Sentiment Bot',
    type: 'Social Signal Trader',
    Icon: Brain,
    color: '#8B5CF6',
    status: 'paused',
    trades: 67,
    winRate: 58.2,
    pnl: '-$340',
    pnlPositive: false,
    avgEdge: 4.2,
    lastSignal: '1hr ago',
    markets: ['Polymarket'],
  },
]

function AgentCard({ agent }: { agent: typeof agents[0] }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="glass-card p-5 group cursor-pointer"
      style={{ borderColor: `${agent.color}10` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center relative"
            style={{ background: `${agent.color}10`, border: `1px solid ${agent.color}20` }}>
            <agent.Icon size={18} strokeWidth={1.8} color={agent.color} />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-[var(--bg-panel)]"
              style={{ background: agent.status === 'active' ? '#00D77E' : '#FF9F43' }} />
          </div>
          <div>
            <h3 className="text-sm font-display font-semibold">{agent.name}</h3>
            <p className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-wider">{agent.type}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded tracking-wider ${
            agent.status === 'active' ? 'bg-[rgba(0,215,126,0.1)] text-[#00D77E]' : 'bg-[rgba(255,159,67,0.1)] text-[#FF9F43]'
          }`}>
            {agent.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-3 mb-3">
        {[
          { label: 'Trades', value: agent.trades.toString(), color: 'var(--text-primary)' },
          { label: 'Win Rate', value: `${agent.winRate}%`, color: agent.winRate > 60 ? '#00D77E' : '#FF9F43' },
          { label: 'PnL', value: agent.pnl, color: agent.pnlPositive ? '#00D77E' : '#FF4B5C' },
          { label: 'Avg Edge', value: `${agent.avgEdge}%`, color: '#8B5CF6' },
        ].map(s => (
          <div key={s.label}>
            <p className="text-[8px] font-mono text-[var(--text-muted)] uppercase tracking-wider">{s.label}</p>
            <p className="text-sm font-mono font-bold tabular-nums" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--border-default)' }}>
        <div className="flex items-center gap-1 text-[8px] font-mono text-[var(--text-muted)]">
          <Clock size={8} /> Last signal: {agent.lastSignal}
        </div>
        <div className="flex items-center gap-1">
          {agent.markets.map(m => (
            <span key={m} className="text-[7px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-[var(--text-muted)]">{m}</span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

/* ─── API Section ─── */
function APISection() {
  const [showKey, setShowKey] = useState(false)
  const apiKey = 'pe_live_sk_a3f8...x9k2'

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Key size={14} strokeWidth={1.8} className="text-[var(--brand-accent)]" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest">API Access</span>
        </div>
        <button className="flex items-center gap-1.5 text-[9px] font-mono text-[var(--brand-accent)] px-3 py-1.5 rounded-md hover:bg-white/5 transition-colors"
          style={{ border: '1px solid rgba(0,229,255,0.15)' }}>
          <Plus size={10} /> New Key
        </button>
      </div>

      <div className="p-3 rounded-lg" style={{ background: 'rgba(0,229,255,0.03)', border: '1px solid rgba(0,229,255,0.08)' }}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-[10px] font-mono text-[var(--text-primary)] font-bold">Production Key</p>
            <p className="text-[8px] font-mono text-[var(--text-muted)]">Created 3 days ago · Last used 2s ago</p>
          </div>
          <div className="flex items-center gap-1">
            <span className="badge-live text-[8px]"><span className="pulse-dot" style={{ width: 3, height: 3 }} /> IN USE</span>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 rounded bg-black/20 font-mono text-xs">
          <span className="flex-1 text-[var(--text-secondary)]">{showKey ? 'pe_live_sk_a3f8c7d2e1b4f6a9x9k2' : apiKey}</span>
          <button onClick={() => setShowKey(!showKey)} className="text-[var(--text-muted)] hover:text-white transition-colors">
            {showKey ? <EyeOff size={12} /> : <Eye size={12} />}
          </button>
          <button className="text-[var(--text-muted)] hover:text-white transition-colors">
            <Copy size={12} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-3">
        {[
          { label: 'Requests Today', value: '12,847', color: '#00E5FF' },
          { label: 'Avg Latency', value: '89ms', color: '#00D77E' },
          { label: 'Rate Limit', value: '1000/min', color: '#FFD166' },
        ].map(s => (
          <div key={s.label} className="text-center p-2 rounded" style={{ background: `${s.color}04` }}>
            <p className="text-sm font-mono font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[8px] font-mono text-[var(--text-muted)] uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Main ─── */
export default function CommandCenterPage() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <LayoutDashboard size={18} strokeWidth={1.8} className="text-[var(--brand-accent)]" />
            <h1 className="text-lg font-display font-bold tracking-wide">Command Center</h1>
          </div>
          <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mt-0.5 ml-[26px]">
            Your AI agents & API management
          </p>
        </div>
        <button className="flex items-center gap-1.5 text-[10px] font-mono text-white px-4 py-2 rounded-md transition-all"
          style={{ background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-accent))', boxShadow: '0 0 15px rgba(139,92,246,0.2)' }}>
          <Plus size={12} /> New Agent
        </button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Active Agents', value: '2', Icon: Bot, color: '#00D77E' },
          { label: 'Total PnL', value: '+$5,860', Icon: TrendingUp, color: '#00D77E' },
          { label: 'Total Trades', value: '298', Icon: Activity, color: '#8B5CF6' },
          { label: 'Avg Win Rate', value: '72.4%', Icon: Shield, color: '#FFD166' },
        ].map(s => (
          <div key={s.label} className="glass-card p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: `${s.color}10` }}>
                <s.Icon size={12} strokeWidth={1.8} color={s.color} />
              </div>
            </div>
            <p className="text-xl font-mono font-bold tabular-nums" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[8px] font-mono text-[var(--text-muted)] uppercase tracking-wider mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Agent cards */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Bot size={14} strokeWidth={1.8} className="text-[var(--text-muted)]" />
          <span className="text-[10px] font-mono font-bold text-[var(--text-secondary)] uppercase tracking-widest">Your AI Agents</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map(a => <AgentCard key={a.name} agent={a} />)}
        </div>
      </div>

      {/* API */}
      <APISection />
    </div>
  )
}
