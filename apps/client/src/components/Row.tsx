import { memo } from 'react'
import { useTickStore } from '../store/useTickStore'
import { useAppContext } from '../context/AppContext'

type Props = { symbol: string; columns: string }

export const Row = memo(function Row({ symbol, columns }: Props) {
  const tick = useTickStore((s) => s.ticks[symbol])
  const { dispatch } = useAppContext()

  if (!tick) return null

  return (
    <div
      className="watchlist-row"
      onClick={() => dispatch({ type: 'SELECT_SYMBOL', symbol })}
      style={{
        display: 'grid',
        gridTemplateColumns: columns,
        cursor: 'pointer',
        borderBottom: '1px solid #21262d',
        alignItems: 'center',
      }}
    >
      <span style={{ padding: '6px 20px', color: '#58a6ff', fontWeight: 600, fontFamily: 'monospace', fontSize: 13 }}>
        {symbol}
      </span>
      <span style={{ padding: '6px 20px', textAlign: 'right', color: '#e6edf3', fontFamily: 'monospace', fontSize: 13 }}>
        {tick.price.toFixed(2)}
      </span>
      <span style={{ padding: '6px 20px', textAlign: 'right', color: '#8b949e', fontFamily: 'monospace', fontSize: 11 }}>
        {new Date(tick.ts).toLocaleTimeString()}
      </span>
    </div>
  )
})
