'use client'
import { useEffect, useState, useRef } from 'react'
import { cn } from '@/lib/utils'

interface PriceFlashProps {
  value: number
  previousValue?: number
  format?: 'price' | 'percent' | 'currency'
  className?: string
}

export function PriceFlash({ value, previousValue, format = 'price', className }: PriceFlashProps) {
  const [flash, setFlash] = useState<'up' | 'down' | null>(null)
  const prevRef = useRef(previousValue ?? value)

  useEffect(() => {
    if (value > prevRef.current) {
      setFlash('up')
    } else if (value < prevRef.current) {
      setFlash('down')
    }
    prevRef.current = value
    const timer = setTimeout(() => setFlash(null), 400)
    return () => clearTimeout(timer)
  }, [value])

  const formatted = format === 'percent'
    ? `${(value * 100).toFixed(1)}%`
    : format === 'currency'
    ? `$${value.toFixed(2)}`
    : `${(value * 100).toFixed(1)}¢`

  return (
    <span
      className={cn(
        'font-mono font-medium tabular-nums transition-colors',
        flash === 'up' && 'price-flash-up text-[var(--color-success)]',
        flash === 'down' && 'price-flash-down text-[var(--color-danger)]',
        className
      )}
    >
      {formatted}
    </span>
  )
}
