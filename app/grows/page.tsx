'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import {
  activeGrow,
  type CultivationRoom,
  defaultOnboardingSetup,
  type GrowTent,
  mediumLabels,
  mediumOrder,
  modes,
  stageLabels,
  stageOrder,
  type GrowMode,
  type Medium,
  type OnboardingSetup,
  type Stage,
  type TrackedGrow,
  type TrackedPlant,
} from '@/lib/catalyx'
import { EmptyState, PageHeader, Panel, ShellSection, StatusPill } from '@/components/catalyx-ui'
import { readLocalList, readLocalObject, storageKeys, writeLocalList } from '@/lib/persistence'
import {
  loadCultivationHierarchyFromSupabase,
  saveGrowToSupabase,
  savePlantToSupabase,
  saveRoomToSupabase,
  saveTentToSupabase,
} from '@/lib/supabase-services'

type GrowForm = Omit<TrackedGrow, 'id' | 'createdAt'>
type RoomForm = Omit<CultivationRoom, 'id' | 'createdAt'>
type TentForm = Omit<GrowTent, 'id' | 'createdAt'>
type PlantForm = Omit<TrackedPlant, 'id' | 'createdAt'>

function createBlankForm(setup: OnboardingSetup): GrowForm {
  return {
    name: '',
    strain: '',
    startDate: new Date().toISOString().slice(0, 10),
    stage: setup.stage,
    medium: setup.medium,
    lightSchedule: '18 / 6',
    goal: setup.mode,
    feedingStyle: setup.feedingStyle,
    environmentNotes: setup.environment,
    healthStatus: 'Stable',
    notes: '',
  }
}

function createBlankRoomForm(): RoomForm {
  return {
    name: '',
    environmentType: 'Controlled indoor room',
    location: '',
    notes: '',
  }
}

function createBlankTentForm(roomId = ''): TentForm {
  return {
    roomId,
    name: '',
    size: '',
    lightModel: '',
    airflow: '',
    notes: '',
  }
}

function createBlankPlantForm(growId = '', tentId = '', setup: OnboardingSetup): PlantForm {
  return {
    growId,
    tentId,
    name: '',
    strain: '',
    stage: setup.stage,
    healthStatus: 'Stable',
    notes: '',
  }
}

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `grow-${Date.now()}`
}

export default function GrowsPage() {
  const [setup] = useState<OnboardingSetup>(() => readLocalObject<OnboardingSetup>(storageKeys.onboarding, defaultOnboardingSetup))
  const [grows, setGrows] = useState<TrackedGrow[]>(() => readLocalList<TrackedGrow>(storageKeys.grows))
  const [rooms, setRooms] = useState<CultivationRoom[]>(() => readLocalList<CultivationRoom>(storageKeys.rooms))
  const [tents, setTents] = useState<GrowTent[]>(() => readLocalList<GrowTent>(storageKeys.tents))
  const [plants, setPlants] = useState<TrackedPlant[]>(() => readLocalList<TrackedPlant>(storageKeys.plants))
  const [form, setForm] = useState<GrowForm>(() => createBlankForm(setup))
  const [roomForm, setRoomForm] = useState<RoomForm>(() => createBlankRoomForm())
  const [tentForm, setTentForm] = useState<TentForm>(() => createBlankTentForm())
  const [plantForm, setPlantForm] = useState<PlantForm>(() => createBlankPlantForm('', '', setup))
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const [hierarchyStatus, setHierarchyStatus] = useState<'idle' | 'synced' | 'local' | 'error'>('idle')

  const fallbackGrow: TrackedGrow = useMemo(
    () => ({
      id: activeGrow.id,
      name: activeGrow.name,
      strain: activeGrow.strain,
      startDate: activeGrow.startDate,
      stage: setup.stage,
      medium: setup.medium,
      lightSchedule: activeGrow.lightSchedule,
      goal: setup.mode,
      feedingStyle: `${setup.feedingStyle} / ${setup.delivery}`,
      environmentNotes: setup.environment,
      healthStatus: activeGrow.healthStatus,
      notes: `Saved onboarding profile. Environment difficulty: ${setup.environment}.`,
      createdAt: setup.configuredAt ?? activeGrow.startDate,
    }),
    [setup],
  )
  const currentGrow = grows[0] ?? fallbackGrow
  const currentRoom = rooms[0]
  const currentTent = tents[0]
  const activePlants = plants.filter((plant) => !plant.growId || plant.growId === currentGrow.id)
  const hierarchyCounts = [
    ['Rooms', rooms.length],
    ['Tents', tents.length],
    ['Active plants', activePlants.length],
  ]
  const detailRows = [
    ['Strain', currentGrow.strain],
    ['Start date', currentGrow.startDate],
    ['Medium', mediumLabels[currentGrow.medium]],
    ['Light schedule', currentGrow.lightSchedule],
    ['Goal', currentGrow.goal],
    ['Feeding style', currentGrow.feedingStyle],
    ['Environment notes', currentGrow.environmentNotes],
    ['Health status', currentGrow.healthStatus],
    ['Notes', currentGrow.notes],
  ]

  useEffect(() => {
    let alive = true
    async function loadRemoteHierarchy() {
      try {
        const remote = await loadCultivationHierarchyFromSupabase()
        if (!alive || !remote) return
        if (remote.grows.length) {
          setGrows(remote.grows)
          writeLocalList(storageKeys.grows, remote.grows)
        }
        if (remote.rooms.length) {
          setRooms(remote.rooms)
          writeLocalList(storageKeys.rooms, remote.rooms)
        }
        if (remote.tents.length) {
          setTents(remote.tents)
          writeLocalList(storageKeys.tents, remote.tents)
        }
        if (remote.plants.length) {
          setPlants(remote.plants)
          writeLocalList(storageKeys.plants, remote.plants)
        }
        setHierarchyStatus('synced')
      } catch {
        if (alive) setHierarchyStatus('local')
      }
    }
    loadRemoteHierarchy()
    return () => {
      alive = false
    }
  }, [])

  function updateForm<Key extends keyof GrowForm>(key: Key, value: GrowForm[Key]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function updateRoomForm<Key extends keyof RoomForm>(key: Key, value: RoomForm[Key]) {
    setRoomForm((current) => ({ ...current, [key]: value }))
  }

  function updateTentForm<Key extends keyof TentForm>(key: Key, value: TentForm[Key]) {
    setTentForm((current) => ({ ...current, [key]: value }))
  }

  function updatePlantForm<Key extends keyof PlantForm>(key: Key, value: PlantForm[Key]) {
    setPlantForm((current) => ({ ...current, [key]: value }))
  }

  async function createGrow(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.name.trim() || !form.strain.trim()) {
      setSaveStatus('error')
      return
    }

    const grow: TrackedGrow = {
      ...form,
      name: form.name.trim(),
      strain: form.strain.trim(),
      id: createId(),
      createdAt: new Date().toISOString(),
    }
    const nextGrows = [grow, ...grows].slice(0, 12)
    setGrows(nextGrows)
    writeLocalList(storageKeys.grows, nextGrows)
    setForm(createBlankForm(setup))
    setSaveStatus('saved')
    saveGrowToSupabase(form).catch(() => setHierarchyStatus('local'))
  }

  function createRoom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!roomForm.name.trim()) {
      setHierarchyStatus('error')
      return
    }

    const room: CultivationRoom = {
      ...roomForm,
      name: roomForm.name.trim(),
      id: createId(),
      createdAt: new Date().toISOString(),
    }
    const nextRooms = [room, ...rooms].slice(0, 20)
    setRooms(nextRooms)
    writeLocalList(storageKeys.rooms, nextRooms)
    setRoomForm(createBlankRoomForm())
    setTentForm((current) => ({ ...current, roomId: room.id }))
    setHierarchyStatus('local')
    saveRoomToSupabase(roomForm)
      .then((result) => setHierarchyStatus(result.source === 'supabase' ? 'synced' : 'local'))
      .catch(() => setHierarchyStatus('local'))
  }

  function createTent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!tentForm.name.trim()) {
      setHierarchyStatus('error')
      return
    }

    const tent: GrowTent = {
      ...tentForm,
      roomId: tentForm.roomId || currentRoom?.id || '',
      name: tentForm.name.trim(),
      id: createId(),
      createdAt: new Date().toISOString(),
    }
    const nextTents = [tent, ...tents].slice(0, 30)
    setTents(nextTents)
    writeLocalList(storageKeys.tents, nextTents)
    setTentForm(createBlankTentForm(tent.roomId))
    setPlantForm((current) => ({ ...current, tentId: tent.id }))
    setHierarchyStatus('local')
    saveTentToSupabase(tent)
      .then((result) => setHierarchyStatus(result.source === 'supabase' ? 'synced' : 'local'))
      .catch(() => setHierarchyStatus('local'))
  }

  function createPlant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!plantForm.name.trim() || !plantForm.strain.trim()) {
      setHierarchyStatus('error')
      return
    }

    const plant: TrackedPlant = {
      ...plantForm,
      growId: plantForm.growId || currentGrow.id,
      tentId: plantForm.tentId || currentTent?.id || '',
      name: plantForm.name.trim(),
      strain: plantForm.strain.trim(),
      id: createId(),
      createdAt: new Date().toISOString(),
    }
    const nextPlants = [plant, ...plants].slice(0, 80)
    setPlants(nextPlants)
    writeLocalList(storageKeys.plants, nextPlants)
    setPlantForm(createBlankPlantForm(currentGrow.id, plant.tentId, setup))
    setHierarchyStatus('local')
    savePlantToSupabase(plant)
      .then((result) => setHierarchyStatus(result.source === 'supabase' ? 'synced' : 'local'))
      .catch(() => setHierarchyStatus('local'))
  }

  return (
    <ShellSection>
      <PageHeader title="Grow tracker" copy="Track grows, plants, tents, rooms, stages, mediums, light schedules, goals, feeding style, environment notes, health status, and journal notes." />
      <div className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Panel className="p-5">
          <h2 className="text-2xl font-black">Add grow</h2>
          <form onSubmit={createGrow} className="mt-4 grid gap-3">
            <label className="grid gap-2 text-sm font-semibold text-zinc-300">
              Grow name
              <input value={form.name} onChange={(event) => updateForm('name', event.target.value)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]" placeholder="Run Alpha" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-zinc-300">
              Strain name
              <input value={form.strain} onChange={(event) => updateForm('strain', event.target.value)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]" placeholder="Cultivar or plant label" />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-zinc-300">
                Start date
                <input value={form.startDate} type="date" onChange={(event) => updateForm('startDate', event.target.value)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]" />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-zinc-300">
                Light schedule
                <input value={form.lightSchedule} onChange={(event) => updateForm('lightSchedule', event.target.value)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]" placeholder="18 / 6" />
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-zinc-300">
                Stage
                <select value={form.stage} onChange={(event) => updateForm('stage', event.target.value as Stage)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]">
                  {stageOrder.map((stage) => (
                    <option key={stage} value={stage}>{stageLabels[stage]}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-semibold text-zinc-300">
                Medium
                <select value={form.medium} onChange={(event) => updateForm('medium', event.target.value as Medium)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]">
                  {mediumOrder.map((medium) => (
                    <option key={medium} value={medium}>{mediumLabels[medium]}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="grid gap-2 text-sm font-semibold text-zinc-300">
              Grow goal
              <select value={form.goal} onChange={(event) => updateForm('goal', event.target.value as GrowMode)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]">
                {modes.map((mode) => (
                  <option key={mode} value={mode}>{mode}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold text-zinc-300">
              Feeding style
              <input value={form.feedingStyle} onChange={(event) => updateForm('feedingStyle', event.target.value)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]" placeholder="safe, standard, aggressive, automated" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-zinc-300">
              Environment notes
              <input value={form.environmentNotes} onChange={(event) => updateForm('environmentNotes', event.target.value)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]" placeholder="temperature, humidity, room notes" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-zinc-300">
              Health status
              <input value={form.healthStatus} onChange={(event) => updateForm('healthStatus', event.target.value)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]" placeholder="Stable" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-zinc-300">
              Notes
              <textarea value={form.notes} onChange={(event) => updateForm('notes', event.target.value)} className="min-h-24 rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]" placeholder="Current observations, room context, or target outcome" />
            </label>
            <button className="rounded-md bg-[#c8f500] px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-black">Create grow</button>
            {saveStatus === 'saved' ? <p className="text-sm font-semibold text-[#d9ff34]">Grow saved locally and set as active.</p> : null}
            {saveStatus === 'error' ? <p className="text-sm font-semibold text-[#ff8b92]">Add a grow name and strain before saving.</p> : null}
          </form>
        </Panel>
        <Panel className="p-5">
          <div className="flex flex-wrap justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Active grow</p>
              <h2 className="mt-2 text-3xl font-black">{currentGrow.name}</h2>
              <p className="mt-2 text-zinc-400">{currentGrow.strain} / {mediumLabels[currentGrow.medium]}</p>
            </div>
            <StatusPill tone="lime">{stageLabels[currentGrow.stage]}</StatusPill>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {detailRows.map(([label, value]) => (
              <div key={label} className="rounded-md border border-white/10 bg-black/30 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">{label}</p>
                <p className="mt-2 font-bold text-white">{value}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Panel className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Cultivation structure</p>
              <h2 className="mt-2 text-2xl font-black">Rooms, tents, and plants</h2>
            </div>
            <StatusPill tone={hierarchyStatus === 'synced' ? 'lime' : hierarchyStatus === 'error' ? 'red' : 'blue'}>
              {hierarchyStatus === 'synced' ? 'Supabase synced' : hierarchyStatus === 'error' ? 'Check required' : 'Local first'}
            </StatusPill>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {hierarchyCounts.map(([label, value]) => (
              <div key={label} className="rounded-md border border-white/10 bg-black/30 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">{label}</p>
                <p className="mt-2 text-3xl font-black text-white">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-4">
            {rooms.length ? rooms.map((room) => {
              const roomTents = tents.filter((tent) => tent.roomId === room.id)
              return (
                <div key={room.id} className="rounded-md border border-white/10 bg-black/30 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-white">{room.name}</p>
                      <p className="mt-1 text-sm text-zinc-500">{room.environmentType || 'Controlled room'} / {room.location || 'No location set'}</p>
                    </div>
                    <StatusPill tone="blue">{roomTents.length} tents</StatusPill>
                  </div>
                  {room.notes ? <p className="mt-3 text-sm leading-6 text-zinc-400">{room.notes}</p> : null}
                  <div className="mt-4 grid gap-3">
                    {roomTents.map((tent) => {
                      const tentPlants = plants.filter((plant) => plant.tentId === tent.id)
                      return (
                        <div key={tent.id} className="rounded-md border border-white/10 bg-black/40 p-3">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="font-bold text-white">{tent.name}</p>
                            <StatusPill tone="lime">{tentPlants.length} plants</StatusPill>
                          </div>
                          <p className="mt-2 text-sm text-zinc-500">{tent.size || 'Size unset'} / {tent.lightModel || 'Light unset'} / {tent.airflow || 'Airflow unset'}</p>
                          {tentPlants.length ? (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {tentPlants.map((plant) => (
                                <span key={plant.id} className="rounded border border-white/10 bg-white/[0.04] px-2 py-1 text-xs font-semibold text-zinc-300">
                                  {plant.name} / {stageLabels[plant.stage]}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            }) : (
              <EmptyState title="No rooms configured" body="Add a room first, then assign tents and plants so Catalyx can understand where each plant lives." />
            )}
          </div>
        </Panel>
        <div className="grid gap-6">
          <Panel className="p-5">
            <h2 className="text-xl font-black">Add room</h2>
            <form onSubmit={createRoom} className="mt-4 grid gap-3">
              <input value={roomForm.name} onChange={(event) => updateRoomForm('name', event.target.value)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]" placeholder="Main flower room" />
              <div className="grid gap-3 sm:grid-cols-2">
                <input value={roomForm.environmentType} onChange={(event) => updateRoomForm('environmentType', event.target.value)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]" placeholder="Controlled indoor room" />
                <input value={roomForm.location} onChange={(event) => updateRoomForm('location', event.target.value)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]" placeholder="Garage, shed, room 1" />
              </div>
              <textarea value={roomForm.notes} onChange={(event) => updateRoomForm('notes', event.target.value)} className="min-h-20 rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]" placeholder="Room notes, HVAC, humidity control, intake/exhaust context" />
              <button className="rounded-md bg-[#c8f500] px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-black">Save room</button>
            </form>
          </Panel>
          <Panel className="p-5">
            <h2 className="text-xl font-black">Add tent</h2>
            <form onSubmit={createTent} className="mt-4 grid gap-3">
              <select value={tentForm.roomId} onChange={(event) => updateTentForm('roomId', event.target.value)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]">
                <option value="">No room selected</option>
                {rooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}
              </select>
              <input value={tentForm.name} onChange={(event) => updateTentForm('name', event.target.value)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]" placeholder="Tent A" />
              <div className="grid gap-3 sm:grid-cols-3">
                <input value={tentForm.size} onChange={(event) => updateTentForm('size', event.target.value)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]" placeholder="1.2m x 1.2m" />
                <input value={tentForm.lightModel} onChange={(event) => updateTentForm('lightModel', event.target.value)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]" placeholder="LED model" />
                <input value={tentForm.airflow} onChange={(event) => updateTentForm('airflow', event.target.value)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]" placeholder="Exhaust / intake" />
              </div>
              <input value={tentForm.notes} onChange={(event) => updateTentForm('notes', event.target.value)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]" placeholder="Tent notes" />
              <button className="rounded-md bg-white px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-black">Save tent</button>
            </form>
          </Panel>
          <Panel className="p-5">
            <h2 className="text-xl font-black">Add plant</h2>
            <form onSubmit={createPlant} className="mt-4 grid gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <select value={plantForm.growId} onChange={(event) => updatePlantForm('growId', event.target.value)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]">
                  <option value="">Active grow</option>
                  {[currentGrow, ...grows.filter((grow) => grow.id !== currentGrow.id)].map((grow) => <option key={grow.id} value={grow.id}>{grow.name}</option>)}
                </select>
                <select value={plantForm.tentId} onChange={(event) => updatePlantForm('tentId', event.target.value)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]">
                  <option value="">No tent selected</option>
                  {tents.map((tent) => <option key={tent.id} value={tent.id}>{tent.name}</option>)}
                </select>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input value={plantForm.name} onChange={(event) => updatePlantForm('name', event.target.value)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]" placeholder="Plant 1" />
                <input value={plantForm.strain} onChange={(event) => updatePlantForm('strain', event.target.value)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]" placeholder="Strain" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <select value={plantForm.stage} onChange={(event) => updatePlantForm('stage', event.target.value as Stage)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]">
                  {stageOrder.map((stage) => <option key={stage} value={stage}>{stageLabels[stage]}</option>)}
                </select>
                <input value={plantForm.healthStatus} onChange={(event) => updatePlantForm('healthStatus', event.target.value)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]" placeholder="Stable" />
              </div>
              <textarea value={plantForm.notes} onChange={(event) => updatePlantForm('notes', event.target.value)} className="min-h-20 rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]" placeholder="Plant notes, phenotype, response, or issue context" />
              <button className="rounded-md border border-[#c8f500]/40 bg-[#c8f500]/10 px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#d9ff34]">Save plant</button>
            </form>
          </Panel>
        </div>
      </div>
      <div className="mt-6">
        <Panel className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-black">Saved grows</h2>
            <StatusPill tone={grows.length ? 'blue' : 'amber'}>{grows.length} saved</StatusPill>
          </div>
          {grows.length ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {grows.map((grow) => (
                <button
                  key={grow.id}
                  onClick={() => {
                    const nextGrows = [grow, ...grows.filter((item) => item.id !== grow.id)]
                    setGrows(nextGrows)
                    writeLocalList(storageKeys.grows, nextGrows)
                  }}
                  className="rounded-md border border-white/10 bg-black/30 p-4 text-left transition hover:border-[#c8f500]/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-white">{grow.name}</p>
                      <p className="mt-1 text-sm text-zinc-500">{grow.strain} / {mediumLabels[grow.medium]}</p>
                    </div>
                    <StatusPill tone="lime">{stageLabels[grow.stage]}</StatusPill>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">{grow.healthStatus}</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState title="No custom grows saved yet" body="Create a grow to replace the seeded active profile with your own room, stage, medium, goal, and notes." />
            </div>
          )}
        </Panel>
      </div>
    </ShellSection>
  )
}
