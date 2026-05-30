import { WebSocketServer, WebSocket } from 'ws'
import type { ClientMessage, ServerMessage } from '@prep/types'
import { createFirehose, nextTick, snapshot, updateConfig } from './firehose.js'

const PORT = 4000
const DEFAULT_RATE = 500
const DEFAULT_COUNT = 200

const state = createFirehose({ rate: DEFAULT_RATE, count: DEFAULT_COUNT })
const wss = new WebSocketServer({ port: PORT })

console.log(`[firehose] WS server listening on ws://localhost:${PORT}`)

wss.on('connection', (ws: WebSocket) => {
  console.log('[firehose] client connected')

  const msg: ServerMessage = { type: 'snapshot', data: snapshot(state) }
  ws.send(JSON.stringify(msg))

  ws.on('message', (raw) => {
    try {
      const parsed = JSON.parse(raw.toString()) as ClientMessage
      if (parsed.type === 'config') {
        updateConfig(state, { rate: parsed.rate, count: parsed.count })
        console.log(`[firehose] config updated: rate=${parsed.rate} count=${parsed.count}`)
      }
    } catch {
      // ignore malformed messages
    }
  })

  ws.on('close', () => console.log('[firehose] client disconnected'))
})

// broadcast loop — fires at current rate
function broadcastLoop() {
  const tick = nextTick(state)
  const msg: ServerMessage = { type: 'tick', data: tick }
  const payload = JSON.stringify(msg)
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload)
    }
  })
  const interval = Math.max(1, Math.floor(1000 / state.config.rate))
  setTimeout(broadcastLoop, interval)
}

broadcastLoop()
