import { useState, useCallback } from 'react'
import type { ClientMessage } from '@prep/types'

type Props = { ws: WebSocket | null }

export function SettingsPage({ ws }: Props) {
  const [rate, setRate] = useState(500)
  const [count, setCount] = useState(200)
  const [hover, setHover] = useState(false)

  const sendConfig = useCallback(() => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return
    const msg: ClientMessage = { type: 'config', rate, count }
    ws.send(JSON.stringify(msg))
  }, [ws, rate, count])

  return (
    <div style={{ background: '#0f1117', minHeight: 'calc(100vh - 44px)', padding: 24 }}>
      <div style={{ maxWidth: 480 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#e6edf3', margin: '0 0 24px' }}>Settings</h2>

        <label style={{ display: 'block', marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: '#8b949e', marginBottom: 6 }}>
            Tick rate: <span style={{ color: '#e6edf3', fontWeight: 600, fontFamily: 'monospace' }}>{rate}/s</span>
          </div>
          <input
            type="range" min={10} max={5000} step={10} value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            style={{ display: 'block', width: '100%', accentColor: '#1f6feb' }}
          />
        </label>

        <div style={{ borderTop: '1px solid #21262d', margin: '4px 0 20px' }} />

        <label style={{ display: 'block', marginBottom: 24 }}>
          <div style={{ fontSize: 13, color: '#8b949e', marginBottom: 6 }}>
            Symbol count: <span style={{ color: '#e6edf3', fontWeight: 600, fontFamily: 'monospace' }}>{count}</span>
          </div>
          <input
            type="range" min={10} max={500} step={10} value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            style={{ display: 'block', width: '100%', accentColor: '#1f6feb' }}
          />
        </label>

        <button
          onClick={sendConfig}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{
            background: hover ? '#388bfd' : '#1f6feb',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '8px 20px',
            fontSize: 13,
            fontFamily: 'monospace',
            cursor: 'pointer',
          }}
        >
          Apply
        </button>
      </div>
    </div>
  )
}
