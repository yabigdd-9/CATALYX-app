import Image from 'next/image'
import Link from 'next/link'
import { Disclaimer } from '@/components/catalyx-ui'
import { catalyxKits } from '@/lib/kits'

const groups = [
  ['Shop', [['All products', '/products'], ['Core nutrients', '/collections/core-nutrients'], ['Additives', '/collections/additives'], ['Specialist support', '/collections/specialist'], ['View cart', '/cart']]],
  ['Kits', catalyxKits.map((kit) => [kit.name, kit.href])],
  ['Learn', [['How it works', '/ax-bx-system'], ['Feed chart', '/feed-chart'], ['Product guide', '/product-guide'], ['Safety + storage', '/safety-storage'], ['Install on phone', '/install']]],
  ['Company', [['About', '/about'], ['Contact', '/contact'], ['Grow OS', '/dashboard'], ['Privacy', '/privacy'], ['Terms', '/terms']]],
]

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.1fr_2fr] lg:px-8">
        <div>
          <div className="brand-logo-blend flex items-center gap-3">
            <Image src="/brand/catalyx/CATALYX_Monogram_Full_Colour.png" alt="Catalyx Labs" width={1000} height={1000} className="h-16 w-16 shrink-0 object-contain" />
            <span className="grid leading-none">
              <span className="text-[20px] font-black uppercase tracking-[0.22em] text-zinc-100">Catalyx</span>
              <span className="mt-1 text-[11px] font-black uppercase tracking-[0.42em] text-[#c8f500]">Labs</span>
            </span>
          </div>
          <p className="mt-4 max-w-md text-sm leading-6 text-zinc-300">
            Premium plant nutrition, clearer feed planning, and practical grow support without the clutter.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/products" className="rounded-md bg-[#c8f500] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-black">
              Shop nutrients
            </Link>
            <Link href="/feed-chart" className="rounded-md border border-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-white">
              Find feed plan
            </Link>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {groups.map(([title, links]) => (
            <div key={title as string}>
              <h3 className="text-sm font-black uppercase tracking-[0.16em] text-[#c8f500]">{title as string}</h3>
              <div className="mt-3 grid gap-2">
                {(links as string[][]).map(([label, href]) => (
                  <Link key={href} href={href} className="text-sm text-zinc-300 transition hover:text-white">{label}</Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <Disclaimer />
      </div>
    </footer>
  )
}
