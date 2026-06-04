'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import AccountOrderHistory from '@/components/AccountOrderHistory'
import { useAuth } from '@/components/AuthProvider'
import RewardsExchangePanel from '@/components/RewardsExchangePanel'
import SubscriptionPanel from '@/components/SubscriptionPanel'
import { Panel, SaveBanner, StatusPill } from '@/components/catalyx-ui'
import { premiumFeatureSuites } from '@/lib/pro-features'
import { isProfessionalLikePlan } from '@/lib/rewards'

export default function AccountSettings() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading, isConfigured, signOut } = useAuth()
  const billingState = searchParams.get('billing')
  const isPro = isProfessionalLikePlan(user?.plan)
  const planLabel = user?.plan === 'professional_yearly' ? 'professional_yearly' : user?.plan === 'professional_monthly' || user?.plan === 'professional' ? 'professional_monthly' : 'free'

  async function handleSignOut() {
    await signOut()
    router.push('/login')
  }

  if (loading) {
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

  if (!user) {
    return (
      <Panel className="mt-6 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-white">Sign in required</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
              Sign in to manage billing, subscription status, saved grow data, rewards exchanges, and account settings.
            </p>
          </div>
          <StatusPill tone={isConfigured ? 'lime' : 'blue'}>{isConfigured ? 'Secure sign-in' : 'Local session'}</StatusPill>
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
      {billingState === 'no-customer' ? (
        <SaveBanner
          status="error"
          message="Billing portal is available after a real Stripe checkout creates a customer for this account."
        />
      ) : null}
      {billingState === 'portal-error' ? (
        <SaveBanner
          status="error"
          message="Stripe could not open the billing portal. Check the customer record and Billing Portal configuration in Stripe."
        />
      ) : null}

      <Panel className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Signed in as</p>
            <h2 className="mt-2 text-3xl font-black text-white">{user.name}</h2>
            <p className="mt-2 text-sm text-zinc-400">{user.email}</p>
          </div>
          <StatusPill tone={isPro ? 'lime' : 'blue'}>{planLabel}</StatusPill>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-md border border-white/10 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Auth mode</p>
            <p className="mt-2 font-bold text-white">{isConfigured ? 'Secure cloud auth' : 'Local-only session'}</p>
          </div>
          <div className="rounded-md border border-white/10 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">User ID</p>
            <p className="mt-2 truncate text-sm text-zinc-300">{user.id}</p>
          </div>
          <div className="rounded-md border border-white/10 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Session action</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Link href="/update-password" className="rounded-md border border-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white">
                Update password
              </Link>
              <button onClick={handleSignOut} className="rounded-md border border-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white">
                Sign out
              </button>
            </div>
          </div>
        </div>
      </Panel>

      <SubscriptionPanel variant="full" />

      <RewardsExchangePanel />

      <AccountOrderHistory />

      <Panel className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Plan access</p>
            <h2 className="mt-2 text-2xl font-black text-white">What your account unlocks</h2>
          </div>
          <StatusPill tone={isPro ? 'lime' : 'blue'}>{isPro ? 'Optimisation active' : 'AI included'}</StatusPill>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-md border border-[#33d9ff]/25 bg-[#33d9ff]/10 p-4">
            <StatusPill tone="blue">Free core</StatusPill>
            <h3 className="mt-3 font-black text-white">AI Copilot daily guidance</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-400">Available to every Catalyx account for basic next-step recommendations.</p>
          </div>
          {premiumFeatureSuites.slice(0, 5).map((suite) => (
            <div key={suite.title} className="rounded-md border border-white/10 bg-black/30 p-4">
              <StatusPill tone={isPro ? 'lime' : 'amber'}>{isPro ? 'Unlocked' : 'Professional'}</StatusPill>
              <h3 className="mt-3 font-black text-white">{suite.title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{suite.value}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}
