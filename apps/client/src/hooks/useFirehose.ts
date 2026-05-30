import React, { useEffect, useRef } from 'react'
import type { ServerMessage, Tick } from '@prep/types'
import { useTickStore } from '../store/useTickStore'

const WS_URL = 'ws://localhost:4000'

export type FirehoseStatus = 'connecting' | 'connected' | 'disconnected'

export function useFirehose(onStatusChange: (s: FirehoseStatus) => void): React.RefObject<WebSocket | null> {
  const setTicks = useTickStore((s) => s.setTicks)
  const buffer = useRef<Map<string, Tick>>(new Map())
  const rafRef = useRef<number | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    onStatusChange('connecting')
    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onopen = () => onStatusChange('connected')
    ws.onclose = () => onStatusChange('disconnected')

    ws.onmessage = (event: MessageEvent) => {
      const msg = JSON.parse(event.data as string) as ServerMessage
      if (msg.type === 'snapshot') {
        const initial = new Map<string, Tick>()
        msg.data.forEach((tick) => initial.set(tick.symbol, tick))
        setTicks(initial)
      } else if (msg.type === 'tick') {
        buffer.current.set(msg.data.symbol, msg.data)
      }
    }

    function flush() {
      if (buffer.current.size > 0) {
        setTicks(buffer.current)
        buffer.current = new Map()
      }
      rafRef.current = requestAnimationFrame(flush)
    }
    rafRef.current = requestAnimationFrame(flush)

    return () => {
      ws.close()
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return wsRef
}
