import { expect, test, type Page } from '@playwright/test'

const authUserId = '7300d97b-fbd3-4385-bd74-3281d564b875'
const appUserId = '98a20aac-0025-41be-859d-8da2f211ee7b'
const typedEmail = 'grower@example.com'
const typedPassword = 'S3curePass?'
const authStorageKey = 'catalyx-auth-user'

test.describe.configure({ timeout: 120_000 })

function seedStoredUser(page: Page, overrides: Partial<{ id: string; email: string; name: string; plan: string }> = {}) {
  return page.addInitScript(
    ({
      authStorageKey,
      authUserId,
      typedEmail,
      overrides,
    }: {
      authStorageKey: string
      authUserId: string
      typedEmail: string
      overrides: Partial<{ id: string; email: string; name: string; plan: string }>
    }) => {
      window.localStorage.setItem(
        authStorageKey,
        JSON.stringify({
          id: overrides.id ?? authUserId,
          email: overrides.email ?? typedEmail,
          name: overrides.name ?? 'Test Grower',
          plan: overrides.plan ?? 'free',
        })
      )
    },
    { authStorageKey, authUserId, typedEmail, overrides }
  )
}

test.describe('login flow', () => {
  test('starts blank and redirects to the requested path after login', async ({ page }) => {
    await page.route('**/auth/v1/user', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: authUserId,
          email: typedEmail,
          user_metadata: { name: 'Test Grower' },
        }),
      })
    })

    await page.route('**/rest/v1/users**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: appUserId,
          auth_user_id: authUserId,
          email: typedEmail,
          full_name: 'Test Grower',
          subscription_status: 'free',
        }),
      })
    })

    await page.route('**/rest/v1/user_plan**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ plan: 'free' }),
      })
    })

    await page.route('**/rest/v1/subscriptions**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ plan: 'free', status: 'inactive' }),
      })
    })

    await page.goto('/login?next=/products', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await page.waitForTimeout(1000)

    const emailInput = page.locator('input[type="email"]')
    const passwordInput = page.locator('input[type="password"]')
    await expect(async () => {
      await emailInput.fill(typedEmail)
      await passwordInput.fill(typedPassword)
      await expect(emailInput).toHaveValue(typedEmail, { timeout: 1000 })
      await expect(passwordInput).toHaveValue(typedPassword, { timeout: 1000 })
    }).toPass({ timeout: 20_000 })
    await page.getByRole('button', { name: 'Login to Grow OS' }).click()

    await page.waitForURL('**/products')
  })

  test('shows signed-in product order history and receipt actions on account', async ({ page }) => {
    await seedStoredUser(page)

    await page.route('**/auth/v1/user', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: authUserId,
          email: typedEmail,
          user_metadata: { name: 'Test Grower' },
        }),
      })
    })

    await page.route('**/rest/v1/users**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: appUserId,
          auth_user_id: authUserId,
          email: typedEmail,
          full_name: 'Test Grower',
          subscription_status: 'free',
        }),
      })
    })

    await page.route('**/rest/v1/user_plan**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ plan: 'free' }),
      })
    })

    await page.route('**/rest/v1/subscriptions**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ plan: 'free', status: 'inactive' }),
      })
    })

    await page.route('**/api/portal/orders**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          orders: [
            {
              id: 'order-1',
              stripe_checkout_session_id: 'cs_test_account_order',
              customer_email: typedEmail,
              order_lines: [
                { product_id: 'ax-pro', quantity: 1 },
                { product_id: 'bx-pro', quantity: 2 },
              ],
              amount_total: 149.97,
              subtotal_cents: 14997,
              store_credit_applied_cents: 0,
              refunded_amount_cents: 0,
              currency: 'nzd',
              status: 'paid',
              created_at: '2026-06-02T03:12:00.000Z',
            },
          ],
        }),
      })
    })

    await page.route('**/api/rewards/migrate**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          source: 'supabase',
          migrated: false,
          wallet: {
            balanceCx: 0,
            tier: 'free',
            storeCreditBalanceCents: 0,
            pendingStoreCreditCents: 0,
          },
          appUserId: appUserId,
        }),
      })
    })

    await page.route('**/api/rewards/sync**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          source: 'supabase',
          wallet: {
            balanceCx: 0,
            tier: 'free',
            storeCreditBalanceCents: 0,
            pendingStoreCreditCents: 0,
          },
          appUserId: appUserId,
        }),
      })
    })

    await page.goto('/account', { waitUntil: 'domcontentloaded' })

    await expect(page.getByRole('heading', { name: 'Recent product orders' })).toBeVisible()
    await expect(page.getByText('cs_test_account_order')).toBeVisible()
    await expect(page.getByText('1 x A-X PRO')).toBeVisible()
    await expect(page.getByText('2 x B-X PRO')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Copy reference' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Request receipt' })).toBeVisible()
  })
})
