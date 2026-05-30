import { useReducer, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom'
import { AppContext, reducer, initialState } from './context/AppContext'
import { useFirehose } from './hooks/useFirehose'
import type { FirehoseStatus } from './hooks/useFirehose'
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
