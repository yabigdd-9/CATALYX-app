import Link from 'next/link'
import { Panel, ShellSection, StatusPill } from '@/components/catalyx-ui'
import { products } from '@/lib/catalyx'

const safetyRules = [
  ['Follow the label first', 'Use Catalyx digital guidance as education and decision support. Product labels and local requirements remain the operating authority.'],
  ['Never mix concentrates directly', 'Dilute products into water one at a time. A-X PRO and B-X PRO must remain separate until they are diluted.'],
  ['Measure with clean tools', 'Avoid dipping contaminated syringes, cups, or caps back into bottles. Cross-contamination can destabilise concentrates.'],
  ['Store sealed and cool', 'Keep bottles closed, upright, out of direct light, away from heat, and away from children or pets.'],
  ['Log every feed', 'Record product, ml/L, EC, pH, runoff, and plant response so adjustments are based on trends instead of guesses.'],
]

export default function SafetyStoragePage() {
  return (
    <ShellSection>
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <StatusPill tone="amber">Safety + storage</StatusPill>
          <h1 className="mt-5 max-w-4xl text-5xl font-black uppercase leading-[0.94] tracking-[0.04em] text-white md:text-7xl">
            Clean mixing. Stable bottles. Better records.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
            A customer-facing page for product labels, QR codes, inserts, and retailer education. It keeps the safety language practical, direct, and aligned with the Catalyx product system.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/feed-chart" className="rounded-md bg-[#c8f500] px-6 py-4 text-center text-sm font-black uppercase tracking-[0.16em] text-black">Open feed chart</Link>
            <Link href="/product-guide" className="rounded-md border border-white/15 bg-white/5 px-6 py-4 text-center text-sm font-black uppercase tracking-[0.16em] text-white">Open product guide</Link>
          </div>
        </div>
        <div className="grid gap-4">
          {safetyRules.map(([title, body]) => (
            <Panel key={title} className="p-5">
              <h2 className="text-xl font-black">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-400">{body}</p>
            </Panel>
          ))}
        </div>
      </div>

      <Panel className="mt-8 overflow-hidden">
        <div className="border-b border-white/10 p-5">
          <h2 className="text-3xl font-black">SKU storage notes</h2>
          <p className="mt-2 text-sm text-zinc-500">Pulled from the same product data used by product pages and Grow OS education.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-white/[0.03] text-xs uppercase tracking-[0.16em] text-zinc-500">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Mixing</th>
                <th className="p-4">Storage</th>
                <th className="p-4">Shelf life</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t border-white/10 align-top">
                  <td className="p-4 font-black" style={{ color: product.accent }}>{product.name}</td>
                  <td className="p-4 text-zinc-300">{product.mixing}</td>
                  <td className="p-4 text-zinc-400">{product.storage}</td>
                  <td className="p-4 text-zinc-400">{product.shelfLife}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </ShellSection>
  )
}
