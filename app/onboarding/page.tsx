import OnboardingConfigurator from '@/components/OnboardingConfigurator'
import { PageHeader, ShellSection } from '@/components/catalyx-ui'

export default function OnboardingPage() {
  return (
    <ShellSection>
      <PageHeader title="Smart onboarding" copy="Configure medium, experience, grow goals, feeding style, automation, environment difficulty, stage, products owned, and start date into a usable Catalyx setup." />
      <div className="mt-6">
        <OnboardingConfigurator />
      </div>
    </ShellSection>
  )
}

