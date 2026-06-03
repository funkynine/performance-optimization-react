import { useEffect, useRef } from 'react'
import { createBatcher } from '../utils/createBatcher'

export function useBatcher<K, V>(
  onFlush: (batch: Map<K, V>) => void,
  intervalMs = 16,
) {
  const onFlushRef = useRef(onFlush)
  onFlushRef.current = onFlush

  const batcherRef = useRef<ReturnType<typeof createBatcher<K, V>> | null>(null)

  useEffect(() => {
    const batcher = createBatcher<K, V>(
      (batch) => onFlushRef.current(batch),
      intervalMs,
    )
    batcherRef.current = batcher

    return () => batcher.stop()
  }, [intervalMs])

  return batcherRef
}
