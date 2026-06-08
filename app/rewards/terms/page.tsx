import { PageHeader, Panel, ShellSection } from '@/components/catalyx-ui'

const rules = [
  'CX Points expire after 12 months of account inactivity. Active users keep their balance.',
  'Store credit cannot be withdrawn for cash and does not apply to subscriptions unless explicitly enabled later.',
  'Only one store-credit style reward should apply per order unless admin rules allow otherwise.',
  'Major promo-code stacking is disabled by default to protect margin. Free-shipping stacking is configurable.',
  'Referral rewards should only complete after a valid first purchase and must reject self-referrals.',
  'Refunded or partially refunded orders can reverse earned CX proportionally.',
  'Weighted mechanics such as the Grow Wheel must stay auditable, capped, and clearly disclosed.',
]

export default function RewardsTermsPage() {
  return (
    <ShellSection>
      <PageHeader
        title="CX Rewards Terms"
        copy="Phase 1 support page for expiry, reversals, stacking rules, abuse prevention, subscriber value, and weighted reward disclosures."
      />
      <div className="mt-6 grid gap-3">
        {rules.map((rule) => (
          <Panel key={rule} className="p-5 text-sm leading-6 text-zinc-300">
            {rule}
          </Panel>
        ))}
      </div>
    </ShellSection>
  )
}

