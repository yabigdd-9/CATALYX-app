'use client'

import { useState } from 'react'
import { useCart } from '@/lib/store'
import type { Product } from '@/types'

export default function AddKitToCartButton({
  products,
  className = '',
}: {
  products: Product[]
  className?: string
}) {
  const addToCart = useCart((state) => state.addToCart)
  const [added, setAdded] = useState(false)

  function handleAdd() {
    const availableProducts = products.filter((product) => product.inStock)
    if (!availableProducts.length) return

    for (const product of availableProducts) {
      addToCart(product, 1)
    }

    setAdded(true)
    window.setTimeout(() => setAdded(false), 1600)
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={!products.some((product) => product.inStock)}
      className={`rounded-md bg-[#c8f500] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-black shadow-lg shadow-[#c8f500]/20 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400 ${className}`}
    >
      {added ? 'Kit added' : 'Add full kit to cart'}
    </button>
  )
}
