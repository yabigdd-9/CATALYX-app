import type { Metadata } from 'next'
import ShopCollection from '@/components/ShopCollection'

export const metadata: Metadata = {
  title: 'Catalyx products | Base Kit to Complete Kit',
  description:
    'Browse the full Catalyx nutrient range and match individual products to Base Kit, Core Kit, Enhancement Kit, Final Stage Kit, Performance Kit, and Complete Kit.',
  alternates: {
    canonical: '/products',
  },
  openGraph: {
    title: 'Catalyx products | Base Kit to Complete Kit',
    description:
      'Browse the full Catalyx nutrient range and match individual products to Base Kit, Core Kit, Enhancement Kit, Final Stage Kit, Performance Kit, and Complete Kit.',
    url: '/products',
  },
}

export default function ProductsPage() {
  return <ShopCollection collection="all" />
}
