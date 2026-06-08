import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import KitCard from '@/components/KitCard'
import PublicTrustStrip from '@/components/PublicTrustStrip'
import StoreProductCard from '@/components/StoreProductCard'
import { Panel, ShellSection, StatusPill } from '@/components/catalyx-ui'
import { products as catalyxProducts } from '@/lib/catalyx'
import { catalyxKits, getKitBySlug } from '@/lib/kits'
import { getProductById } from '@/lib/products'

const baseKit = getKitBySlug('base-kit')
const featuredProductIds = ['ax-pro', 'root-x', 'pk-x', 'flush-x'] as const
const featuredProducts = featuredProductIds
  .map((id) => {
    const product = catalyxProducts.find((item) => item.id === id)
    const storeProduct = getProductById(id)
    return product && storeProduct ? { product, storeProduct } : null
  })
  .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))

const quickStart = [
  {
    title: 'What CATALYX is',
    body: 'A 9-product nutrient system paired with feed planning, product guidance, and Grow OS tools that explain what each bottle does clearly.',
  },
  {
    title: 'Which kit to start with',
    body: 'Start with the Base Kit if you are new. It gives you the two-part foundation before you layer in support products.',
  },
  {
    title: 'How the system is structured',
    body: 'Think of it in three layers: base feed first, support products when the run needs more control, then finish products for bloom and cleanup.',
  },
  {
    title: 'What to click next',
    body: 'Open the kits page first, then use the feed plan or product guide once you know whether you are starting with Base Kit or building further.',
  },
]

const structure = [
  {
    title: 'Base feed',
    body: 'A-X PRO and B-X PRO form the foundation. This is where most new growers should begin.',
    href: '/collections/core-nutrients',
    cta: 'View core feed',
  },
  {
    title: 'Support layer',
    body: 'ROOT-X, VITAL-X, and MICRO-X help with establishment, resilience, and trace balance when the run needs more control.',
    href: '/collections/additives',
    cta: 'View support products',
  },
  {
    title: 'Finish layer',
    body: 'PK-X, RIPEN-X, TRACE-X, and FLUSH-X shape bloom, finishing, and cleanup without turning the system into guesswork.',
    href: '/collections/specialist',
    cta: 'View finish products',
  },
]

export const metadata: Metadata = {
  title: 'Catalyx Labs | Base Kit to Complete Kit',
  description:
    'Explore the Catalyx system from Base Kit to Complete Kit, with product guidance, feed planning, and clear next steps for first-time buyers.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Catalyx Labs | Base Kit to Complete Kit',
    description:
      'Explore the Catalyx system from Base Kit to Complete Kit, with product guidance, feed planning, and clear next steps for first-time buyers.',
    url: '/',
  },
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050707] text-white">
      <section className="relative overflow-hidden border-b border-white/10" aria-labelledby="home-hero-heading">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(124,255,0,0.16),transparent_28%),radial-gradient(circle_at_18%_84%,rgba(22,157,255,0.10),transparent_24%),linear-gradient(180deg,#050707_0%,#07100d_58%,#050707_100%)]" />
        <ShellSection className="relative grid gap-10 pb-14 pt-10 lg:min-h-[calc(100vh-76px)] lg:content-center">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.92fr] lg:items-center">
            <div>
              <div className="brand-logo-blend mb-8 flex max-w-[560px] items-center gap-4">
                <Image
                  src="/brand/catalyx/CATALYX_Monogram_Full_Colour.png"
                  alt="Catalyx Labs"
                  width={1000}
                  height={1000}
                  className="h-24 w-24 shrink-0 object-contain sm:h-32 sm:w-32"
                  priority
                />
                <div className="min-w-0 leading-none">
                  <p className="text-[34px] font-black uppercase tracking-[0.18em] text-zinc-100 sm:text-[52px]">Catalyx</p>
                  <p className="mt-2 text-[18px] font-black uppercase tracking-[0.48em] text-[#7cff00] sm:text-[26px]">Labs</p>
                </div>
              </div>
              <StatusPill tone="lime">Premium plant nutrition system</StatusPill>
              <h1 id="home-hero-heading" className="mt-5 max-w-4xl text-5xl font-black uppercase leading-[0.94] tracking-[0.04em] text-white md:text-7xl">
                Know where to start. Know what each product does.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
                Catalyx combines a 9-product nutrient system with a clearer buying path: start with the Base Kit, understand the support layers, then move into feed planning and product guidance without noise.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href={baseKit?.href ?? '/preorder'} className="rounded-md bg-[#7cff00] px-6 py-4 text-center text-sm font-black uppercase tracking-[0.16em] text-black shadow-lg shadow-[#7cff00]/20">
                  Start with Base Kit
                </Link>
                <Link href="/preorder" className="rounded-md border border-white/15 bg-white/5 px-6 py-4 text-center text-sm font-black uppercase tracking-[0.16em] text-white">
                  Compare all kits
                </Link>
                <Link href="/feed-chart" className="rounded-md border border-[#169dff]/25 bg-[#169dff]/10 px-6 py-4 text-center text-sm font-black uppercase tracking-[0.16em] text-[#7fc8ff]">
                  Find your feed plan
                </Link>
              </div>
            </div>

            <Panel className="overflow-hidden border-[#7cff00]/20 p-6 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7cff00]">New here?</p>
                  <h2 className="mt-3 text-3xl font-black uppercase tracking-[0.04em] text-white">Start in four simple moves.</h2>
                </div>
                <StatusPill tone="blue">First-visit path</StatusPill>
              </div>
              <div className="mt-6 grid gap-3">
                {quickStart.map((item, index) => (
                  <div key={item.title} className="rounded-md border border-white/10 bg-black/25 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">Step {index + 1}</p>
                    <h3 className="mt-2 text-lg font-black text-white">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-300">{item.body}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-md border border-[#169dff]/20 bg-[#169dff]/10 p-4">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#7fc8ff]">Fastest next click</p>
                <p className="mt-2 text-sm leading-6 text-zinc-200">
                  If you only need one answer right now, open the Base Kit first. It is the cleanest starting point for most first-time Catalyx buyers.
                </p>
              </div>
            </Panel>
          </div>
        </ShellSection>
      </section>

      <ShellSection aria-labelledby="kits-heading">
        <div className="flex flex-col justify-between gap-5 border-b border-white/10 pb-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7cff00]">Kits</p>
            <h2 id="kits-heading" className="mt-3 max-w-4xl text-4xl font-black uppercase leading-tight tracking-[0.06em] text-white md:text-6xl">
              One locked naming system from Base Kit to Complete Kit.
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-300">
              The kit path is now the simplest way to understand the range: start with the base, add support when needed, or jump straight to the full system.
            </p>
          </div>
          <Link href="/preorder" className="rounded-md border border-white/15 px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white">
            Open kits page
          </Link>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {catalyxKits.map((kit) => (
            <KitCard key={kit.slug} kit={kit} />
          ))}
        </div>
      </ShellSection>

      <ShellSection className="pt-0" aria-labelledby="system-heading">
        <div className="flex flex-col justify-between gap-5 border-b border-white/10 pb-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7cff00]">System structure</p>
            <h2 id="system-heading" className="mt-3 max-w-4xl text-4xl font-black uppercase leading-tight tracking-[0.06em] text-white md:text-6xl">
              The system is easier to scan when it is broken into layers.
            </h2>
          </div>
          <Link href="/ax-bx-system" className="rounded-md border border-white/15 px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white">
            Learn how it works
          </Link>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {structure.map((item) => (
            <Panel key={item.title} className="flex h-full flex-col p-6">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">Layer</p>
              <h3 className="mt-3 text-3xl font-black uppercase tracking-[0.04em] text-white">{item.title}</h3>
              <p className="mt-4 text-sm leading-6 text-zinc-300">{item.body}</p>
              <div className="mt-auto pt-6">
                <Link href={item.href} className="inline-flex w-full items-center justify-center rounded-md border border-white/15 bg-white/5 px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-white">
                  {item.cta}
                </Link>
              </div>
            </Panel>
          ))}
        </div>
      </ShellSection>

      <ShellSection className="pt-0" aria-labelledby="featured-products-heading">
        <div className="flex flex-col justify-between gap-5 border-b border-white/10 pb-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7cff00]">Featured products</p>
            <h2 id="featured-products-heading" className="mt-3 max-w-4xl text-4xl font-black uppercase leading-tight tracking-[0.06em] text-white md:text-6xl">
              Product cards now use one cleaner system too.
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-300">
              Every card should tell the same story fast: what it is, where it fits, and where to click next.
            </p>
          </div>
          <Link href="/products" className="rounded-md border border-white/15 px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white">
            Browse all products
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {featuredProducts.map(({ product, storeProduct }) => (
            <StoreProductCard key={product.id} product={product} storeProduct={storeProduct} />
          ))}
        </div>
      </ShellSection>

      <ShellSection className="pt-0" aria-labelledby="trust-heading">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Panel className="p-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#00d1c7]">Why it feels clearer</p>
            <h2 id="trust-heading" className="mt-3 text-4xl font-black uppercase leading-tight tracking-[0.05em] text-white">
              The public path now explains the system without making buyers work for it.
            </h2>
            <p className="mt-6 max-w-2xl text-sm leading-6 text-zinc-300">
              The homepage now introduces the range in one sequence: understand Catalyx, choose a locked kit, see how the system is structured, then move into the exact next click.
            </p>
            <div className="mt-6 rounded-md border border-white/10 bg-black/25 p-4">
              <p className="text-sm leading-6 text-zinc-300">
                The new kit detail pages also give each bundle its own proof, FAQ answers, and direct cart path instead of forcing buyers to work from anchor targets alone.
              </p>
            </div>
          </Panel>
          <Panel className="border-[#169dff]/25 p-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#169dff]">Next click</p>
            <h2 className="mt-3 text-4xl font-black uppercase leading-tight tracking-[0.05em] text-white">
              Choose the path that matches how you buy.
            </h2>
            <div className="mt-6 grid gap-3">
              <Link href={baseKit?.href ?? '/preorder'} className="rounded-md border border-white/10 bg-black/25 px-4 py-4 text-left transition hover:border-[#7cff00]/40">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#7cff00]">Start here</p>
                <p className="mt-2 text-lg font-black text-white">Base Kit</p>
                <p className="mt-2 text-sm leading-6 text-zinc-300">Best for first-time buyers who want the cleanest path into the system.</p>
              </Link>
              <Link href="/kits/complete-kit" className="rounded-md border border-white/10 bg-black/25 px-4 py-4 text-left transition hover:border-[#7cff00]/40">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#7cff00]">See everything</p>
                <p className="mt-2 text-lg font-black text-white">Complete Kit</p>
                <p className="mt-2 text-sm leading-6 text-zinc-300">Best for buyers who already know they want the full 9-product system.</p>
              </Link>
              <Link href="/product-guide" className="rounded-md border border-white/10 bg-black/25 px-4 py-4 text-left transition hover:border-[#7cff00]/40">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#7cff00]">Understand the bottles</p>
                <p className="mt-2 text-lg font-black text-white">Open product guide</p>
                <p className="mt-2 text-sm leading-6 text-zinc-300">Best for visitors who want to understand product roles before choosing a kit.</p>
              </Link>
            </div>
          </Panel>
        </div>
        <PublicTrustStrip
          title="Buying proof buyers should not have to guess at"
          copy="Public trust should be explicit. Shipping visibility, direct support, secure checkout, and order-help language now sit inside the storefront instead of being left implicit."
        />
      </ShellSection>
    </div>
  )
}
