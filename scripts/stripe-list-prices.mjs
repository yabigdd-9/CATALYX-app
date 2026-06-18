/**
 * Lists recurring Stripe prices for Catalyx Pro env setup.
 * Requires a Stripe secret key in environment (loads .env.local if present).
 */
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

function loadEnvLocal() {
  const path = resolve(process.cwd(), '.env.local')
  if (!existsSync(path)) return
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const value = trimmed.slice(eq + 1).trim()
    if (!process.env[key]) process.env[key] = value
  }
}

loadEnvLocal()

function getMode() {
  const explicit = process.env.STRIPE_MODE?.trim().toLowerCase()
  if (explicit === 'live' || explicit === 'test') return explicit
  return process.env.NODE_ENV === 'production' ? 'live' : 'test'
}

function resolveSecretKey() {
  if (process.env.STRIPE_SECRET_KEY) {
    return { source: 'STRIPE_SECRET_KEY', secret: process.env.STRIPE_SECRET_KEY.trim() }
  }
  if (getMode() === 'live' && process.env.STRIPE_SECRET_KEY_LIVE) {
    return { source: 'STRIPE_SECRET_KEY_LIVE', secret: process.env.STRIPE_SECRET_KEY_LIVE.trim() }
  }
  if (getMode() === 'test' && process.env.STRIPE_SECRET_KEY_TEST) {
    return { source: 'STRIPE_SECRET_KEY_TEST', secret: process.env.STRIPE_SECRET_KEY_TEST.trim() }
  }
  return { source: 'missing', secret: '' }
}

const { source, secret } = resolveSecretKey()
if (!secret) {
  console.error('Set STRIPE_SECRET_KEY, STRIPE_SECRET_KEY_TEST, or STRIPE_SECRET_KEY_LIVE in .env.local first.')
  process.exit(1)
}

const keyKind = secret.startsWith('sk_live_') || secret.startsWith('rk_live_')
  ? 'LIVE'
  : secret.startsWith('sk_test_') || secret.startsWith('rk_test_')
    ? 'TEST'
    : 'UNKNOWN'

const res = await fetch('https://api.stripe.com/v1/prices?active=true&limit=100&expand[]=data.product', {
  headers: { Authorization: `Bearer ${secret}` },
})

if (!res.ok) {
  console.error('Stripe API error:', res.status)
  process.exit(1)
}

const { data } = await res.json()
const recurring = data.filter((p) => p.recurring)
const configuredProductId = process.env.STRIPE_PRODUCT_PRO
const configuredMonthly = process.env.STRIPE_PRICE_PRO_MONTHLY
const configuredYearly = process.env.STRIPE_PRICE_PRO_YEARLY

function productId(price) {
  return typeof price.product === 'object' ? price.product?.id : price.product
}

function productName(price) {
  return typeof price.product === 'object' ? price.product?.name ?? price.product?.id : price.product
}

function isCatalyxPrice(price) {
  const id = productId(price)
  const name = productName(price)
  return Boolean(
    (configuredProductId && id === configuredProductId) ||
      String(name ?? '').toLowerCase().includes('catalyx')
  )
}

console.log(`\nResolved secret key: ${source}`)
console.log(`Stripe mode requested: ${getMode().toUpperCase()}`)
console.log(`Stripe key kind: ${keyKind}\n`)
console.log('Recurring prices:\n')
for (const price of recurring) {
  const name = productName(price)
  const interval = price.recurring?.interval ?? '?'
  console.log(`  ${price.id}`)
  console.log(`    product: ${name}`)
  console.log(`    interval: ${interval}`)
  console.log(`    amount: ${(price.unit_amount ?? 0) / 100} ${(price.currency ?? '').toUpperCase()}\n`)
}

const catalyxRecurring = recurring.filter(isCatalyxPrice)
const pricePool = catalyxRecurring.length ? catalyxRecurring : recurring
const monthly = pricePool.filter((p) => p.recurring?.interval === 'month')
const yearly = pricePool.filter((p) => p.recurring?.interval === 'year')

if (configuredProductId || configuredMonthly || configuredYearly) {
  const configuredMonthlyPrice = recurring.find((p) => p.id === configuredMonthly)
  const configuredYearlyPrice = recurring.find((p) => p.id === configuredYearly)
  const configuredProduct = recurring.find((p) => productId(p) === configuredProductId)
  console.log('Configured .env.local check:')
  console.log(`  STRIPE_PRODUCT_PRO: ${configuredProduct ? `found (${productName(configuredProduct)})` : configuredProductId ? 'set but not found' : 'missing'}`)
  console.log(`  STRIPE_PRICE_PRO_MONTHLY: ${configuredMonthlyPrice ? `found (${productName(configuredMonthlyPrice)})` : 'missing or not found'}`)
  console.log(`  STRIPE_PRICE_PRO_YEARLY: ${configuredYearlyPrice ? `found (${productName(configuredYearlyPrice)})` : 'missing or not found'}\n`)
}

const suggestedProduct = monthly[0] || yearly[0]
if (suggestedProduct) {
  console.log(catalyxRecurring.length ? 'Suggested Catalyx env block:' : 'Suggested env block:')
  console.log(`STRIPE_PRODUCT_PRO=${productId(suggestedProduct)}`)
  if (monthly[0]) console.log(`STRIPE_PRICE_PRO_MONTHLY=${monthly[0].id}`)
  if (yearly[0]) console.log(`STRIPE_PRICE_PRO_YEARLY=${yearly[0].id}`)
  console.log(`STRIPE_MODE=${keyKind === 'LIVE' ? 'live' : 'test'}`)
}

console.log('\nNote: Stripe Price and Product IDs use the same prefixes in test and live mode. The environment you query is determined by the secret key above.')
