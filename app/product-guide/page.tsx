import Link from 'next/link'
import ProductVisual from '@/components/ProductVisual'
import { Panel, ShellSection, StatusPill } from '@/components/catalyx-ui'
import { products, stageLabels, stageOrder } from '@/lib/catalyx'

export default function ProductGuidePage() {
  return (
    <ShellSection>
      <div className="flex flex-col justify-between gap-5 border-b border-white/10 pb-6 md:flex-row md:items-end">
        <div>
          <h1 className="max-w-4xl text-5xl font-black uppercase leading-[0.94] tracking-[0.04em] text-white md:text-7xl">Product guide</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-300">
            A practical buying and usage guide for the Catalyx range, organised by stage, function, watch signs, and product role.
          </p>
        </div>
        <Link href="/products" className="rounded-md bg-[#c8f500] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-black">Shop all SKUs</Link>
      </div>

      <div className="mt-8 grid gap-4">
        {stageOrder.map((stage) => {
          const stageProducts = products.filter((product) => product.stages.includes(stage))
          return (
            <Panel key={stage} className="overflow-hidden">
              <div className="border-b border-white/10 p-5">
                <StatusPill tone="lime">{stageLabels[stage]}</StatusPill>
                <h2 className="mt-3 text-3xl font-black">{stageLabels[stage]} products</h2>
              </div>
              <div className="grid gap-0 md:grid-cols-2 xl:grid-cols-3">
                {stageProducts.map((product) => (
                  <Link key={product.id} href={`/products/${product.id}`} className="group grid gap-4 border-b border-white/10 p-5 last:border-b-0 md:border-r md:last:border-r-0 xl:last:border-r">
                    <ProductVisual productId={product.id} productName={product.name} className="h-56 w-full rounded-md transition duration-500 group-hover:scale-[1.02]" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: product.accent }}>{product.purpose}</p>
                      <h3 className="mt-2 text-2xl font-black">{product.name}</h3>
                      <p className="mt-3 text-sm leading-6 text-zinc-400">{product.when}</p>
                      <p className="mt-3 text-sm leading-6 text-zinc-500">{product.watchFor.join(' / ')}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </Panel>
          )
        })}
      </div>
    </ShellSection>
  )
}
