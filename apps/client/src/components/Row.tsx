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
      onClick={() => dispatch({ type: 'SELECT_SYMBOL', symbol })}
      style={{ cursor: 'pointer', fontFamily: 'monospace', fontSize: 12 }}
    >
      <td style={{ padding: '2px 8px' }}>{symbol}</td>
      <td style={{ padding: '2px 8px', textAlign: 'right' }}>{tick.price.toFixed(2)}</td>
      <td style={{ padding: '2px 8px', textAlign: 'right', color: '#6c7086', fontSize: 10 }}>
        {new Date(tick.ts).toLocaleTimeString()}
      </td>
    </tr>
  )
})
