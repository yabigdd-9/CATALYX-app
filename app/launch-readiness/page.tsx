import { getLaunchChecks } from '@/lib/launch-checks'
import { getStripeLaunchProfile } from '@/lib/stripe'
import Link from 'next/link'
import { PageHeader, Panel, ShellSection, StatusPill } from '@/components/catalyx-ui'

export const dynamic = 'force-dynamic'

export default async function LaunchReadinessPage() {
  const checks = await getLaunchChecks()
  const stripeLaunch = getStripeLaunchProfile()
  const ready = checks.filter((check) => check.status === 'ready').length
  const setup = checks.filter((check) => check.status === 'setup').length
  const stripe = checks.filter((check) => check.status === 'stripe').length
  const manual = checks.filter((check) => check.status === 'manual').length
  const statusTone = {
    ready: 'lime',
    setup: 'blue',
    stripe: 'violet',
    manual: 'amber',
  } as const
  const statusLabel = {
    ready: 'Built',
    setup: 'Setup',
    stripe: 'Stripe',
    manual: 'QA',
  } as const

  return (
    <ShellSection>
      <PageHeader
        title="Launch readiness"
        copy="Production checks for auth, Stripe env wiring, Supabase webhook writes, product-order persistence, PWA/mobile, and final QA before Catalyx Labs goes live."
      />
      <Panel className="mt-6 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <StatusPill tone={ready === checks.length ? 'lime' : 'blue'}>{ready}/{checks.length} built or configured</StatusPill>
            <h2 className="mt-3 text-2xl font-black text-white">Launch gate</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-zinc-400">
            Built checks are app-side work. Setup and Stripe checks now show the exact missing env or persistence gate, while mobile and live payment returns still need manual QA on a deployed build.
          </p>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/stripe-setup" className="rounded-md bg-[#c8f500] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-black">
            Open Stripe setup
          </Link>
          <Link href="/pricing" className="rounded-md border border-white/15 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-white">
            Test pricing
          </Link>
        </div>
        <div className="mt-5 rounded-md border border-white/10 bg-black/30 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <StatusPill tone={stripeLaunch.stageTone}>{stripeLaunch.stageLabel}</StatusPill>
              <h3 className="mt-3 text-xl font-black text-white">Stripe production handoff</h3>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">{stripeLaunch.summary}</p>
            </div>
            <StatusPill tone={stripeLaunch.blockers.length ? 'amber' : 'lime'}>
              {stripeLaunch.blockers.length ? `${stripeLaunch.blockers.length} production blockers` : 'No Stripe env blockers'}
            </StatusPill>
          </div>
          {stripeLaunch.blockers.length ? (
            <div className="mt-4 grid gap-3">
              {stripeLaunch.blockers.map((blocker) => (
                <div key={blocker.label} className="rounded-md border border-[#ffd23f]/20 bg-[#ffd23f]/5 p-4">
                  <p className="font-black text-white">{blocker.label}</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{blocker.detail}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm leading-6 text-zinc-400">
              Stripe env wiring is aligned for live deployment. Finish real subscription, product-order, webhook, and mobile return QA before launch, then use the checkout-status route to prove persisted webhook writes on a live session.
            </p>
          )}
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-md border border-[#c8f500]/20 bg-[#c8f500]/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Built / configured</p>
            <p className="mt-2 text-3xl font-black text-white">{ready}</p>
          </div>
          <div className="rounded-md border border-[#33d9ff]/20 bg-[#33d9ff]/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Needs setup</p>
            <p className="mt-2 text-3xl font-black text-white">{setup}</p>
          </div>
          <div className="rounded-md border border-[#9a5cff]/20 bg-[#9a5cff]/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Stripe next</p>
            <p className="mt-2 text-3xl font-black text-white">{stripe}</p>
          </div>
          <div className="rounded-md border border-[#ffd23f]/20 bg-[#ffd23f]/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Manual QA</p>
            <p className="mt-2 text-3xl font-black text-white">{manual}</p>
          </div>
        </div>
        <div className="mt-5 grid gap-3">
          {checks.map((check) => (
            <div key={`${check.area}-${check.label}`} className="grid gap-3 rounded-md border border-white/10 bg-black/30 p-4 md:grid-cols-[0.22fr_0.28fr_1fr] md:items-center">
              <StatusPill tone={statusTone[check.status]}>{statusLabel[check.status]}</StatusPill>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">{check.area}</p>
                <p className="mt-1 font-black text-white">{check.label}</p>
              </div>
              <p className="text-sm leading-6 text-zinc-400">{check.action}</p>
            </div>
          ))}
        </div>
      </Panel>
    </ShellSection>
  )
}
