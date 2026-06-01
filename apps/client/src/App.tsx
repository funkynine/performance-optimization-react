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
