'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { Panel, StatusPill } from '@/components/catalyx-ui'
import {
  getSubscriptionPlan,
  isProfessionalPlan,
  proFeatureMatrix,
  subscriptionPlans,
  type SubscriptionPlanKey,
} from '@/lib/subscriptions'

type SubscriptionPanelProps = {
  variant?: 'summary' | 'full'
  className?: string
}

function planKeyFromUser(plan?: string): SubscriptionPlanKey {
  if (plan === 'professional') return 'professional_monthly'
  if (plan === 'professional_monthly' || plan === 'professional_yearly') return plan
  return 'free'
}

export default function SubscriptionPanel({ variant = 'summary', className = '' }: SubscriptionPanelProps) {
  const { user, loading } = useAuth()
  const currentKey = planKeyFromUser(user?.plan)
  const currentPlan = useMemo(() => getSubscriptionPlan(currentKey), [currentKey])
  const isPro = isProfessionalPlan(currentKey)

  return (
    <Panel className={`p-5 ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Subscription</p>
          <h2 className="mt-2 text-2xl font-black text-white">{loading ? 'Checking plan...' : currentPlan.name}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">{currentPlan.positioning}</p>
        </div>
        <StatusPill tone={isPro ? 'lime' : 'blue'}>{isPro ? 'Catalyx Pro active' : 'Free access'}</StatusPill>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-md border border-white/10 bg-black/30 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Current fee</p>
          <p className="mt-2 text-3xl font-black text-white">{currentPlan.price}</p>
          <p className="mt-1 text-xs text-zinc-500">{currentPlan.billingCadence}</p>
        </div>
        <div className="rounded-md border border-white/10 bg-black/30 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Best for</p>
          <p className="mt-2 text-sm leading-6 text-zinc-300">{currentPlan.bestFor}</p>
        </div>
        <div className="rounded-md border border-white/10 bg-black/30 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Billing actions</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {isPro ? (
              <form action="/api/stripe/portal" method="post">
                <input type="hidden" name="userId" value={user?.id ?? ''} />
                <button className="rounded-md bg-[#c8f500] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-black">
                  Manage billing
                </button>
              </form>
            ) : (
              <Link href="/pricing" className="rounded-md bg-[#c8f500] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-black">
                Upgrade
              </Link>
            )}
          </div>
        </div>
      </div>

      {variant === 'full' ? (
        <>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {subscriptionPlans.map((plan) => (
              <div key={plan.key} className={`rounded-lg border bg-black/30 p-4 ${plan.key === currentKey ? 'border-[#c8f500]/60' : 'border-white/10'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-black text-white">{plan.shortName}</h3>
                    <p className="mt-1 text-sm text-zinc-500">{plan.price} {plan.billingCadence}</p>
                  </div>
                  {plan.key === currentKey ? <StatusPill tone="lime">Current</StatusPill> : null}
                </div>
                <ul className="mt-4 space-y-2 text-sm text-zinc-300">
                  {plan.limits.map((item) => (
                    <li key={item}>+ {item}</li>
                  ))}
                </ul>
                {plan.stripePlan ? (
                  <form action="/api/stripe/checkout" method="post">
                    <input type="hidden" name="plan" value={plan.stripePlan} />
                    <input type="hidden" name="userId" value={user?.id ?? ''} />
                    <input type="hidden" name="email" value={user?.email ?? ''} />
                    <button className="mt-4 w-full rounded-md border border-[#c8f500]/50 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-[#d9ff34]">
                      {plan.key === currentKey ? 'Current plan' : 'Choose plan'}
                    </button>
                  </form>
                ) : (
                  <Link href="/dashboard" className="mt-4 inline-flex w-full justify-center rounded-md border border-white/15 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-white">
                    Start free
                  </Link>
                )}
              </div>
            ))}
          </div>

          <div className="mt-5 overflow-x-auto rounded-lg border border-white/10">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-white/[0.03] text-xs uppercase tracking-[0.16em] text-zinc-500">
                <tr>
                  <th className="p-4">Feature</th>
                  <th className="p-4">Free</th>
                  <th className="p-4">Catalyx Pro</th>
                </tr>
              </thead>
              <tbody>
                {proFeatureMatrix.map(([feature, free, pro]) => (
                  <tr key={feature} className="border-t border-white/10">
                    <td className="p-4 font-bold text-white">{feature}</td>
                    <td className="p-4 text-zinc-400">{free}</td>
                    <td className="p-4 text-zinc-300">{pro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </Panel>
  )
}
