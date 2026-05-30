import { memo, useEffect, useRef, useState } from 'react'
import { useTickStore } from '../store/useTickStore'
import type { FirehoseStatus } from '../hooks/useFirehose'

type Props = { status: FirehoseStatus }

export const StatsBar = memo(function StatsBar({ status }: Props) {
  const ticks = useTickStore((s) => s.ticks)
  const countRef = useRef(0)
  const [ticksPerSec, setTicksPerSec] = useState(0)

  useEffect(() => {
    countRef.current += 1
  })

  useEffect(() => {
    const id = setInterval(() => {
      setTicksPerSec(countRef.current)
      countRef.current = 0
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const statusColor = status === 'connected' ? '#22c55e' : status === 'connecting' ? '#f59e0b' : '#ef4444'

  return (
    <div style={{ display: 'flex', gap: 16, padding: '8px 16px', background: '#1e1e2e', color: '#cdd6f4', fontFamily: 'monospace', fontSize: 13 }}>
      <span>WS: <span style={{ color: statusColor }}>{status}</span></span>
      <span>ticks/s: <strong>{ticksPerSec}</strong></span>
      <span>symbols: <strong>{Object.keys(ticks).length}</strong></span>
    </div>
  )
})
