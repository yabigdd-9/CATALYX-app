import { Suspense } from 'react'
import AccountSettings from '@/components/AccountSettings'
import { PageHeader, Panel, ShellSection } from '@/components/catalyx-ui'

export default function AccountPage() {
  return (
    <ShellSection>
      <PageHeader title="Account settings" copy="Manage sign-in state, billing actions, account access, and your Catalyx product order history." />
      <Suspense fallback={<AccountPageFallback />}>
        <AccountSettings />
      </Suspense>
    </ShellSection>
  )
}

function AccountPageFallback() {
  return (
    <Panel className="mt-6 p-6 animate-pulse">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="h-4 w-24 rounded bg-white/10" />
          <div className="mt-3 h-9 w-52 rounded bg-white/10" />
          <div className="mt-3 h-4 w-64 rounded bg-white/10" />
        </div>
        <div className="h-7 w-28 rounded-full bg-white/10" />
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="h-28 rounded-md bg-white/10" />
        <div className="h-28 rounded-md bg-white/10" />
        <div className="h-28 rounded-md bg-white/10" />
      </div>
    </Panel>
  )
}
