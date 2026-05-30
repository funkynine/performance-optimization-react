export type Tick = {
  symbol: string
  price: number
  ts: number
}

export type ServerMessage =
  | { type: 'tick'; data: Tick }
  | { type: 'snapshot'; data: Tick[] }

export type ClientMessage = {
  type: 'config'
  rate: number
  count: number
}
