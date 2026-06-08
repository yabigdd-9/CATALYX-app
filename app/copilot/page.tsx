import { recommendationEngine } from '@/lib/catalyx'
import { PageHeader, Panel, ShellSection, StatusPill } from '@/components/catalyx-ui'
import ProGate from '@/components/ProGate'
import { proCommandModules } from '@/lib/pro-features'
import AICopilotPanel from '@/components/AICopilotPanel'

export default function CopilotPage() {
  return (
    <ShellSection>
      <PageHeader title="Catalyx Copilot" copy="AI guidance is available to every grower. Free users get daily recommendations; Professional adds deeper evidence, risk scoring, simulations, reviews, and forecasts." />
      <AICopilotPanel />
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {recommendationEngine().map((item) => (
          <Panel key={item.title} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl font-black">{item.title}</h2>
              <StatusPill tone={item.severity === 'warning' ? 'amber' : 'lime'}>{item.confidence} confidence</StatusPill>
            </div>
            <p className="mt-4 text-sm leading-6 text-zinc-300">{item.action}</p>
            <details className="mt-4 rounded-md border border-white/10 bg-black/30 p-3">
              <summary className="cursor-pointer text-xs font-black uppercase tracking-[0.16em] text-[#c8f500]">Why this recommendation?</summary>
              <p className="mt-3 text-sm leading-6 text-zinc-500">{item.why}</p>
            </details>
          </Panel>
        ))}
      </div>

      <Panel className="mt-6 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <StatusPill tone="blue">Included for everyone</StatusPill>
            <h2 className="mt-3 text-2xl font-black text-white">Free AI daily guidance</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-zinc-400">
            The base Copilot should always help growers decide what to do today. Upgrading should make the answer deeper, not hide the assistant.
          </p>
        </div>
      </Panel>

      <ProGate featureKey="full_catalyx_intelligence" feature="Catalyx Pro Copilot depth" reason="Catalyx Pro adds the evidence stack behind the AI: root-zone risk radar, dose simulation, confidence boosters, weekly reviews, and forecast logic." preview>
        <Panel className="mt-6 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-black">Professional AI command modules</h2>
            <StatusPill tone="lime">Pro depth</StatusPill>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {proCommandModules.map(([title, body]) => (
              <div key={title} className="rounded-md border border-white/10 bg-black/30 p-4">
                <p className="font-black text-white">{title}</p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{body}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="mt-6 p-5">
          <h2 className="text-2xl font-black">Mistake prevention and predictive warnings</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              'pH drift suggests possible nutrient lockout risk.',
              'Runoff EC trend suggests possible salt buildup within 5-7 days.',
              'Feed strength has increased quickly. Monitor leaf tip burn.',
              'Late flower nitrogen risk: avoid vegetative base-heavy feeding.',
              'Data confidence limited when logging is inconsistent.',
              'Product mixing risk: keep A-X PRO and B-X PRO concentrates separate.',
            ].map((warning) => (
              <div key={warning} className="rounded-md border border-[#ff8a1f]/30 bg-[#ff8a1f]/10 p-4 text-sm leading-6 text-zinc-300">
                {warning}
              </div>
            ))}
          </div>
        </Panel>
      </ProGate>
    </ShellSection>
  )
}
