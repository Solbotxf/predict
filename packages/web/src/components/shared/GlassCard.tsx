'use client'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface GlassCardProps {
  children: React.ReactNode
  variant?: 'default' | 'elevated' | 'interactive'
  glow?: 'none' | 'primary' | 'success' | 'danger'
  className?: string
  onClick?: () => void
}

const glowMap = {
  none: '',
  primary: 'hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]',
  success: 'hover:shadow-[0_0_20px_rgba(34,197,94,0.2)]',
  danger: 'hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]',
}

export function GlassCard({ children, variant = 'default', glow = 'none', className, onClick }: GlassCardProps) {
  return (
    <motion.div
      whileHover={variant === 'interactive' ? { scale: 1.01, y: -2 } : undefined}
      className={cn(
        'glass-card p-6',
        variant === 'elevated' && 'bg-[var(--bg-elevated)]',
        variant === 'interactive' && 'cursor-pointer',
        glowMap[glow],
        className
      )}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}
