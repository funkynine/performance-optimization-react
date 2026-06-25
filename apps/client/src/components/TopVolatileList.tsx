import { memo } from 'react'
import { useTop5Volatile } from '../hooks/useTop5Volatile'

const ROW_HEIGHT = 33
const MAX_ROWS = 5
const COL_WIDTHS = ['40%', '30%', '30%'] as const

export const TopVolatileList = memo(function TopVolatileList() {
  const top5 = useTop5Volatile()

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

      {/* Header */}
      <div style={{ display: 'flex', fontSize: 11, color: '#8b949e', borderBottom: '1px solid #21262d', paddingBottom: 8 }}>
        <span style={{ width: COL_WIDTHS[0] }}>Symbol</span>
        <span style={{ width: COL_WIDTHS[1], textAlign: 'right' }}>Price</span>
        <span style={{ width: COL_WIDTHS[2], textAlign: 'right' }}>Δ Price</span>
      </div>

      {/* Rows — position:absolute + transform keeps rows off the layout flow → no CLS */}
      <div style={{ position: 'relative', height: MAX_ROWS * ROW_HEIGHT }}>
        {top5.map(({ symbol, price, delta }, rank) => (
          <div
            key={symbol}
            style={{
              position: 'absolute',
              width: '100%',
              height: ROW_HEIGHT,
              display: 'flex',
              alignItems: 'center',
              fontSize: 13,
              borderBottom: '1px solid #21262d',
              transform: `translateY(${rank * ROW_HEIGHT}px)`,
              willChange: 'transform',
            }}
          >
            <span style={{ width: COL_WIDTHS[0], color: '#58a6ff', fontWeight: 600, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {symbol}
            </span>
            <span style={{ width: COL_WIDTHS[1], textAlign: 'right', color: '#e6edf3', fontFamily: 'monospace' }}>
              {price.toFixed(2)}
            </span>
            <span style={{ width: COL_WIDTHS[2], textAlign: 'right', color: '#f85149', fontFamily: 'monospace' }}>
              {delta.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
})
