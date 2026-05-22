'use client'

import { useState } from 'react'
import Image from 'next/image'
import { uploadSupabaseFile } from '@/lib/supabase'
import { Panel, SaveBanner } from '@/components/catalyx-ui'

export default function PhotoUpload() {
  const [preview, setPreview] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [message, setMessage] = useState<string>()

  async function upload(file: File | undefined) {
    if (!file) return
    setStatus('saving')
    const result = await uploadSupabaseFile({
      bucket: 'grow-photos',
      path: `mock-grow/${Date.now()}-${file.name}`,
      file,
    })
    setPreview(result.url)
    setStatus(result.error ? 'error' : 'saved')
    setMessage(result.source === 'supabase' ? 'Photo uploaded to Supabase Storage.' : 'Photo preview saved locally until Supabase Storage is configured.')
  }

  return (
    <Panel className="p-5">
      <h2 className="text-2xl font-black">Upload grow photo</h2>
      <p className="mt-3 text-sm leading-6 text-zinc-400">Uploads to the `grow-photos` Supabase Storage bucket when configured, with local preview fallback.</p>
      <input type="file" accept="image/*" onChange={(event) => upload(event.target.files?.[0])} className="mt-5 w-full rounded-md border border-dashed border-white/15 bg-black px-3 py-3 text-sm text-zinc-500 file:mr-4 file:rounded-md file:border-0 file:bg-[#c8f500] file:px-3 file:py-2 file:text-sm file:font-bold file:text-black" />
      {preview ? (
        <Image
          src={preview}
          alt="Uploaded grow preview"
          width={960}
          height={540}
          unoptimized
          className="mt-5 aspect-video w-full rounded-md border border-white/10 object-cover"
        />
      ) : null}
      <div className="mt-4">
        <SaveBanner status={status} message={message} />
      </div>
    </Panel>
  )
}
