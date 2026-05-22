import SubscriptionPanel from '@/components/SubscriptionPanel'
import { PageHeader, Panel, ShellSection } from '@/components/catalyx-ui'

const upgradePrompts = [
  'Unlock the reason behind this warning.',
  'Interpret runoff trend before increasing feed strength.',
  'Generate a Weekly Catalyx Review from saved logs.',
  'Use Recovery Mode when EC or pH instability appears.',
  'Export a professional grow report.',
  'Forecast outcome changes from feeding consistency.',
]

export default function PricingPage() {
  return (
    <ShellSection>
      <PageHeader
        title="Professional Mode"
        copy="Free is for tracking. Professional is for decision support: adaptive feed logic, warnings, reviews, exports, and billing controls."
      />

      <div className="mt-6">
        <SubscriptionPanel variant="full" />
      </div>

      <Panel className="mt-6 p-5">
        <h2 className="text-2xl font-black">Where upgrade prompts appear</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {upgradePrompts.map((prompt) => (
            <div key={prompt} className="rounded-md border border-white/10 bg-black/30 p-4 text-sm text-zinc-300">
              {prompt}
            </div>
          ))}
        </div>
      </Panel>
    </ShellSection>
  )
}
