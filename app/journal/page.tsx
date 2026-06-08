import SmartJournal from '@/components/SmartJournal'
import { PageHeader, ShellSection } from '@/components/catalyx-ui'

export default function JournalPage() {
  return (
    <ShellSection>
      <PageHeader title="Smart grow journal" copy="Feed logs, daily check-ins, photo observations, suggested entries, plant response, and week-by-week context in one fast timeline." />
      <div className="mt-6">
        <SmartJournal />
      </div>
    </ShellSection>
  )
}
