import { products } from '@/lib/catalyx'
import { PageHeader, Panel, ShellSection, StatusPill } from '@/components/catalyx-ui'

export default function InventoryPage() {
  return (
    <ShellSection>
      <PageHeader title="My Shelf inventory" copy="Track owned Catalyx products, bottle size, amount remaining, usage per feed, days left, reorder timing, and low-stock warnings." />
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product, index) => {
          const remaining = 820 - index * 55
          const days = Math.max(6, Math.round(remaining / (20 + index * 3)))
          return (
            <Panel key={product.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">{product.purpose}</p>
                  <h2 className="mt-2 text-2xl font-black" style={{ color: product.accent }}>{product.name}</h2>
                </div>
                <StatusPill tone={days < 14 ? 'amber' : 'lime'}>{days < 14 ? 'Low soon' : 'Stocked'}</StatusPill>
              </div>
              <p className="mt-4 text-sm leading-6 text-zinc-400">Bottle size: 1 L. Amount remaining: {remaining} ml. Estimated {days} days left. Reorder recommended in {Math.max(1, days - 8)} days.</p>
              <div className="mt-4 h-2 rounded-full bg-white/10">
                <div className="h-2 rounded-full" style={{ width: `${remaining / 10}%`, maxWidth: '100%', backgroundColor: product.accent, boxShadow: `0 0 18px ${product.accent}66` }} />
              </div>
              <button className="mt-4 rounded-md border border-white/15 px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-white">Reorder placeholder</button>
            </Panel>
          )
        })}
      </div>
    </ShellSection>
  )
}

