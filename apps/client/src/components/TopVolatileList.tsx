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
    <div style={{
      background: '#161b22',
      border: '1px solid #21262d',
      borderRadius: 8,
      margin: '0 20px 20px',
      padding: 16,
    }}>
      <div style={{ fontSize: 12, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
        Top 5 Volatile — last 50 ticks
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ fontSize: 11, color: '#8b949e', borderBottom: '1px solid #21262d' }}>
            <th style={{ textAlign: 'left', fontWeight: 500, paddingBottom: 8 }}>Symbol</th>
            <th style={{ textAlign: 'right', fontWeight: 500, paddingBottom: 8 }}>Price</th>
            <th style={{ textAlign: 'right', fontWeight: 500, paddingBottom: 8 }}>Δ Price</th>
          </tr>
        </thead>
        <tbody>
          {top5.map(({ symbol, price, delta }) => (
            <tr key={symbol} style={{ fontSize: 13, borderBottom: '1px solid #21262d' }}>
              <td style={{ padding: '6px 0', color: '#58a6ff', fontWeight: 600, fontFamily: 'monospace' }}>{symbol}</td>
              <td style={{ padding: '6px 0', textAlign: 'right', color: '#e6edf3', fontFamily: 'monospace' }}>{price.toFixed(2)}</td>
              <td style={{ padding: '6px 0', textAlign: 'right', color: '#f85149', fontFamily: 'monospace' }}>{delta.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
})
