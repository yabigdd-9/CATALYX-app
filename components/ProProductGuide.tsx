import Link from 'next/link'
import type { ProductKey } from '@/lib/catalyx'
import { guideForProduct, weeklyStageTip } from '@/lib/pro-product-guide'
import { Panel, StatusPill } from '@/components/catalyx-ui'
import StaticUpgradeCard from '@/components/StaticUpgradeCard'

type ProProductGuideProps = {
  productId: ProductKey
  productName: string
  stage?: string
}

export default function ProProductGuide({ productId, productName, stage = 'mid-flower' }: ProProductGuideProps) {
  const guide = guideForProduct(productId)
  if (!guide) return null

  const weeklyTip = weeklyStageTip(productId, stage)

  return (
    <div className="relative mt-6">
      <div className="pointer-events-none max-h-[420px] overflow-hidden rounded-lg opacity-40 blur-[1px]">
        <Panel className="overflow-hidden border-[#c8f500]/25 p-6">
          <div className="flex flex-wrap items-center gap-3">
            <StatusPill tone="lime">Catalyx Pro guide</StatusPill>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Also known as {guide.aliases.join(' · ')}</p>
          </div>
          <p className="mt-4 text-lg font-black text-white">{guide.role}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              ['When to use', guide.whenToUse],
              ['What not to mix', guide.doNotMix],
              ['Beginner dose', guide.beginnerDose],
              ['Pro dose', guide.proDose],
              ['Storage', guide.storage],
              ['Compatibility', guide.compatibility],
            ].map(([title, body]) => (
              <div key={title} className="rounded-md border border-white/10 bg-black/30 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">{title}</p>
                <p className="mt-2 text-sm leading-6 text-zinc-300">{body}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <GuideList title="Signs of overuse" items={guide.overuseSigns} />
            <GuideList title="Signs of deficiency" items={guide.deficiencySigns} />
          </div>
          {weeklyTip ? (
            <div className="mt-4 rounded-md border border-[#8decff]/30 bg-[#8decff]/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8decff]">Weekly stage tip</p>
              <p className="mt-2 text-sm leading-6 text-zinc-200">{weeklyTip}</p>
            </div>
          ) : null}
          <Link href="/pricing" className="mt-5 inline-flex rounded-md border border-[#c8f500]/40 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#d9ff34]">
            Unlock all product guides
          </Link>
        </Panel>
      </div>
      <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-[#050707] via-[#050707]/90 to-transparent p-6">
        <StaticUpgradeCard
          feature={`${productName} Pro guide`}
          reason="Catalyx Pro unlocks the full product assistant: what it does, when to use it, what not to mix, dose bands, overuse and deficiency signs, storage, compatibility, and weekly stage tips."
          compact
        />
      </div>
    </div>
  )
}

function GuideList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-md border border-white/10 bg-black/30 p-4">
      <p className="font-black text-white">{title}</p>
      <ul className="mt-3 space-y-2 text-sm text-zinc-400">
        {items.map((item) => (
          <li key={item}>+ {item}</li>
        ))}
      </ul>
    </div>
  )
}
