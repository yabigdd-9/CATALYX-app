import { supabaseAuth } from '@/lib/auth'

function stripAuthParams(url: URL) {
  for (const key of ['code', 'state', 'type', 'error', 'error_code', 'error_description']) {
    url.searchParams.delete(key)
  }
  return url
}

export async function exchangeSupabaseSessionFromUrl() {
  if (typeof window === 'undefined' || !supabaseAuth) {
    return { error: null as string | null, exchanged: false }
  }

  const currentUrl = new URL(window.location.href)
  const code = currentUrl.searchParams.get('code')
  if (!code) {
    return { error: null as string | null, exchanged: false }
  }

  const { error } = await supabaseAuth.auth.exchangeCodeForSession(code)
  if (error) {
    return { error: error.message, exchanged: true }
  }

  const nextUrl = stripAuthParams(currentUrl)
  window.history.replaceState({}, '', `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`)
  return { error: null as string | null, exchanged: true }
}
