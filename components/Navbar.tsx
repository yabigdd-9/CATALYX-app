'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

const nav = [
  ['Shop', '/products'],
  ['Kits', '/preorder'],
  ['How It Works', '/ax-bx-system'],
  ['Feed Plan', '/feed-chart'],
  ['CX Rewards', '/rewards'],
  ['Portal', '/portal'],
  ['Grow OS', '/dashboard'],
]

export default function Navbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#050707]/90 shadow-2xl shadow-black/40 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="brand-logo-blend flex min-w-0 items-center gap-3">
            <Image src="/brand/catalyx/CATALYX_Monogram_Full_Colour.png" alt="Catalyx Labs" width={1000} height={1000} className="h-16 w-16 shrink-0 object-contain sm:h-[72px] sm:w-[72px]" priority />
            <span className="hidden min-w-0 leading-none sm:grid">
              <span className="text-[20px] font-black uppercase tracking-[0.22em] text-zinc-100">Catalyx</span>
              <span className="mt-1 text-[11px] font-black uppercase tracking-[0.42em] text-[#c8f500]">Labs</span>
            </span>
          </Link>
          <div className="hidden items-center gap-5 lg:flex">
            {nav.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                aria-current={pathname === href ? 'page' : undefined}
                className={`text-xs font-bold uppercase tracking-[0.16em] transition ${
                  pathname === href ? 'text-[#d9ff34]' : 'text-zinc-400 hover:text-[#c8f500]'
                }`}
              >
                {label}
              </Link>
            ))}
            <Link href="/install" className="rounded-md border border-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white">Install</Link>
            <Link href="/products" className="rounded-md bg-[#c8f500] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-black">Shop nutrients</Link>
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-md border border-white/15 px-3 py-2 text-sm font-bold text-white lg:hidden"
            aria-label="Toggle navigation"
            aria-expanded={isOpen}
            aria-controls="mobile-nav"
          >
            Menu
          </button>
        </div>
        {isOpen ? (
          <div id="mobile-nav" className="mt-4 grid gap-2 border-t border-white/10 pt-4 lg:hidden">
            {nav.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
                aria-current={pathname === href ? 'page' : undefined}
                className={`rounded-md px-3 py-3 text-sm font-semibold ${
                  pathname === href ? 'bg-[#c8f500]/10 text-[#d9ff34]' : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                {label}
              </Link>
            ))}
            <div className="mt-2 grid gap-2 border-t border-white/10 pt-4">
              <Link href="/install" onClick={() => setIsOpen(false)} className="rounded-md border border-white/15 px-3 py-3 text-sm font-black text-white">
                Install on phone
              </Link>
              <Link href="/portal" onClick={() => setIsOpen(false)} className="rounded-md border border-white/15 px-3 py-3 text-sm font-black text-white">
                Customer portal
              </Link>
              <Link href="/products" onClick={() => setIsOpen(false)} className="rounded-md bg-[#c8f500] px-3 py-3 text-sm font-black text-black">
                Shop nutrients
              </Link>
            </div>
            <Link href="/login" onClick={() => setIsOpen(false)} className="rounded-md px-3 py-3 text-sm font-semibold text-zinc-400">
              Login
            </Link>
          </div>
        ) : null}
      </div>
    </nav>
  )
}
