import Link from 'next/link'
import { Panel, StatusPill } from '@/components/catalyx-ui'
import { type CatalyxKit, getKitProducts } from '@/lib/kits'

export default function KitCard({
  kit,
  className = '',
  showNote = true,
}: {
  kit: CatalyxKit
  className?: string
  showNote?: boolean
}) {
  const entries = getKitProducts(kit.productIds)
  const accent = entries[0]?.catalyxProduct.accent ?? '#c8f500'

  return (
    <Panel className={`flex h-full flex-col overflow-hidden border-white/12 ${className}`}>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em]" style={{ color: accent }}>
              Kit
            </p>
            <h3 className="mt-3 text-2xl font-black uppercase tracking-[0.04em] text-white">
              {kit.name}
            </h3>
            <p className="mt-2 text-sm font-semibold text-zinc-200">{kit.subtitle}</p>
          </div>
          <StatusPill tone="blue">{entries.length} items</StatusPill>
        </div>

        <p className="mt-4 text-sm leading-6 text-zinc-300">{kit.description}</p>

        <div className="mt-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">Included items</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {entries.map(({ catalyxProduct }) => (
              <span
                key={catalyxProduct.id}
                className="rounded-md border border-white/10 bg-black/30 px-2.5 py-1.5 text-xs font-semibold uppercase tracking-[0.12em]"
                style={{ color: catalyxProduct.accent }}
              >
                {catalyxProduct.name}
              </span>
            ))}
          </div>
        </div>

        {showNote && kit.note ? (
          <div className="mt-5 rounded-md border border-[#33d9ff]/20 bg-[#33d9ff]/10 p-3">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8decff]">Why click this first</p>
            <p className="mt-2 text-sm leading-6 text-zinc-200">{kit.note}</p>
          </div>
        ) : null}

        <div className="mt-auto pt-6">
          <Link
            href={kit.href}
            className="inline-flex w-full items-center justify-center rounded-md bg-[#c8f500] px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-black shadow-lg shadow-[#c8f500]/15"
          >
            {kit.ctaLabel}
          </Link>
        </div>
      </div>
    </Panel>
  )
}
