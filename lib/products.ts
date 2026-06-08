import { Product } from '@/types'
import { getLockedFrontLabel } from '@/lib/catalyx-assets'

export const products: Product[] = [
  // Core Nutrient System
  {
    id: 'ax-pro',
    name: 'A-X PRO',
    description: 'Part A base nutrient providing essential calcium, nitrogen, and iron support. Used together with B-X PRO to form your complete feed system.',
    details:
      'A-X PRO is the first half of the Catalyx two-part base. It is built for growers who need a stable mineral foundation before adding stage-specific support products. Use it as the calcium, nitrogen, and iron side of the feed, then pair it with B-X PRO after dilution so the full base profile stays balanced and predictable.',
    price: 49.99,
    image: getLockedFrontLabel('ax-pro'),
    category: 'core-nutrients',
    sku: 'CXL-AXP-1L',
    size: '1 L',
    usageNote: 'Use as Part A of the base feed only after diluting into water. Do not mix the concentrate directly with Part B.',
    inStock: true,
  },
  {
    id: 'bx-pro',
    name: 'B-X PRO',
    description: 'Part B nutrient delivering phosphorus, potassium, magnesium, and sulfur. Essential companion to A-X PRO for balanced plant nutrition.',
    details:
      'B-X PRO completes the base feed by supplying the phosphorus, potassium, magnesium, and sulfur side of the system. It is designed to run beside A-X PRO, not replace it. Together they create the core feed layer that later products can build on without forcing growers to guess where the base nutrition is coming from.',
    price: 49.99,
    image: getLockedFrontLabel('bx-pro'),
    category: 'core-nutrients',
    sku: 'CXL-BXP-1L',
    size: '1 L',
    usageNote: 'Use with A-X PRO at matched rates after each part has been diluted separately.',
    inStock: true,
  },
  // Additives
  {
    id: 'root-x',
    name: 'ROOT-X',
    description: 'Rooting and transplant additive for root initiation, mass development, and stress reduction. Contains fulvic acid, potassium phosphite, and vitamin B complex.',
    details:
      'ROOT-X is for establishment windows where root strength matters more than heavy feeding. Use it during seedling, transplant, and early vegetative phases to support root initiation, root mass, and early recovery. It fits best when the plant is building the root system that later feed intensity will depend on.',
    price: 34.99,
    image: getLockedFrontLabel('root-x'),
    category: 'additives',
    sku: 'CXL-ROT-1L',
    size: '250 mL / 1 L',
    usageNote: 'Best used early in the cycle and around transplant or establishment windows.',
    inStock: true,
  },
  {
    id: 'vital-x',
    name: 'VITAL-X',
    description: 'Plant vitality and resilience additive for stress support, silica supplementation, and overall plant health. Features potassium silicate, fulvic acid, and vitamin B complex.',
    details:
      'VITAL-X is the resilience product in the range. It is intended for stress windows, early establishment, and demanding growth phases where consistency matters. Instead of pushing EC higher, it supports plant posture, recovery, and general vitality so the rest of the feed program can stay controlled.',
    price: 39.99,
    image: getLockedFrontLabel('vital-x'),
    category: 'additives',
    sku: 'CXL-VIT-1L',
    size: '250 mL / 1 L',
    usageNote: 'Use around stress windows or when consistency matters more than pushing feed harder.',
    inStock: true,
  },
  {
    id: 'pk-x',
    name: 'PK-X',
    description: 'Mid-bloom power product for enhanced flower density and bloom bulking. Provides targeted PK supplementation during critical flowering stages.',
    details:
      'PK-X is the bloom push product for growers who want extra phosphorus and potassium during early-to-mid flower demand. It should be introduced gradually and read against runoff EC, tip response, and flower set. It adds targeted bloom support without replacing disciplined base-feed management.',
    price: 44.99,
    image: getLockedFrontLabel('pk-x'),
    category: 'additives',
    sku: 'CXL-PKX-1L',
    size: '250 mL / 1 L',
    usageNote: 'Increase gradually through bloom rather than making aggressive jumps in one feed.',
    inStock: true,
  },
  {
    id: 'ripen-x',
    name: 'RIPEN-X',
    description: 'Late bloom ripener for final-stage support, reduced nitrogen finish, and cleaner ripening phase. Ensures optimal harvest quality.',
    details:
      'RIPEN-X is used when the crop moves out of bloom building and into finishing strategy. It supports late-flower emphasis with a cleaner, lower-nitrogen finish mindset. Use it when harvest timing is approaching and the goal is controlled ripening rather than another aggressive bloom push.',
    price: 39.99,
    image: getLockedFrontLabel('ripen-x'),
    category: 'additives',
    sku: 'CXL-RIP-1L',
    size: '250 mL / 1 L',
    usageNote: 'Use in late flower only, once the crop has moved out of bloom-push strategy.',
    inStock: true,
  },
  // Support/Specialist Products
  {
    id: 'micro-x',
    name: 'MICRO-X',
    description: 'Complete micronutrient supplement containing iron, manganese, zinc, copper, boron, and molybdenum for trace element correction and plant health.',
    details:
      'MICRO-X is a measured micronutrient support product for trace balance during vegetative growth. It helps cover small-element needs that can affect color, enzyme function, and growth consistency. Use it deliberately at low rates, especially where the base feed is stable but new growth still shows trace imbalance.',
    price: 29.99,
    image: getLockedFrontLabel('micro-x'),
    category: 'specialist',
    sku: 'CXL-MIC-1L',
    size: '250 mL / 1 L',
    usageNote: 'Use measured rates when trace balance is needed. More is not better with micros.',
    inStock: true,
  },
  {
    id: 'trace-x',
    name: 'TRACE-X',
    description: 'Foliar trace spray for rapid correction of micronutrient deficiencies. More targeted application than MICRO-X for immediate plant response.',
    details:
      'TRACE-X is the more targeted trace-support option for flower transition and late-flower correction windows. It is useful when the grow needs a focused micronutrient adjustment without changing the whole base feed. Because trace products are powerful at small rates, it should be used only when there is a clear reason.',
    price: 24.99,
    image: getLockedFrontLabel('trace-x'),
    category: 'specialist',
    sku: 'CXL-TRC-1L',
    size: '250 mL / 1 L',
    usageNote: 'Use carefully in bloom support windows and avoid stacking trace products without a reason.',
    inStock: true,
  },
  {
    id: 'flush-x',
    name: 'FLUSH-X',
    description: 'Flush additive for final flushing, salt reduction, and root-zone cleanup. Prepares plants for harvest with cleaner end product.',
    details:
      'FLUSH-X is for the final flush window or a controlled root-zone cleanup phase. It is not a daily feed product. Use it when the goal is to reduce excess salt pressure, monitor runoff movement, and transition the crop out of feeding with a cleaner finish plan.',
    price: 22.99,
    image: getLockedFrontLabel('flush-x'),
    category: 'specialist',
    sku: 'CXL-FLS-1L',
    size: '250 mL / 1 L',
    usageNote: 'Use in the flush window or controlled cleanup phases, not as a day-to-day feed product.',
    inStock: true,
  },
]

export const getProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id)
}
