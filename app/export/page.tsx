import { PageHeader, Panel, ShellSection, StatusPill } from '@/components/catalyx-ui'
import ProGate from '@/components/ProGate'

export default function ExportPage() {
  return (
    <ShellSection>
      <PageHeader title="Export my grow" copy="Professional PDF and timeline reports for journal, feed history, charts, photos, observations, scores, weekly reviews, product usage, and recommendations." />
      <ProGate feature="Professional grow exports" reason="Exports package your journal, feed history, charts, photos, scores, weekly reviews, product usage, and recommendation history into shareable reports.">
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {['PDF report', 'Timeline report'].map((type) => (
            <Panel key={type} className="p-6">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-3xl font-black">{type}</h2>
                <StatusPill tone="violet">Professional</StatusPill>
              </div>
              <p className="mt-4 text-sm leading-6 text-zinc-400">Includes grow journal, feed history, pH and EC charts, photos, observations, scores, weekly reviews, product usage, and recommendation history.</p>
              <a href="/api/export/grow-report" className="mt-6 inline-flex rounded-md bg-[#c8f500] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-black">Generate export</a>
            </Panel>
          ))}
        </div>
      </ProGate>
    </ShellSection>
  )
}
