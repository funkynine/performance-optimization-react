import { useState, useCallback } from 'react'
import type { ClientMessage } from '@prep/types'

type Props = { ws: WebSocket | null }

export function SettingsPage({ ws }: Props) {
  const [rate, setRate] = useState(500)
  const [count, setCount] = useState(200)

  const sendConfig = useCallback(() => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return
    const msg: ClientMessage = { type: 'config', rate, count }
    ws.send(JSON.stringify(msg))
  }, [ws, rate, count])

  return (
    <div style={{ padding: 24, fontFamily: 'monospace', maxWidth: 480 }}>
      <h2>Settings</h2>

      <label style={{ display: 'block', marginBottom: 16 }}>
        <span>Tick rate: <strong>{rate}/s</strong></span>
        <input
          type="range" min={10} max={5000} step={10} value={rate}
          onChange={(e) => setRate(Number(e.target.value))}
          style={{ display: 'block', width: '100%', marginTop: 4 }}
        />
      </label>

      <label style={{ display: 'block', marginBottom: 16 }}>
        <span>Symbol count: <strong>{count}</strong></span>
        <input
          type="range" min={10} max={500} step={10} value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          style={{ display: 'block', width: '100%', marginTop: 4 }}
        />
      </label>

      <button
        onClick={sendConfig}
        style={{ padding: '8px 16px', cursor: 'pointer', fontFamily: 'monospace' }}
      >
        Apply
      </button>
    </div>
  )
}
