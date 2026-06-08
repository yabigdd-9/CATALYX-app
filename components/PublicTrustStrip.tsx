import Link from 'next/link'
import { Panel, StatusPill } from '@/components/catalyx-ui'

const trustCards = [
  {
    title: 'Shipping clarity',
    body: 'Shipping options and final charges are shown in checkout before payment is confirmed.',
    actionLabel: 'View cart checkout',
    href: '/cart',
  },
  {
    title: 'Direct support path',
    body: 'Product, technical, and operations contacts are published openly instead of being hidden behind an untracked form.',
    actionLabel: 'Open contact',
    href: '/contact',
  },
  {
    title: 'Secure checkout',
    body: 'Catalyx product orders use Stripe-hosted checkout so payment details are entered on Stripe, not stored in this app.',
    actionLabel: 'Review terms',
    href: '/terms',
  },
  {
    title: 'Returns and order issues',
    body: 'Order issues, support questions, and store terms are handled through the public contact path and store policy pages.',
    actionLabel: 'Read store terms',
    href: '/terms',
  },
]

export default function PublicTrustStrip({
  title = 'Public trust signals',
  copy = 'The buying path should answer the practical questions buyers look for before they commit.',
  compact = false,
}: {
  title?: string
  copy?: string
  compact?: boolean
}) {
  return (
    <div className={compact ? 'mt-6' : 'mt-8'}>
      <div className="flex flex-col gap-3 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c8f500]">Trust strip</p>
          <h2 className="mt-3 text-3xl font-black uppercase leading-tight tracking-[0.05em] text-white md:text-4xl">{title}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-300">{copy}</p>
        </div>
        <StatusPill tone="blue">Launch-ready buying path</StatusPill>
      </div>
      <div className={`mt-6 grid gap-4 ${compact ? 'lg:grid-cols-2' : 'lg:grid-cols-4'}`}>
        {trustCards.map((card) => (
          <Panel key={card.title} className="flex h-full flex-col p-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#33d9ff]">Buyer proof</p>
            <h3 className="mt-3 text-xl font-black text-white">{card.title}</h3>
            <p className="mt-3 text-sm leading-6 text-zinc-300">{card.body}</p>
            <div className="mt-auto pt-5">
              <Link
                href={card.href}
                className="inline-flex rounded-md border border-white/15 bg-white/5 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-white"
              >
                {card.actionLabel}
              </Link>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  )
}
