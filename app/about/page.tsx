import { labNotes } from '@/lib/catalyx'
import { PageHeader, Panel, ShellSection } from '@/components/catalyx-ui'

export default function AboutPage() {
  return (
    <ShellSection>
      <PageHeader title="About Catalyx Labs" copy="Catalyx Labs is positioned as a precision cultivation ecosystem: product system, assistant, education platform, optimisation engine, journal, and professional companion." />
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {labNotes.map((note) => (
          <Panel key={note} className="p-5">
            <p className="text-sm leading-7 text-zinc-300">{note}</p>
          </Panel>
        ))}
      </div>
    </ShellSection>
  )
}

