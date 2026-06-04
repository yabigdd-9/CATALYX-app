import { supabaseAuth } from '@/lib/auth'

export async function adminFetch(input: string, init: RequestInit = {}) {
  const { data } = supabaseAuth ? await supabaseAuth.auth.getSession() : { data: { session: null } }
  const token = data.session?.access_token

  return fetch(input, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
}
