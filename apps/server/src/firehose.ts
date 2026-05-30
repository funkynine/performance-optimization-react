import type { Tick } from '@prep/types'
import { SYMBOLS } from './symbols.js'

export type FirehoseConfig = {
  rate: number   // ticks per second
  count: number  // number of active symbols
}

export type FirehoseState = {
  prices: Map<string, number>
  config: FirehoseConfig
}

export function createFirehose(initial: FirehoseConfig): FirehoseState {
  const prices = new Map<string, number>()
  SYMBOLS.slice(0, initial.count).forEach((s) => {
    prices.set(s, 100 + Math.random() * 900)
  })
  return { prices, config: { ...initial } }
}

export function nextTick(state: FirehoseState): Tick {
  const symbols = Array.from(state.prices.keys())
  const symbol = symbols[Math.floor(Math.random() * symbols.length)]
  const prev = state.prices.get(symbol)!
  const delta = (Math.random() - 0.5) * prev * 0.002
  const price = Math.max(0.01, prev + delta)
  state.prices.set(symbol, price)
  return { symbol, price: Math.round(price * 100) / 100, ts: Date.now() }
}

export function snapshot(state: FirehoseState): Tick[] {
  return Array.from(state.prices.entries()).map(([symbol, price]) => ({
    symbol,
    price: Math.round(price * 100) / 100,
    ts: Date.now(),
  }))
}

export function updateConfig(state: FirehoseState, next: FirehoseConfig): void {
  state.config = { ...next }
  // add new symbols if count increased
  SYMBOLS.slice(0, next.count).forEach((s) => {
    if (!state.prices.has(s)) {
      state.prices.set(s, 100 + Math.random() * 900)
    }
  })
  // remove symbols if count decreased
  const toRemove = Array.from(state.prices.keys()).slice(next.count)
  toRemove.forEach((s) => state.prices.delete(s))
}
