import { useParams, Navigate } from 'react-router-dom'
import { PriceChart } from '../components/PriceChart'

export function ChartPage() {
  const { symbol } = useParams<{ symbol: string }>()
  if (!symbol) return <Navigate to="/dashboard" replace />
  return <PriceChart symbol={symbol} />
}
