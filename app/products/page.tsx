import Link from 'next/link'
import { products, stageLabels } from '@/lib/catalyx'
import { PageHeader, Panel, ShellSection, StatusPill } from '@/components/catalyx-ui'
import ProductVisual from '@/components/ProductVisual'

export default function ProductsPage() {
  return (
    <ShellSection>
      <PageHeader title="Product education platform" copy="The official Catalyx Labs product system: when to use each product, why it matters, how it works, dose bands, warning signs, compatibility, mixing, storage, and protocols." />
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <Panel key={product.id} className="group overflow-hidden">
            <Link href={`/products/${product.id}`} className="block">
              <div className="relative h-72 overflow-hidden bg-black">
                <ProductVisual productId={product.id} productName={product.name} className="h-full w-full transition duration-500 group-hover:scale-105" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black via-black/55 to-transparent" />
              </div>
              <div className="p-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <h2 className="text-xl font-black">{product.purpose}</h2>
                  <StatusPill tone="lime">{product.stages.map((stage) => stageLabels[stage]).join(', ')}</StatusPill>
                </div>
                <p className="text-sm leading-6 text-zinc-400">{product.why}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-md border border-white/10 bg-black/30 px-2.5 py-1.5 text-xs font-semibold text-zinc-400">
                    Used in {product.stages.map((stage) => stageLabels[stage]).join(', ')}
                  </span>
                  <span className="rounded-md border border-white/10 bg-black/30 px-2.5 py-1.5 text-xs font-semibold text-zinc-400">
                    Calculator ready
                  </span>
                </div>
                <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em]" style={{ color: product.accent }}>Open product system</p>
              </div>
            </Link>
          </Panel>
        ))}
      </div>
    </ShellSection>
  )
}
