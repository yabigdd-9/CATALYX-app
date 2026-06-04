'use client'

import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { Panel, StatusPill } from '@/components/catalyx-ui'
import { resolveFeatureAccess } from '@/lib/feature-access'
import { premiumFeatureSuites } from '@/lib/pro-features'

type ProGateProps = {
  feature: string
  featureKey?: string
  reason: string
  children: React.ReactNode
  preview?: boolean
}

export default function ProGate({ feature, featureKey, reason, children, preview = false }: ProGateProps) {
  const { user, loading } = useAuth()
  const access = resolveFeatureAccess(featureKey ?? 'full_catalyx_intelligence', user?.plan ?? 'free', undefined, user?.id ?? 'guest')
  const isProfessional = access.allowed

  if (loading) {
    return (
      <Panel className="mt-6 p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">Checking access</p>
        <p className="mt-3 text-zinc-300">Loading subscription status.</p>
      </Panel>
    )
  }

  if (isProfessional) return <>{children}</>

  if (preview && access.preview) {
    return (
      <div className="relative mt-6">
        <div className="pointer-events-none max-h-[420px] overflow-hidden rounded-lg opacity-40 blur-[1px]">{children}</div>
        <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-[#050707] via-[#050707]/90 to-transparent p-6">
          <UpgradeCard feature={feature} reason={reason} compact />
        </div>
      </div>
    )
  }

  return <UpgradeCard feature={feature} reason={reason} />
}

function UpgradeCard({ feature, reason, compact = false }: { feature: string; reason: string; compact?: boolean }) {
  return (
    <Panel className={`overflow-hidden border-[#c8f500]/40 ${compact ? 'w-full max-w-xl' : 'mt-6'}`}>
      <div className={`grid gap-6 p-6 ${compact ? '' : 'lg:grid-cols-[1.1fr_0.9fr] lg:items-center'}`}>
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <StatusPill tone="lime">Catalyx Pro</StatusPill>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Preview locked</p>
          </div>
          <h2 className="mt-4 text-3xl font-black text-white">{feature}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">{reason}</p>
        </div>
        {!compact ? (
          <div className="rounded-lg border border-white/10 bg-black/30 p-5">
            <p className="text-sm leading-6 text-zinc-300">
              Catalyx Pro is a premium grow assistant — weekly reviews, runoff intelligence, product guides, inventory, and exports — not just a paywall.
            </p>
            <div className="mt-4 grid gap-2">
              {premiumFeatureSuites.slice(0, 3).map((suite) => (
                <div key={suite.title} className="rounded-md border border-white/10 bg-black/30 px-3 py-2">
                  <p className="text-sm font-black text-white">{suite.title}</p>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">{suite.value}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
        <Link
          href="/pricing"
          className={`inline-flex justify-center rounded-md bg-[#c8f500] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-black ${compact ? 'w-full' : 'mt-5 w-full lg:mt-0'}`}
        >
          Upgrade to Catalyx Pro
        </Link>
      </div>
    </Panel>
  )
}
