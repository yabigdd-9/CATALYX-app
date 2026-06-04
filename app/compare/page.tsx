import ProGate from '@/components/ProGate'
import LiveProInsights from '@/components/LiveProInsights'
import { PageHeader, ShellSection } from '@/components/catalyx-ui'

export default function ComparePage() {
  return (
    <ShellSection>
      <PageHeader
        title="Compare My Grow"
        copy="Professional comparison shows whether the current run is improving against previous grows, previous weeks, and strategy benchmarks."
      />
      <ProGate featureKey="compare_my_grow" feature="Compare My Grow" reason="Professional comparison helps growers see whether decisions are producing better outcomes over time.">
        <LiveProInsights variant="compare" />
      </ProGate>
    </ShellSection>
  )
}
