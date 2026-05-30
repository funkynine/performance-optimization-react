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
