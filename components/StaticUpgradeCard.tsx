import Link from 'next/link'
import { Panel, StatusPill } from '@/components/catalyx-ui'
import { premiumFeatureSuites } from '@/lib/pro-features'

export default function StaticUpgradeCard({
  feature,
  reason,
  compact = false,
}: {
  feature: string
  reason: string
  compact?: boolean
}) {
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
