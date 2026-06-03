import type { ServerMessage, Tick } from '@prep/types'
import { createBatcher } from '../../utils/createBatcher'

const batcher = createBatcher<string, Tick>((batch) => self.postMessage(batch))

self.onmessage = (event: MessageEvent<string>) => {
  const msg = JSON.parse(event.data) as ServerMessage

  if (msg.type === 'snapshot') {
    const batch = new Map<string, Tick>()
    msg.data.forEach((tick) => batch.set(tick.symbol, tick))
    self.postMessage(batch)
  } else if (msg.type === 'tick') {
    batcher.push(msg.data.symbol, msg.data)
  }
}
