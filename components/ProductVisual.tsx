import Image from 'next/image'
import { getLockedLabelAsset } from '@/lib/catalyx-assets'
import type { ProductKey } from '@/lib/catalyx'

const productKeys = ['ax-pro', 'bx-pro', 'micro-x', 'root-x', 'vital-x', 'pk-x', 'ripen-x', 'trace-x', 'flush-x'] as const

const officialImages: Record<string, string> = {
  'micro-x': '/brand/official/micro-x.png',
  'root-x': '/brand/official/root-x.png',
  'vital-x': '/brand/official/vital-x.png',
  'pk-x': '/brand/official/pk-x.png',
  'ripen-x': '/brand/official/ripen-x.png',
  'trace-x': '/brand/official/trace-x.png',
  'flush-x': '/brand/official/flush-x.png',
}

const baseBottleProducts: Record<string, { name: string; base: string; part: string; accent: string }> = {
  'ax-pro': { name: 'A-X PRO', base: 'GROW BASE A', part: 'PART A', accent: '#62e33b' },
  'bx-pro': { name: 'B-X PRO', base: 'GROW BASE B', part: 'PART B', accent: '#b7e33b' },
}

const galleryPositions: Record<string, { x: number; y: number }> = {
  'ax-pro': { x: 0, y: 0 },
  'bx-pro': { x: 1, y: 0 },
  'micro-x': { x: 2, y: 0 },
  'root-x': { x: 3, y: 0 },
  'vital-x': { x: 4, y: 0 },
  'pk-x': { x: 0, y: 1 },
  'ripen-x': { x: 1, y: 1 },
  'trace-x': { x: 2, y: 1 },
  'flush-x': { x: 4, y: 1 },
}

interface ProductVisualProps {
  productId: string
  productName: string
  className?: string
  mode?: 'portrait' | 'gallery'
}

function isProductKey(productId: string): productId is ProductKey {
  return productKeys.includes(productId as ProductKey)
}

function AssetImage({
  src,
  alt,
  fill = true,
  className = '',
  sizes = '(max-width: 768px) 90vw, 40vw',
  style,
}: {
  src: string
  alt: string
  fill?: boolean
  className?: string
  sizes?: string
  style?: React.CSSProperties
}) {
  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className={className}
        style={style}
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={1600}
      height={1600}
      sizes={sizes}
      className={className}
      style={style}
    />
  )
}

function LabelledBottle({
  productName,
  label,
  className,
}: {
  productName: string
  label: string
  className: string
}) {
  return (
    <div
      aria-label={productName}
      role="img"
      className={`relative flex items-center justify-center overflow-hidden bg-black ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_36%,rgba(200,245,0,0.16),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0)_38%)]" />
      <div className="absolute bottom-[6%] h-[10%] w-[44%] max-w-[260px] rounded-[999px] bg-black/75 blur-xl" />
      <div className="relative flex h-[90%] max-h-[660px] min-h-[210px] w-[42%] min-w-[138px] max-w-[285px] flex-col items-center">
        <div className="z-20 h-[6%] w-[42%] rounded-t-md border border-white/15 bg-gradient-to-b from-zinc-700 via-zinc-950 to-black shadow-[inset_0_1px_0_rgba(255,255,255,0.28)]" />
        <div className="z-20 h-[6%] w-[54%] rounded-t-sm border border-white/10 bg-[repeating-linear-gradient(90deg,#101010_0,#101010_4px,#2a2a2a_5px,#2a2a2a_7px)]" />
        <div
          className="relative -mt-[1%] w-full flex-1 overflow-hidden border border-white/10 bg-gradient-to-r from-[#030303] via-[#171717] to-[#030303] shadow-[inset_18px_0_24px_rgba(255,255,255,0.06),inset_-18px_0_28px_rgba(0,0,0,0.68),0_30px_50px_rgba(0,0,0,0.58)]"
          style={{ clipPath: 'polygon(19% 0, 81% 0, 95% 11%, 95% 100%, 5% 100%, 5% 11%)' }}
        >
          <div className="absolute inset-x-[12%] top-[7%] h-px bg-white/10" />
          <div className="absolute inset-x-[16%] top-[10%] text-center text-[clamp(0.42rem,0.9vw,0.72rem)] font-black uppercase tracking-[0.2em] text-zinc-700">
            CATALYX
          </div>
          <div className="absolute inset-x-[12%] bottom-[10%] top-[22%] overflow-hidden rounded-[10px] border border-white/15 bg-black shadow-[0_0_28px_rgba(0,0,0,0.55)]">
            <AssetImage
              src={label}
              alt={productName}
              className="object-contain object-center"
              sizes="(max-width: 768px) 38vw, 18vw"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-black/20 mix-blend-screen" />
            <div className="pointer-events-none absolute inset-y-0 left-0 w-[18%] bg-gradient-to-r from-black/28 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-[18%] bg-gradient-to-l from-black/34 to-transparent" />
          </div>
        </div>
      </div>
    </div>
  )
}

function LabelledBottlePair({
  productName,
  frontLabel,
  rearLabel,
  className,
}: {
  productName: string
  frontLabel: string
  rearLabel: string
  className: string
}) {
  return (
    <div
      aria-label={`${productName} front and rear labelled bottles`}
      role="img"
      className={`relative grid grid-cols-2 overflow-hidden bg-black ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_34%_38%,rgba(200,245,0,0.14),transparent_32%),radial-gradient(circle_at_70%_34%,rgba(51,217,255,0.1),transparent_30%)]" />
      <LabelledBottle productName={`${productName} front label`} label={frontLabel} className="relative h-full bg-transparent" />
      <LabelledBottle productName={`${productName} rear label`} label={rearLabel} className="relative h-full bg-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black to-transparent" />
    </div>
  )
}

export default function ProductVisual({
  productId,
  productName,
  className = '',
  mode = 'portrait',
}: ProductVisualProps) {
  const lockedLabels = isProductKey(productId) ? getLockedLabelAsset(productId) : null
  const lockedFrontLabel = lockedLabels?.frontLabel ?? null

  if (lockedFrontLabel && mode === 'portrait') {
    return <LabelledBottle productName={productName} label={lockedFrontLabel} className={className} />
  }

  if (lockedLabels && mode === 'gallery') {
    return (
      <LabelledBottlePair
        productName={productName}
        frontLabel={lockedLabels.frontLabel}
        rearLabel={lockedLabels.rearLabel}
        className={className}
      />
    )
  }

  const baseBottle = baseBottleProducts[productId]
  if (baseBottle) {
    return (
      <div
        aria-label={productName}
        role="img"
        className={`relative flex items-center justify-center overflow-hidden bg-black ${className}`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(200,245,0,0.18),transparent_42%)]" />
        <div className="relative flex h-[88%] max-h-[620px] min-h-[180px] w-[34%] min-w-[132px] max-w-[245px] flex-col items-center">
          <div className="z-10 h-[7%] w-[44%] rounded-t-md border border-white/15 bg-gradient-to-b from-zinc-700 via-zinc-950 to-black shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]" />
          <div className="z-10 h-[6%] w-[54%] rounded-t-sm border border-white/10 bg-[repeating-linear-gradient(90deg,#111_0,#111_4px,#2b2b2b_5px,#2b2b2b_7px)]" />
          <div
            className="relative -mt-[1%] w-full flex-1 overflow-hidden border border-white/10 bg-gradient-to-r from-[#050505] via-[#171717] to-[#050505] shadow-[inset_18px_0_24px_rgba(255,255,255,0.05),inset_-18px_0_24px_rgba(0,0,0,0.65),0_28px_45px_rgba(0,0,0,0.55)]"
            style={{ clipPath: 'polygon(20% 0, 80% 0, 95% 11%, 95% 100%, 5% 100%, 5% 11%)' }}
          >
            <div className="absolute inset-x-[12%] top-[7%] h-px bg-white/10" />
            <div className="absolute inset-x-[14%] top-[9%] text-center text-[clamp(0.58rem,1.2vw,0.92rem)] font-black uppercase tracking-[0.18em] text-zinc-700">
              CATALYX
            </div>
            <div
              className="absolute inset-x-[12%] top-[28%] rounded-md border bg-black/55 px-3 py-4 text-center shadow-[0_0_24px_rgba(0,0,0,0.5)]"
              style={{ borderColor: `${baseBottle.accent}aa` }}
            >
              <div className="mx-auto flex aspect-square w-[38%] items-center justify-center rounded-full border border-white/20 bg-black">
                <span className="text-[clamp(1.1rem,3vw,2.6rem)] font-black text-white">X</span>
              </div>
              <p className="mt-3 text-[clamp(1.2rem,3.2vw,2.7rem)] font-black leading-none" style={{ color: baseBottle.accent }}>
                {baseBottle.name}
              </p>
              <div className="mx-auto my-3 h-px w-full" style={{ backgroundColor: `${baseBottle.accent}99` }} />
              <p className="text-[clamp(0.55rem,1.2vw,0.9rem)] font-semibold uppercase tracking-[0.08em] text-white">
                {baseBottle.base}
              </p>
              <p className="mt-2 text-[clamp(0.42rem,0.8vw,0.62rem)] font-semibold uppercase tracking-[0.08em] text-zinc-400">
                Professional 2-part nutrient system
              </p>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {['S', 'P', 'L', 'E'].map((item) => (
                  <span
                    key={item}
                    className="flex aspect-square items-center justify-center rounded-full border text-[clamp(0.42rem,0.8vw,0.62rem)] font-bold"
                    style={{ borderColor: `${baseBottle.accent}99`, color: baseBottle.accent }}
                  >
                    {item}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-[clamp(0.56rem,1vw,0.78rem)] font-bold text-white">1L (33.8 FL OZ)</p>
              <p className="mt-1 text-[clamp(0.42rem,0.8vw,0.58rem)] uppercase tracking-[0.12em] text-zinc-500">{baseBottle.part}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const image = officialImages[productId]

  if (image && mode === 'portrait') {
    return (
      <div aria-label={productName} role="img" className={`relative overflow-hidden bg-black ${className}`}>
        <AssetImage
          src={image}
          alt={productName}
          className="object-contain object-center"
          sizes="(max-width: 768px) 80vw, 28vw"
        />
      </div>
    )
  }

  const galleryPosition = galleryPositions[productId] ?? { x: 0, y: 0 }

  return (
    <div aria-label={productName} role="img" className={`relative overflow-hidden bg-black ${className}`}>
      <AssetImage
        src="/brand/official/product-gallery.png"
        alt={productName}
        fill={false}
        className="pointer-events-none absolute inset-0 h-[200%] w-[500%] max-w-none select-none"
        sizes="(max-width: 768px) 90vw, 28vw"
        style={{
          transform: `translate(-${galleryPosition.x * 20}%, -${galleryPosition.y * 50}%)`,
        }}
      />
    </div>
  )
}
