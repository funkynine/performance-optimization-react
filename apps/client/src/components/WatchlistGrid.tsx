import { memo } from 'react'
import { useTickStore } from '../store/useTickStore'
import { Row } from './Row'

export const WatchlistGrid = memo(function WatchlistGrid() {
  const symbols = useTickStore((s) => Object.keys(s.ticks).slice(0, 200))

  return (
    <div style={{ overflowY: 'auto', height: 'calc(100vh - 44px - 48px)' }}>
      {/* LEARNER TODO Week 4: add @tanstack/react-virtual here */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{
            position: 'sticky',
            top: 0,
            background: '#0f1117',
            borderBottom: '1px solid #21262d',
            fontSize: 11,
            color: '#8b949e',
            textTransform: 'uppercase',
          }}>
            <th style={{ textAlign: 'left', padding: '8px 20px', fontWeight: 500 }}>Symbol</th>
            <th style={{ textAlign: 'right', padding: '8px 20px', fontWeight: 500 }}>Price</th>
            <th style={{ textAlign: 'right', padding: '8px 20px', fontWeight: 500 }}>Time</th>
          </tr>
        </thead>
        <tbody>
          {symbols.map((s) => (
            <Row key={s} symbol={s} />
          ))}
        </tbody>
      </table>
    </div>
  )
})
