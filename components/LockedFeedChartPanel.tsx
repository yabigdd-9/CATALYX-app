import Image from 'next/image'
import type { ReactNode } from 'react'
import { lockedAppFeedChartAssets, lockedFeedCharts } from '@/lib/catalyx-assets'
import { Panel } from '@/components/catalyx-ui'

export default function LockedFeedChartPanel() {
  return (
    <Panel className="overflow-hidden p-0">
      <div className="grid gap-0 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Locked feed chart</p>
              <h2 className="mt-2 text-2xl font-black text-white">Official master chart</h2>
            </div>
            <a href={lockedFeedCharts.master.pdf} target="_blank" rel="noreferrer" className="rounded-md bg-[#c8f500] px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-black">
              Open PDF
            </a>
          </div>
          <div className="mt-5 rounded-md border border-white/10 bg-black/40 p-3">
            <ChartPreview
              src={lockedAppFeedChartAssets.mainWide}
              alt="Catalyx master feed chart preview"
              sizes="(max-width: 1024px) 92vw, 64vw"
              className="aspect-[4/3]"
            />
          </div>
          <p className="mt-3 text-xs leading-5 text-zinc-500">Optimized preview for fast loading. Open the PDF or PNG if you need the full locked source asset.</p>
          <div className="mt-3">
            <AssetLink href={lockedFeedCharts.master.png}>Open PNG</AssetLink>
          </div>
        </div>
        <div className="border-t border-white/10 p-5 lg:border-l lg:border-t-0">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Rear-label chart assets</p>
          <div className="mt-4 grid gap-3">
            <AssetLink href={lockedFeedCharts.oneLitreRear.pdf}>1L rear chart PDF</AssetLink>
            <AssetLink href={lockedFeedCharts.fiveLitreBulkRear.pdf}>5L bulk chart PDF</AssetLink>
            <AssetLink href={lockedFeedCharts.oneLitreRear.png}>1L rear chart PNG</AssetLink>
            <AssetLink href={lockedFeedCharts.sourceCsv}>Source CSV</AssetLink>
          </div>
          <div className="mt-5 rounded-md border border-white/10 bg-black/40 p-3">
            <ChartPreview
              src={lockedAppFeedChartAssets.oneLitreWide}
              alt="Catalyx 1L rear feed chart preview"
              sizes="(max-width: 1024px) 92vw, 32vw"
              className="aspect-[4/3]"
            />
          </div>
        </div>
      </div>
    </Panel>
  )
}

function ChartPreview({
  src,
  alt,
  sizes,
  className,
}: {
  src: string
  alt: string
  sizes: string
  className: string
}) {
  return (
    <div className={`relative overflow-hidden rounded-md ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className="object-contain object-center"
      />
    </div>
  )
}

function AssetLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="rounded-md border border-white/15 bg-white/5 px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-white hover:border-[#c8f500]/60 hover:text-[#d9ff34]">
      {children}
    </a>
  )
}
