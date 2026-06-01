import { memo } from 'react'
import type { CSSProperties } from 'react'
import { useTickStore } from '../store/useTickStore'
import { useTicksPerSec } from '../hooks/useTicksPerSec'
import type { FirehoseStatus } from '../hooks/useFirehose'

type Props = { status: FirehoseStatus }

const card: CSSProperties = {
  background: '#161b22',
  border: '1px solid #21262d',
  borderRadius: 8,
  padding: 16,
}

const labelStyle: CSSProperties = {
  fontSize: 11,
  color: '#8b949e',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: 4,
}

const valueStyle: CSSProperties = {
  fontSize: 24,
  fontWeight: 700,
  color: '#e6edf3',
  fontFamily: 'monospace',
}

export const StatsBar = memo(function StatsBar({ status }: Props) {
  const symbolCount = useTickStore((s) => Object.keys(s.ticks).length)
  const ticksPerSec = useTicksPerSec()

  const statusColor = status === 'connected' ? '#3fb950' : status === 'connecting' ? '#f0883e' : '#f85149'
  const statusIcon = status === 'connected' ? '●' : status === 'connecting' ? '◌' : '✕'

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, padding: 20 }}>
      <div style={card}>
        <div style={labelStyle}>Ticks / s</div>
        <div style={valueStyle}>{ticksPerSec}</div>
      </div>
      <div style={card}>
        <div style={labelStyle}>Symbols</div>
        <div style={valueStyle}>{symbolCount}</div>
      </div>
      <div style={card}>
        <div style={labelStyle}>WS Status</div>
        <div style={{ ...valueStyle, fontSize: 16, color: statusColor }}>
          {statusIcon} {status}
        </div>
      </div>
    </div>
  )
})
