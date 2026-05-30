# prep-for-work

Bloomberg/DataArt 4-week senior React prep micro-sandbox.

## Quick Start

```bash
pnpm install
pnpm dev
```

Opens client at `http://localhost:3000` and WS firehose at `ws://localhost:4000`.

> If `pnpm` is not installed globally: `npm i -g pnpm` or use `npx pnpm`.

## Structure

```
apps/client     React 18 + Vite + TypeScript strict
apps/server     Node.js WS firehose (tsx watch, port 4000)
packages/types  Shared types: Tick, ServerMessage, ClientMessage
```

## Routes

| Path | Page |
|---|---|
| `/dashboard` | Summary: top-5 volatile symbols, ticks/s, WS status |
| `/watchlist` | Live grid — 200 symbols, updates per tick |
| `/chart/:symbol` | Canvas sparkline for selected symbol |
| `/settings` | Tick rate slider (10–5000/s), symbol count slider (10–500) |

Click any row in Watchlist to select a symbol → Chart nav link appears.

## Dev Tooling (pre-wired)

- **React DevTools Profiler:** Install the [Chrome extension](https://react.dev/learn/react-developer-tools). Enable "Highlight updates when components render" in Profiler settings — your main diagnostic tool.
- **why-did-you-render:** Wired in dev mode. Open the browser console to see wasted re-render warnings.
- **Chrome DevTools Performance panel:** Record 5s on `/watchlist` to get flamegraphs.
- **Chrome DevTools Memory tab:** Take a heap snapshot at rest, one under load, compare retained objects.

## Intentional Gaps — Your Learning Surface

| Week | What to add |
|---|---|
| 1 | Open React Profiler on `/watchlist`. Observe the whole grid re-rendering per tick. Refactor `<WatchlistGrid>` / `<Row>` so only the changed row re-renders. Record before/after flamegraph. |
| 2 | Move tick parsing out of `useFirehose` into a Web Worker using [`Comlink`](https://github.com/GoogleChromeLabs/comlink). Add a second polling feed merged into the same buffer. |
| 3 | Re-implement the tick store with Jotai (atom per symbol). Drive at 2,000 ticks/s. Compare render counts and CPU vs Zustand. Write a 5-line verdict table. |
| 4 | Add `@tanstack/react-virtual` to `<WatchlistGrid>` for 50k rows. Add full keyboard nav (`↑/↓/PageUp/PageDown/Home/End`, `role="grid"`, roving tabindex). Wire `uPlot` or `lightweight-charts` in `<PriceChart>`. |
| All | Run Lighthouse on `/watchlist`. Find performance issues. Fix them. |

## Notes

- The firehose server sends one tick at a time at the configured rate. At 500 ticks/s with 200 symbols, each symbol updates ~2.5 times/second.
- `why-did-you-render` only runs in dev mode — it has no production footprint.
- The canvas sparkline in `<PriceChart>` keeps the last 200 prices in a ref — no React state, no re-renders from drawing.
