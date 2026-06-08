import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import AddKitToCartButton from '@/components/AddKitToCartButton'
import PublicTrustStrip from '@/components/PublicTrustStrip'
import StoreProductCard from '@/components/StoreProductCard'
import { PageHeader, Panel, ShellSection, StatusPill } from '@/components/catalyx-ui'
import { getKitBySlug, getKitProducts, catalyxKits, type KitSlug } from '@/lib/kits'

type KitPageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return catalyxKits.map((kit) => ({ slug: kit.slug }))
}

export async function generateMetadata({ params }: KitPageProps): Promise<Metadata> {
  const { slug } = await params
  const kit = getKitBySlug(slug as KitSlug)

  if (!kit) {
    return {
      title: 'Kit not found',
      description: 'Catalyx kit details are unavailable.',
    }
  }

  return {
    title: kit.name,
    description: `${kit.lead} ${kit.description}`,
    alternates: {
      canonical: `/kits/${kit.slug}`,
    },
    openGraph: {
      title: kit.name,
      description: `${kit.lead} ${kit.description}`,
      url: `/kits/${kit.slug}`,
    },
  }
}

export default async function KitDetailPage({ params }: KitPageProps) {
  const { slug } = await params
  const kit = getKitBySlug(slug as KitSlug)
  if (!kit) notFound()

  const entries = getKitProducts(kit.productIds)
  const total = entries.reduce((sum, entry) => sum + entry.storeProduct.price, 0)

  return (
    <ShellSection>
      <PageHeader
        title={kit.name}
        copy={kit.lead}
        action={<StatusPill tone="blue">{entries.length} items</StatusPill>}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Panel className="p-6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c8f500]">Why this kit exists</p>
          <h2 className="mt-3 text-3xl font-black uppercase tracking-[0.04em] text-white">{kit.subtitle}</h2>
          <p className="mt-4 text-sm leading-6 text-zinc-300">{kit.description}</p>

          <div className="mt-5 grid gap-3">
            <div className="rounded-md border border-white/10 bg-black/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Ideal for</p>
              <p className="mt-2 text-sm leading-6 text-zinc-200">{kit.idealFor}</p>
            </div>
            <div className="rounded-md border border-white/10 bg-black/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">When to choose it</p>
              <p className="mt-2 text-sm leading-6 text-zinc-200">{kit.whenToChoose}</p>
            </div>
            <div className="rounded-md border border-[#33d9ff]/20 bg-[#33d9ff]/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8decff]">Kit value snapshot</p>
              <p className="mt-2 text-sm leading-6 text-zinc-200">
                {entries.length} included products. Combined current store total: NZD ${total.toFixed(2)}.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <AddKitToCartButton products={entries.map((entry) => entry.storeProduct)} />
            <Link
              href="/preorder"
              className="rounded-md border border-white/15 px-5 py-3 text-center text-sm font-black uppercase tracking-[0.12em] text-white"
            >
              Compare all kits
            </Link>
            <Link
              href="/feed-chart"
              className="rounded-md border border-white/15 px-5 py-3 text-center text-sm font-black uppercase tracking-[0.12em] text-white"
            >
              Open feed plan
            </Link>
          </div>
        </Panel>

        <Panel className="p-6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c8f500]">Included products</p>
          <div className="mt-5 grid gap-3">
            {entries.map(({ catalyxProduct, storeProduct }) => (
              <div key={catalyxProduct.id} className="rounded-md border border-white/10 bg-black/30 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em]" style={{ color: catalyxProduct.accent }}>
                      {storeProduct.category}
                    </p>
                    <h3 className="mt-2 text-xl font-black text-white">{catalyxProduct.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-300">{catalyxProduct.purpose}</p>
                  </div>
                  <StatusPill tone="lime">NZD ${storeProduct.price.toFixed(2)}</StatusPill>
                </div>
                <div className="mt-4">
                  <Link
                    href={`/products/${catalyxProduct.id}`}
                    className="inline-flex rounded-md border border-white/15 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-white"
                  >
                    View product
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <PublicTrustStrip
        compact
        title={`Why ${kit.name} feels safer to buy publicly`}
        copy="The kit path should answer the questions buyers usually have before they open checkout: shipping visibility, support path, secure payment, and what happens if an order needs attention."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Panel className="p-6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c8f500]">FAQs</p>
          <div className="mt-5 grid gap-3">
            {kit.faqs.map((faq) => (
              <details key={faq.question} className="rounded-md border border-white/10 bg-black/30 p-4">
                <summary className="cursor-pointer text-sm font-black uppercase tracking-[0.08em] text-white">{faq.question}</summary>
                <p className="mt-3 text-sm leading-6 text-zinc-300">{faq.answer}</p>
              </details>
            ))}
          </div>
        </Panel>

        <Panel className="p-6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#33d9ff]">Next clicks</p>
          <div className="mt-5 grid gap-3">
            <Link href="/products" className="rounded-md border border-white/10 bg-black/30 px-4 py-4 text-left transition hover:border-[#c8f500]/40">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#c8f500]">Browse individually</p>
              <p className="mt-2 text-lg font-black text-white">Shop all products</p>
              <p className="mt-2 text-sm leading-6 text-zinc-300">Use this if you want to swap out items or compare the wider range before ordering.</p>
            </Link>
            <Link href="/product-guide" className="rounded-md border border-white/10 bg-black/30 px-4 py-4 text-left transition hover:border-[#c8f500]/40">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#c8f500]">Understand every bottle</p>
              <p className="mt-2 text-lg font-black text-white">Open product guide</p>
              <p className="mt-2 text-sm leading-6 text-zinc-300">Best for buyers who want product-level understanding before they commit to a full kit.</p>
            </Link>
            <Link href="/contact" className="rounded-md border border-white/10 bg-black/30 px-4 py-4 text-left transition hover:border-[#c8f500]/40">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#c8f500]">Need help choosing?</p>
              <p className="mt-2 text-lg font-black text-white">Talk to Catalyx</p>
              <p className="mt-2 text-sm leading-6 text-zinc-300">Use the direct contact path if you want a recommendation before checkout.</p>
            </Link>
          </div>
        </Panel>
      </div>

      <div className="mt-8">
        <div className="flex flex-col gap-3 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c8f500]">Preview more products</p>
            <h2 className="mt-3 text-3xl font-black uppercase leading-tight tracking-[0.05em] text-white">See how this kit sits inside the wider range.</h2>
          </div>
          <Link href="/products" className="rounded-md border border-white/15 px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white">
            Browse full range
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {entries.slice(0, 4).map(({ catalyxProduct, storeProduct }) => (
            <StoreProductCard key={catalyxProduct.id} product={catalyxProduct} storeProduct={storeProduct} showAddToCart />
          ))}
        </div>
      </div>
    </ShellSection>
  )
}
