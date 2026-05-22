'use client'

import { useState } from 'react'
import { type CatalyxProduct } from '@/lib/catalyx'
import { readLocalList, storageKeys, writeLocalList } from '@/lib/persistence'
import { addProductToShelfSupabase } from '@/lib/supabase-services'

export default function AddToShelfButton({ product }: { product: CatalyxProduct }) {
  const [saved, setSaved] = useState(false)

  async function addToShelf() {
    const current = readLocalList<{ productId: string; name: string }>(storageKeys.shelf)
    const next = [{ productId: product.id, name: product.name }, ...current.filter((item) => item.productId !== product.id)]
    writeLocalList(storageKeys.shelf, next)
    await addProductToShelfSupabase({ productId: product.id })
    writeLocalList(storageKeys.shelf, next)
    setSaved(true)
  }

  return (
    <button onClick={addToShelf} className="mt-4 inline-flex rounded-md border border-white/15 px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:border-[#c8f500]/60 hover:text-[#d9ff34]">
      {saved ? 'Added to My Shelf' : 'Add to My Shelf'}
    </button>
  )
}
