import type { Metadata } from 'next'
import ShopCollection from '@/components/ShopCollection'

export const metadata: Metadata = {
  title: 'Specialist support | Performance Kit and Complete Kit',
  description:
    'Shop Catalyx specialist support products used across Enhancement Kit, Final Stage Kit, Performance Kit, and Complete Kit.',
}

export default function SpecialistCollectionPage() {
  return <ShopCollection collection="specialist" />
}
