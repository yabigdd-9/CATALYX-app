import AuthForm from '@/components/AuthForm'
import { PageHeader, ShellSection } from '@/components/catalyx-ui'

export default function SignupPage() {
  return (
    <ShellSection>
      <PageHeader title="Create account" copy="Start the Phase 1 core flow: account, onboarding, active grow, feed calculator, feed log, product catalogue, and reminders." />
      <AuthForm mode="signup" />
    </ShellSection>
  )
}

