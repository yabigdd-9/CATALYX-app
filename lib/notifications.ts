import type { AppReminder } from '@/lib/catalyx'

export function formatReminderDue(date: Date) {
  const now = new Date()
  const sameDay = date.toDateString() === now.toDateString()
  const tomorrow = date.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString()
  const time = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  if (sameDay) return `Today ${time}`
  if (tomorrow) return `Tomorrow ${time}`
  return date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export function createReminder(input: {
  title: string
  detail: string
  type: AppReminder['type']
  dueAt: string
}): AppReminder {
  const dueDate = new Date(input.dueAt)
  return {
    id: `reminder-${Date.now()}`,
    title: input.title.trim(),
    detail: input.detail.trim(),
    type: input.type,
    dueAt: dueDate.toISOString(),
    due: formatReminderDue(dueDate),
    completed: false,
    source: 'local',
  }
}

export function dueReminder(reminders: AppReminder[]) {
  const now = Date.now()
  return reminders
    .filter((item) => !item.completed && !item.notifiedAt)
    .filter((item) => {
      const due = new Date(item.dueAt).getTime()
      return Number.isFinite(due) && due <= now
    })
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())[0]
}

export async function showReminderNotification(reminder: AppReminder) {
  if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
    return false
  }

  const registration = await navigator.serviceWorker?.ready.catch(() => null)
  if (registration?.showNotification) {
    await registration.showNotification(`Catalyx: ${reminder.title}`, {
      body: reminder.detail,
      tag: reminder.id,
      icon: '/brand/catalyx/favicon_256x256.png',
      badge: '/brand/catalyx/favicon_128x128.png',
      data: { url: '/reminders', reminderId: reminder.id },
    })
    return true
  }

  new Notification(`Catalyx: ${reminder.title}`, {
    body: reminder.detail,
    icon: '/brand/catalyx/favicon_256x256.png',
  })
  return true
}
