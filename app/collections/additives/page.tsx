import type { Metadata } from 'next'
import ShopCollection from '@/components/ShopCollection'

export const metadata: Metadata = {
  title: 'Stage additives | Enhancement Kit to Final Stage Kit',
  description:
    'Shop the Catalyx support layer used in Enhancement Kit, Final Stage Kit, Performance Kit, and Complete Kit.',
}

export default function AdditivesCollectionPage() {
  return <ShopCollection collection="additives" />
}
