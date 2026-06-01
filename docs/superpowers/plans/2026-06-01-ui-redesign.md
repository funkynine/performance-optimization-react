# UI Redesign — Modern Dark Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing Catppuccin inline styles with a Modern Dark Dashboard (GitHub-inspired) design across all client pages and components.

**Architecture:** Pure inline styles throughout, with one exception: a single `<style>` block in `index.html` for the `.watchlist-row:hover` rule (inline styles cannot express pseudo-selectors; using onMouseEnter/Leave per row would cause per-row state and hurt render performance). A shared `useTicksPerSec` hook is extracted so the nav bar and Dashboard KPI cards both read the same counter without duplicating logic.

**Tech Stack:** React 18, inline styles, no new dependencies

---

## File Map

```
apps/client/
├── index.html                          MODIFY — add global body reset + .watchlist-row:hover
├── src/
│   ├── App.tsx                         MODIFY — new nav bar styles, ticks/s in nav right
│   ├── hooks/
│   │   └── useTicksPerSec.ts           CREATE — shared ticks/s counter hook
│   ├── components/
│   │   ├── StatsBar.tsx                MODIFY — 3 KPI cards layout, new palette
│   │   ├── TopVolatileList.tsx         MODIFY — new table styles, palette
│   │   ├── Row.tsx                     MODIFY — new cell styles + className="watchlist-row"
│   │   ├── WatchlistGrid.tsx           MODIFY — new wrapper + sticky header styles
│   │   └── PriceChart.tsx              MODIFY — new wrapper, canvas bg, stroke color
│   └── pages/
│       ├── DashboardPage.tsx           MODIFY — page wrapper background
│       ├── WatchlistPage.tsx           MODIFY — page wrapper + title style
│       ├── ChartPage.tsx               MODIFY — wrapper + header row layout
│       └── SettingsPage.tsx            MODIFY — new form styles, Apply button
```

---

## Design Tokens (reference for all tasks)

```ts
const C = {
  bg:          '#0f1117',
  surface:     '#161b22',
  border:      '#21262d',
  textPrimary: '#e6edf3',
  textMuted:   '#8b949e',
  accentBlue:  '#58a6ff',
  activeUnder: '#1f6feb',
  green:       '#3fb950',
  red:         '#f85149',
  amber:       '#f0883e',
  hoverRow:    '#1c2128',
  navBg:       '#161b22',
}
```

---

## Task 1: Global Body Reset + Hover Rule

**Files:**
- Modify: `apps/client/index.html`

- [ ] **Step 1: Update `index.html`**

Replace the entire file with:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>prep-for-work</title>
    <style>
      *, *::before, *::after { box-sizing: border-box; }
      body {
        margin: 0;
        background: #0f1117;
        color: #e6edf3;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 14px;
        -webkit-font-smoothing: antialiased;
      }
      .watchlist-row:hover { background: #1c2128; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add apps/client/index.html
git commit -m "style: add global body reset and watchlist row hover"
```

---

## Task 2: Extract `useTicksPerSec` Hook

**Files:**
- Create: `apps/client/src/hooks/useTicksPerSec.ts`

- [ ] **Step 1: Create `apps/client/src/hooks/useTicksPerSec.ts`**

```ts
import { useEffect, useRef, useState } from 'react'
import { useTickStore } from '../store/useTickStore'

export function useTicksPerSec(): number {
  const ticks = useTickStore((s) => s.ticks)
  const countRef = useRef(0)
  const [ticksPerSec, setTicksPerSec] = useState(0)

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

  return ticksPerSec
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/client/src/hooks/useTicksPerSec.ts
git commit -m "refactor: extract useTicksPerSec hook"
```

---

## Task 3: Redesign `App.tsx` — Top Navigation Bar

**Files:**
- Modify: `apps/client/src/App.tsx`

The nav bar gets: logo left, links centre, WS status dot + ticks/s right. Height 44px.

- [ ] **Step 1: Replace `App.tsx`**

```tsx
import { useReducer, useState } from 'react'
import type { CSSProperties } from 'react'
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom'
import { AppContext, reducer, initialState } from './context/AppContext'
import { useFirehose } from './hooks/useFirehose'
import { useTicksPerSec } from './hooks/useTicksPerSec'
import type { FirehoseStatus } from './hooks/useFirehose'
import { DashboardPage } from './pages/DashboardPage'
import { WatchlistPage } from './pages/WatchlistPage'
import { ChartPage } from './pages/ChartPage'
import { SettingsPage } from './pages/SettingsPage'

function StatusDot({ status }: { status: FirehoseStatus }) {
  const color = status === 'connected' ? '#3fb950' : status === 'connecting' ? '#f0883e' : '#f85149'
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
      <span style={{ color, fontSize: 11, fontFamily: 'monospace' }}>{status}</span>
    </span>
  )
}

export function App() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [status, setStatus] = useState<FirehoseStatus>('connecting')
  const wsRef = useFirehose(setStatus)
  const ticksPerSec = useTicksPerSec()

  const navBase: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 24,
    padding: '0 20px',
    height: 44,
    background: '#161b22',
    borderBottom: '1px solid #21262d',
    flexShrink: 0,
  }

  const linkBase: CSSProperties = {
    fontSize: 13,
    color: '#8b949e',
    textDecoration: 'none',
    padding: '4px 0',
    borderBottom: '2px solid transparent',
  }

  const activeLink: CSSProperties = {
    ...linkBase,
    color: '#58a6ff',
    borderBottom: '2px solid #1f6feb',
  }

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      <BrowserRouter>
        <nav style={navBase}>
          <span style={{ color: '#58a6ff', fontWeight: 700, fontSize: 13, marginRight: 4 }}>◈ prep-for-work</span>
          <span style={{ width: 1, height: 16, background: '#21262d', flexShrink: 0 }} />
          <NavLink to="/dashboard" style={({ isActive }) => isActive ? activeLink : linkBase}>Dashboard</NavLink>
          <NavLink to="/watchlist" style={({ isActive }) => isActive ? activeLink : linkBase}>Watchlist</NavLink>
          {state.selectedSymbol && (
            <NavLink to={`/chart/${state.selectedSymbol}`} style={({ isActive }) => isActive ? activeLink : linkBase}>
              Chart: {state.selectedSymbol}
            </NavLink>
          )}
          <NavLink to="/settings" style={({ isActive }) => isActive ? activeLink : linkBase}>Settings</NavLink>
          <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            <StatusDot status={status} />
            <span style={{ color: '#8b949e', fontSize: 12, fontFamily: 'monospace' }}>{ticksPerSec}/s</span>
          </span>
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

- [ ] **Step 2: Commit**

```bash
git add apps/client/src/App.tsx apps/client/src/hooks/useTicksPerSec.ts
git commit -m "style: redesign top nav bar (modern dark, status dot, ticks/s)"
```

---

## Task 4: Redesign `StatsBar` — 3 KPI Cards

**Files:**
- Modify: `apps/client/src/components/StatsBar.tsx`

StatsBar becomes 3 side-by-side cards: ticks/s, symbol count, WS status. Pulls ticks/s from the new hook.

- [ ] **Step 1: Replace `apps/client/src/components/StatsBar.tsx`**

```tsx
import { memo } from 'react'
import { useTickStore } from '../store/useTickStore'
import { useTicksPerSec } from '../hooks/useTicksPerSec'
import type { FirehoseStatus } from '../hooks/useFirehose'

type Props = { status: FirehoseStatus }

const card: React.CSSProperties = {
  background: '#161b22',
  border: '1px solid #21262d',
  borderRadius: 8,
  padding: 16,
}

const label: React.CSSProperties = {
  fontSize: 11,
  color: '#8b949e',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: 4,
}

const value: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 700,
  color: '#e6edf3',
  fontFamily: 'monospace',
}

export const StatsBar = memo(function StatsBar({ status }: Props) {
  const symbolCount = useTickStore((s) => Object.keys(s.ticks).length)
  const ticksPerSec = useTicksPerSec()

  const statusColor = status === 'connected' ? '#3fb950' : status === 'connecting' ? '#f0883e' : '#f85149'
  const statusIcon = status === 'connected' ? '●' : status === 'connecting' ? '◌' : '✕'

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, padding: 20 }}>
      <div style={card}>
        <div style={label}>Ticks / s</div>
        <div style={value}>{ticksPerSec}</div>
      </div>
      <div style={card}>
        <div style={label}>Symbols</div>
        <div style={value}>{symbolCount}</div>
      </div>
      <div style={card}>
        <div style={label}>WS Status</div>
        <div style={{ ...value, fontSize: 16, color: statusColor }}>
          {statusIcon} {status}
        </div>
      </div>
    </div>
  )
})
```

- [ ] **Step 2: Commit**

```bash
git add apps/client/src/components/StatsBar.tsx
git commit -m "style: StatsBar → 3 KPI cards (modern dark)"
```

---

## Task 5: Redesign `TopVolatileList`

**Files:**
- Modify: `apps/client/src/components/TopVolatileList.tsx`

- [ ] **Step 1: Replace `apps/client/src/components/TopVolatileList.tsx`**

```tsx
import { memo, useEffect, useRef, useState } from 'react'
import { useTickStore } from '../store/useTickStore'

type SymbolDelta = { symbol: string; price: number; delta: number }

export const TopVolatileList = memo(function TopVolatileList() {
  const ticks = useTickStore((s) => s.ticks)
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
    <div style={{
      background: '#161b22',
      border: '1px solid #21262d',
      borderRadius: 8,
      margin: '0 20px 20px',
      padding: 16,
    }}>
      <div style={{ fontSize: 12, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
        Top 5 Volatile — last 50 ticks
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ fontSize: 11, color: '#8b949e', borderBottom: '1px solid #21262d' }}>
            <th style={{ textAlign: 'left', fontWeight: 500, paddingBottom: 8 }}>Symbol</th>
            <th style={{ textAlign: 'right', fontWeight: 500, paddingBottom: 8 }}>Price</th>
            <th style={{ textAlign: 'right', fontWeight: 500, paddingBottom: 8 }}>Δ Price</th>
          </tr>
        </thead>
        <tbody>
          {top5.map(({ symbol, price, delta }) => (
            <tr key={symbol} style={{ fontSize: 13, borderBottom: '1px solid #21262d' }}>
              <td style={{ padding: '6px 0', color: '#58a6ff', fontWeight: 600, fontFamily: 'monospace' }}>{symbol}</td>
              <td style={{ padding: '6px 0', textAlign: 'right', color: '#e6edf3', fontFamily: 'monospace' }}>{price.toFixed(2)}</td>
              <td style={{ padding: '6px 0', textAlign: 'right', color: '#f85149', fontFamily: 'monospace' }}>{delta.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
})
```

- [ ] **Step 2: Commit**

```bash
git add apps/client/src/components/TopVolatileList.tsx
git commit -m "style: TopVolatileList → modern dark table"
```

---

## Task 6: Redesign `DashboardPage`

**Files:**
- Modify: `apps/client/src/pages/DashboardPage.tsx`

- [ ] **Step 1: Replace `apps/client/src/pages/DashboardPage.tsx`**

```tsx
import { StatsBar } from '../components/StatsBar'
import { TopVolatileList } from '../components/TopVolatileList'
import type { FirehoseStatus } from '../hooks/useFirehose'

type Props = { status: FirehoseStatus }

export function DashboardPage({ status }: Props) {
  return (
    <div style={{ background: '#0f1117', minHeight: 'calc(100vh - 44px)' }}>
      <StatsBar status={status} />
      <TopVolatileList />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/client/src/pages/DashboardPage.tsx
git commit -m "style: DashboardPage wrapper background"
```

---

## Task 7: Redesign `Row` + `WatchlistGrid` + `WatchlistPage`

**Files:**
- Modify: `apps/client/src/components/Row.tsx`
- Modify: `apps/client/src/components/WatchlistGrid.tsx`
- Modify: `apps/client/src/pages/WatchlistPage.tsx`

- [ ] **Step 1: Replace `apps/client/src/components/Row.tsx`**

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
      className="watchlist-row"
      onClick={() => dispatch({ type: 'SELECT_SYMBOL', symbol })}
      style={{ cursor: 'pointer', borderBottom: '1px solid #21262d' }}
    >
      <td style={{ padding: '6px 20px', color: '#58a6ff', fontWeight: 600, fontFamily: 'monospace', fontSize: 13, width: 100 }}>
        {symbol}
      </td>
      <td style={{ padding: '6px 20px', textAlign: 'right', color: '#e6edf3', fontFamily: 'monospace', fontSize: 13 }}>
        {tick.price.toFixed(2)}
      </td>
      <td style={{ padding: '6px 20px', textAlign: 'right', color: '#8b949e', fontFamily: 'monospace', fontSize: 11 }}>
        {new Date(tick.ts).toLocaleTimeString()}
      </td>
    </tr>
  )
})
```

- [ ] **Step 2: Replace `apps/client/src/components/WatchlistGrid.tsx`**

```tsx
import { memo } from 'react'
import { useTickStore } from '../store/useTickStore'
import { Row } from './Row'

export const WatchlistGrid = memo(function WatchlistGrid() {
  const symbols = useTickStore((s) => Object.keys(s.ticks).slice(0, 200))

  return (
    <div style={{ overflowY: 'auto', height: 'calc(100vh - 44px - 48px)' }}>
      {/* LEARNER TODO Week 4: add @tanstack/react-virtual here */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{
            position: 'sticky',
            top: 0,
            background: '#0f1117',
            borderBottom: '1px solid #21262d',
            fontSize: 11,
            color: '#8b949e',
            textTransform: 'uppercase',
          }}>
            <th style={{ textAlign: 'left', padding: '8px 20px', fontWeight: 500 }}>Symbol</th>
            <th style={{ textAlign: 'right', padding: '8px 20px', fontWeight: 500 }}>Price</th>
            <th style={{ textAlign: 'right', padding: '8px 20px', fontWeight: 500 }}>Time</th>
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

- [ ] **Step 3: Replace `apps/client/src/pages/WatchlistPage.tsx`**

```tsx
import { WatchlistGrid } from '../components/WatchlistGrid'

export function WatchlistPage() {
  return (
    <div style={{ background: '#0f1117', height: 'calc(100vh - 44px)' }}>
      <div style={{
        fontSize: 13,
        color: '#8b949e',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        padding: '14px 20px 10px',
      }}>
        Live Watchlist
      </div>
      <WatchlistGrid />
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/client/src/components/Row.tsx apps/client/src/components/WatchlistGrid.tsx apps/client/src/pages/WatchlistPage.tsx
git commit -m "style: Watchlist — modern dark table, hover via CSS class"
```

---

## Task 8: Redesign `PriceChart` + `ChartPage`

**Files:**
- Modify: `apps/client/src/components/PriceChart.tsx`
- Modify: `apps/client/src/pages/ChartPage.tsx`

- [ ] **Step 1: Replace `apps/client/src/components/PriceChart.tsx`**

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

    ctx.strokeStyle = '#58a6ff'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    prices.forEach((p, i) => {
      const x = (i / (prices.length - 1)) * width
      const y = height - ((p - min) / range) * (height - 8) - 4
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    })
    ctx.stroke()
    // LEARNER TODO Week 4: replace with uPlot or lightweight-charts
  }, [tick])

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16 }}>
        <span style={{ fontSize: 20, fontWeight: 700, color: '#e6edf3', fontFamily: 'monospace' }}>{symbol}</span>
        <span style={{ fontSize: 24, fontWeight: 700, color: '#e6edf3', fontFamily: 'monospace' }}>
          {tick?.price.toFixed(2) ?? '—'}
        </span>
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={240}
        style={{
          display: 'block',
          width: '100%',
          maxWidth: 800,
          height: 240,
          background: '#161b22',
          border: '1px solid #21262d',
          borderRadius: 8,
        }}
      />
    </div>
  )
})
```

- [ ] **Step 2: Replace `apps/client/src/pages/ChartPage.tsx`**

```tsx
import { useParams, Navigate } from 'react-router-dom'
import { PriceChart } from '../components/PriceChart'

export function ChartPage() {
  const { symbol } = useParams<{ symbol: string }>()
  if (!symbol) return <Navigate to="/dashboard" replace />

  return (
    <div style={{ background: '#0f1117', minHeight: 'calc(100vh - 44px)' }}>
      <PriceChart symbol={symbol} />
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/client/src/components/PriceChart.tsx apps/client/src/pages/ChartPage.tsx
git commit -m "style: ChartPage + PriceChart — modern dark, blue stroke"
```

---

## Task 9: Redesign `SettingsPage`

**Files:**
- Modify: `apps/client/src/pages/SettingsPage.tsx`

- [ ] **Step 1: Replace `apps/client/src/pages/SettingsPage.tsx`**

```tsx
import { useState, useCallback } from 'react'
import type { ClientMessage } from '@prep/types'

type Props = { ws: WebSocket | null }

export function SettingsPage({ ws }: Props) {
  const [rate, setRate] = useState(500)
  const [count, setCount] = useState(200)
  const [hover, setHover] = useState(false)

  const sendConfig = useCallback(() => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return
    const msg: ClientMessage = { type: 'config', rate, count }
    ws.send(JSON.stringify(msg))
  }, [ws, rate, count])

  return (
    <div style={{ background: '#0f1117', minHeight: 'calc(100vh - 44px)', padding: 24 }}>
      <div style={{ maxWidth: 480 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#e6edf3', margin: '0 0 24px' }}>Settings</h2>

        <label style={{ display: 'block', marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: '#8b949e', marginBottom: 6 }}>
            Tick rate: <span style={{ color: '#e6edf3', fontWeight: 600, fontFamily: 'monospace' }}>{rate}/s</span>
          </div>
          <input
            type="range" min={10} max={5000} step={10} value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            style={{ display: 'block', width: '100%', accentColor: '#1f6feb' }}
          />
        </label>

        <div style={{ borderTop: '1px solid #21262d', margin: '4px 0 20px' }} />

        <label style={{ display: 'block', marginBottom: 24 }}>
          <div style={{ fontSize: 13, color: '#8b949e', marginBottom: 6 }}>
            Symbol count: <span style={{ color: '#e6edf3', fontWeight: 600, fontFamily: 'monospace' }}>{count}</span>
          </div>
          <input
            type="range" min={10} max={500} step={10} value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            style={{ display: 'block', width: '100%', accentColor: '#1f6feb' }}
          />
        </label>

        <button
          onClick={sendConfig}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{
            background: hover ? '#388bfd' : '#1f6feb',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '8px 20px',
            fontSize: 13,
            fontFamily: 'monospace',
            cursor: 'pointer',
          }}
        >
          Apply
        </button>
      </div>
    </div>
  )
}
```

Note: `onMouseEnter/Leave` on a single button is fine — it's one component, not 200 row components.

- [ ] **Step 2: Commit**

```bash
git add apps/client/src/pages/SettingsPage.tsx
git commit -m "style: SettingsPage — modern dark form + Apply button"
```

---

## Task 10: TypeScript Check + Final Verification

- [ ] **Step 1: Run tsc**

```bash
cd /home/ihorbazyliuk/projects/prep-for-work/apps/client
npx tsc --noEmit 2>&1
```

Expected: no errors.

- [ ] **Step 2: Verify `pnpm dev` starts**

```bash
cd /home/ihorbazyliuk/projects/prep-for-work
timeout 8 npx pnpm --filter @prep/server dev &
sleep 3 && timeout 5 npx pnpm --filter @prep/client dev 2>&1 | head -10 || true
```

Expected: Vite ready on port 3000, server on port 4000.

- [ ] **Step 3: Final commit**

```bash
git add .
git commit -m "chore: ui redesign complete — modern dark dashboard"
```
