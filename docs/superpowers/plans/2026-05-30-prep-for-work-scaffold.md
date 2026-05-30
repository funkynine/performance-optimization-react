# prep-for-work Micro-Sandbox Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold a working Bloomberg-prep monorepo with a Node.js WS firehose server and a React 18 client (Vite + TypeScript) that has routing, Zustand tick store, rAF buffer, and dev tooling pre-wired — leaving intentional gaps for the learner to fill.

**Architecture:** Turbo + pnpm monorepo with three packages: `packages/types` (shared TS types), `apps/server` (Node.js WS firehose on port 4000), `apps/client` (Vite + React + react-router-dom v6). The client connects via `useFirehose()` hook, buffers ticks in a `Map` ref, and flushes to Zustand once per `requestAnimationFrame`.

**Tech Stack:** pnpm workspaces, Turborepo, Node.js + `ws`, Vite, React 18, TypeScript strict, react-router-dom v6, Zustand, `@welldone-software/why-did-you-render`, ESLint, Prettier

---

## File Map

```
prep-for-work/
├── package.json                              # pnpm workspace root
├── pnpm-workspace.yaml
├── turbo.json
├── .gitignore
├── .prettierrc
├── .eslintrc.cjs
│
├── packages/
│   └── types/
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           └── index.ts                      # Tick, ServerMessage, ClientMessage
│
├── apps/
│   ├── server/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts                      # WS server entry, port 4000
│   │       ├── firehose.ts                   # tick generator, configurable rate
│   │       └── symbols.ts                    # 500 symbols pool
│   │
│   └── client/
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── index.html
│       └── src/
│           ├── main.tsx                      # entry, why-did-you-render init
│           ├── App.tsx                       # Router + AppContext.Provider
│           ├── context/
│           │   └── AppContext.ts             # selectedSymbol, theme, dispatch
│           ├── store/
│           │   └── useTickStore.ts           # Zustand store: Record<symbol, Tick>
│           ├── hooks/
│           │   └── useFirehose.ts            # WS connect, Map buffer, rAF flush
│           ├── pages/
│           │   ├── DashboardPage.tsx         # StatsBar + TopVolatileList
│           │   ├── WatchlistPage.tsx         # WatchlistGrid wrapper
│           │   ├── ChartPage.tsx             # PriceChart canvas placeholder
│           │   └── SettingsPage.tsx          # rate + count sliders
│           └── components/
│               ├── StatsBar.tsx              # ticks/s counter + WS status badge
│               ├── TopVolatileList.tsx       # top-5 by price delta (last 50 ticks)
│               ├── WatchlistGrid.tsx         # 200 memo-wrapped Row components
│               ├── Row.tsx                   # memo + Zustand selector per symbol
│               └── PriceChart.tsx            # canvas ref, rAF loop placeholder
```

---

## Task 1: Monorepo Root Setup

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `turbo.json`
- Create: `.gitignore`
- Create: `.prettierrc`
- Create: `.eslintrc.cjs`

- [ ] **Step 1: Create root `package.json`**

```json
{
  "name": "prep-for-work",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "format": "prettier --write \"**/*.{ts,tsx,json,md}\""
  },
  "devDependencies": {
    "turbo": "^2.5.4",
    "prettier": "^3.5.3",
    "eslint": "^9.28.0",
    "@typescript-eslint/eslint-plugin": "^8.33.1",
    "@typescript-eslint/parser": "^8.33.1",
    "eslint-plugin-react": "^7.37.5",
    "eslint-plugin-react-hooks": "^5.2.0"
  },
  "packageManager": "pnpm@10.11.0"
}
```

- [ ] **Step 2: Create `pnpm-workspace.yaml`**

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

- [ ] **Step 3: Create `turbo.json`**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "dev": {
      "persistent": true,
      "cache": false
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    }
  }
}
```

- [ ] **Step 4: Create `.gitignore`**

```
node_modules/
dist/
.turbo/
*.local
```

- [ ] **Step 5: Create `.prettierrc`**

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100
}
```

- [ ] **Step 6: Create `.eslintrc.cjs`**

```js
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  settings: { react: { version: 'detect' } },
  rules: {
    'react/react-in-jsx-scope': 'off',
  },
}
```

- [ ] **Step 7: Install root deps**

```bash
pnpm install
```

Expected: `node_modules/` created at root, `.pnpm-lock.yaml` generated.

- [ ] **Step 8: Commit**

```bash
git add package.json pnpm-workspace.yaml turbo.json .gitignore .prettierrc .eslintrc.cjs pnpm-lock.yaml
git commit -m "chore: init monorepo root (turbo + pnpm workspaces)"
```

---

## Task 2: Shared Types Package

**Files:**
- Create: `packages/types/package.json`
- Create: `packages/types/tsconfig.json`
- Create: `packages/types/src/index.ts`

- [ ] **Step 1: Create `packages/types/package.json`**

```json
{
  "name": "@prep/types",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "lint": "echo 'no lint for types'"
  }
}
```

- [ ] **Step 2: Create `packages/types/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "declaration": true,
    "outDir": "dist"
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create `packages/types/src/index.ts`**

```ts
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
```

- [ ] **Step 4: Commit**

```bash
git add packages/
git commit -m "feat: add @prep/types shared package"
```

---

## Task 3: Server — WS Firehose

**Files:**
- Create: `apps/server/package.json`
- Create: `apps/server/tsconfig.json`
- Create: `apps/server/src/symbols.ts`
- Create: `apps/server/src/firehose.ts`
- Create: `apps/server/src/index.ts`

- [ ] **Step 1: Create `apps/server/package.json`**

```json
{
  "name": "@prep/server",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "lint": "eslint src"
  },
  "dependencies": {
    "ws": "^8.18.2"
  },
  "devDependencies": {
    "@prep/types": "workspace:*",
    "@types/node": "^22.15.21",
    "@types/ws": "^8.5.14",
    "tsx": "^4.19.4",
    "typescript": "^5.8.3"
  }
}
```

- [ ] **Step 2: Create `apps/server/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "paths": {
      "@prep/types": ["../../packages/types/src/index.ts"]
    }
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create `apps/server/src/symbols.ts`**

Generate 500 realistic-looking ticker symbols:

```ts
const BASES = [
  'AAPL','GOOG','MSFT','AMZN','META','TSLA','NVDA','NFLX','AMD','INTC',
  'ORCL','IBM','CSCO','QCOM','AVGO','TXN','MU','AMAT','LRCX','KLAC',
  'JPM','BAC','GS','MS','C','WFC','BLK','AXP','V','MA',
  'JNJ','PFE','MRK','ABBV','BMY','LLY','AMGN','GILD','BIIB','REGN',
  'XOM','CVX','COP','SLB','EOG','PXD','MPC','VLO','PSX','HAL',
]

function generateSymbols(): string[] {
  const symbols: string[] = [...BASES]
  const suffixes = ['A','B','C','X','Y','Z','1','2','3']
  while (symbols.length < 500) {
    const base = BASES[symbols.length % BASES.length]
    const suffix = suffixes[Math.floor(symbols.length / BASES.length) % suffixes.length]
    symbols.push(`${base}${suffix}`)
  }
  return symbols
}

export const SYMBOLS = generateSymbols()
```

- [ ] **Step 4: Create `apps/server/src/firehose.ts`**

```ts
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
```

- [ ] **Step 5: Create `apps/server/src/index.ts`**

```ts
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
```

- [ ] **Step 6: Install server deps**

```bash
pnpm install
```

- [ ] **Step 7: Smoke-test server starts**

```bash
cd apps/server && pnpm dev
```

Expected output: `[firehose] WS server listening on ws://localhost:4000`  
Stop with Ctrl+C after confirming.

- [ ] **Step 8: Commit**

```bash
git add apps/server/
git commit -m "feat: add WS firehose server (@prep/server)"
```

---

## Task 4: Client — Vite + TS Scaffold

**Files:**
- Create: `apps/client/package.json`
- Create: `apps/client/tsconfig.json`
- Create: `apps/client/vite.config.ts`
- Create: `apps/client/index.html`

- [ ] **Step 1: Create `apps/client/package.json`**

```json
{
  "name": "@prep/client",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint src"
  },
  "dependencies": {
    "@prep/types": "workspace:*",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.30.1",
    "zustand": "^5.0.4"
  },
  "devDependencies": {
    "@types/react": "^18.3.23",
    "@types/react-dom": "^18.3.7",
    "@vitejs/plugin-react": "^4.5.2",
    "@welldone-software/why-did-you-render": "^8.0.4",
    "typescript": "^5.8.3",
    "vite": "^6.3.5"
  }
}
```

- [ ] **Step 2: Create `apps/client/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "paths": {
      "@prep/types": ["../../packages/types/src/index.ts"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 3: Create `apps/client/tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 4: Create `apps/client/vite.config.ts`**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@prep/types': resolve(__dirname, '../../packages/types/src/index.ts'),
    },
  },
  server: {
    port: 3000,
  },
})
```

- [ ] **Step 5: Create `apps/client/index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>prep-for-work</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Install client deps**

```bash
pnpm install
```

- [ ] **Step 7: Commit**

```bash
git add apps/client/
git commit -m "feat: scaffold client app (vite + react18 + ts strict)"
```

---

## Task 5: Client — AppContext + Zustand Store

**Files:**
- Create: `apps/client/src/context/AppContext.ts`
- Create: `apps/client/src/store/useTickStore.ts`

- [ ] **Step 1: Create `apps/client/src/context/AppContext.ts`**

```ts
import { createContext, useContext, useReducer, Dispatch } from 'react'

type Theme = 'light' | 'dark'

type AppState = {
  selectedSymbol: string | null
  theme: Theme
}

type AppAction =
  | { type: 'SELECT_SYMBOL'; symbol: string | null }
  | { type: 'TOGGLE_THEME' }

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SELECT_SYMBOL':
      return { ...state, selectedSymbol: action.symbol }
    case 'TOGGLE_THEME':
      return { ...state, theme: state.theme === 'light' ? 'dark' : 'light' }
  }
}

const initialState: AppState = { selectedSymbol: null, theme: 'light' }

export const AppContext = createContext<{
  state: AppState
  dispatch: Dispatch<AppAction>
}>({ state: initialState, dispatch: () => {} })

export function useAppContext() {
  return useContext(AppContext)
}

export { useReducer, initialState, reducer }
export type { AppState, AppAction }
```

- [ ] **Step 2: Create `apps/client/src/store/useTickStore.ts`**

```ts
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
```

- [ ] **Step 3: Commit**

```bash
git add apps/client/src/context/ apps/client/src/store/
git commit -m "feat: add AppContext and Zustand tick store"
```

---

## Task 6: Client — useFirehose Hook

**Files:**
- Create: `apps/client/src/hooks/useFirehose.ts`

- [ ] **Step 1: Create `apps/client/src/hooks/useFirehose.ts`**

```ts
import { useEffect, useRef } from 'react'
import type { ServerMessage, Tick } from '@prep/types'
import { useTickStore } from '../store/useTickStore'

const WS_URL = 'ws://localhost:4000'

export type FirehoseStatus = 'connecting' | 'connected' | 'disconnected'

export function useFirehose(onStatusChange: (s: FirehoseStatus) => void) {
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
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/client/src/hooks/
git commit -m "feat: add useFirehose hook (WS + rAF buffer → Zustand)"
```

---

## Task 7: Client — Components

**Files:**
- Create: `apps/client/src/components/StatsBar.tsx`
- Create: `apps/client/src/components/TopVolatileList.tsx`
- Create: `apps/client/src/components/Row.tsx`
- Create: `apps/client/src/components/WatchlistGrid.tsx`
- Create: `apps/client/src/components/PriceChart.tsx`

- [ ] **Step 1: Create `apps/client/src/components/StatsBar.tsx`**

```tsx
import { memo, useEffect, useRef, useState } from 'react'
import { useTickStore } from '../store/useTickStore'
import type { FirehoseStatus } from '../hooks/useFirehose'

type Props = { status: FirehoseStatus }

export const StatsBar = memo(function StatsBar({ status }: Props) {
  const ticks = useTickStore((s) => s.ticks)
  const countRef = useRef(0)
  const [ticksPerSec, setTicksPerSec] = useState(0)
  const prevCountRef = useRef(Object.keys(ticks).length)

  useEffect(() => {
    countRef.current += 1
  })

  useEffect(() => {
    const id = setInterval(() => {
      setTicksPerSec(countRef.current)
      countRef.current = 0
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const statusColor = status === 'connected' ? '#22c55e' : status === 'connecting' ? '#f59e0b' : '#ef4444'

  return (
    <div style={{ display: 'flex', gap: 16, padding: '8px 16px', background: '#1e1e2e', color: '#cdd6f4', fontFamily: 'monospace', fontSize: 13 }}>
      <span>WS: <span style={{ color: statusColor }}>{status}</span></span>
      <span>ticks/s: <strong>{ticksPerSec}</strong></span>
      <span>symbols: <strong>{Object.keys(ticks).length}</strong></span>
    </div>
  )
})
```

- [ ] **Step 2: Create `apps/client/src/components/TopVolatileList.tsx`**

This component tracks price history per symbol (last 50 ticks) and computes delta.

```tsx
import { memo, useEffect, useRef, useState } from 'react'
import { useTickStore } from '../store/useTickStore'

type SymbolDelta = { symbol: string; price: number; delta: number }

export const TopVolatileList = memo(function TopVolatileList() {
  const ticks = useTickStore((s) => s.ticks)
  // history: symbol → [oldest, ..., newest] (max 50 prices)
  const historyRef = useRef<Map<string, number[]>>(new Map())
  const [top5, setTop5] = useState<SymbolDelta[]>([])

  useEffect(() => {
    Object.entries(ticks).forEach(([symbol, tick]) => {
      const hist = historyRef.current.get(symbol) ?? []
      hist.push(tick.price)
      if (hist.length > 50) hist.shift()
      historyRef.current.set(symbol, hist)
    })

    const deltas: SymbolDelta[] = []
    historyRef.current.forEach((hist, symbol) => {
      if (hist.length < 2) return
      const delta = Math.abs(hist[hist.length - 1] - hist[0])
      deltas.push({ symbol, price: hist[hist.length - 1], delta })
    })
    deltas.sort((a, b) => b.delta - a.delta)
    setTop5(deltas.slice(0, 5))
  }, [ticks])

  return (
    <div style={{ padding: 16, fontFamily: 'monospace', fontSize: 13 }}>
      <h3 style={{ marginBottom: 8 }}>Top 5 Volatile (last 50 ticks)</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>Symbol</th>
            <th style={{ textAlign: 'right' }}>Price</th>
            <th style={{ textAlign: 'right' }}>Δ</th>
          </tr>
        </thead>
        <tbody>
          {top5.map(({ symbol, price, delta }) => (
            <tr key={symbol}>
              <td>{symbol}</td>
              <td style={{ textAlign: 'right' }}>{price.toFixed(2)}</td>
              <td style={{ textAlign: 'right', color: '#f38ba8' }}>{delta.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
})
```

- [ ] **Step 3: Create `apps/client/src/components/Row.tsx`**

```tsx
import { memo } from 'react'
import { useTickStore } from '../store/useTickStore'
import { useAppContext } from '../context/AppContext'

type Props = { symbol: string }

export const Row = memo(function Row({ symbol }: Props) {
  const tick = useTickStore((s) => s.ticks[symbol])
  const { dispatch } = useAppContext()

  if (!tick) return null

  return (
    <tr
      onClick={() => dispatch({ type: 'SELECT_SYMBOL', symbol })}
      style={{ cursor: 'pointer', fontFamily: 'monospace', fontSize: 12 }}
    >
      <td style={{ padding: '2px 8px' }}>{symbol}</td>
      <td style={{ padding: '2px 8px', textAlign: 'right' }}>{tick.price.toFixed(2)}</td>
      <td style={{ padding: '2px 8px', textAlign: 'right', color: '#6c7086', fontSize: 10 }}>
        {new Date(tick.ts).toLocaleTimeString()}
      </td>
    </tr>
  )
})
```

- [ ] **Step 4: Create `apps/client/src/components/WatchlistGrid.tsx`**

```tsx
import { memo } from 'react'
import { useTickStore } from '../store/useTickStore'
import { Row } from './Row'

export const WatchlistGrid = memo(function WatchlistGrid() {
  const symbols = useTickStore((s) => Object.keys(s.ticks).slice(0, 200))

  return (
    <div style={{ overflowY: 'auto', height: 'calc(100vh - 80px)' }}>
      {/* LEARNER TODO Week 4: add @tanstack/react-virtual here */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ fontFamily: 'monospace', fontSize: 11, position: 'sticky', top: 0, background: '#1e1e2e', color: '#cdd6f4' }}>
            <th style={{ textAlign: 'left', padding: '4px 8px' }}>Symbol</th>
            <th style={{ textAlign: 'right', padding: '4px 8px' }}>Price</th>
            <th style={{ textAlign: 'right', padding: '4px 8px' }}>Time</th>
          </tr>
        </thead>
        <tbody>
          {symbols.map((s) => (
            <Row key={s} symbol={s} />
          ))}
        </tbody>
      </table>
    </div>
  )
})
```

- [ ] **Step 5: Create `apps/client/src/components/PriceChart.tsx`**

```tsx
import { memo, useEffect, useRef } from 'react'
import { useTickStore } from '../store/useTickStore'

type Props = { symbol: string }

export const PriceChart = memo(function PriceChart({ symbol }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pricesRef = useRef<number[]>([])
  const tick = useTickStore((s) => s.ticks[symbol])

  useEffect(() => {
    if (!tick) return
    pricesRef.current.push(tick.price)
    if (pricesRef.current.length > 200) pricesRef.current.shift()

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = canvas
    ctx.clearRect(0, 0, width, height)

    const prices = pricesRef.current
    if (prices.length < 2) return

    const min = Math.min(...prices)
    const max = Math.max(...prices)
    const range = max - min || 1

    ctx.strokeStyle = '#89b4fa'
    ctx.lineWidth = 1.5
    ctx.beginPath()

    prices.forEach((p, i) => {
      const x = (i / (prices.length - 1)) * width
      const y = height - ((p - min) / range) * height
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    })
    ctx.stroke()
    // LEARNER TODO Week 4: replace with uPlot or lightweight-charts
  }, [tick])

  return (
    <div style={{ padding: 16 }}>
      <h3 style={{ fontFamily: 'monospace', marginBottom: 8 }}>{symbol}</h3>
      <canvas
        ref={canvasRef}
        width={600}
        height={200}
        style={{ background: '#1e1e2e', borderRadius: 4, display: 'block' }}
      />
      <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#6c7086', marginTop: 4 }}>
        Price: {tick?.price.toFixed(2) ?? '—'}
      </p>
    </div>
  )
})
```

- [ ] **Step 6: Commit**

```bash
git add apps/client/src/components/
git commit -m "feat: add StatsBar, TopVolatileList, Row, WatchlistGrid, PriceChart components"
```

---

## Task 8: Client — Pages

**Files:**
- Create: `apps/client/src/pages/DashboardPage.tsx`
- Create: `apps/client/src/pages/WatchlistPage.tsx`
- Create: `apps/client/src/pages/ChartPage.tsx`
- Create: `apps/client/src/pages/SettingsPage.tsx`

- [ ] **Step 1: Create `apps/client/src/pages/DashboardPage.tsx`**

```tsx
import { StatsBar } from '../components/StatsBar'
import { TopVolatileList } from '../components/TopVolatileList'
import type { FirehoseStatus } from '../hooks/useFirehose'

type Props = { status: FirehoseStatus }

export function DashboardPage({ status }: Props) {
  return (
    <div>
      <StatsBar status={status} />
      <TopVolatileList />
    </div>
  )
}
```

- [ ] **Step 2: Create `apps/client/src/pages/WatchlistPage.tsx`**

```tsx
import { WatchlistGrid } from '../components/WatchlistGrid'

export function WatchlistPage() {
  return (
    <div>
      <h2 style={{ fontFamily: 'monospace', padding: '8px 16px', margin: 0 }}>Watchlist</h2>
      <WatchlistGrid />
    </div>
  )
}
```

- [ ] **Step 3: Create `apps/client/src/pages/ChartPage.tsx`**

```tsx
import { useParams, Navigate } from 'react-router-dom'
import { PriceChart } from '../components/PriceChart'

export function ChartPage() {
  const { symbol } = useParams<{ symbol: string }>()
  if (!symbol) return <Navigate to="/dashboard" replace />
  return <PriceChart symbol={symbol} />
}
```

- [ ] **Step 4: Create `apps/client/src/pages/SettingsPage.tsx`**

```tsx
import { useState, useCallback, useRef } from 'react'
import type { ClientMessage } from '@prep/types'

type Props = { ws: WebSocket | null }

export function SettingsPage({ ws }: Props) {
  const [rate, setRate] = useState(500)
  const [count, setCount] = useState(200)

  const sendConfig = useCallback(() => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return
    const msg: ClientMessage = { type: 'config', rate, count }
    ws.send(JSON.stringify(msg))
  }, [ws, rate, count])

  return (
    <div style={{ padding: 24, fontFamily: 'monospace', maxWidth: 480 }}>
      <h2>Settings</h2>

      <label style={{ display: 'block', marginBottom: 16 }}>
        <span>Tick rate: <strong>{rate}/s</strong></span>
        <input
          type="range" min={10} max={5000} step={10} value={rate}
          onChange={(e) => setRate(Number(e.target.value))}
          style={{ display: 'block', width: '100%', marginTop: 4 }}
        />
      </label>

      <label style={{ display: 'block', marginBottom: 16 }}>
        <span>Symbol count: <strong>{count}</strong></span>
        <input
          type="range" min={10} max={500} step={10} value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          style={{ display: 'block', width: '100%', marginTop: 4 }}
        />
      </label>

      <button
        onClick={sendConfig}
        style={{ padding: '8px 16px', cursor: 'pointer', fontFamily: 'monospace' }}
      >
        Apply
      </button>
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add apps/client/src/pages/
git commit -m "feat: add page components (dashboard, watchlist, chart, settings)"
```

---

## Task 9: Client — App Entry + Routing

**Files:**
- Create: `apps/client/src/App.tsx`
- Create: `apps/client/src/main.tsx`

- [ ] **Step 1: Create `apps/client/src/App.tsx`**

```tsx
import { useReducer, useRef, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom'
import { AppContext, reducer, initialState } from './context/AppContext'
import { useFirehose, FirehoseStatus } from './hooks/useFirehose'
import { DashboardPage } from './pages/DashboardPage'
import { WatchlistPage } from './pages/WatchlistPage'
import { ChartPage } from './pages/ChartPage'
import { SettingsPage } from './pages/SettingsPage'

const navStyle = { display: 'flex', gap: 16, padding: '8px 16px', background: '#181825', borderBottom: '1px solid #313244' }
const linkStyle = { fontFamily: 'monospace', fontSize: 13, color: '#cdd6f4', textDecoration: 'none' }
const activeLinkStyle = { ...linkStyle, color: '#89b4fa', borderBottom: '2px solid #89b4fa' }

export function App() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [status, setStatus] = useState<FirehoseStatus>('connecting')

  const wsRef = useFirehose(setStatus)

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      <BrowserRouter>
        <nav style={navStyle}>
          <NavLink to="/dashboard" style={({ isActive }) => isActive ? activeLinkStyle : linkStyle}>Dashboard</NavLink>
          <NavLink to="/watchlist" style={({ isActive }) => isActive ? activeLinkStyle : linkStyle}>Watchlist</NavLink>
          {state.selectedSymbol && (
            <NavLink to={`/chart/${state.selectedSymbol}`} style={({ isActive }) => isActive ? activeLinkStyle : linkStyle}>
              Chart: {state.selectedSymbol}
            </NavLink>
          )}
          <NavLink to="/settings" style={({ isActive }) => isActive ? activeLinkStyle : linkStyle}>Settings</NavLink>
        </nav>

        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage status={status} />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
          <Route path="/chart/:symbol" element={<ChartPage />} />
          <Route path="/settings" element={<SettingsPage ws={wsRef.current} />} />
        </Routes>
      </BrowserRouter>
    </AppContext.Provider>
  )
}
```

- [ ] **Step 2: Create `apps/client/src/main.tsx`**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'

if (import.meta.env.DEV) {
  const { default: whyDidYouRender } = await import('@welldone-software/why-did-you-render')
  whyDidYouRender(React, { trackAllPureComponents: true })
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

Fix the React import needed by why-did-you-render — add to top of `main.tsx`:

```tsx
import React from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'

if (import.meta.env.DEV) {
  const { default: whyDidYouRender } = await import('@welldone-software/why-did-you-render')
  whyDidYouRender(React, { trackAllPureComponents: true })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 3: Update `useFirehose.ts` to return the WS ref**

Replace the closing line of `useFirehose` so `App.tsx` can access the socket for `SettingsPage`:

```ts
// Full updated signature + return at end of useFirehose.ts
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
```

Add `import React from 'react'` at the top of `useFirehose.ts`.

- [ ] **Step 4: Commit**

```bash
git add apps/client/src/
git commit -m "feat: wire App entry, routing, and firehose to full client"
```

---

## Task 10: Full Integration Smoke Test

- [ ] **Step 1: Start both apps from monorepo root**

```bash
pnpm dev
```

Expected: Turbo starts both `@prep/server` and `@prep/client` in parallel.  
Server logs: `[firehose] WS server listening on ws://localhost:4000`  
Client logs: Vite ready on `http://localhost:3000`

- [ ] **Step 2: Open browser at `http://localhost:3000`**

Expected: redirects to `/dashboard`, StatsBar shows WS: **connected**, ticks/s > 0, top-5 symbols populate.

- [ ] **Step 3: Navigate to `/watchlist`**

Expected: 200 rows visible, prices updating continuously.

- [ ] **Step 4: Click a row → verify chart nav**

Expected: "Chart: AAPL" (or whichever symbol) appears in nav, navigating to `/chart/AAPL` shows live canvas sparkline.

- [ ] **Step 5: Go to `/settings`, crank rate to 2000, hit Apply**

Expected: ticks/s on dashboard rises noticeably.

- [ ] **Step 6: Open React DevTools Profiler, record 5s on `/watchlist`**

Expected: `why-did-you-render` logs in console, Profiler shows renders isolated to individual `<Row>` components — not the whole grid.

- [ ] **Step 7: Final commit**

```bash
git add .
git commit -m "chore: integration smoke test passed — baseline scaffold complete"
```

---

## Task 11: README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Create `README.md`**

````markdown
# prep-for-work

Bloomberg/DataArt 4-week senior React prep micro-sandbox.

## Quick Start

```bash
pnpm install
pnpm dev
```

Opens client at `http://localhost:3000` and WS firehose at `ws://localhost:4000`.

## Structure

```
apps/client   React 18 + Vite + TypeScript
apps/server   Node.js WS firehose (tsx watch)
packages/types  Shared Tick / ServerMessage / ClientMessage types
```

## Dev Tooling

- **React DevTools:** Install the [Chrome extension](https://react.dev/learn/react-developer-tools). Enable "Highlight updates when components render" in the Profiler tab settings.
- **why-did-you-render:** Already wired in dev mode. Watch the console for wasted renders.
- **Chrome DevTools Performance panel:** Record while at `/watchlist` to get flamegraphs.
- **Chrome DevTools Memory tab:** Heap snapshots — take one at rest, one under load, compare.

## Intentional Gaps (your learning surface)

| Week | What to add |
|---|---|
| 1 | Profile `<WatchlistGrid>`, shrink render subtree with `memo` + selectors |
| 2 | Move tick parsing to a Web Worker (`Comlink`) |
| 3 | Replace Zustand store with Jotai atom-per-symbol, compare render counts |
| 4 | Add `@tanstack/react-virtual`, keyboard nav, wire `uPlot`/`lightweight-charts` |
| All | Run Lighthouse, find issues, fix them |
````

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add README with quick start and learning guide"
```
