'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { stageLabels, stageOrder, type GrowPhoto, type Stage } from '@/lib/catalyx'
import { readLocalList, storageKeys, writeLocalList } from '@/lib/persistence'
import { loadPhotosFromSupabase, uploadGrowPhotoToSupabase } from '@/lib/supabase-services'
import { EmptyState, Panel, SaveBanner, StatusPill } from '@/components/catalyx-ui'

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `photo-${Date.now()}`
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Could not read image preview.'))
    reader.readAsDataURL(file)
  })
}

export default function PhotoUpload() {
  const [photos, setPhotos] = useState<GrowPhoto[]>(() => readLocalList<GrowPhoto>(storageKeys.photos))
  const [file, setFile] = useState<File | null>(null)
  const [stage, setStage] = useState<Stage>('vegetative')
  const [tag, setTag] = useState('Canopy')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [message, setMessage] = useState<string>()

  useEffect(() => {
    let alive = true
    async function loadRemotePhotos() {
      try {
        const remotePhotos = await loadPhotosFromSupabase()
        if (!alive || !remotePhotos.length) return
        setPhotos(remotePhotos)
        writeLocalList(storageKeys.photos, remotePhotos)
      } catch {
        if (alive) setMessage('Using local photo timeline until Supabase Storage is ready.')
      }
    }
    loadRemotePhotos()
    return () => {
      alive = false
    }
  }, [])

  const comparePair = useMemo(() => photos.slice(0, 2), [photos])
  const stageCount = useMemo(() => new Set(photos.map((photo) => photo.stage)).size, [photos])
  const latestPhoto = photos[0]

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!file) {
      setStatus('error')
      setMessage('Choose a photo before saving.')
      return
    }

    setStatus('saving')
    const localPreview = await fileToDataUrl(file)
    const localPhoto: GrowPhoto = {
      id: createId(),
      growId: 'local-active-grow',
      url: localPreview,
      stage,
      tag: tag.trim() || 'Progress',
      notes: notes.trim(),
      capturedAt: new Date().toISOString(),
      source: 'local',
    }
    const localTimeline = [localPhoto, ...photos].slice(0, 40)
    setPhotos(localTimeline)
    writeLocalList(storageKeys.photos, localTimeline)

    try {
      const result = await uploadGrowPhotoToSupabase({ file, stage, tag: localPhoto.tag, notes: localPhoto.notes })
      if (result.photo) {
        const syncedTimeline = [result.photo, ...photos].slice(0, 40)
        setPhotos(syncedTimeline)
        writeLocalList(storageKeys.photos, syncedTimeline)
      }
      setStatus('saved')
      setMessage(result.message)
    } catch (error) {
      setStatus('saved')
      setMessage(error instanceof Error ? `Saved locally. Supabase upload needs attention: ${error.message}` : 'Saved locally. Supabase upload needs attention.')
    }

    setFile(null)
    setNotes('')
  }

  return (
    <div className="grid gap-6">
      <Panel className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black">Upload grow photo</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">Photos save to the `grow-photos` Supabase Storage bucket when configured, with local timeline fallback.</p>
          </div>
          <StatusPill tone={photos.some((photo) => photo.source === 'supabase') ? 'lime' : 'blue'}>
            {photos.some((photo) => photo.source === 'supabase') ? 'Storage synced' : 'Local ready'}
          </StatusPill>
        </div>
        <form onSubmit={upload} className="mt-5 grid gap-4">
          <input type="file" accept="image/*" onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="w-full rounded-md border border-dashed border-white/15 bg-black px-3 py-3 text-sm text-zinc-500 file:mr-4 file:rounded-md file:border-0 file:bg-[#c8f500] file:px-3 file:py-2 file:text-sm file:font-bold file:text-black" />
          <div className="grid gap-3 md:grid-cols-3">
            <select value={stage} onChange={(event) => setStage(event.target.value as Stage)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]">
              {stageOrder.map((item) => <option key={item} value={item}>{stageLabels[item]}</option>)}
            </select>
            <input value={tag} onChange={(event) => setTag(event.target.value)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]" placeholder="Canopy, flower, root zone" />
            <input value={notes} onChange={(event) => setNotes(event.target.value)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]" placeholder="Observation notes" />
          </div>
          <button className="rounded-md bg-[#c8f500] px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-black">Save photo</button>
        </form>
        <div className="mt-4">
          <SaveBanner status={status} message={message} />
        </div>
      </Panel>

      <Panel className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <StatusPill tone="lime">Compare My Grow</StatusPill>
            <h2 className="mt-3 text-2xl font-black text-white">Photo progression signals</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-zinc-400">Photo tracking now uses saved images to show visual history, stage spread, and comparison readiness.</p>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[
            ['Timeline depth', `${photos.length}`, photos.length >= 4 ? 'Enough photos for stronger week-by-week visual review.' : 'Add more photos to improve visual trend confidence.'],
            ['Stage coverage', `${stageCount}`, stageCount > 1 ? 'Multiple stages are represented in the photo timeline.' : 'Only one growth stage is represented so far.'],
            ['Latest evidence', latestPhoto ? stageLabels[latestPhoto.stage] : 'None', latestPhoto?.notes || 'Upload a photo to start visual tracking.'],
          ].map(([label, value, body]) => (
            <div key={label} className="rounded-md border border-white/10 bg-black/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">{label}</p>
              <p className="mt-2 text-3xl font-black text-white">{value}</p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{body}</p>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <Panel className="overflow-hidden">
          <div className="border-b border-white/10 p-5">
            <h2 className="text-2xl font-black">Photo timeline</h2>
          </div>
          {photos.length ? (
            <div className="grid gap-4 p-5 md:grid-cols-2">
              {photos.map((photo) => (
                <PhotoCard key={photo.id} photo={photo} />
              ))}
            </div>
          ) : (
            <div className="p-5">
              <EmptyState title="No grow photos yet" body="Upload canopy, flower, root-zone, or issue photos to build a useful progression timeline." />
            </div>
          )}
        </Panel>
        <Panel className="p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-black">Side-by-side</h2>
            <StatusPill tone={comparePair.length >= 2 ? 'lime' : 'amber'}>{comparePair.length >= 2 ? 'Ready' : 'Needs 2 photos'}</StatusPill>
          </div>
          <div className="mt-4 grid gap-3">
            {comparePair.length ? comparePair.map((photo, index) => (
              <div key={photo.id} className="overflow-hidden rounded-md border border-white/10 bg-black/30">
                <Image src={photo.url} alt={`${photo.tag} comparison ${index + 1}`} width={800} height={600} unoptimized className="aspect-[4/3] w-full object-cover" />
                <div className="p-3">
                  <p className="font-bold text-white">{index === 0 ? 'Latest' : 'Previous'} / {stageLabels[photo.stage]}</p>
                  <p className="mt-1 text-sm text-zinc-500">{new Date(photo.capturedAt).toLocaleString()}</p>
                </div>
              </div>
            )) : <EmptyState title="Comparison not ready" body="Save at least two photos to compare visual movement." />}
          </div>
        </Panel>
      </div>
    </div>
  )
}

function PhotoCard({ photo }: { photo: GrowPhoto }) {
  return (
    <div className="overflow-hidden rounded-md border border-white/10 bg-black/30">
      <Image src={photo.url} alt={`${photo.tag} grow photo`} width={900} height={675} unoptimized className="aspect-[4/3] w-full object-cover" />
      <div className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-black text-white">{photo.tag}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-zinc-500">{new Date(photo.capturedAt).toLocaleString()}</p>
          </div>
          <StatusPill tone={photo.source === 'supabase' ? 'lime' : 'blue'}>{stageLabels[photo.stage]}</StatusPill>
        </div>
        {photo.notes ? <p className="mt-3 text-sm leading-6 text-zinc-400">{photo.notes}</p> : null}
      </div>
    </div>
  )
}
