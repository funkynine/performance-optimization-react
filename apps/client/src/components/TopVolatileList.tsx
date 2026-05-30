import { memo, useEffect, useRef, useState } from 'react'
import { useTickStore } from '../store/useTickStore'

type SymbolDelta = { symbol: string; price: number; delta: number }

export const TopVolatileList = memo(function TopVolatileList() {
  const ticks = useTickStore((s) => s.ticks)
  const historyRef = useRef<Map<string, number[]>>(new Map())
  const [top5, setTop5] = useState<SymbolDelta[]>([])

  useEffect(() => {
    Object.entries(ticks).forEach(([symbol, tick]) => {
      const hist = historyRef.current.get(symbol) ?? []
      hist.push(tick.price)
      if (hist.length > 50) hist.shift()
      historyRef.current.set(symbol, hist)
    })

    const deltas: SymbolDelta[] = []
    historyRef.current.forEach((hist, symbol) => {
      if (hist.length < 2) return
      const delta = Math.abs(hist[hist.length - 1] - hist[0])
      deltas.push({ symbol, price: hist[hist.length - 1], delta })
    })
    deltas.sort((a, b) => b.delta - a.delta)
    setTop5(deltas.slice(0, 5))
  }, [ticks])

  return (
    <div style={{ padding: 16, fontFamily: 'monospace', fontSize: 13 }}>
      <h3 style={{ marginBottom: 8 }}>Top 5 Volatile (last 50 ticks)</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>Symbol</th>
            <th style={{ textAlign: 'right' }}>Price</th>
            <th style={{ textAlign: 'right' }}>Δ</th>
          </tr>
        </thead>
        <tbody>
          {top5.map(({ symbol, price, delta }) => (
            <tr key={symbol}>
              <td>{symbol}</td>
              <td style={{ textAlign: 'right' }}>{price.toFixed(2)}</td>
              <td style={{ textAlign: 'right', color: '#f38ba8' }}>{delta.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
})
