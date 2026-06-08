import Link from 'next/link'
import { Panel, StatusPill } from '@/components/catalyx-ui'
import { proFeatureMatrix, subscriptionPlans } from '@/lib/subscriptions'

export default function MarketingSubscriptionPanel() {
  return (
    <Panel className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Subscription</p>
          <h2 className="mt-2 text-2xl font-black text-white">Choose the Catalyx plan that fits your workflow.</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            This public pricing view stays lightweight and shows the plan structure clearly. Billing and account-aware actions happen after sign-in or checkout.
          </p>
        </div>
        <StatusPill tone="blue">Public pricing view</StatusPill>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {subscriptionPlans.map((plan) => (
          <div key={plan.key} className={`rounded-lg border bg-black/30 p-4 ${plan.key === 'professional_monthly' ? 'border-[#c8f500]/60' : 'border-white/10'}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-black text-white">{plan.shortName}</h3>
                <p className="mt-1 text-sm text-zinc-500">{plan.price} {plan.billingCadence}</p>
              </div>
              {plan.key === 'professional_monthly' ? <StatusPill tone="lime">Popular</StatusPill> : null}
            </div>
            <p className="mt-3 text-sm leading-6 text-zinc-300">{plan.positioning}</p>
            <ul className="mt-4 space-y-2 text-sm text-zinc-300">
              {plan.limits.map((item) => (
                <li key={item}>+ {item}</li>
              ))}
            </ul>
            {plan.stripePlan ? (
              <form action="/api/stripe/checkout" method="post">
                <input type="hidden" name="plan" value={plan.stripePlan} />
                <button className="mt-4 w-full rounded-md border border-[#c8f500]/50 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-[#d9ff34]">
                  Choose plan
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
    </Panel>
  )
}
