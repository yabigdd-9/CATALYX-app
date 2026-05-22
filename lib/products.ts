import { Product } from '@/types'

export const products: Product[] = [
  // Core Nutrient System
  {
    id: 'ax-pro',
    name: 'A-X PRO',
    description: 'Part A base nutrient providing essential calcium, nitrogen, and iron support. Used together with B-X PRO to form your complete feed system.',
    price: 49.99,
    image: '/products/ax-pro.svg',
    category: 'core-nutrients',
    inStock: true,
  },
  {
    id: 'bx-pro',
    name: 'B-X PRO',
    description: 'Part B nutrient delivering phosphorus, potassium, magnesium, and sulfur. Essential companion to A-X PRO for balanced plant nutrition.',
    price: 49.99,
    image: '/products/bx-pro.svg',
    category: 'core-nutrients',
    inStock: true,
  },
  // Additives
  {
    id: 'root-x',
    name: 'ROOT-X',
    description: 'Rooting and transplant additive for root initiation, mass development, and stress reduction. Contains fulvic acid, potassium phosphite, and vitamin B complex.',
    price: 34.99,
    image: '/products/root-x.svg',
    category: 'additives',
    inStock: true,
  },
  {
    id: 'vital-x',
    name: 'VITAL-X',
    description: 'Plant vitality and resilience additive for stress support, silica supplementation, and overall plant health. Features potassium silicate, fulvic acid, and vitamin B complex.',
    price: 39.99,
    image: '/products/vital-x.svg',
    category: 'additives',
    inStock: true,
  },
  {
    id: 'pk-x',
    name: 'PK-X',
    description: 'Mid-bloom power product for enhanced flower density and bloom bulking. Provides targeted PK supplementation during critical flowering stages.',
    price: 44.99,
    image: '/products/pk-x.svg',
    category: 'additives',
    inStock: true,
  },
  {
    id: 'ripen-x',
    name: 'RIPEN-X',
    description: 'Late bloom ripener for final-stage support, reduced nitrogen finish, and cleaner ripening phase. Ensures optimal harvest quality.',
    price: 39.99,
    image: '/products/ripen-x.svg',
    category: 'additives',
    inStock: true,
  },
  // Support/Specialist Products
  {
    id: 'micro-x',
    name: 'MICRO-X',
    description: 'Complete micronutrient supplement containing iron, manganese, zinc, copper, boron, and molybdenum for trace element correction and plant health.',
    price: 29.99,
    image: '/products/micro-x.svg',
    category: 'specialist',
    inStock: true,
  },
  {
    id: 'trace-x',
    name: 'TRACE-X',
    description: 'Foliar trace spray for rapid correction of micronutrient deficiencies. More targeted application than MICRO-X for immediate plant response.',
    price: 24.99,
    image: '/products/trace-x.svg',
    category: 'specialist',
    inStock: true,
  },
  {
    id: 'iron-x',
    name: 'IRON-X',
    description: 'Specialized iron supplement for correcting iron deficiencies and chlorosis. Essential for plants showing yellowing between veins.',
    price: 19.99,
    image: '/products/iron-x.svg',
    category: 'specialist',
    inStock: true,
  },
  {
    id: 'flush-x',
    name: 'FLUSH-X',
    description: 'Flush additive for final flushing, salt reduction, and root-zone cleanup. Prepares plants for harvest with cleaner end product.',
    price: 22.99,
    image: '/products/flush-x.svg',
    category: 'specialist',
    inStock: true,
  },
]

export const getProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id)
}