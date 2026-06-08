export interface Product {
  id: string
  name: string
  description: string
  details?: string
  price: number
  image: string
  category: string
  sku?: string
  size?: string
  usageNote?: string
  inStock: boolean
}

export interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  author: string
  publishedAt: Date
  slug: string
}

export interface TeamMember {
  id: string
  name: string
  role: string
  bio: string
  image: string
  email?: string
}

export interface CartItem {
  productId: string
  quantity: number
  price: number
}
