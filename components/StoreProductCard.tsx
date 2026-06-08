import Link from 'next/link'
import AddToCartButton from '@/components/AddToCartButton'
import ProductVisual from '@/components/ProductVisual'
import { Panel, StatusPill } from '@/components/catalyx-ui'
import { stageLabels, type CatalyxProduct } from '@/lib/catalyx'
import type { Product as StoreProduct } from '@/types'

function categoryLabel(category: string) {
  if (category === 'core-nutrients') return 'Core'
  if (category === 'additives') return 'Support'
  if (category === 'specialist') return 'Specialist'
  return 'Product'
}

export default function StoreProductCard({
  product,
  storeProduct,
  showAddToCart = false,
  className = '',
}: {
  product: CatalyxProduct
  storeProduct: StoreProduct
  showAddToCart?: boolean
  className?: string
}) {
  return (
    <Panel className={`group flex h-full flex-col overflow-hidden border-white/12 ${className}`}>
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative h-64 overflow-hidden bg-black">
          <ProductVisual
            productId={product.id}
            productName={product.name}
            className="h-full w-full transition duration-500 group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black via-black/60 to-transparent" />
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em]" style={{ color: product.accent }}>
              {categoryLabel(storeProduct.category)}
            </p>
            <h3 className="mt-3 text-2xl font-black uppercase tracking-[0.04em] text-white">
              {product.name}
            </h3>
            <p className="mt-2 text-sm font-semibold text-zinc-200">{product.purpose}</p>
          </div>
          <StatusPill tone={storeProduct.inStock ? 'lime' : 'amber'}>
            {storeProduct.inStock ? `NZD $${storeProduct.price.toFixed(2)}` : 'Coming soon'}
          </StatusPill>
        </div>

        <p className="mt-4 text-sm leading-6 text-zinc-300">{product.why}</p>

        <div className="mt-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">Use in</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.stages.map((stage) => (
              <span
                key={stage}
                className="rounded-md border border-white/10 bg-black/30 px-2.5 py-1.5 text-xs font-semibold text-zinc-300"
              >
                {stageLabels[stage]}
              </span>
            ))}
            {storeProduct.size ? (
              <span className="rounded-md border border-white/10 bg-black/30 px-2.5 py-1.5 text-xs font-semibold text-zinc-300">
                {storeProduct.size}
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-auto pt-6">
          <Link
            href={`/products/${product.id}`}
            className="inline-flex w-full items-center justify-center rounded-md border border-white/15 bg-white/5 px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:border-[#c8f500]/40 hover:text-[#d9ff34]"
          >
            View product
          </Link>
          {showAddToCart ? (
            <div className="mt-3">
              <AddToCartButton product={storeProduct} className="w-full justify-center px-4 py-3 text-xs" />
            </div>
          ) : null}
        </div>
      </div>
    </Panel>
  )
}
