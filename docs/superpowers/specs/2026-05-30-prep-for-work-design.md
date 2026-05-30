# prep-for-work — Micro-Sandbox Design

**Date:** 2026-05-30  
**Goal:** A working baseline repo for Bloomberg/DataArt 4-week senior React prep. WS firehose, routing, dashboard, and state are pre-wired so the learner focuses on Web Workers, Lighthouse fixes, virtualization, and state manager bake-off — not setup.

---

## 1. Repository Structure

Turbo + pnpm monorepo.

```
prep-for-work/
├── apps/
│   ├── client/          # Vite + React 18 + TypeScript strict
│   └── server/          # Node.js WS firehose (tsx watch, no build step)
├── packages/
│   └── types/           # Shared: Tick, ServerMessage, ClientMessage
├── package.json         # pnpm workspaces root
├── pnpm-workspace.yaml
└── turbo.json           # dev pipeline: server + client in parallel
```

`pnpm dev` from root starts both apps via Turborepo.

---

## 2. Shared Types (`packages/types`)

```ts
export type Tick = { symbol: string; price: number; ts: number }

// server → client
export type ServerMessage =
  | { type: 'tick'; data: Tick }
  | { type: 'snapshot'; data: Tick[] }

// client → server
export type ClientMessage = { type: 'config'; rate: number; count: number }
```

---

## 3. Server (`apps/server`)

**Stack:** Node.js + `ws` library + `tsx watch` for TS execution.  
**Port:** 4000

```
server/
└── src/
    ├── index.ts        # WS server entry
    ├── firehose.ts     # tick generator, configurable rate
    └── symbols.ts      # pool of 500 symbols (AAPL, GOOG, ...)
```

**Behaviour:**
- On connect: send `snapshot` of current prices for all active symbols.
- Continuously stream `tick` messages at the configured rate.
- On receiving `ClientMessage { type: 'config' }`: update rate and symbol count on the fly — no reconnect needed.

---

## 4. Client (`apps/client`)

**Stack:** Vite + React 18 + TypeScript strict + react-router-dom v6

### 4.1 Routes

```
/                   → redirect → /dashboard
/dashboard          → <DashboardPage>   summary: top-5 by price delta (last 50 ticks), ticks/s, WS status
/watchlist          → <WatchlistPage>   live grid, 200 symbols
/chart/:symbol      → <ChartPage>       price detail + canvas placeholder
/settings           → <SettingsPage>    rate slider (10–5000/s), symbol count slider (10–500)
```

### 4.2 State Architecture

| Layer | Tool | Contents |
|---|---|---|
| Tick store | **Zustand** | `Record<symbol, Tick>` — flushed from rAF buffer |
| App state | **React Context** | `selectedSymbol`, `theme` (light/dark) |

### 4.3 WS Hook

`useFirehose()` — lives in `client/src/hooks/useFirehose.ts`:
- Opens `WebSocket` to `ws://localhost:4000`.
- Accumulates incoming ticks into a `Map<symbol, Tick>` ref (not state).
- Flushes the map to Zustand once per `requestAnimationFrame`.
- **Web Worker integration: intentionally omitted** — learner adds this in Week 2.

### 4.4 Component Tree (abbreviated)

```
<App>
  <AppContext.Provider>
    <Router>
      /dashboard  → <DashboardPage>
                      <StatsBar>          ticks/s + WS status
                      <TopVolatileList>   top-5 symbols by price delta (last 50 ticks)
      /watchlist  → <WatchlistPage>
                      <WatchlistGrid>     200 memo-wrapped <Row> components
                                          (virtualization: learner adds Week 4)
      /chart/:s   → <ChartPage>
                      <PriceChart>        canvas ref placeholder (learner wires uPlot/lightweight-charts)
      /settings   → <SettingsPage>
                      rate + count sliders → sends ClientMessage to server
    </Router>
  </AppContext.Provider>
</App>
```

### 4.5 Dev Tooling (pre-wired)

| Tool | Where |
|---|---|
| `@welldone-software/why-did-you-render` | `main.tsx` (dev only) |
| React DevTools Profiler | README instructions |
| Chrome DevTools Performance / Memory | README instructions |
| TypeScript strict | `tsconfig.json` |
| ESLint + Prettier | root config |

---

## 5. What the Learner Adds (intentional gaps)

| Week | Gap |
|---|---|
| 1 | Profile `<WatchlistGrid>`, fix re-renders with `memo` + selectors |
| 2 | Move tick parsing to a Web Worker via `Comlink`; add second polling feed |
| 3 | Implement store twice — Zustand selector-per-row vs Jotai atom-per-symbol; write verdict table |
| 4 | Add `@tanstack/react-virtual`; keyboard nav (`role="grid"`, roving tabindex); wire `uPlot`/`lightweight-charts` sparkline in `<ChartPage>` |
| All | Run Lighthouse, identify issues, fix them |

---

## 6. Out of Scope

- Auth, persistence, backend beyond the firehose
- CI/CD, deployment
- Testing setup (learner can add)
- Production build optimisation
