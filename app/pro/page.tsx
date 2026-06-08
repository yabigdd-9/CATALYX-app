import Link from 'next/link'
import { PageHeader, Panel, ShellSection, StatusPill } from '@/components/catalyx-ui'
import { premiumFeatureSuites, subscriberProofPoints } from '@/lib/pro-features'
import ProWorkspaceLinks from '@/components/ProWorkspaceLinks'

export default function ProPage() {
  return (
    <ShellSection>
      <PageHeader title="Professional cultivation advantage" copy="AI stays available to everyone. Catalyx Professional is the deeper operating layer: risk radar, feed simulations, weekly reviews, recovery playbooks, forecasts, analytics, and export-ready grow history." action={<Link href="/pricing" className="rounded-md bg-[#c8f500] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-black">View pricing</Link>} />

      <ProWorkspaceLinks className="mt-6" />

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        {subscriberProofPoints.map(([title, body]) => (
          <Panel key={title} className="p-5">
            <StatusPill tone="lime">Pro value</StatusPill>
            <h2 className="mt-3 text-xl font-black">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">{body}</p>
          </Panel>
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {premiumFeatureSuites.map((suite) => (
          <Panel key={suite.title} className="p-5">
            <h2 className="text-xl font-black">{suite.title}</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">{suite.value}</p>
            <div className="mt-4 grid gap-2">
              {suite.unlocks.map((item) => (
                <div key={item} className="rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-300">{item}</div>
              ))}
            </div>
          </Panel>
        ))}
      </div>
    </ShellSection>
  )
}
