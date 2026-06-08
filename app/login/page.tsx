import { Suspense } from 'react'
import AuthForm from '@/components/AuthForm'
import { PageHeader, Panel, ShellSection } from '@/components/catalyx-ui'

export default function LoginPage() {
  return (
    <ShellSection>
      <PageHeader title="Login" copy="Secure your Catalyx account, sync your grow data, and continue exactly where your grow left off." />
      <Suspense fallback={<AuthPageFallback mode="login" />}>
        <AuthForm mode="login" />
      </Suspense>
    </ShellSection>
  )
}

function AuthPageFallback({ mode }: { mode: 'login' | 'signup' }) {
  return (
    <Panel className="mx-auto mt-6 max-w-xl p-6 animate-pulse">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="h-8 w-48 rounded bg-white/10" />
        <div className="h-7 w-28 rounded-full bg-white/10" />
      </div>
      <div className="grid gap-4">
        {mode === 'signup' ? <div className="h-14 rounded-md bg-white/10" /> : null}
        <div className="h-14 rounded-md bg-white/10" />
        <div className="h-14 rounded-md bg-white/10" />
        <div className="h-12 rounded-md bg-white/10" />
      </div>
    </Panel>
  )
}
