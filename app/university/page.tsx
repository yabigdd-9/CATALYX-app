import { labNotes, universityLessons } from '@/lib/catalyx'
import { PageHeader, Panel, ShellSection, StatusPill } from '@/components/catalyx-ui'

export default function UniversityPage() {
  return (
    <ShellSection>
      <PageHeader title="Catalyx University" copy="Product education, nutrient fundamentals, pH, EC, runoff, diagnosis, flowering, dryback, root-zone science, flush timing, and professional feed tuning." />
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-3 md:grid-cols-2">
          {universityLessons.map((lesson, index) => (
            <Panel key={lesson} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-black">{lesson}</h2>
                <StatusPill tone={index % 4 === 0 ? 'lime' : index % 4 === 1 ? 'blue' : index % 4 === 2 ? 'violet' : 'amber'}>{index < 6 ? 'Free preview' : 'Pro'}</StatusPill>
              </div>
              <p className="mt-3 text-sm leading-6 text-zinc-400">Clear, practical cultivation science connected to the Catalyx product system.</p>
            </Panel>
          ))}
        </div>
        <Panel className="p-5">
          <h2 className="text-2xl font-black">Catalyx Lab Notes</h2>
          <div className="mt-4 grid gap-3">
            {labNotes.map((note) => (
              <div key={note} className="rounded-md border border-white/10 bg-black/30 p-4 text-sm leading-6 text-zinc-300">{note}</div>
            ))}
          </div>
        </Panel>
      </div>
    </ShellSection>
  )
}

