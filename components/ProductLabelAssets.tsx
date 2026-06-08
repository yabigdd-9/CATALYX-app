import type { ReactNode } from 'react'
import Image from 'next/image'
import { getLockedLabelAsset, getLockedSkuTile, lockedFeedCharts } from '@/lib/catalyx-assets'
import type { ProductKey } from '@/lib/catalyx'
import { Panel } from '@/components/catalyx-ui'

type ProductLabelAssetsProps = {
  productId: ProductKey
  productName: string
}

export default function ProductLabelAssets({ productId, productName }: ProductLabelAssetsProps) {
  const assets = getLockedLabelAsset(productId)
  const skuTile = getLockedSkuTile(productId)

  return (
    <div id="label-assets">
    <Panel className="mt-6 overflow-hidden p-0">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 p-5">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Locked label system</p>
          <h2 className="mt-2 text-2xl font-black text-white">{productName} label assets</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
            Front label, rear label with feed chart, app SKU tile, manufacturer PDFs, and QR-ready feed chart references.
          </p>
        </div>
        <a href={`/feed-chart?product=${productId}&source=product-page`} className="rounded-md bg-[#c8f500] px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-black">
          Open QR chart
        </a>
      </div>
      <div className="grid gap-0 lg:grid-cols-3">
        <LockedLabelPreview title="Locked front label" image={assets.frontLabel} alt={`${productName} locked front label`} />
        <LockedLabelPreview title="Locked rear label + feed chart" image={assets.rearLabel} alt={`${productName} locked rear label with feed chart`} />
        <LockedLabelPreview title="Locked v17 app SKU tile" image={skuTile} alt={`${productName} locked v17 app SKU tile`} />
      </div>
      <div className="flex flex-wrap gap-3 border-t border-white/10 p-5">
        <AssetLink href={assets.frontLabelPdf}>Front label PDF</AssetLink>
        <AssetLink href={assets.rearLabelPdf}>Rear label PDF</AssetLink>
        <AssetLink href={lockedFeedCharts.master.pdf}>v17 master chart</AssetLink>
        <AssetLink href={lockedFeedCharts.colourReference.pdf}>v17 colour system</AssetLink>
        <AssetLink href={`/feed-chart?product=${productId}&source=label-assets`}>Product QR page</AssetLink>
      </div>
    </Panel>
    </div>
  )
}

function LockedLabelPreview({ title, image, alt }: { title: string; image: string; alt: string }) {
  return (
    <div className="border-white/10 p-5 even:border-l">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">{title}</p>
      <div className="relative mt-4 h-[360px] overflow-hidden rounded-md border border-white/10 bg-black/40 p-4 md:h-[420px]">
        <Image src={image} alt={alt} fill sizes="(max-width: 768px) 90vw, 28vw" className="object-contain p-4" />
      </div>
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
