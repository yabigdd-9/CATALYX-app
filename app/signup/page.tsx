import { Suspense } from 'react'
import AuthForm from '@/components/AuthForm'
import { PageHeader, Panel, ShellSection } from '@/components/catalyx-ui'

export default function SignupPage() {
  return (
    <ShellSection>
      <PageHeader title="Create account" copy="Create a Catalyx account to sync onboarding, grow logs, reminders, shelf data, and checkout history across devices." />
      <Suspense fallback={<AuthPageFallback />}>
        <AuthForm mode="signup" />
      </Suspense>
    </ShellSection>
  )
}

function AuthPageFallback() {
  return (
    <Panel className="mx-auto mt-6 max-w-xl p-6 animate-pulse">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="h-8 w-56 rounded bg-white/10" />
        <div className="h-7 w-28 rounded-full bg-white/10" />
      </div>
      <div className="grid gap-4">
        <div className="h-14 rounded-md bg-white/10" />
        <div className="h-14 rounded-md bg-white/10" />
        <div className="h-14 rounded-md bg-white/10" />
        <div className="h-12 rounded-md bg-white/10" />
      </div>
    </Panel>
  )
}
