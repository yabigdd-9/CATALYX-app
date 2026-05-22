import ReminderList from '@/components/ReminderList'
import { PageHeader, ShellSection } from '@/components/catalyx-ui'

export default function RemindersPage() {
  return (
    <ShellSection>
      <PageHeader title="Basic reminders" copy="Phase 1 reminders for feeds, watering, photos, daily check-ins, stage transitions, flush timing, and low-stock follow-ups." />
      <div className="mt-6">
        <ReminderList />
      </div>
    </ShellSection>
  )
}

