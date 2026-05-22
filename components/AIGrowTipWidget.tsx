'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const tips = [
  {
    title: 'Check runoff before pushing EC',
    body: 'If runoff EC is rising over multiple feeds, hold strength before adding bloom boosters.',
    href: '/feed-calculator',
    action: 'Tune feed',
  },
  {
    title: 'Log the small signal',
    body: 'Leaf posture, pH drift, dryback speed, and runoff trend are more useful together than any single reading.',
    href: '/feed-log',
    action: 'Log feed',
  },
  {
    title: 'Stage drives the recipe',
    body: 'Seedling, vegetative, early flower, mid flower, late flower, and flush each need different nutrient pressure.',
    href: '/university',
    action: 'Study stages',
  },
  {
    title: 'Base first, additives second',
    body: 'A-X PRO and B-X PRO set the mineral backbone. Supplements should support the stage, not replace the base.',
    href: '/products',
    action: 'View products',
  },
]

export default function AIGrowTipWidget() {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % tips.length)
    }, 9000)

    return () => window.clearInterval(timer)
  }, [])

  const tip = tips[index]

  return (
    <aside className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm">
      {open ? (
        <div className="overflow-hidden rounded-lg border border-[#c8f500]/35 bg-[#050707]/95 shadow-2xl shadow-[#c8f500]/10 backdrop-blur">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#c8f500] opacity-60" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-[#c8f500]" />
              </span>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#d9ff34]">Catalyx AI Coach</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-md border border-white/10 px-2 py-1 text-xs font-black uppercase tracking-[0.12em] text-zinc-400 transition hover:border-[#c8f500]/50 hover:text-white"
              aria-label="Collapse AI coach"
            >
              Hide
            </button>
          </div>
          <div className="p-4">
            <p className="text-lg font-black leading-tight text-white">{tip.title}</p>
            <p className="mt-3 text-sm leading-6 text-zinc-400">{tip.body}</p>
            <div className="mt-4 flex items-center justify-between gap-3">
              <Link
                href={tip.href}
                className="rounded-md bg-[#c8f500] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-black shadow-lg shadow-[#c8f500]/15"
              >
                {tip.action}
              </Link>
              <button
                onClick={() => setIndex((current) => (current + 1) % tips.length)}
                className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-500 transition hover:text-[#d9ff34]"
              >
                Next tip
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="ml-auto flex items-center gap-3 rounded-full border border-[#c8f500]/35 bg-[#050707]/95 px-4 py-3 text-left shadow-2xl shadow-[#c8f500]/10 backdrop-blur transition hover:border-[#c8f500]/70"
          aria-label="Open Catalyx AI coach"
        >
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#c8f500] opacity-60" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-[#c8f500]" />
          </span>
          <span>
            <span className="block text-xs font-black uppercase tracking-[0.14em] text-[#d9ff34]">AI Coach</span>
            <span className="block text-xs text-zinc-500">Live grow tip</span>
          </span>
        </button>
      )}
    </aside>
  )
}
