import Image from 'next/image'
import Link from 'next/link'
import ProductVisual from '@/components/ProductVisual'
import { calculateAdaptiveFeed, mediumLabels, mediumOrder, products, stageLabels, stageOrder, type Medium, type Stage } from '@/lib/catalyx'
import { Panel, ShellSection, StatusPill } from '@/components/catalyx-ui'
import { lockedAppFeedChartAssets, lockedFeedCharts } from '@/lib/catalyx-assets'

type FeedChartQrPageProps = {
  searchParams?: Promise<{
    product?: string
    source?: string
  }>
}

function plan(stage: Stage, medium: Medium) {
  return calculateAdaptiveFeed({
    stage,
    medium,
    experience: 'standard',
    litres: 1,
    mode: 'Quality Mode',
  })
}

export default async function FeedChartQrPage({ searchParams }: FeedChartQrPageProps) {
  const params = await searchParams
  const selectedProduct = products.find((product) => product.id === params?.product)
  const source = params?.source
  const productDoseRows = selectedProduct
    ? mediumOrder.flatMap((medium) =>
        selectedProduct.stages.map((stage) => {
          const feedPlan = plan(stage, medium)
          const item = feedPlan.items.find((feedItem) => feedItem.product.id === selectedProduct.id)
          return {
            medium,
            stage,
            dose: item?.adaptiveMlPerL,
            ec: feedPlan.targetEc,
            ph: feedPlan.targetPh,
          }
        }).filter((row) => row.dose)
      )
    : []

  return (
    <ShellSection>
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
        <div>
          <StatusPill tone="blue">{selectedProduct ? `${selectedProduct.name} QR` : 'QR landing page'}</StatusPill>
          <h1 className="mt-5 max-w-4xl text-5xl font-black uppercase leading-[0.94] tracking-[0.04em] text-white md:text-7xl">
            {selectedProduct ? `${selectedProduct.name} feed chart.` : 'Catalyx feed chart.'}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
            {selectedProduct
              ? `${selectedProduct.purpose}. ${selectedProduct.when} This page is ready for bottle, box, insert, and retailer QR codes.`
              : 'A fast mobile page for QR codes on bottles, boxes, inserts, and retailer displays. Choose the stage and medium, then move into the full calculator when tank totals are needed.'}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/feed-calculator" className="rounded-md bg-[#c8f500] px-6 py-4 text-center text-sm font-black uppercase tracking-[0.16em] text-black">Calculate tank</Link>
            <Link href={selectedProduct ? `/products/${selectedProduct.id}` : '/feed-charts'} className="rounded-md border border-white/15 bg-white/5 px-6 py-4 text-center text-sm font-black uppercase tracking-[0.16em] text-white">
              {selectedProduct ? 'Open product page' : 'Advanced charts'}
            </Link>
          </div>
        </div>
        <Panel className="p-5">
          {selectedProduct ? (
            <>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Scanned product</p>
              <ProductVisual productId={selectedProduct.id} productName={selectedProduct.name} className="mt-4 h-72 w-full rounded-md" />
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedProduct.stages.map((stage) => (
                  <span key={stage} className="rounded-md border border-white/10 bg-black/30 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-zinc-300">
                    {stageLabels[stage]}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm leading-6 text-zinc-400">
                QR URL: /feed-chart?product={selectedProduct.id}{source ? `&source=${source}` : ''}. Use label directions first and adjust with Grow OS data.
              </p>
            </>
          ) : (
            <>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Bottle QR preview</p>
              <div className="mt-4 grid aspect-square place-items-center rounded-md border border-white/10 bg-white p-6 text-black">
                <div className="grid h-full w-full grid-cols-7 gap-1">
                  {Array.from({ length: 49 }).map((_, index) => (
                    <span key={index} className={`${index % 3 === 0 || index % 7 === 0 || [8, 12, 24, 32, 40].includes(index) ? 'bg-black' : 'bg-zinc-200'}`} />
                  ))}
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-zinc-400">Destination: catalyx.app/feed-chart. Add product and source query parameters for product-specific scans.</p>
            </>
          )}
        </Panel>
      </div>

      <Panel className="mt-8 overflow-hidden border-[#c8f500]/30">
        <div className="grid gap-0 lg:grid-cols-[1fr_1.1fr]">
          <div className="p-5">
            <StatusPill tone="lime">Locked v17 chart</StatusPill>
            <h2 className="mt-4 text-3xl font-black text-white">Official app feed chart reference</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Use this v17 9-SKU chart as the product QR reference. The calculator below adapts from this locked system using medium, stage, and grow data.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a href={lockedFeedCharts.master.pdf} target="_blank" rel="noreferrer" className="rounded-md bg-[#c8f500] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-black">
                Open PDF
              </a>
              <a href={lockedFeedCharts.colourReference.pdf} target="_blank" rel="noreferrer" className="rounded-md border border-white/15 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-white">
                Colour reference
              </a>
            </div>
          </div>
          <div className="bg-black/40 p-4">
            <div className="relative h-[320px] md:h-[520px]">
              <Image
                src={lockedAppFeedChartAssets.mainWide}
                alt="Catalyx v17 app feed chart"
                fill
                sizes="(max-width: 1024px) 100vw, 48vw"
                className="rounded-md border border-white/10 object-contain"
              />
            </div>
          </div>
        </div>
      </Panel>

      {selectedProduct ? (
        <Panel className="mt-8 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black">{selectedProduct.name} quick dose reference</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-400">Standard dose preview per 1 L across supported stages and media.</p>
            </div>
            <StatusPill tone="lime">{selectedProduct.theme}</StatusPill>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {productDoseRows.map((row) => (
              <div key={`${row.medium}-${row.stage}`} className="rounded-md border border-white/10 bg-black/30 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">{mediumLabels[row.medium]} / {stageLabels[row.stage]}</p>
                <p className="mt-2 text-3xl font-black" style={{ color: selectedProduct.accent }}>{row.dose} ml/L</p>
                <p className="mt-2 text-sm text-zinc-500">EC {row.ec[0]}-{row.ec[1]} / pH {row.ph[0]}-{row.ph[1]}</p>
              </div>
            ))}
          </div>
        </Panel>
      ) : null}

      <div className="mt-8 grid gap-6">
        {mediumOrder.map((medium) => (
          <Panel key={medium} className="overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-5">
              <div>
                <h2 className="text-2xl font-black">{mediumLabels[medium]}</h2>
                <p className="mt-2 text-sm text-zinc-500">Standard dose preview per 1 L. Use label directions and adjust with Grow OS data.</p>
              </div>
              <StatusPill tone={medium === 'hydro' ? 'blue' : medium === 'soil' ? 'amber' : 'lime'}>{mediumLabels[medium]} defaults</StatusPill>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="bg-white/[0.03] text-xs uppercase tracking-[0.16em] text-zinc-500">
                  <tr>
                    <th className="p-4">Stage</th>
                    <th className="p-4">Products</th>
                    <th className="p-4">Dose</th>
                    <th className="p-4">EC</th>
                    <th className="p-4">pH</th>
                  </tr>
                </thead>
                <tbody>
                  {stageOrder.map((stage) => {
                    const feedPlan = plan(stage, medium)
                    const containsSelected = selectedProduct ? feedPlan.items.some((item) => item.product.id === selectedProduct.id) : false
                    return (
                      <tr key={stage} className={`border-t border-white/10 align-top ${containsSelected ? 'bg-[#c8f500]/[0.06]' : ''}`}>
                        <td className="p-4 font-bold text-white">{stageLabels[stage]}</td>
                        <td className="p-4 text-zinc-300">{feedPlan.items.map((item) => item.product.name).join(' + ')}</td>
                        <td className="p-4 text-zinc-300">{feedPlan.items.map((item) => `${item.product.name} ${item.adaptiveMlPerL} ml/L`).join(', ')}</td>
                        <td className="p-4 text-zinc-300">{feedPlan.targetEc[0]}-{feedPlan.targetEc[1]}</td>
                        <td className="p-4 text-zinc-300">{feedPlan.targetPh[0]}-{feedPlan.targetPh[1]}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Panel>
        ))}
      </div>
    </ShellSection>
  )
}
