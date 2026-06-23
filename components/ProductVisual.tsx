import type { ProductKey } from '@/lib/catalyx'
import { SKU_DATA } from '@/lib/sku-data'

const productKeys = ['ax-pro', 'bx-pro', 'micro-x', 'root-x', 'vital-x', 'pk-x', 'ripen-x', 'trace-x', 'flush-x'] as const

const renderBase = 'https://catalyx-labs-grow-os.vercel.app/brand/renders/review'

const renderImages: Record<ProductKey, string> = {
  'ax-pro': `${renderBase}/CATALYX_A-X_PRO_1L_Transparent_REVIEW.png`,
  'bx-pro': `${renderBase}/CATALYX_B-X_PRO_1L_Transparent_REVIEW.png`,
  'micro-x': `${renderBase}/CATALYX_MICRO-X_250mL_Transparent_REVIEW.png`,
  'root-x': `${renderBase}/CATALYX_ROOT-X_250mL_Transparent_REVIEW.png`,
  'vital-x': `${renderBase}/CATALYX_VITAL-X_250mL_Transparent_REVIEW.png`,
  'pk-x': `${renderBase}/CATALYX_PK-X_250mL_Transparent_REVIEW.png`,
  'ripen-x': `${renderBase}/CATALYX_RIPEN-X_250mL_Transparent_REVIEW.png`,
  'trace-x': `${renderBase}/CATALYX_TRACE-X_250mL_Transparent_REVIEW.png`,
  'flush-x': `${renderBase}/CATALYX_FLUSH-X_250mL_Transparent_REVIEW.png`,
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

export default function ProductVisual({ productId, productName, className = '' }: ProductVisualProps) {
  const key = isProductKey(productId) ? productId : null
  const image = key ? renderImages[key] : null
  const accent = key ? SKU_DATA[key].accent : '#7cff00'

  return (
    <div
      aria-label={productName}
      role="img"
      className={`relative flex items-center justify-center overflow-hidden bg-black ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(circle at 50% 38%, ${accent}22, transparent 58%)` }}
      />
      {image ? (
        <div
          className="relative h-full w-full bg-contain bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${image}')` }}
        />
      ) : (
        <span className="relative text-sm font-black uppercase tracking-[0.18em] text-zinc-500">{productName}</span>
      )}
    </div>
  )
}
