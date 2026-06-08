import MarketingSubscriptionPanel from '@/components/MarketingSubscriptionPanel'
import PricingValueCallout from '@/components/PricingValueCallout'
import { PageHeader, Panel, ShellSection, StatusPill } from '@/components/catalyx-ui'
import { premiumFeatureSuites, subscriberProofPoints } from '@/lib/pro-features'

const upgradePrompts = [
  'Unlock the reason behind this warning.',
  'Interpret runoff trend before increasing feed strength.',
  'Generate a Weekly Catalyx Review from saved logs.',
  'Use Recovery Mode when EC or pH instability appears.',
  'Preview a dose change before mixing nutrients.',
  'Compare this run against your previous grow.',
  'Export a professional grow report.',
  'Forecast outcome changes from feeding consistency.',
]

export default function PricingPage() {
  return (
    <ShellSection>
      <PageHeader
        title="Catalyx Pro Mode"
        copy="AI is available to everyone. Catalyx Pro adds a premium grow assistant: adaptive charts, full product guides, runoff analytics, inventory, weekly reviews, and PDF exports."
      />

      <div className="mt-6">
        <MarketingSubscriptionPanel />
      </div>

      <PricingValueCallout />

      <Panel className="mt-6 overflow-hidden border-[#c8f500]/30">
        <div className="grid gap-6 p-5 lg:grid-cols-[0.9fr_1.4fr]">
          <div>
            <StatusPill tone="lime">Subscriber value</StatusPill>
            <h2 className="mt-4 text-3xl font-black text-white">What Catalyx Pro adds after checkout</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Catalyx Pro should feel genuinely valuable — like a premium grow assistant with weekly reviews, risk detection, product guides, and report history — not just a paywall.
            </p>
            <div className="mt-5 grid gap-3">
              {subscriberProofPoints.map(([title, body]) => (
                <div key={title} className="rounded-md border border-white/10 bg-black/30 p-3">
                  <p className="font-black text-white">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-zinc-400">{body}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {premiumFeatureSuites.map((suite) => (
              <div key={suite.title} className="rounded-md border border-white/10 bg-black/30 p-4">
                <h3 className="text-lg font-black text-white">{suite.title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{suite.value}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {suite.unlocks.slice(0, 3).map((item) => (
                    <span key={item} className="rounded-md border border-[#c8f500]/25 bg-[#c8f500]/10 px-2 py-1 text-xs font-semibold text-[#d9ff34]">{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Panel>

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
