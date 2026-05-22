'use client'

import { useState } from 'react'
import { Panel, SaveBanner, StatusPill } from '@/components/catalyx-ui'

export default function NotificationControls() {
  const [permission, setPermission] = useState(typeof Notification === 'undefined' ? 'unsupported' : Notification.permission)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  async function enable() {
    setStatus('saving')
    if (typeof Notification === 'undefined') {
      setStatus('error')
      return
    }
    const next = await Notification.requestPermission()
    setPermission(next)
    if (next === 'granted') {
      new Notification('Catalyx reminders enabled', {
        body: 'Feed, check-in, photo, stage, flush, and low-stock reminders can now surface from the installed app.',
      })
    }
    setStatus(next === 'granted' ? 'saved' : 'error')
  }

  return (
    <Panel className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black">PWA reminder notifications</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">Enable installable-app reminders for feeds, watering, photos, daily check-ins, stage changes, flush timing, and low stock.</p>
        </div>
        <StatusPill tone={permission === 'granted' ? 'lime' : 'amber'}>{permission}</StatusPill>
      </div>
      <button onClick={enable} className="mt-5 rounded-md bg-[#c8f500] px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-black">Enable reminders</button>
      <div className="mt-4">
        <SaveBanner status={status} message={status === 'saved' ? 'Notifications enabled for this browser.' : 'Notification permission was not granted.'} />
      </div>
    </Panel>
  )
}

