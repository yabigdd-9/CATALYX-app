'use client'

import { useEffect, useMemo, useState } from 'react'
import { readLocalList, storageKeys, writeLocalList } from '@/lib/persistence'
import { MetricCard, Panel, SaveBanner, StatusPill } from '@/components/catalyx-ui'
import { loadEnvironmentLogsFromSupabase, saveEnvironmentLogToSupabase } from '@/lib/supabase-services'

type EnvironmentLog = {
  id: string
  loggedAt: string
  temperature: number
  humidity: number
  vpd: number
  reservoirTemp: number
  waterTemp: number
  ppfd: number
  dli: number
  runoffAmount: number
  note: string
}

const seedLogs: EnvironmentLog[] = [
  {
    id: 'env-1',
    loggedAt: 'May 16 AM',
    temperature: 25,
    humidity: 58,
    vpd: 1.18,
    reservoirTemp: 20,
    waterTemp: 20,
    ppfd: 720,
    dli: 31,
    runoffAmount: 14,
    note: 'Stable lights-on window with mild humidity drift.',
  },
  {
    id: 'env-2',
    loggedAt: 'May 15 PM',
    temperature: 24,
    humidity: 61,
    vpd: 1.05,
    reservoirTemp: 20,
    waterTemp: 19,
    ppfd: 700,
    dli: 30,
    runoffAmount: 12,
    note: 'Good recovery after irrigation.',
  },
]

function scoreEnvironment(logs: EnvironmentLog[]) {
  const latest = logs[0] ?? seedLogs[0]
  let score = 100
  if (latest.temperature < 20 || latest.temperature > 29) score -= 16
  if (latest.humidity < 45 || latest.humidity > 70) score -= 14
  if (latest.vpd < 0.8 || latest.vpd > 1.45) score -= 18
  if (latest.reservoirTemp > 22 || latest.waterTemp > 22) score -= 14
  if (latest.ppfd < 500 || latest.ppfd > 950) score -= 10
  return Math.max(45, score)
}

function environmentVerdict(log: EnvironmentLog) {
  if (log.vpd > 1.45) return 'VPD is high. Watch dryback speed and avoid aggressive feed increases.'
  if (log.vpd < 0.8) return 'VPD is low. Watch humidity and airflow before assuming nutrient deficiency.'
  if (log.reservoirTemp > 22 || log.waterTemp > 22) return 'Water temperature is elevated. Watch root-zone oxygen and biofilm risk.'
  return 'Environment is stable enough to support the current feed recommendation.'
}

export default function EnvironmentLogger() {
  const [logs, setLogs] = useState<EnvironmentLog[]>(() => {
    const saved = readLocalList<EnvironmentLog>(storageKeys.environmentLogs)
    return saved.length ? saved : seedLogs
  })
  const [form, setForm] = useState<Omit<EnvironmentLog, 'id' | 'loggedAt'>>({
    temperature: 25,
    humidity: 58,
    vpd: 1.18,
    reservoirTemp: 20,
    waterTemp: 20,
    ppfd: 720,
    dli: 31,
    runoffAmount: 14,
    note: 'Stable room conditions.',
  })
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [message, setMessage] = useState('Environment log saved locally.')
  const latest = logs[0]
  const score = useMemo(() => scoreEnvironment(logs), [logs])

  useEffect(() => {
    let alive = true
    loadEnvironmentLogsFromSupabase()
      .then((remoteLogs) => {
        if (!alive || !remoteLogs.length) return
        setLogs(remoteLogs)
        writeLocalList(storageKeys.environmentLogs, remoteLogs)
      })
      .catch(() => {
        if (!alive) return
        setMessage('Using local environment history until Supabase is reachable.')
      })
    return () => {
      alive = false
    }
  }, [])

  function updateNumber(key: keyof Omit<EnvironmentLog, 'id' | 'loggedAt' | 'note'>, value: number) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function saveLog() {
    setStatus('saving')
    setMessage('Saving environment log...')
    const nextLog: EnvironmentLog = {
      ...form,
      id: `env-${Date.now()}`,
      loggedAt: new Date().toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
    }
    const next = [nextLog, ...logs].slice(0, 20)
    setLogs(next)
    writeLocalList(storageKeys.environmentLogs, next)
    try {
      const result = await saveEnvironmentLogToSupabase(form)
      setStatus('saved')
      setMessage(result.message)
    } catch {
      setStatus('saved')
      setMessage('Environment log saved locally. Supabase sync failed and can be retried later.')
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="grid gap-4">
        <MetricCard label="Environment Consistency" value={score} note={environmentVerdict(latest)} accent="#33d9ff" />
        <Panel className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-black text-white">Environment signal</h2>
            <StatusPill tone={score >= 82 ? 'lime' : score >= 68 ? 'amber' : 'red'}>{score >= 82 ? 'Stable' : score >= 68 ? 'Monitor' : 'Correct'}</StatusPill>
          </div>
          <p className="mt-4 text-sm leading-6 text-zinc-400">
            Catalyx uses environment context to avoid bad feed decisions. A nutrient symptom can be caused by VPD, temperature, humidity, or root-zone conditions.
          </p>
        </Panel>
      </div>

      <Panel className="p-5">
        <h2 className="text-2xl font-black">Log environment</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <NumberField label="Temperature C" value={form.temperature} setValue={(value) => updateNumber('temperature', value)} />
          <NumberField label="Humidity %" value={form.humidity} setValue={(value) => updateNumber('humidity', value)} />
          <NumberField label="VPD" value={form.vpd} step={0.01} setValue={(value) => updateNumber('vpd', value)} />
          <NumberField label="Reservoir temp C" value={form.reservoirTemp} setValue={(value) => updateNumber('reservoirTemp', value)} />
          <NumberField label="Water temp C" value={form.waterTemp} setValue={(value) => updateNumber('waterTemp', value)} />
          <NumberField label="PPFD" value={form.ppfd} setValue={(value) => updateNumber('ppfd', value)} />
          <NumberField label="DLI" value={form.dli} setValue={(value) => updateNumber('dli', value)} />
          <NumberField label="Runoff amount %" value={form.runoffAmount} setValue={(value) => updateNumber('runoffAmount', value)} />
        </div>
        <textarea
          value={form.note}
          onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
          className="mt-3 min-h-24 w-full rounded-md border border-white/10 bg-black px-3 py-3 text-sm leading-6 text-white outline-none focus:border-[#c8f500]"
          placeholder="Room notes, light cycle, airflow, dryback, reservoir condition"
        />
        <button onClick={saveLog} className="mt-3 rounded-md bg-[#c8f500] px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-black">Save environment log</button>
        <div className="mt-4">
          <SaveBanner status={status} message={message} />
        </div>
      </Panel>

      <Panel className="lg:col-span-2">
        <div className="border-b border-white/10 p-5">
          <h2 className="text-2xl font-black">Recent environment history</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-white/[0.03] text-xs uppercase tracking-[0.16em] text-zinc-500">
              <tr>
                <th className="p-4">Time</th>
                <th className="p-4">Temp</th>
                <th className="p-4">Humidity</th>
                <th className="p-4">VPD</th>
                <th className="p-4">Water</th>
                <th className="p-4">PPFD</th>
                <th className="p-4">DLI</th>
                <th className="p-4">Note</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t border-white/10">
                  <td className="p-4 font-bold text-white">{log.loggedAt}</td>
                  <td className="p-4 text-zinc-300">{log.temperature} C</td>
                  <td className="p-4 text-zinc-300">{log.humidity}%</td>
                  <td className="p-4 text-zinc-300">{log.vpd}</td>
                  <td className="p-4 text-zinc-300">{log.waterTemp} C</td>
                  <td className="p-4 text-zinc-300">{log.ppfd}</td>
                  <td className="p-4 text-zinc-300">{log.dli}</td>
                  <td className="p-4 text-zinc-400">{log.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

function NumberField({ label, value, setValue, step = 1 }: { label: string; value: number; setValue: (value: number) => void; step?: number }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-zinc-300">
      {label}
      <input
        value={value}
        step={step}
        type="number"
        onChange={(event) => setValue(Number(event.target.value))}
        className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]"
      />
    </label>
  )
}
