import { recommendationEngine } from '@/lib/catalyx'
import { PageHeader, Panel, ShellSection, StatusPill } from '@/components/catalyx-ui'
import ProGate from '@/components/ProGate'

export default function CopilotPage() {
  return (
    <ShellSection>
      <PageHeader title="Catalyx Copilot" copy="Rule-based intelligence for daily recommendations, next-step actions, warnings, recovery suggestions, optimisation, product timing, and confidence." />
      <ProGate feature="Catalyx Copilot intelligence" reason="Copilot uses stage, medium, runoff trend, check-ins, grow mode, and feed history to produce evidence-based next actions.">
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
