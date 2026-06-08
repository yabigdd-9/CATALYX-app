import EnvironmentLogger from '@/components/EnvironmentLogger'
import { PageHeader, ShellSection } from '@/components/catalyx-ui'

export default function EnvironmentPage() {
  return (
    <ShellSection>
      <PageHeader
        title="Environment tracking"
        copy="Log temperature, humidity, VPD, reservoir temperature, water temperature, PPFD, DLI, and runoff amount so Catalyx can separate nutrient problems from room conditions."
      />
      <div className="mt-6">
        <EnvironmentLogger />
      </div>
    </ShellSection>
  )
}
