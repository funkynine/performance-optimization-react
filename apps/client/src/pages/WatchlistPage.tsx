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
