import { create } from 'zustand'
import type { Tick } from '@prep/types'

type TickStore = {
  ticks: Record<string, Tick>
  setTicks: (batch: Map<string, Tick>) => void
}

export const useTickStore = create<TickStore>((set) => ({
  ticks: {},
  setTicks: (batch) =>
    set((state) => {
      const next = { ...state.ticks }
      batch.forEach((tick, symbol) => {
        next[symbol] = tick
      })
      return { ticks: next }
    }),
}))
