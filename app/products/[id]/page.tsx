import { notFound } from 'next/navigation'
import Link from 'next/link'
import { products, stageLabels } from '@/lib/catalyx'
import { PageHeader, Panel, ShellSection, StatusPill } from '@/components/catalyx-ui'
import AddToShelfButton from '@/components/AddToShelfButton'
import ProductVisual from '@/components/ProductVisual'

interface ProductPageProps {
  params: { id: string }
}

export function generateStaticParams() {
  return products.map((product) => ({ id: product.id }))
}

export function generateMetadata({ params }: ProductPageProps) {
  const product = products.find((item) => item.id === params.id)
  return {
    title: product ? `${product.name} | Catalyx Labs` : 'Product Not Found | Catalyx Labs',
    description: product?.why ?? 'Catalyx Labs product education.',
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = products.find((item) => item.id === params.id)
  if (!product) notFound()

  const related = products.filter((item) => item.id !== product.id && item.stages.some((stage) => product.stages.includes(stage))).slice(0, 3)

  return (
    <ShellSection>
      <PageHeader title={product.name} copy={`${product.purpose}. ${product.why}`} action={<StatusPill tone="lime">{product.theme}</StatusPill>} />
      <div className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Panel className="min-h-[560px] overflow-hidden p-0">
          <div className="absolute h-72 w-72 rounded-full blur-3xl opacity-30" style={{ backgroundColor: product.accent }} />
          <ProductVisual productId={product.id} productName={product.name} className="relative h-[560px] w-full" />
        </Panel>
        <div className="grid gap-4">
          {[
            ['When to use', product.when],
            ['Why it matters', product.why],
            ['How it works', product.how],
            ['Compatibility notes', product.compatibility],
            ['Mixing notes', product.mixing],
            ['Storage notes', product.storage],
            ['Shelf-life notes', product.shelfLife],
          ].map(([title, body]) => (
            <Panel key={title} className="p-5">
              <h2 className="text-lg font-black">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{body}</p>
            </Panel>
          ))}
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <InfoList title="What to watch for" items={product.watchFor} />
        <InfoList title="Signs of overuse" items={product.overuse} />
        <InfoList title="Signs of deficiency" items={product.deficiency} />
      </div>
      <Panel className="mt-6 p-5">
        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">Suggested dose range</h2>
            <p className="mt-2 text-sm text-zinc-400">Beginner, standard, and professional dose bands for calculator defaults.</p>
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
          <h2 className="text-xl font-black">Related protocols</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">Stages: {product.stages.map((stage) => stageLabels[stage]).join(', ')}. Add {product.name} to My Shelf to track usage, reorder timing, and low-stock warnings.</p>
          <div className="flex flex-wrap gap-3">
            <AddToShelfButton product={product} />
            <Link href="/feed-calculator" className="mt-4 inline-flex rounded-md bg-[#c8f500] px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-black">Use in calculator</Link>
          </div>
        </Panel>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {related.map((item) => (
          <Link key={item.id} href={`/products/${item.id}`}>
            <Panel className="p-5">
              <ProductVisual productId={item.id} productName={item.name} className="mb-4 h-52 w-full rounded-md" />
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Related product</p>
              <h2 className="mt-2 text-xl font-black" style={{ color: item.accent }}>{item.name}</h2>
              <p className="mt-3 text-sm text-zinc-400">{item.purpose}</p>
            </Panel>
          </Link>
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
