import ProGate from '@/components/ProGate'
import { PageHeader, ShellSection } from '@/components/catalyx-ui'
import LiveProInsights from '@/components/LiveProInsights'

export default function WeeklyReviewPage() {
  return (
    <ShellSection>
      <PageHeader
        title="Weekly Grow Review"
        copy="A Professional weekly report that turns logs, scores, check-ins, and product usage into clear improvement actions."
      />
      <ProGate featureKey="weekly_grow_reviews" feature="Weekly Grow Review" reason="Professional reviews explain what changed, what improved, what needs attention, and which actions matter next week.">
        <LiveProInsights variant="weekly-review" />
      </ProGate>
    </ShellSection>
  )
}
