import { reminders } from '@/lib/catalyx'
import { PageHeader, Panel, ShellSection, StatusPill } from '@/components/catalyx-ui'
import NotificationControls from '@/components/NotificationControls'

const extra = ['Feed reminder', 'Water reminder', 'Photo reminder', 'Daily check-in reminder', 'Environment log reminder', 'Stage change reminder', 'Flush reminder', 'Harvest estimate', 'Low-stock reminder', 'Weekly grow review reminder']

export default function CalendarPage() {
  return (
    <ShellSection>
      <PageHeader title="Calendar and reminders" copy="Feed, water, photo, daily check-in, stage change, flush, harvest estimate, low-stock, and weekly review reminders." />
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[...reminders.map((item) => item.title), ...extra].map((item, index) => (
          <Panel key={`${item}-${index}`} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-black">{item}</h2>
              <StatusPill tone={index % 2 ? 'blue' : 'lime'}>{index < 4 ? 'Active' : 'Ready'}</StatusPill>
            </div>
            <p className="mt-3 text-sm leading-6 text-zinc-400">Scheduled from grow stage, last feed, product inventory, stage estimate, and Professional intelligence settings.</p>
          </Panel>
        ))}
      </div>
      <div className="mt-6">
        <NotificationControls />
      </div>
    </ShellSection>
  )
}
