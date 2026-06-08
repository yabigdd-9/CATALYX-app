'use client'

import { useState } from 'react'
import { type CatalyxProduct } from '@/lib/catalyx'
import { readLocalList, storageKeys, writeLocalList } from '@/lib/persistence'
import { addProductToShelfSupabase } from '@/lib/supabase-services'

export default function AddToShelfButton({ product }: { product: CatalyxProduct }) {
  const [saved, setSaved] = useState(false)
  const [syncFailed, setSyncFailed] = useState(false)

  async function addToShelf() {
    const current = readLocalList<{ productId: string; name: string }>(storageKeys.shelf)
    const next = [{ productId: product.id, name: product.name }, ...current.filter((item) => item.productId !== product.id)]
    writeLocalList(storageKeys.shelf, next)
    try {
      await addProductToShelfSupabase({ productId: product.id })
      setSyncFailed(false)
    } catch {
      setSyncFailed(true)
    }
    setSaved(true)
  }

  return (
    <div className="mt-4 grid gap-2">
      <button onClick={addToShelf} className="inline-flex rounded-md border border-white/15 px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:border-[#c8f500]/60 hover:text-[#d9ff34]">
        {saved ? 'Added to My Shelf' : 'Add to My Shelf'}
      </button>
      {syncFailed ? <p className="text-xs text-zinc-500">Saved locally. Supabase sync failed and can be retried later.</p> : null}
    </div>
  )
}
