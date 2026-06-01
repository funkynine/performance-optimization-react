import { memo } from 'react'
import { useTickStore } from '../store/useTickStore'
import { useAppContext } from '../context/AppContext'

type Props = { symbol: string }

export const Row = memo(function Row({ symbol }: Props) {
  const tick = useTickStore((s) => s.ticks[symbol])
  const { dispatch } = useAppContext()

  if (!tick) return null

  return (
    <tr
      className="watchlist-row"
      onClick={() => dispatch({ type: 'SELECT_SYMBOL', symbol })}
      style={{ cursor: 'pointer', borderBottom: '1px solid #21262d' }}
    >
      <td style={{ padding: '6px 20px', color: '#58a6ff', fontWeight: 600, fontFamily: 'monospace', fontSize: 13, width: 100 }}>
        {symbol}
      </td>
      <td style={{ padding: '6px 20px', textAlign: 'right', color: '#e6edf3', fontFamily: 'monospace', fontSize: 13 }}>
        {tick.price.toFixed(2)}
      </td>
      <td style={{ padding: '6px 20px', textAlign: 'right', color: '#8b949e', fontFamily: 'monospace', fontSize: 11 }}>
        {new Date(tick.ts).toLocaleTimeString()}
      </td>
    </tr>
  )
})
