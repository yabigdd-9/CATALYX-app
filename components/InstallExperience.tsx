'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Panel, StatusPill } from '@/components/catalyx-ui'

type DevicePlatform = 'ios' | 'android' | 'desktop'
type BrowserType = 'safari' | 'chrome' | 'other'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const iosSteps = [
  'Open the live Catalyx site in Safari on iPhone.',
  'Tap the Share button in Safari.',
  'Choose Add to Home Screen.',
  'Tap Add, then launch Catalyx from the new home-screen icon.',
]

const androidSteps = [
  'Open the live Catalyx site in Chrome on Android.',
  'Tap Install app if Chrome offers it, or open the browser menu.',
  'Choose Install app or Add to Home screen.',
  'Confirm the install and launch Catalyx from the app icon.',
]

const requirements = [
  'Use the deployed HTTPS domain, not localhost.',
  'For iPhone, use Safari. Other iOS browsers are less reliable for install UX.',
  'Sign in once after install so the app can restore your session and live grow data.',
]

function detectPlatform(userAgent: string) {
  if (/iphone|ipad|ipod/i.test(userAgent)) return 'ios' as const
  if (/android/i.test(userAgent)) return 'android' as const
  return 'desktop' as const
}

function detectBrowser(userAgent: string) {
  const isChrome = /chrome|crios/i.test(userAgent) && !/edg|opr|samsungbrowser/i.test(userAgent)
  const isSafari = /safari/i.test(userAgent) && !/chrome|crios|android/i.test(userAgent)

  if (isSafari) return 'safari' as const
  if (isChrome) return 'chrome' as const
  return 'other' as const
}

export default function InstallExperience() {
  const [platform] = useState<DevicePlatform>(() => {
    if (typeof window === 'undefined') return 'desktop'
    return detectPlatform(window.navigator.userAgent)
  })
  const [browser] = useState<BrowserType>(() => {
    if (typeof window === 'undefined') return 'other'
    return detectBrowser(window.navigator.userAgent)
  })
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window === 'undefined') return false
    const iosNavigator = window.navigator as Navigator & { standalone?: boolean }
    return window.matchMedia('(display-mode: standalone)').matches || iosNavigator.standalone === true
  })
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installMessage, setInstallMessage] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
    }

    const handleInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
      setInstallMessage('Catalyx is installed on this device.')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  async function handleInstall() {
    if (!deferredPrompt) return

    await deferredPrompt.prompt()
    const outcome = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setInstallMessage(
      outcome.outcome === 'accepted'
        ? 'Catalyx install accepted. Open it from your home screen once Chrome finishes.'
        : 'Install prompt dismissed. You can reopen it later from Chrome.'
    )
  }

  const statusTone = isInstalled ? 'lime' : platform === 'ios' ? 'blue' : platform === 'android' ? 'amber' : 'blue'
  const statusText = isInstalled
    ? 'Installed'
    : platform === 'ios'
      ? 'iPhone install path'
      : platform === 'android'
        ? 'Android install path'
        : 'Open this page on your phone'

  return (
    <div className="grid gap-8">
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Panel className="overflow-hidden border-[#c8f500]/30 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#c8f500]">Install Catalyx</p>
            <StatusPill tone={statusTone}>{statusText}</StatusPill>
          </div>
          <h1 className="mt-4 max-w-3xl text-4xl font-black uppercase leading-[0.95] tracking-[0.05em] text-white md:text-6xl">
            Home-screen install is the fastest mobile rollout.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-300">
            Catalyx already has installable PWA support. Use this page on the real deployed site to
            install it to iPhone or Android first, then decide later whether you still need full
            App Store and Play Store wrappers.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="rounded-md bg-[#c8f500] px-5 py-3 text-center text-sm font-black uppercase tracking-[0.14em] text-black"
            >
              Open site
            </Link>
            <Link
              href="/dashboard"
              className="rounded-md border border-white/15 bg-white/5 px-5 py-3 text-center text-sm font-black uppercase tracking-[0.14em] text-white"
            >
              Open Grow OS
            </Link>
            {platform === 'android' && deferredPrompt ? (
              <button
                type="button"
                onClick={() => void handleInstall()}
                className="rounded-md border border-[#33d9ff]/25 bg-[#33d9ff]/10 px-5 py-3 text-center text-sm font-black uppercase tracking-[0.14em] text-[#8decff]"
              >
                Install now
              </button>
            ) : null}
          </div>
          {installMessage ? (
            <div className="mt-6 rounded-md border border-[#33d9ff]/20 bg-[#33d9ff]/10 p-4">
              <p className="text-sm leading-6 text-zinc-200">{installMessage}</p>
            </div>
          ) : null}
        </Panel>

        <Panel className="p-6 sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">Requirements</p>
          <div className="mt-5 grid gap-3">
            {requirements.map((item) => (
              <div key={item} className="rounded-md border border-white/10 bg-black/25 p-4">
                <p className="text-sm leading-6 text-zinc-300">{item}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-md border border-[#33d9ff]/20 bg-[#33d9ff]/8 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8decff]">Current device</p>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              {platform === 'ios'
                ? browser === 'safari'
                  ? 'You are on iPhone Safari, which is the correct browser for home-screen install.'
                  : 'You appear to be on iPhone, but not Safari. Open the same URL in Safari to install properly.'
                : platform === 'android'
                  ? browser === 'chrome'
                    ? 'You are on Android Chrome, so install should be available from Chrome UI.'
                    : 'You appear to be on Android. Chrome gives the cleanest install flow.'
                  : 'Open this page on an iPhone or Android device to complete install.'}
            </p>
          </div>
          <div className="mt-4 rounded-md border border-[#c8f500]/18 bg-[#c8f500]/7 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#d9ff34]">Store note</p>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              Home-screen install is enough for mobile use now. Full store submission still needs
              native wrapper QA, store assets, developer accounts, and a digital-subscription policy
              decision for Apple and Google.
            </p>
          </div>
        </Panel>
      </div>

      {isInstalled ? (
        <Panel className="border-[#c8f500]/30 p-6 sm:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c8f500]">Installed app detected</p>
              <h2 className="mt-2 text-3xl font-black uppercase tracking-[0.04em] text-white">
                Catalyx is already on this device.
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-300">
                Use the installed icon for the cleanest full-screen experience, then enable reminders
                and complete a real mobile pass through dashboard, feed log, photos, and account.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="rounded-md bg-[#c8f500] px-5 py-3 text-center text-sm font-black uppercase tracking-[0.14em] text-black"
              >
                Open dashboard
              </Link>
              <Link
                href="/reminders"
                className="rounded-md border border-white/15 bg-white/5 px-5 py-3 text-center text-sm font-black uppercase tracking-[0.14em] text-white"
              >
                Open reminders
              </Link>
            </div>
          </div>
        </Panel>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel className="p-6 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c8f500]">iPhone</p>
            <h2 className="mt-3 text-3xl font-black uppercase tracking-[0.04em] text-white">
              Add Catalyx to the home screen
            </h2>
            <div className="mt-6 grid gap-3">
              {iosSteps.map((step, index) => (
                <div key={step} className="flex gap-4 rounded-md border border-white/10 bg-black/25 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#c8f500]/35 bg-[#c8f500]/10 text-sm font-black text-[#d9ff34]">
                    {index + 1}
                  </div>
                  <p className="pt-1 text-sm leading-6 text-zinc-300">{step}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="p-6 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#33d9ff]">Android</p>
            <h2 className="mt-3 text-3xl font-black uppercase tracking-[0.04em] text-white">
              Install it like an app
            </h2>
            <div className="mt-6 grid gap-3">
              {androidSteps.map((step, index) => (
                <div key={step} className="flex gap-4 rounded-md border border-white/10 bg-black/25 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#33d9ff]/35 bg-[#33d9ff]/10 text-sm font-black text-[#8decff]">
                    {index + 1}
                  </div>
                  <p className="pt-1 text-sm leading-6 text-zinc-300">{step}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}
    </div>
  )
}
