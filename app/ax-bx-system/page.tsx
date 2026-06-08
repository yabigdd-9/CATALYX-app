import Link from 'next/link'
import ProductVisual from '@/components/ProductVisual'
import { Panel, ShellSection, StatusPill } from '@/components/catalyx-ui'
import { products } from '@/lib/catalyx'

const ax = products.find((product) => product.id === 'ax-pro')!
const bx = products.find((product) => product.id === 'bx-pro')!

const rules = [
  ['Keep concentrates separate', 'A-X PRO and B-X PRO should never be combined undiluted. Add A-X PRO to water, mix thoroughly, then add B-X PRO.'],
  ['Run equal base rates', 'Match A-X PRO and B-X PRO ml/L for predictable base balance unless the calculator or label says otherwise.'],
  ['Add supplements after base', 'ROOT-X, MICRO-X, VITAL-X, PK-X, TRACE-X, RIPEN-X, and FLUSH-X belong after the base is diluted.'],
  ['Log EC and pH last', 'Measure EC after the feed is fully mixed, then adjust pH and record the final values in Grow OS.'],
]

export default function AxBxSystemPage() {
  return (
    <ShellSection>
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <StatusPill tone="lime">Core nutrient system</StatusPill>
          <h1 className="mt-5 max-w-4xl text-5xl font-black uppercase leading-[0.94] tracking-[0.04em] text-white md:text-7xl">
            A-X PRO and B-X PRO work as one base.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
            Part A supplies calcium, nitrogen, and iron support. Part B completes the profile with phosphorus, potassium, magnesium, and sulfur. The system is separated for concentrate stability and mixed together only after dilution.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/products/ax-pro" className="rounded-md bg-[#c8f500] px-6 py-4 text-center text-sm font-black uppercase tracking-[0.16em] text-black">View A-X PRO</Link>
            <Link href="/products/bx-pro" className="rounded-md border border-white/15 bg-white/5 px-6 py-4 text-center text-sm font-black uppercase tracking-[0.16em] text-white">View B-X PRO</Link>
          </div>
        </div>
        <Panel className="overflow-hidden p-0">
          <div className="grid min-h-[620px] md:grid-cols-2">
            {[ax, bx].map((product) => (
              <div key={product.id} className="relative overflow-hidden border-white/10 first:border-b md:first:border-b-0 md:first:border-r">
                <ProductVisual productId={product.id} productName={product.name} className="h-full min-h-[360px]" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: product.accent }}>{product.theme}</p>
                  <h2 className="mt-2 text-3xl font-black">{product.name}</h2>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{product.how}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {rules.map(([title, body]) => (
          <Panel key={title} className="p-5">
            <h2 className="text-xl font-black">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">{body}</p>
          </Panel>
        ))}
      </div>

      <Panel className="mt-8 p-5">
        <h2 className="text-2xl font-black">Base dose bands</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {Object.entries(ax.dose).map(([level, range]) => (
            <div key={level} className="rounded-md border border-white/10 bg-black/30 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">{level}</p>
              <p className="mt-2 text-2xl font-black text-[#c8f500]">{range[0]}-{range[1]} ml/L each</p>
            </div>
          ))}
        </div>
      </Panel>
    </ShellSection>
  )
}
