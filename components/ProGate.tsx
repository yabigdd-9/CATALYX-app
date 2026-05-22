'use client'

import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { Panel, StatusPill } from '@/components/catalyx-ui'

type ProGateProps = {
  feature: string
  reason: string
  children: React.ReactNode
}

export default function ProGate({ feature, reason, children }: ProGateProps) {
  const { user, loading } = useAuth()
  const isProfessional = user?.plan === 'professional'

  if (loading) {
    return (
      <Panel className="mt-6 p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">Checking access</p>
        <p className="mt-3 text-zinc-300">Loading subscription status.</p>
      </Panel>
    )
  }

  if (isProfessional) return <>{children}</>

  return (
    <Panel className="mt-6 overflow-hidden border-[#c8f500]/40">
      <div className="grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <StatusPill tone="lime">Professional</StatusPill>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Upgrade required</p>
          </div>
          <h2 className="mt-4 text-3xl font-black text-white">{feature}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">{reason}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-black/30 p-5">
          <p className="text-sm leading-6 text-zinc-300">
            Professional unlocks adaptive recommendations, predictive warnings, Weekly Grow Reviews, exports, and deeper analytics.
          </p>
          <Link
            href="/pricing"
            className="mt-5 inline-flex w-full justify-center rounded-md bg-[#c8f500] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-black"
          >
            View plans
          </Link>
        </div>
      </div>
    </Panel>
  )
}
