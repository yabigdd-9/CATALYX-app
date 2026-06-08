'use client'

import { useEffect, useState } from 'react'
import { storageKeys, writeLocalObject } from '@/lib/persistence'
import { Panel, SaveBanner, StatusPill } from '@/components/catalyx-ui'

export default function NotificationControls() {
  const [permission, setPermission] = useState<NotificationPermission | 'checking' | 'unsupported'>(() => {
    if (typeof Notification === 'undefined') return 'unsupported'
    return Notification.permission
  })
  const [workerReady, setWorkerReady] = useState(false)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [message, setMessage] = useState('Notification permission was not granted.')

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return
    navigator.serviceWorker.ready
      .then(() => setWorkerReady(true))
      .catch(() => setWorkerReady(false))
  }, [])

  async function enable() {
    setStatus('saving')
    if (typeof Notification === 'undefined' || !('serviceWorker' in navigator)) {
      setMessage('This browser does not support installable reminder notifications.')
      setStatus('error')
      return
    }
    const next = await Notification.requestPermission()
    setPermission(next)
    if (next === 'granted') {
      const registration = await navigator.serviceWorker.ready.catch(() => null)
      if (registration) {
        writeLocalObject(storageKeys.pushSubscription, {
          enabled: true,
          permission: next,
          enabledAt: new Date().toISOString(),
          endpoint: 'local-device-scheduler',
        })
        await registration.showNotification('Catalyx reminders enabled', {
          body: 'Feed, check-in, photo, stage, flush, and low-stock reminders can now surface from the installed app.',
          icon: '/brand/catalyx/favicon_256x256.png',
          badge: '/brand/catalyx/favicon_128x128.png',
          data: { url: '/reminders' },
        })
      } else {
        new Notification('Catalyx reminders enabled', {
          body: 'Feed, check-in, photo, stage, flush, and low-stock reminders can now surface from the installed app.',
        })
      }
      setMessage('Notifications enabled for this browser. Due reminders will surface while the app is open or installed.')
    } else {
      setMessage('Notification permission was not granted.')
    }
    setStatus(next === 'granted' ? 'saved' : 'error')
  }

  async function testNotification() {
    if (permission !== 'granted') {
      setStatus('error')
      setMessage('Enable notifications before sending a test reminder.')
      return
    }
    const registration = await navigator.serviceWorker.ready.catch(() => null)
    await registration?.showNotification('Catalyx test reminder', {
      body: 'This is how feed, check-in, photo, flush, and low-stock reminders will appear.',
      icon: '/brand/catalyx/favicon_256x256.png',
      badge: '/brand/catalyx/favicon_128x128.png',
      data: { url: '/reminders' },
    })
    setStatus('saved')
    setMessage('Test notification sent.')
  }

  return (
    <Panel className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black">PWA reminder notifications</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">Enable installable-app reminders for feeds, watering, photos, daily check-ins, stage changes, flush timing, low stock, and reward lifecycle nudges that bring users back before value expires.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusPill tone={permission === 'granted' ? 'lime' : permission === 'checking' ? 'blue' : 'amber'}>
            {permission === 'checking' ? 'checking' : permission}
          </StatusPill>
          <StatusPill tone={workerReady ? 'blue' : 'amber'}>{workerReady ? 'Service worker ready' : 'Worker pending'}</StatusPill>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={enable}
          disabled={permission === 'checking' || permission === 'unsupported'}
          className="rounded-md bg-[#c8f500] px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-black disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
        >
          {permission === 'unsupported' ? 'Notifications unavailable' : 'Enable reminders'}
        </button>
        <button
          onClick={testNotification}
          disabled={permission !== 'granted'}
          className="rounded-md border border-white/15 px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-white disabled:cursor-not-allowed disabled:border-white/10 disabled:text-zinc-500"
        >
          Send test
        </button>
      </div>
      <div className="mt-4">
        <SaveBanner status={status} message={message} />
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {[
          'Check-in ready',
          'Mission ready',
          'Wheel ready',
          'Points expiring',
          'Reward claimable',
          "You're 80 CX away",
        ].map((item) => (
          <div key={item} className="rounded-md border border-white/10 bg-black/30 p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Lifecycle reminder</p>
            <p className="mt-2 font-black text-white">{item}</p>
          </div>
        ))}
      </div>
    </Panel>
  )
}
