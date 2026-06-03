import { CSSProperties, memo, useRef } from 'react'
import { useTickStore } from '../store/useTickStore'
import { Row } from './Row'
import { useShallow } from 'zustand/shallow'
import { useVirtualizer } from '@tanstack/react-virtual'

const GRID_COLUMNS = '1fr 100px 150px'
const ROW_HEIGHT = 35

const headerStyles: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: GRID_COLUMNS,
  position: 'sticky',
  top: 0,
  background: '#0f1117',
  borderBottom: '1px solid #21262d',
  fontSize: 11,
  color: '#8b949e',
  textTransform: 'uppercase',
}

const headerCellStyles: CSSProperties = {
  padding: '8px 20px',
  fontWeight: 500,
}

export const WatchlistGrid = memo(function WatchlistGrid() {
  const parentRef = useRef<HTMLDivElement>(null)
  const symbols = useTickStore(useShallow((s) => Object.keys(s.ticks).slice(0, 200)))

  const virtualizer = useVirtualizer({
    count: symbols.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5,
  })

  const virtualItems = virtualizer.getVirtualItems()

  return (
    <div ref={parentRef} style={{ overflowY: 'auto', height: 'calc(100vh - 44px - 48px)' }}>
      <div style={headerStyles}>
        <span style={headerCellStyles}>Symbol</span>
        <span style={{ ...headerCellStyles, textAlign: 'right' }}>Price</span>
        <span style={{ ...headerCellStyles, textAlign: 'right' }}>Time</span>
      </div>

      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualItems.map((virtualRow) => (
          <div
            key={virtualRow.key}
            style={{ position: 'absolute', top: 0, width: '100%', transform: `translateY(${virtualRow.start}px)` }}
          >
            <Row symbol={symbols[virtualRow.index]} columns={GRID_COLUMNS} />
          </div>
        ))}
      </div>
    </div>
  )
})
