'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import SubscriptionPanel from '@/components/SubscriptionPanel'
import { Panel, StatusPill } from '@/components/catalyx-ui'

export default function AccountSettings() {
  const router = useRouter()
  const { user, loading, isConfigured, signOut } = useAuth()

  async function handleSignOut() {
    await signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <Panel className="mt-6 p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">Account</p>
        <p className="mt-3 text-zinc-300">Loading account status.</p>
      </Panel>
    )
  }

  if (!user) {
    return (
      <Panel className="mt-6 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-white">Sign in required</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
              Sign in to manage billing, subscription status, saved grow data, and account settings.
            </p>
          </div>
          <StatusPill tone={isConfigured ? 'lime' : 'blue'}>{isConfigured ? 'Supabase auth' : 'Mock auth'}</StatusPill>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/login" className="rounded-md bg-[#c8f500] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-black">
            Login
          </Link>
          <Link href="/signup" className="rounded-md border border-white/15 px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white">
            Create account
          </Link>
        </div>
      </Panel>
    )
  }

  return (
    <div className="mt-6 grid gap-6">
      <Panel className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Signed in as</p>
            <h2 className="mt-2 text-3xl font-black text-white">{user.name}</h2>
            <p className="mt-2 text-sm text-zinc-400">{user.email}</p>
          </div>
          <StatusPill tone={user.plan === 'professional' ? 'lime' : 'blue'}>{user.plan}</StatusPill>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-md border border-white/10 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Auth mode</p>
            <p className="mt-2 font-bold text-white">{isConfigured ? 'Supabase' : 'Local mock'}</p>
          </div>
          <div className="rounded-md border border-white/10 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">User ID</p>
            <p className="mt-2 truncate text-sm text-zinc-300">{user.id}</p>
          </div>
          <div className="rounded-md border border-white/10 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Session action</p>
            <button onClick={handleSignOut} className="mt-2 rounded-md border border-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white">
              Sign out
            </button>
          </div>
        </div>
      </Panel>

      <SubscriptionPanel variant="full" />
    </div>
  )
}
