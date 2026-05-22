const officialImages: Record<string, string> = {
  'micro-x': '/brand/official/micro-x.png',
  'root-x': '/brand/official/root-x.png',
  'vital-x': '/brand/official/vital-x.png',
  'pk-x': '/brand/official/pk-x.png',
  'ripen-x': '/brand/official/ripen-x.png',
  'trace-x': '/brand/official/trace-x.png',
  'iron-x': '/brand/official/iron-x.png',
  'flush-x': '/brand/official/flush-x.png',
}

const baseBottleProducts: Record<string, { name: string; base: string; part: string; accent: string }> = {
  'ax-pro': { name: 'A-X PRO', base: 'GROW BASE A', part: 'PART A', accent: '#62e33b' },
  'bx-pro': { name: 'B-X PRO', base: 'GROW BASE B', part: 'PART B', accent: '#b7e33b' },
}

const galleryPositions: Record<string, string> = {
  'ax-pro': '0% 0%',
  'bx-pro': '25% 0%',
  'micro-x': '50% 0%',
  'root-x': '75% 0%',
  'vital-x': '100% 0%',
  'pk-x': '0% 100%',
  'ripen-x': '25% 100%',
  'trace-x': '50% 100%',
  'iron-x': '75% 100%',
  'flush-x': '100% 100%',
}

interface ProductVisualProps {
  productId: string
  productName: string
  className?: string
  mode?: 'portrait' | 'gallery'
}

export default function ProductVisual({
  productId,
  productName,
  className = '',
  mode = 'portrait',
}: ProductVisualProps) {
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
      <div
        aria-label={productName}
        role="img"
        className={`bg-cover bg-center bg-no-repeat ${className}`}
        style={{ backgroundImage: `url('${image}')` }}
      />
    )
  }

  return (
    <div
      aria-label={productName}
      role="img"
      className={`bg-[url('/brand/official/product-gallery.png')] bg-[length:500%_200%] bg-no-repeat ${className}`}
      style={{ backgroundPosition: galleryPositions[productId] ?? '0% 0%' }}
    />
  )
}
