import ProGate from '@/components/ProGate'
import { PageHeader, ShellSection } from '@/components/catalyx-ui'
import LiveProInsights from '@/components/LiveProInsights'

export default function RecoveryPage() {
  return (
    <ShellSection>
      <PageHeader
        title="Recovery Mode"
        copy="A Professional stabilisation workspace for runoff drift, high stress, overfeeding risk, pH issues, or root-zone instability."
      />
      <ProGate featureKey="recovery_playbooks" feature="Recovery Playbooks" reason="Professional gives growers a focused correction plan with hold/reduce rules, monitoring steps, and exit criteria.">
        <LiveProInsights variant="recovery" />
      </ProGate>
    </ShellSection>
  )
}
