import { authIsConfigured } from '@/lib/auth'
import { supabaseAnonKey, supabaseUrl } from '@/lib/supabase'

/**
 * Heuristic: anon cannot read users (RLS on), but can read public catalogue tables.
 * Requires seed data on products (or another public table).
 */
export async function verifyRlsHardening(): Promise<boolean> {
  if (process.env.SUPABASE_RLS_APPLIED === 'true') return true
  if (!authIsConfigured || !supabaseUrl || !supabaseAnonKey) return false

  const headers = {
    apikey: supabaseAnonKey,
    Authorization: `Bearer ${supabaseAnonKey}`,
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3500)
    const [usersRes, productsRes] = await Promise.all([
      fetch(`${supabaseUrl}/rest/v1/users?select=id&limit=1`, { headers, cache: 'no-store', signal: controller.signal }),
      fetch(`${supabaseUrl}/rest/v1/products?select=id&limit=1`, { headers, cache: 'no-store', signal: controller.signal }),
    ])
    clearTimeout(timeout)

    if (!productsRes.ok) return false

    const usersLockedByGrant = usersRes.status === 401 || usersRes.status === 403
    if (!usersRes.ok && !usersLockedByGrant) return false

    const users = usersRes.ok ? ((await usersRes.json()) as unknown[]) : []
    const products = (await productsRes.json()) as unknown[]

    const usersLocked = usersLockedByGrant || (Array.isArray(users) && users.length === 0)
    const catalogueReadable = Array.isArray(products) && products.length > 0

    return usersLocked && catalogueReadable
  } catch {
    return false
  }
}
