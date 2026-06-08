import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { products, stageLabels } from '@/lib/catalyx'
import { PageHeader, Panel, ShellSection, StatusPill } from '@/components/catalyx-ui'
import AddToCartButton from '@/components/AddToCartButton'
import AddToShelfButton from '@/components/AddToShelfButton'
import ProProductGuide from '@/components/ProProductGuide'
import PublicTrustStrip from '@/components/PublicTrustStrip'
import ProductLabelAssets from '@/components/ProductLabelAssets'
import ProductVisual from '@/components/ProductVisual'
import StoreProductCard from '@/components/StoreProductCard'
import { getKitsForProduct } from '@/lib/kits'
import { getProductById } from '@/lib/products'

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export function generateStaticParams() {
  return products.map((product) => ({ id: product.id }))
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { id } = await params
  const product = products.find((item) => item.id === id)
  const kitNames = product ? getKitsForProduct(product.id).map((kit) => kit.name).join(', ') : ''
  const metadata: Metadata = {
    title: product ? product.name : 'Product Not Found',
    description: product
      ? `${product.purpose}. ${product.why}${kitNames ? ` Included in ${kitNames}.` : ''}`
      : 'Catalyx Labs product education.',
    alternates: {
      canonical: product ? `/products/${product.id}` : '/products',
    },
    openGraph: {
      title: product ? product.name : 'Catalyx product',
      description: product
        ? `${product.purpose}. ${product.why}${kitNames ? ` Included in ${kitNames}.` : ''}`
        : 'Catalyx Labs product education.',
      url: product ? `/products/${product.id}` : '/products',
    },
  }
  return metadata
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const product = products.find((item) => item.id === id)
  if (!product) notFound()

  const storeProduct = getProductById(product.id)
  const related = products.filter((item) => item.id !== product.id && item.stages.some((stage) => product.stages.includes(stage))).slice(0, 3)
  const relatedProducts = related
    .map((item) => {
      const relatedStoreProduct = getProductById(item.id)
      return relatedStoreProduct ? { product: item, storeProduct: relatedStoreProduct } : null
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
  const bestPairedWith = related.slice(0, 2)
  const kits = getKitsForProduct(product.id)
  const stageSummary = product.stages.map((stage) => stageLabels[stage]).join(', ')
  const usageNote = storeProduct?.usageNote ?? product.mixing

  return (
    <ShellSection>
      <PageHeader title={product.name} copy={`${product.purpose}. ${product.why}`} action={<StatusPill tone="lime">{product.theme}</StatusPill>} />
      <div className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Panel className="min-h-[560px] overflow-hidden p-0">
          <div className="absolute h-72 w-72 rounded-full blur-3xl opacity-30" style={{ backgroundColor: product.accent }} />
          <ProductVisual productId={product.id} productName={product.name} mode="gallery" className="relative h-[560px] w-full" />
        </Panel>
        <div className="grid gap-4">
          <Panel className="border-[#c8f500]/30 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Product overview</p>
                <h2 className="mt-2 text-3xl font-black">{product.name}</h2>
                <p className="mt-2 text-sm leading-6 text-zinc-300">{product.purpose}. Use in {stageSummary}.</p>
              </div>
              {storeProduct ? (
                <div className="text-right">
                  <p className="text-3xl font-black text-[#c8f500]">NZD ${storeProduct.price.toFixed(2)}</p>
                  {!storeProduct.inStock ? (
                    <StatusPill tone="amber">Coming soon</StatusPill>
                  ) : null}
                </div>
              ) : null}
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {storeProduct?.details ? (
                <div className="rounded-md border border-[#c8f500]/20 bg-[#c8f500]/10 p-4 md:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#d9ff34]">Product detail</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-200">{storeProduct.details}</p>
                </div>
              ) : null}
              <div className="rounded-md border border-white/10 bg-black/30 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">What it does</p>
                <p className="mt-2 text-sm leading-6 text-zinc-200">{product.how}</p>
              </div>
              <div className="rounded-md border border-white/10 bg-black/30 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">When to use it</p>
                <p className="mt-2 text-sm leading-6 text-zinc-200">{product.when}</p>
              </div>
              <div className="rounded-md border border-white/10 bg-black/30 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Best paired with</p>
                <p className="mt-2 text-sm leading-6 text-zinc-200">
                  {bestPairedWith.length
                    ? bestPairedWith.map((item) => item.name).join(' and ')
                    : 'Use alongside the broader Catalyx stage system based on current crop stage.'}
                </p>
              </div>
              <div className="rounded-md border border-white/10 bg-black/30 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Size, price, SKU</p>
                <p className="mt-2 text-sm leading-6 text-zinc-200">
                  {storeProduct
                    ? `${storeProduct.size ?? 'See label'} • NZD $${storeProduct.price.toFixed(2)} • ${storeProduct.sku ?? 'Catalyx SKU'}`
                    : 'Store data is currently unavailable.'}
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-md border border-white/10 bg-black/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Included in kits</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {kits.map((kit) => (
                  <Link
                    key={kit.slug}
                    href={kit.href}
                    className="rounded-md border border-white/10 bg-black/30 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-zinc-200 transition hover:border-[#c8f500]/40 hover:text-[#d9ff34]"
                  >
                    {kit.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="mt-4 rounded-md border border-[#33d9ff]/20 bg-[#33d9ff]/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8decff]">Simple usage note</p>
              <p className="mt-2 text-sm leading-6 text-zinc-200">{usageNote}</p>
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              {storeProduct ? <AddToCartButton product={storeProduct} className="justify-center px-5 py-3" /> : null}
              <Link href="/cart" className="rounded-md border border-white/15 bg-white/5 px-5 py-3 text-center text-sm font-black uppercase tracking-[0.12em] text-white">View cart</Link>
              <Link href="#label-assets" className="rounded-md border border-white/15 bg-white/5 px-5 py-3 text-center text-sm font-black uppercase tracking-[0.12em] text-white">View labels</Link>
              <Link href={`/feed-chart?product=${product.id}&source=product-page`} className="rounded-md border border-white/15 bg-white/5 px-5 py-3 text-center text-sm font-black uppercase tracking-[0.12em] text-white">Open feed chart</Link>
            </div>
          </Panel>
          {[
            ['Why it matters', product.why],
            ['Compatibility notes', product.compatibility],
            ['Mixing notes', product.mixing],
            ['Storage notes', product.storage],
            ['Shelf-life notes', product.shelfLife],
          ].map(([title, body]) => (
            <Panel key={title} className="p-5">
              <h2 className="text-lg font-black">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-300">{body}</p>
            </Panel>
          ))}
        </div>
      </div>
      <ProductLabelAssets productId={product.id} productName={product.name} />
      <PublicTrustStrip
        compact
        title="Product-page trust signals"
        copy="Single-product buyers should still see the same public trust cues: checkout is Stripe-hosted, shipping is shown before payment completes, and receipt or order issues route through direct support."
      />
      <ProProductGuide productId={product.id} productName={product.name} stage={product.stages[product.stages.length - 1]} />
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <InfoList title="What to watch for" items={product.watchFor} />
        <InfoList title="Signs of overuse" items={product.overuse} />
        <InfoList title="Signs of deficiency" items={product.deficiency} />
      </div>
      <Panel className="mt-6 p-5">
        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">Suggested dose range</h2>
            <p className="mt-2 text-sm text-zinc-300">Beginner, standard, and professional dose bands for calculator defaults. Always adjust to your own EC, pH, media, and stage response.</p>
          </div>
          <Link href="/feed-calculator" className="rounded-md bg-[#c8f500] px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-black">Open calculator</Link>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {Object.entries(product.dose).map(([level, range]) => (
            <div key={level} className="rounded-md border border-white/10 bg-black/30 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">{level}</p>
              <p className="mt-2 text-2xl font-black" style={{ color: product.accent }}>{range[0]}-{range[1]} ml/L</p>
            </div>
          ))}
        </div>
      </Panel>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <InfoList title="Product tips" items={product.tips} />
        <Panel className="p-5">
          <h2 className="text-xl font-black">Related workflow</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-300">Stages: {stageSummary}. Add {product.name} to My Shelf to track usage, reorder timing, and low-stock warnings.</p>
          <div className="flex flex-wrap gap-3">
            <AddToShelfButton product={product} />
            <Link href="/feed-calculator" className="mt-4 inline-flex rounded-md bg-[#c8f500] px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-black">Use in calculator</Link>
          </div>
        </Panel>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {relatedProducts.map(({ product: relatedProduct, storeProduct: relatedStoreProduct }) => (
          <StoreProductCard key={relatedProduct.id} product={relatedProduct} storeProduct={relatedStoreProduct} />
        ))}
      </div>
    </ShellSection>
  )
}

function InfoList({ title, items }: { title: string; items: string[] }) {
  return (
    <Panel className="p-5">
      <h2 className="text-xl font-black">{title}</h2>
      <ul className="mt-4 space-y-2 text-sm leading-6 text-zinc-400">
        {items.map((item) => (
          <li key={item}>+ {item}</li>
        ))}
      </ul>
    </Panel>
  )
}
