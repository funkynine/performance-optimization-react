export interface Batcher<K, V> {
  push: (key: K, value: V) => void
  stop: () => void
}

export function createBatcher<K, V>(
  onFlush: (batch: Map<K, V>) => void,
  intervalMs = 16,
): Batcher<K, V> {
  const buffer = new Map<K, V>()
  let timerId: ReturnType<typeof setTimeout> | null = null

  function flush() {
    if (buffer.size > 0) {
      onFlush(new Map(buffer))
      buffer.clear()
    }
    timerId = setTimeout(flush, intervalMs)
  }

  function push(key: K, value: V) {
    buffer.set(key, value)
  }

  function stop() {
    if (timerId !== null) clearTimeout(timerId)
  }

  timerId = setTimeout(flush, intervalMs)

  return { push, stop }
}
