'use client'

import { useEffect, useState } from 'react'
import {
  defaultFeatureFlags,
  readFeatureFlags,
  writeFeatureFlags,
  type FeatureFlagRecord,
  type PlanTier,
} from '@/lib/feature-access'
import { adminFetch } from '@/lib/admin-client'
import { Panel, SaveBanner, StatusPill } from '@/components/catalyx-ui'

function mergeRemoteFlags(remote: Array<{ feature_key: string; plan_required: string; enabled: boolean }>) {
  const remoteKeys = new Set(remote.map((row) => row.feature_key))
  const merged = remote.map((row) => {
    const fallback = defaultFeatureFlags.find((f) => f.featureKey === row.feature_key)
    return {
      featureKey: row.feature_key,
      label: fallback?.label ?? row.feature_key,
      planRequired: (row.plan_required === 'professional' ? 'professional' : 'free') as PlanTier,
      enabled: row.enabled,
      description: fallback?.description ?? '',
    }
  })
  return [...merged, ...defaultFeatureFlags.filter((row) => !remoteKeys.has(row.featureKey))]
}

export default function AdminFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlagRecord[]>(() => readFeatureFlags())
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [remoteSync, setRemoteSync] = useState<'local' | 'supabase'>('local')
  const [loadMessage, setLoadMessage] = useState<string | undefined>()

  useEffect(() => {
    let active = true
    async function loadRemote() {
      try {
        const response = await adminFetch('/api/admin/feature-flags')
        const payload = await response.json()
        if (!active) return
        if (payload.ok && Array.isArray(payload.flags) && payload.flags.length) {
          setFlags(mergeRemoteFlags(payload.flags))
          setRemoteSync('supabase')
          setLoadMessage('Loaded from Supabase (service role on server).')
        } else if (!payload.ok) {
          setLoadMessage(payload.error ?? 'Using local feature flags (service role not configured).')
        }
      } catch {
        if (active) setLoadMessage('Using local feature flags.')
      }
    }
    loadRemote()
    return () => {
      active = false
    }
  }, [])

  function updateFlag(featureKey: string, patch: Partial<FeatureFlagRecord>) {
    setFlags((current) => current.map((row) => (row.featureKey === featureKey ? { ...row, ...patch } : row)))
  }

  function resetDefaults() {
    setFlags(defaultFeatureFlags)
  }

  async function save() {
    setStatus('saving')
    writeFeatureFlags(flags)

    try {
      const response = await adminFetch('/api/admin/feature-flags', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flags: flags.map((flag) => ({
            feature_key: flag.featureKey,
            plan_required: flag.planRequired,
            enabled: flag.enabled,
          })),
        }),
      })
      const payload = await response.json()
      if (payload.ok) {
        setRemoteSync('supabase')
        setStatus('saved')
        return
      }
      setStatus('error')
      setLoadMessage(payload.error ?? 'Saved locally only; configure SUPABASE_SERVICE_ROLE_KEY on the server.')
    } catch {
      setStatus('error')
      setLoadMessage('Saved locally only; could not reach admin API.')
    }
  }

  return (
    <Panel className="mt-6 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black">Free vs Catalyx Pro access</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Control which features stay on the Free plan and which require Catalyx Pro. Saves locally and syncs to Supabase `feature_flags` when `SUPABASE_SERVICE_ROLE_KEY` is set on the server.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusPill tone="blue">{flags.filter((row) => row.planRequired === 'professional').length} Pro features</StatusPill>
          <StatusPill tone={remoteSync === 'supabase' ? 'lime' : 'amber'}>{remoteSync === 'supabase' ? 'Supabase sync' : 'Local only'}</StatusPill>
        </div>
      </div>
      <div className="mt-5 grid gap-3">
        {flags.map((flag) => (
          <div key={flag.featureKey} className="grid gap-3 rounded-md border border-white/10 bg-black/30 p-4 md:grid-cols-[1.2fr_0.5fr_0.5fr_auto] md:items-center">
            <div>
              <p className="font-bold text-white">{flag.label}</p>
              <p className="mt-1 text-xs text-zinc-500">{flag.featureKey}</p>
              <p className="mt-2 text-sm text-zinc-400">{flag.description}</p>
            </div>
            <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Plan
              <select
                value={flag.planRequired}
                onChange={(event) => updateFlag(flag.featureKey, { planRequired: event.target.value as PlanTier })}
                className="rounded-md border border-white/10 bg-black px-3 py-2 text-sm text-white"
              >
                <option value="free">Free</option>
                <option value="professional">Catalyx Pro</option>
              </select>
            </label>
            <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Enabled
              <select
                value={flag.enabled ? 'yes' : 'no'}
                onChange={(event) => updateFlag(flag.featureKey, { enabled: event.target.value === 'yes' })}
                className="rounded-md border border-white/10 bg-black px-3 py-2 text-sm text-white"
              >
                <option value="yes">On</option>
                <option value="no">Off</option>
              </select>
            </label>
            <StatusPill tone={flag.planRequired === 'professional' ? 'lime' : 'blue'}>{flag.planRequired === 'professional' ? 'Pro' : 'Free'}</StatusPill>
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={save} className="rounded-md bg-[#c8f500] px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-black">
          Save feature access
        </button>
        <button onClick={resetDefaults} className="rounded-md border border-white/15 px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-white">
          Reset to defaults
        </button>
      </div>
      <SaveBanner
        status={status}
        message={
          loadMessage ??
          (remoteSync === 'supabase'
            ? 'Feature access saved to Supabase and local cache. ProGate reads flags on the next page load.'
            : 'Feature access saved locally. Set SUPABASE_SERVICE_ROLE_KEY to persist to Supabase.')
        }
      />
    </Panel>
  )
}
