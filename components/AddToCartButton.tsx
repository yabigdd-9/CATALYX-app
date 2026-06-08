'use client'

import { useState } from 'react'
import { Product } from '@/types'
import { useCart } from '@/lib/store'

interface AddToCartButtonProps {
  product: Product
  className?: string
  quantity?: number
}

export default function AddToCartButton({
  product,
  className = '',
  quantity = 1,
}: AddToCartButtonProps) {
  const addToCart = useCart((state) => state.addToCart)
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    if (!product.inStock) return

    addToCart(product, quantity)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1400)
  }

  return (
    <button
      type="button"
      disabled={!product.inStock}
      onClick={handleAdd}
      aria-label={product.inStock ? `Add ${product.name} to cart` : `${product.name} is coming soon`}
      className={`rounded-md px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] transition ${
        product.inStock
          ? 'bg-[#c8f500] text-black shadow-lg shadow-[#c8f500]/20 hover:bg-[#e0ff33]'
          : 'cursor-not-allowed bg-zinc-700 text-zinc-400'
      } ${className}`}
    >
      {!product.inStock ? 'Coming soon' : added ? 'Added' : 'Add to Cart'}
    </button>
  )
}
