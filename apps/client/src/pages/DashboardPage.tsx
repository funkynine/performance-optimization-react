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
