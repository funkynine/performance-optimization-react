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
