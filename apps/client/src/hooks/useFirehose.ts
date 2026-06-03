import React, { useEffect, useRef } from 'react'
import type { Tick } from '@prep/types'
import { useTickStore } from '../store/useTickStore'
import ParseWorker from './workers/parse-socket.worker.ts?worker'

const WS_URL = 'ws://localhost:4000'

export type FirehoseStatus = 'connecting' | 'connected' | 'disconnected'

export function useFirehose(onStatusChange: (s: FirehoseStatus) => void): React.RefObject<WebSocket | null> {
  const setTicks = useTickStore((s) => s.setTicks)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    const worker = new ParseWorker()
    const ws = initializeSockets(worker)

    return () => {
      ws.close()
      worker.terminate()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function initializeSockets(worker: Worker): WebSocket {
    onStatusChange('connecting')
    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onopen = () => onStatusChange('connected')
    ws.onclose = () => onStatusChange('disconnected')
    ws.onmessage = (event: MessageEvent<string>) => worker.postMessage(event.data)

    worker.onmessage = (event: MessageEvent<Map<string, Tick>>) => setTicks(event.data)

    return ws
  }

  return wsRef
}
