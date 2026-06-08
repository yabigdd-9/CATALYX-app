'use client'

import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'

const AIGrowTipWidget = dynamic(() => import('@/components/AIGrowTipWidget'), {
  ssr: false,
})

const hiddenPrefixes = [
  '/',
  '/about',
  '/contact',
  '/install',
  '/privacy',
  '/terms',
  '/products',
  '/collections',
  '/product-guide',
  '/feed-chart',
  '/ax-bx-system',
  '/safety-storage',
  '/preorder',
]

function shouldHideAssistant(pathname: string) {
  if (pathname === '/') return true
  return hiddenPrefixes.some((prefix) => prefix !== '/' && pathname.startsWith(prefix))
}

export default function RouteAwareAssistant() {
  const pathname = usePathname()

  if (!pathname || shouldHideAssistant(pathname)) return null

  return <AIGrowTipWidget />
}
