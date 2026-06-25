import { useEffect, useRef, useState } from 'react'
import { Tick } from '@prep/types'
import { useTickStore } from '../store/useTickStore'
import { throttle } from '../utils/throttle'

export type SymbolDelta = { symbol: string; price: number; delta: number }

function computeTop5(ticks: Record<string, Tick>, history: Map<string, number[]>): SymbolDelta[] {
  Object.entries(ticks).forEach(([symbol, tick]) => {
    const hist = history.get(symbol) ?? []
    hist.push(tick.price)
    if (hist.length > 50) hist.shift()
    history.set(symbol, hist)
  })

  return Array.from(history.entries())
    .filter(([, hist]) => hist.length >= 2)
    .map(([symbol, hist]) => ({
      symbol,
      price: hist[hist.length - 1],
      delta: Math.abs(hist[hist.length - 1] - hist[0]),
    }))
    .sort((a, b) => b.delta - a.delta)
    .slice(0, 5)
}

export function useTop5Volatile() {
  const ticks = useTickStore((s) => s.ticks)
  const ticksRef = useRef(ticks)
  ticksRef.current = ticks

  const historyRef = useRef<Map<string, number[]>>(new Map())
  const [top5, setTop5] = useState<SymbolDelta[]>([])

  const throttledUpdate = useRef(throttle(() => {
    setTop5(computeTop5(ticksRef.current, historyRef.current))
  }, 250))

  useEffect(() => {
    throttledUpdate.current()
  }, [ticks])

  return top5
}
