import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const hasSupabase = Boolean(supabaseUrl && supabaseAnonKey)
export const hasSupabaseAdmin = Boolean(supabaseUrl && supabaseServiceRoleKey)
export { supabaseUrl, supabaseAnonKey, supabaseServiceRoleKey }

export const supabaseServer = hasSupabase && supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export const supabaseAdmin = hasSupabaseAdmin && supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null

export async function supabaseRest<T>(table: string, init?: RequestInit): Promise<T | null> {
  if (!hasSupabase || !supabaseUrl || !supabaseAnonKey) return null

  const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
    ...init,
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(init?.headers ?? {}),
    },
  })

  if (!response.ok) {
    throw new Error(`Supabase REST request failed: ${response.status}`)
  }

  return response.json() as Promise<T>
}

export async function uploadSupabaseFile({
  bucket,
  path,
  file,
}: {
  bucket: string
  path: string
  file: File
}) {
  if (!supabaseServer) {
    return { url: URL.createObjectURL(file), source: 'local' as const, error: null }
  }

  const { error } = await supabaseServer.storage.from(bucket).upload(path, file, {
    upsert: true,
    contentType: file.type,
  })

  if (error) {
    return { url: URL.createObjectURL(file), source: 'local' as const, error: error.message }
  }

  const { data } = supabaseServer.storage.from(bucket).getPublicUrl(path)
  return { url: data.publicUrl, source: 'supabase' as const, error: null }
}
