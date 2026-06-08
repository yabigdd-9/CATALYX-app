import QuickCheckIn from '@/components/QuickCheckIn'
import ProgressMilestones from '@/components/ProgressMilestones'
import { PageHeader, Panel, ShellSection } from '@/components/catalyx-ui'

export default function CheckInPage() {
  return (
    <ShellSection>
      <PageHeader title="Quick daily check-in" copy="A habit-forming daily plant read that updates recommendations, grow score, warnings, weekly review, and suggested journal entries." />
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <QuickCheckIn />
        <Panel className="p-5">
          <h2 className="text-2xl font-black">Suggested journal entries</h2>
          <div className="mt-4 grid gap-3">
            {['Strong vertical growth observed after PK-X increase.', 'Minor leaf curl noted after elevated EC.', 'Stable response after maintaining feed strength.'].map((entry) => (
              <div key={entry} className="rounded-md border border-white/10 bg-black/30 p-4">
                <p className="text-sm leading-6 text-zinc-300">{entry}</p>
                <div className="mt-3 flex gap-2">
                  <button className="rounded-md bg-[#c8f500] px-3 py-2 text-xs font-bold text-black">Approve</button>
                  <button className="rounded-md border border-white/15 px-3 py-2 text-xs font-bold text-white">Edit</button>
                  <button className="rounded-md border border-white/15 px-3 py-2 text-xs font-bold text-white">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <ProgressMilestones className="mt-6" />
    </ShellSection>
  )
}
