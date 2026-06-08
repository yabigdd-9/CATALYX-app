import Link from 'next/link'
import KitCard from '@/components/KitCard'
import StoreProductCard from '@/components/StoreProductCard'
import { PageHeader, ShellSection } from '@/components/catalyx-ui'
import { products as catalyxProducts } from '@/lib/catalyx'
import { getKitsForCollection, type CollectionSlug } from '@/lib/kits'
import { products as storeProducts } from '@/lib/products'

const collectionCopy: Record<string, { title: string; copy: string }> = {
  all: {
    title: 'Shop Catalyx nutrients',
    copy: 'Browse the full Catalyx system from Base Kit through Complete Kit, then drill into the exact products that belong in each layer.',
  },
  'core-nutrients': {
    title: 'Core nutrients',
    copy: 'Base Kit and Core Kit begin here. A-X PRO and B-X PRO form the two-part feed foundation for most first-time buyers.',
  },
  additives: {
    title: 'Stage additives',
    copy: 'Enhancement Kit, Final Stage Kit, and Performance Kit all draw from this support layer for roots, resilience, bloom push, and finish strategy.',
  },
  specialist: {
    title: 'Specialist support',
    copy: 'Enhancement Kit, Performance Kit, and Complete Kit use these specialist tools for trace balance, foliar correction, and cleanup windows.',
  },
}

const collectionLinks = [
  ['All products', '/collections/all'],
  ['Core nutrients', '/collections/core-nutrients'],
  ['Additives', '/collections/additives'],
  ['Specialist', '/collections/specialist'],
]

export default function ShopCollection({ collection = 'all' }: { collection?: string }) {
  const meta = collectionCopy[collection] ?? collectionCopy.all
  const storeItems = collection === 'all' ? storeProducts : storeProducts.filter((product) => product.category === collection)
  const relevantKits = getKitsForCollection((collection in collectionCopy ? collection : 'all') as CollectionSlug)

  return (
    <ShellSection>
      <PageHeader
        title={meta.title}
        copy={meta.copy}
        action={<Link href="/cart" className="rounded-md bg-[#c8f500] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-black">View cart</Link>}
      />

      <div className="mt-6 flex flex-wrap gap-2">
        {collectionLinks.map(([label, href]) => (
          <Link
            key={href}
            href={href}
            className={`rounded-md border px-3 py-2 text-xs font-black uppercase tracking-[0.12em] ${
              href.endsWith(collection) || (collection === 'all' && href.endsWith('/all'))
                ? 'border-[#c8f500]/50 bg-[#c8f500]/10 text-[#d9ff34]'
                : 'border-white/10 bg-black/30 text-zinc-400 hover:text-white'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {relevantKits.slice(0, 3).map((kit) => (
          <KitCard key={kit.slug} kit={kit} showNote={false} className="bg-[#0a0f10]" />
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {storeItems.map((storeProduct) => {
          const product = catalyxProducts.find((item) => item.id === storeProduct.id)
          if (!product) return null

          return (
            <StoreProductCard key={product.id} product={product} storeProduct={storeProduct} showAddToCart />
          )
        })}
      </div>
    </ShellSection>
  )
}
