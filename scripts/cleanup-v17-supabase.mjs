import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

function loadEnvFile(path) {
  const env = {}
  const content = readFileSync(path, 'utf8')
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const index = line.indexOf('=')
    if (index === -1) continue
    const key = line.slice(0, index).trim()
    const value = line.slice(index + 1).trim().replace(/^['"]|['"]$/g, '')
    env[key] = value
  }
  return env
}

const env = { ...loadEnvFile('.env.local'), ...process.env }
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local.')
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function countIronX() {
  const checks = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('id', 'iron-x'),
    supabase.from('product_inventory').select('id', { count: 'exact', head: true }).eq('product_id', 'iron-x'),
    supabase.from('feed_chart').select('id', { count: 'exact', head: true }).eq('product_id', 'iron-x'),
    supabase.from('protocols').select('id, products_used'),
  ])

  for (const result of checks) {
    if (result.error) throw new Error(result.error.message)
  }

  const protocolsWithIronX = (checks[3].data ?? []).filter((protocol) =>
    Array.isArray(protocol.products_used) && protocol.products_used.includes('IRON-X')
  ).length

  return {
    products: checks[0].count ?? 0,
    product_inventory: checks[1].count ?? 0,
    feed_chart: checks[2].count ?? 0,
    protocols: protocolsWithIronX,
  }
}

async function main() {
  const { data: protocols, error: protocolError } = await supabase
    .from('protocols')
    .select('id, products_used')

  if (protocolError) throw new Error(protocolError.message)

  for (const protocol of protocols ?? []) {
    if (!Array.isArray(protocol.products_used) || !protocol.products_used.includes('IRON-X')) continue
    const productsUsed = protocol.products_used.map((product) => (product === 'IRON-X' ? 'MICRO-X' : product))
    const { error } = await supabase.from('protocols').update({ products_used: productsUsed }).eq('id', protocol.id)
    if (error) throw new Error(error.message)
  }

  for (const [table, column] of [
    ['product_inventory', 'product_id'],
    ['feed_chart', 'product_id'],
    ['products', 'id'],
  ]) {
    const { error } = await supabase.from(table).delete().eq(column, 'iron-x')
    if (error) throw new Error(error.message)
  }

  const counts = await countIronX()
  console.log(JSON.stringify({ ok: true, ironXRemaining: counts }, null, 2))
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
