import ProGate from '@/components/ProGate'
import { PageHeader, ShellSection } from '@/components/catalyx-ui'
import LiveProInsights from '@/components/LiveProInsights'

export default function ForecastPage() {
  return (
    <ShellSection>
      <PageHeader
        title="Outcome Forecast"
        copy="Professional forecasting turns the current grow state into a 7-day outlook, risk profile, and controlled feed scenario."
      />
      <ProGate featureKey="outcome_forecasting" feature="Outcome forecasting" reason="Professional forecasting connects scores, runoff trends, feed consistency, and stage timing so growers know where the crop is heading.">
        <LiveProInsights variant="forecast" />
      </ProGate>
    </ShellSection>
  )
}
