import type { Metadata } from 'next'
import ShopCollection from '@/components/ShopCollection'

export const metadata: Metadata = {
  title: 'Core nutrients | Base Kit and Core Kit',
  description:
    'Shop the core feed foundation used in Base Kit, Core Kit, Performance Kit, and Complete Kit.',
}

export default function CoreNutrientsCollectionPage() {
  return <ShopCollection collection="core-nutrients" />
}
