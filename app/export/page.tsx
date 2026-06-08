import { PageHeader, Panel, ShellSection, StatusPill } from '@/components/catalyx-ui'
import ProGate from '@/components/ProGate'
import { proReportSections } from '@/lib/pro-features'

export default function ExportPage() {
  return (
    <ShellSection>
      <PageHeader title="Export my grow" copy="Professional PDF and timeline reports for journal, feed history, charts, photos, observations, scores, weekly reviews, product usage, and recommendations." />
      <ProGate featureKey="export_grow_journal_pdf" feature="Professional grow exports" reason="Exports package your journal, feed history, charts, photos, scores, weekly reviews, product usage, and recommendation history into shareable reports.">
        <Panel className="mt-6 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-black">Report sections included</h2>
            <StatusPill tone="violet">Professional archive</StatusPill>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {proReportSections.map((section) => (
              <div key={section} className="rounded-md border border-white/10 bg-black/30 p-3 text-sm font-semibold text-zinc-300">{section}</div>
            ))}
          </div>
        </Panel>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {[
            ['PDF report', '/api/export/grow-report', 'Generate PDF'],
            ['Timeline PDF', '/api/export/timeline-report', 'Generate timeline'],
          ].map(([type, href, action]) => (
            <Panel key={type} className="p-6">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-3xl font-black">{type}</h2>
                <StatusPill tone="violet">Professional</StatusPill>
              </div>
              <p className="mt-4 text-sm leading-6 text-zinc-400">Generates a branded Catalyx PDF with section cards, paginated evidence, scores, weekly review, timeline, recommendations, and disclaimer.</p>
              <a href={href} className="mt-6 inline-flex rounded-md bg-[#c8f500] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-black">{action}</a>
            </Panel>
          ))}
        </div>
      </ProGate>
    </ShellSection>
  )
}
