import type { Metadata } from 'next'
import ShopCollection from '@/components/ShopCollection'

export const metadata: Metadata = {
  title: 'All Catalyx products | Base Kit to Complete Kit',
  description:
    'Browse every Catalyx product and move from Base Kit to Complete Kit with one consistent kit system.',
}

export default function AllCollectionPage() {
  return <ShopCollection collection="all" />
}
