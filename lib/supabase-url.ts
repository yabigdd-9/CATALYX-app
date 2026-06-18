export function resolveSupabaseUrl(value?: string) {
  const trimmed = value?.trim()
  if (!trimmed) return undefined

  try {
    return new URL(trimmed).origin
  } catch {
    let normalized = trimmed
    const lower = normalized.toLowerCase()
    if (lower.endsWith('/rest/v1/')) {
      normalized = normalized.slice(0, -'/rest/v1/'.length)
    } else if (lower.endsWith('/rest/v1')) {
      normalized = normalized.slice(0, -'/rest/v1'.length)
    }
    while (normalized.endsWith('/')) {
      normalized = normalized.slice(0, -1)
    }
    return normalized || undefined
  }
}
