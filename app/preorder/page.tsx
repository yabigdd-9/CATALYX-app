import type { Metadata } from 'next'
import Link from 'next/link'
import KitCard from '@/components/KitCard'
import PublicTrustStrip from '@/components/PublicTrustStrip'
import { PageHeader, Panel, ShellSection, StatusPill } from '@/components/catalyx-ui'
import { catalyxKits } from '@/lib/kits'

const nextSteps = [
  {
    title: 'Start with Base Kit',
    body: 'Best for first-time buyers who want the cleanest path into the Catalyx system.',
    href: '/kits/base-kit',
    cta: 'View Base Kit',
  },
  {
    title: 'Compare with feed planning',
    body: 'Use the feed chart after you choose a kit so the stage logic matches what you buy.',
    href: '/feed-chart',
    cta: 'Open feed plan',
  },
  {
    title: 'Check every bottle',
    body: 'Open the product guide if you want to understand roles, pairings, and use windows before buying.',
    href: '/product-guide',
    cta: 'Open product guide',
  },
]

export const metadata: Metadata = {
  title: 'Catalyx kits | Base Kit to Complete Kit',
  description:
    'Compare every Catalyx kit from Base Kit to Complete Kit, see what is included, and choose the right path into the system.',
}

export default function PreorderPage() {
  return (
    <ShellSection>
      <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div>
          <StatusPill tone="violet">Kits page</StatusPill>
          <PageHeader
            title="Choose the right Catalyx kit."
            copy="The public path is simpler now: compare the locked kit lineup, see what each kit includes, and move directly into products, feed planning, or product education."
          />
          <div className="mt-6 rounded-md border border-[#33d9ff]/20 bg-[#33d9ff]/10 p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#8decff]">Fastest answer</p>
            <p className="mt-2 text-sm leading-6 text-zinc-200">
              If you are unsure where to begin, start with the Base Kit. It is the clearest entry point for most first-time visitors.
            </p>
          </div>
        </div>

        <Panel className="p-6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c8f500]">What to do next</p>
          <div className="mt-5 grid gap-3">
            {nextSteps.map((item) => (
              <div key={item.title} className="rounded-md border border-white/10 bg-black/25 p-4">
                <h2 className="text-lg font-black text-white">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-zinc-300">{item.body}</p>
                <Link href={item.href} className="mt-4 inline-flex rounded-md border border-white/15 bg-white/5 px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-white">
                  {item.cta}
                </Link>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {catalyxKits.map((kit) => (
          <div key={kit.slug} id={kit.slug}>
            <KitCard kit={kit} />
          </div>
        ))}
      </div>

      <PublicTrustStrip
        compact
        title="Before checkout, buyers should know how the store works"
        copy="The kits page now carries the practical trust signals as well: shipping is visible in checkout, support is direct, Stripe hosts payment, and order issues route through public support and terms."
      />
    </ShellSection>
  )
}
