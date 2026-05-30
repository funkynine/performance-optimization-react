import { memo } from 'react'
import { useTickStore } from '../store/useTickStore'
import { Row } from './Row'

export const WatchlistGrid = memo(function WatchlistGrid() {
  const symbols = useTickStore((s) => Object.keys(s.ticks).slice(0, 200))

  return (
    <div style={{ overflowY: 'auto', height: 'calc(100vh - 80px)' }}>
      {/* LEARNER TODO Week 4: add @tanstack/react-virtual here */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ fontFamily: 'monospace', fontSize: 11, position: 'sticky', top: 0, background: '#1e1e2e', color: '#cdd6f4' }}>
            <th style={{ textAlign: 'left', padding: '4px 8px' }}>Symbol</th>
            <th style={{ textAlign: 'right', padding: '4px 8px' }}>Price</th>
            <th style={{ textAlign: 'right', padding: '4px 8px' }}>Time</th>
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
