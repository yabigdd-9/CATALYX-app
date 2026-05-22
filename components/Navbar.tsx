'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

const nav = [
  ['Dashboard', '/dashboard'],
  ['Grows', '/grows'],
  ['Calculator', '/feed-calculator'],
  ['Log Feed', '/feed-log'],
  ['Reminders', '/reminders'],
  ['Products', '/products'],
  ['Account', '/account'],
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#050707]/90 shadow-2xl shadow-black/40 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <Image src="/brand/official/logo-production-official.png" alt="Catalyx Labs" width={300} height={215} className="h-12 w-auto object-contain drop-shadow-[0_0_18px_rgba(200,245,0,0.28)]" priority />
          </Link>
          <div className="hidden items-center gap-5 lg:flex">
            {nav.map(([label, href]) => (
              <Link key={href} href={href} className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-400 transition hover:text-[#c8f500]">
                {label}
              </Link>
            ))}
            <Link href="/login" className="rounded-md border border-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white">Login</Link>
          </div>
          <button onClick={() => setIsOpen(!isOpen)} className="rounded-md border border-white/15 px-3 py-2 text-sm font-bold text-white lg:hidden" aria-label="Toggle navigation">
            Menu
          </button>
        </div>
        {isOpen ? (
          <div className="mt-4 grid gap-2 border-t border-white/10 pt-4 lg:hidden">
            {nav.map(([label, href]) => (
              <Link key={href} href={href} onClick={() => setIsOpen(false)} className="rounded-md px-3 py-3 text-sm font-semibold text-zinc-300 hover:bg-white/5 hover:text-white">
                {label}
              </Link>
            ))}
            <Link href="/login" onClick={() => setIsOpen(false)} className="rounded-md bg-[#c8f500] px-3 py-3 text-sm font-black text-black">
              Login
            </Link>
          </div>
        ) : null}
      </div>
    </nav>
  )
}
