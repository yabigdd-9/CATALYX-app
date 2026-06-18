import { products as catalyxProducts, type ProductKey } from '@/lib/catalyx'
import { getProductById } from '@/lib/products'

export type KitSlug =
  | 'base-kit'
  | 'core-kit'
  | 'enhancement-kit'
  | 'final-stage-kit'
  | 'performance-kit'
  | 'complete-kit'

export type CollectionSlug = 'all' | 'core-nutrients' | 'additives' | 'specialist'

export type CatalyxKit = {
  slug: KitSlug
  name: string
  subtitle: string
  description: string
  lead: string
  idealFor: string
  whenToChoose: string
  productIds: ProductKey[]
  collections: CollectionSlug[]
  href: string
  ctaLabel: string
  note?: string
  faqs: Array<{ question: string; answer: string }>
}

type CatalyxKitSource = Omit<CatalyxKit, 'href' | 'ctaLabel' | 'faqs'> & {
  faqs: Array<[string, string]>
}

function expandKit(kit: CatalyxKitSource): CatalyxKit {
  return {
    ...kit,
    href: `/kits/${kit.slug}`,
    ctaLabel: `View ${kit.name} details`,
    faqs: kit.faqs.map(([question, answer]) => ({ question, answer })),
  }
}

const catalyxKitSources: CatalyxKitSource[] = [
  {
    slug: 'base-kit',
    name: 'Base Kit',
    subtitle: 'Start here',
    description: 'The simplest starting point for first-time buyers: the two-part base feed that anchors the Catalyx system.',
    lead: 'The cleanest path into Catalyx for growers who want the core feed first and the rest of the system explained clearly.',
    idealFor: 'First-time Catalyx buyers, simple two-part runs, and anyone who wants to understand the system before layering in more products.',
    whenToChoose: 'Choose Base Kit when you want the shortest route from landing page to confident first order.',
    productIds: ['ax-pro', 'bx-pro'],
    collections: ['all', 'core-nutrients'],
    note: 'Best first click for new growers.',
    faqs: [
      ['What is included in Base Kit?', 'Base Kit includes A-X PRO and B-X PRO, the two-part feed foundation that anchors the Catalyx system.'],
      ['Who should start with Base Kit?', 'Most first-time visitors should start here because it keeps the system simple before adding support or finish products.'],
      ['What should I open after Base Kit?', 'Use the feed chart to match stage timing, then open the product guide if you want deeper bottle-by-bottle context.'],
    ],
  },
  {
    slug: 'core-kit',
    name: 'Core Kit',
    subtitle: 'Base plus early-cycle support',
    description: 'Adds root and micronutrient support around the base feed for cleaner establishment and vegetative structure.',
    lead: 'The core feed plus early support products for growers who want a stronger establishment phase without jumping to the full system.',
    idealFor: 'Growers who want the base feed, stronger early-cycle support, and a clearer bridge into veg structure and recovery control.',
    whenToChoose: 'Choose Core Kit when Base Kit feels too minimal but Complete Kit is still more system than you need.',
    productIds: ['ax-pro', 'bx-pro', 'root-x', 'micro-x'],
    collections: ['all', 'core-nutrients', 'additives', 'specialist'],
    faqs: [
      ['How is Core Kit different from Base Kit?', 'Core Kit keeps the A-X PRO and B-X PRO foundation, then adds ROOT-X and MICRO-X for cleaner establishment and trace support.'],
      ['Does Core Kit replace the base feed?', 'No. It extends the base feed with targeted support products rather than replacing the two-part foundation.'],
      ['When should I choose Core Kit?', 'Choose it when you want more early-cycle support and trace balance than Base Kit alone provides.'],
    ],
  },
  {
    slug: 'enhancement-kit',
    name: 'Enhancement Kit',
    subtitle: 'Support without overcomplication',
    description: 'Layers root, vitality, and micronutrient support around demanding moments like transplant, stress, and recovery.',
    lead: 'A support-focused kit for growers who already understand the base feed and want more resilience around stress windows.',
    idealFor: 'Recovery windows, transplant support, root establishment, and trace correction without moving into a full bloom or finish stack.',
    whenToChoose: 'Choose Enhancement Kit when the run needs support control more than it needs extra base or finish products.',
    productIds: ['root-x', 'vital-x', 'micro-x'],
    collections: ['all', 'additives', 'specialist'],
    faqs: [
      ['Does Enhancement Kit include the base feed?', 'No. It is a support-layer kit, so it works best alongside an existing base-feed plan rather than as a standalone full feed.'],
      ['What problems is Enhancement Kit built for?', 'It is built for establishment, resilience, stress management, and trace support when the crop needs tighter intervention.'],
      ['Who should buy Enhancement Kit first?', 'It suits growers who already know their base-feed path and want more control around support windows.'],
    ],
  },
  {
    slug: 'final-stage-kit',
    name: 'Final Stage Kit',
    subtitle: 'Late bloom and clean finish',
    description: 'Built for the closing stretch: bloom support, ripening control, and disciplined root-zone cleanup.',
    lead: 'A finishing kit for the late run, where bloom push, ripening control, and cleanup need to stay disciplined.',
    idealFor: 'Late bloom, ripening transitions, and final cleanup windows where growers want a cleaner, more structured finish.',
    whenToChoose: 'Choose Final Stage Kit when you want a tighter end-of-cycle system rather than a broader all-stage bundle.',
    productIds: ['pk-x', 'ripen-x', 'flush-x'],
    collections: ['all', 'additives', 'specialist'],
    faqs: [
      ['What stage is Final Stage Kit for?', 'It is built for the closing stretch of the cycle: bloom support, ripening, and cleanup before harvest.'],
      ['Can I start the full run with Final Stage Kit?', 'No. This kit is a late-stage layer, not a full-system starting point.'],
      ['Why bundle these products together?', 'They solve the same buyer question: how to push bloom, finish cleanly, and avoid guesswork at the end of the run.'],
    ],
  },
  {
    slug: 'performance-kit',
    name: 'Performance Kit',
    subtitle: 'For higher-control runs',
    description: 'Combines the base feed with vitality, bloom push, and foliar trace support for growers who want more tuning headroom.',
    lead: 'A higher-control bundle for growers who want the base feed plus extra tuning headroom across resilience, bloom push, and foliar correction.',
    idealFor: 'More tuned runs where growers want control over performance rather than only a simple foundation or a finish-only layer.',
    whenToChoose: 'Choose Performance Kit when you know the run needs more than the basics and you want flexibility without jumping to every product.',
    productIds: ['ax-pro', 'bx-pro', 'vital-x', 'pk-x', 'trace-x'],
    collections: ['all', 'core-nutrients', 'additives', 'specialist'],
    faqs: [
      ['How is Performance Kit different from Complete Kit?', 'Performance Kit is still selective. It adds targeted control to the base feed without including every Catalyx product.'],
      ['Who is Performance Kit best for?', 'Growers who already understand the feed path and want extra control around stress support, bloom push, and foliar correction.'],
      ['Is Performance Kit beginner-friendly?', 'It is usable, but it is better for growers who already understand when and why to introduce extra control points.'],
    ],
  },
  {
    slug: 'complete-kit',
    name: 'Complete Kit',
    subtitle: 'Full 9-product system',
    description: 'Every Catalyx product in one structured system, from base nutrition through finish, recovery, and cleanup.',
    lead: 'The full Catalyx system for buyers who already know they want every major product layer in one coordinated order.',
    idealFor: 'Growers who want the complete 9-product system from the start, or stockists and serious users who do not want to piece the range together gradually.',
    whenToChoose: 'Choose Complete Kit when you want the broadest Catalyx coverage and do not need the range simplified down further.',
    productIds: catalyxProducts.map((product) => product.id),
    collections: ['all', 'core-nutrients', 'additives', 'specialist'],
    faqs: [
      ['What does Complete Kit include?', 'Complete Kit includes the full nine-product Catalyx lineup: base feed, support products, bloom tools, foliar trace support, and cleanup products.'],
      ['Who should buy Complete Kit?', 'It suits buyers who already know they want the full system rather than a narrower entry path.'],
      ['Do I need Complete Kit to use Catalyx properly?', 'No. Base Kit remains the clearest entry point. Complete Kit is for buyers who want the whole system immediately.'],
    ],
  },
]

export const catalyxKits: CatalyxKit[] = catalyxKitSources.map(expandKit)

export function getKitBySlug(slug: KitSlug) {
  return catalyxKits.find((kit) => kit.slug === slug)
}

export function getKitProducts(productIds: ProductKey[]) {
  return productIds
    .map((productId) => {
      const catalyxProduct = catalyxProducts.find((product) => product.id === productId)
      const storeProduct = getProductById(productId)
      return catalyxProduct && storeProduct
        ? { catalyxProduct, storeProduct }
        : null
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
}

export function getKitsForCollection(collection: CollectionSlug) {
  return catalyxKits.filter((kit) => kit.collections.includes(collection))
}

export function getKitsForProduct(productId: ProductKey) {
  return catalyxKits.filter((kit) => kit.productIds.includes(productId))
}
