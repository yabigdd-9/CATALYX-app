import Link from 'next/link'
import StripeWebhookTester from '@/components/StripeWebhookTester'
import { PageHeader, Panel, ShellSection, StatusPill } from '@/components/catalyx-ui'
import { getStripeLaunchProfile, stripeConfig } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

const testFlow = [
  ['Subscription checkout', 'Open /pricing, choose monthly and yearly plans, and confirm Stripe Checkout opens.'],
  ['Webhook persistence', 'Complete a test checkout and confirm checkout.session.completed updates subscriptions and user_plan.'],
  ['Pro unlock', 'Return to the app and confirm Pro gates unlock for Weekly Review, Forecast, Recovery, Compare, and exports.'],
  ['Billing portal', 'Open Manage billing from /account or /pricing and confirm Stripe portal opens for the customer.'],
  ['Product checkout', 'Add Catalyx products to /cart and confirm one-time Stripe Checkout opens, charges shipping, and records product_orders.order_lines.'],
  ['Async payment states', 'Test delayed payment success and failure paths, then confirm product_orders.status moves to paid or failed after webhook delivery.'],
  ['Failure handling', 'Send invoice.payment_failed and confirm the plan falls back or shows past_due handling.'],
  ['Mobile return flow', 'Complete a /cart return on a mobile-sized browser and confirm the verification banner remains readable and actionable.'],
] as const

export default function StripeSetupPage() {
  const stripeLaunch = getStripeLaunchProfile()

  return (
    <ShellSection>
      <PageHeader
        title="Stripe launch setup"
        copy="Safe diagnostics for Catalyx subscriptions, product checkout, webhook persistence, billing portal, and the final test-to-live Stripe handoff."
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Panel className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <StatusPill tone={stripeLaunch.stageTone}>{stripeLaunch.stageLabel}</StatusPill>
              <h2 className="mt-3 text-3xl font-black text-white">Current repo Stripe state</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">{stripeLaunch.summary}</p>
            </div>
            <StatusPill tone={stripeLaunch.blockers.length ? 'amber' : 'lime'}>
              {stripeLaunch.blockers.length ? `${stripeLaunch.blockers.length} live blockers` : 'Live env aligned'}
            </StatusPill>
          </div>
          <div className="mt-5 grid gap-3">
            <DiagnosticRow label="Stripe mode" value={stripeConfig.mode} status={stripeConfig.mode === 'live' ? 'Live mode' : 'Local test mode'} tone={stripeConfig.mode === 'live' ? 'lime' : 'blue'} />
            {stripeLaunch.diagnostics.map((diagnostic) => (
              <DiagnosticRow
                key={diagnostic.label}
                label={diagnostic.label}
                value={diagnostic.value}
                status={diagnostic.status}
                tone={diagnostic.tone}
              />
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/pricing" className="rounded-md bg-[#c8f500] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-black">
              Test subscriptions
            </Link>
            <Link href="/cart" className="rounded-md border border-white/15 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-white">
              Test cart
            </Link>
          </div>
        </Panel>

        <Panel className="p-5">
          <StatusPill tone={stripeLaunch.blockers.length ? 'amber' : 'lime'}>
            {stripeLaunch.blockers.length ? 'Production blockers' : 'Deploy-ready'}
          </StatusPill>
          <h2 className="mt-4 text-2xl font-black text-white">Remaining production blockers</h2>
          <div className="mt-4 grid gap-3">
            {stripeLaunch.blockers.length ? stripeLaunch.blockers.map((blocker) => (
              <div key={blocker.label} className="rounded-md border border-[#ffd23f]/20 bg-[#ffd23f]/5 p-4">
                <p className="font-black text-white">{blocker.label}</p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{blocker.detail}</p>
              </div>
            )) : (
              <div className="rounded-md border border-[#c8f500]/20 bg-[#c8f500]/5 p-4">
                <p className="font-black text-white">No env blockers remain</p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Stripe is wired for a live deploy. The remaining work is real payment QA, webhook delivery verification, and the final mobile return-flow checks.
                </p>
              </div>
            )}
          </div>
          <div className="mt-5 grid gap-3">
            {stripeLaunch.notes.map((note) => (
              <div key={note} className="rounded-md border border-white/10 bg-black/30 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Important note</p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{note}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel className="mt-6 p-5">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <StatusPill tone="blue">Copy / paste safe</StatusPill>
            <h2 className="mt-3 text-2xl font-black text-white">Final production env block</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Copy this into the deployment platform for the final Stripe flip. Keep `STRIPE_MODE=test` and the localhost URL in local development unless you are intentionally running a live smoke test. The diagnostics above now separate missing checkout env from missing webhook persistence.
            </p>
            <pre className="mt-4 overflow-x-auto rounded-md border border-white/10 bg-black/40 p-4 text-xs leading-6 text-zinc-200">
{stripeLaunch.finalFlipEnv.join('\n')}
            </pre>
            <p className="mt-3 text-sm leading-6 text-zinc-500">
              Do not keep `STRIPE_WEBHOOK_TEST_ENABLED=true` in the deployed runtime.
            </p>
          </div>
          <div>
            <StatusPill tone="violet">Final flip</StatusPill>
            <h2 className="mt-3 text-2xl font-black text-white">Production cutover checklist</h2>
            <div className="mt-4 grid gap-3">
              {stripeLaunch.finalFlipChecklist.map((item, index) => (
                <div key={item} className="rounded-md border border-white/10 bg-black/30 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Step {index + 1}</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Panel>

      <Panel className="mt-6 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <StatusPill tone="blue">Test order</StatusPill>
            <h2 className="mt-3 text-2xl font-black text-white">Stripe verification sequence</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              This sequence now includes the real one-time product-order checks: persisted `order_lines`, webhook persistence diagnostics, async payment outcomes, and mobile checkout return behavior.
            </p>
          </div>
          <Link href="/launch-readiness" className="rounded-md border border-white/15 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-white">
            Back to launch gate
          </Link>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {testFlow.map(([title, body], index) => (
            <div key={title} className="rounded-md border border-white/10 bg-black/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Step {index + 1}</p>
              <h3 className="mt-2 font-black text-white">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{body}</p>
            </div>
          ))}
        </div>
      </Panel>

      {stripeLaunch.stage === 'production_ready' ? (
        <Panel className="mt-6 p-5">
          <StatusPill tone="lime">Live mode</StatusPill>
          <h2 className="mt-3 text-2xl font-black text-white">Local webhook tester hidden</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
            This env is aligned for a live Stripe deployment, so the local `/api/stripe/webhook-test` workflow is no longer part of the production handoff. Use the real production webhook endpoint and the live payment checks above instead.
          </p>
        </Panel>
      ) : (
        <StripeWebhookTester />
      )}
    </ShellSection>
  )
}

function DiagnosticRow({
  label,
  value,
  status,
  tone,
}: {
  label: string
  value: string
  status: string
  tone: 'blue' | 'amber' | 'lime'
}) {
  return (
    <div className="grid gap-3 rounded-md border border-white/10 bg-black/30 p-4 sm:grid-cols-[0.8fr_1fr_auto] sm:items-center">
      <p className="text-sm font-black text-white">{label}</p>
      <p className="break-all text-sm text-zinc-400">{value}</p>
      <StatusPill tone={tone}>{status}</StatusPill>
    </div>
  )
}
