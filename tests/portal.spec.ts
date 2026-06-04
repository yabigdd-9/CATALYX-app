import { expect, test, type Page } from '@playwright/test'

const authUserId = '7300d97b-fbd3-4385-bd74-3281d564b875'
const appUserId = '98a20aac-0025-41be-859d-8da2f211ee7b'
const typedEmail = 'portal@example.com'
const supabaseAuthStorageKey = 'sb-lqoqxalmimpmrmlqcaft-auth-token'

async function mockSignedInPortal(page: Page) {
  await page.addInitScript(({ authKey, appUser }) => {
    window.localStorage.setItem('catalyx-auth-user', JSON.stringify(appUser))
    window.localStorage.setItem(authKey, JSON.stringify({
      access_token: 'test-access-token',
      refresh_token: 'test-refresh-token',
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      user: {
        id: appUser.id,
        email: appUser.email,
        user_metadata: { name: appUser.name },
      },
    }))
  }, {
    authKey: supabaseAuthStorageKey,
    appUser: { id: authUserId, email: typedEmail, name: 'Portal Grower', plan: 'free' },
  })

  await page.route('**/auth/v1/user', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: authUserId,
        email: typedEmail,
        user_metadata: { name: 'Portal Grower' },
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
        full_name: 'Portal Grower',
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

  await page.route('**/api/portal/orders', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        orders: [
          {
            id: 'order-portal-1',
            stripe_checkout_session_id: 'cs_test_portal_order',
            customer_email: typedEmail,
            order_lines: [{ product_id: 'ax-pro', quantity: 1 }],
            amount_total: 49.99,
            currency: 'nzd',
            status: 'paid',
            created_at: '2026-06-02T03:12:00.000Z',
          },
        ],
      }),
    })
  })

  await page.route('**/api/documents', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        documents: [
          {
            id: 'public-feed-chart',
            user_id: null,
            title: 'Catalyx master feed chart',
            document_type: 'feed_chart',
            description: 'Public nutrient reference for QR labels, product education, and feed planning.',
            public_url: '/feed-chart',
            storage_bucket: null,
            storage_path: null,
            is_private: false,
            published: true,
            created_at: '2026-06-01T00:00:00.000Z',
          },
          {
            id: 'public-product-guide',
            user_id: null,
            title: 'Product guide',
            document_type: 'guide',
            description: 'Browse Catalyx product roles, stage support, and usage context.',
            public_url: '/product-guide',
            storage_bucket: null,
            storage_path: null,
            is_private: false,
            published: true,
            created_at: '2026-06-01T00:00:00.000Z',
          },
        ],
      }),
    })
  })
}

test.describe('customer portal', () => {
  test('protects the portal when signed out', async ({ page }) => {
    await page.addInitScript((authKey) => {
      window.localStorage.removeItem('catalyx-auth-user')
      window.localStorage.removeItem(authKey)
    }, supabaseAuthStorageKey)

    await page.route('**/auth/v1/user', async (route) => {
      await route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'not signed in' }) })
    })

    await page.goto('/portal', { waitUntil: 'domcontentloaded' })

    await expect(page.getByRole('heading', { name: 'Customer portal' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Sign in required' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Login' })).toBeVisible()
  })

  test('shows signed-in portal overview, nav, and order summary', async ({ page }) => {
    await mockSignedInPortal(page)
    await page.route('**/api/support/tickets', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          tickets: [
            {
              id: 'ticket-1',
              user_id: appUserId,
              subject: 'Order support',
              category: 'order',
              status: 'open',
              priority: 'normal',
              last_message_preview: 'Can you confirm my receipt?',
              created_at: '2026-06-02T03:12:00.000Z',
              updated_at: '2026-06-02T03:12:00.000Z',
            },
          ],
        }),
      })
    })
    await page.route('**/api/notifications', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          notifications: [
            {
              id: 'notification-1',
              user_id: appUserId,
              notification_type: 'order',
              title: 'Order captured',
              body: 'Your signed-in Catalyx order was saved.',
              href: '/portal/orders',
              read_at: null,
              created_at: '2026-06-02T03:12:00.000Z',
            },
          ],
        }),
      })
    })

    await page.goto('/portal', { waitUntil: 'domcontentloaded' })

    await expect(page.getByRole('link', { name: 'Orders' })).toBeVisible()
    await expect(page.getByText('Can you confirm my receipt?')).toBeVisible()
    await expect(page.getByText('Latest order is paid.')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Open Grow OS' })).toBeVisible()
  })

  test('creates a support ticket from portal support', async ({ page }) => {
    await mockSignedInPortal(page)
    await page.route('**/api/support/tickets', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            ok: true,
            ticket: {
              id: 'ticket-created',
              user_id: appUserId,
              product_order_id: null,
              subject: 'Need billing help',
              category: 'billing',
              status: 'open',
              priority: 'normal',
              last_message_preview: 'Please help with my invoice.',
              created_at: '2026-06-02T03:12:00.000Z',
              updated_at: '2026-06-02T03:12:00.000Z',
            },
          }),
        })
        return
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, tickets: [] }) })
    })

    await page.goto('/portal/support', { waitUntil: 'domcontentloaded' })
    await page.getByLabel('Subject').fill('Need billing help')
    await page.getByLabel('Category').selectOption('billing')
    await page.getByLabel('Message').fill('Please help with my invoice.')
    await page.getByRole('button', { name: 'Create ticket' }).click()

    await expect(page.getByText('Support ticket created.')).toBeVisible()
    await expect(page.getByText('Need billing help')).toBeVisible()
  })

  test('shows public documents and marks notifications read', async ({ page }) => {
    await mockSignedInPortal(page)
    await page.route('**/api/support/tickets', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, tickets: [] }) })
    })
    await page.route('**/api/notifications', async (route) => {
      if (route.request().method() === 'PATCH') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) })
        return
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          notifications: [
            {
              id: 'notification-1',
              user_id: appUserId,
              notification_type: 'support',
              title: 'Support replied',
              body: 'Your support ticket has an update.',
              href: '/portal/support',
              read_at: null,
              created_at: '2026-06-02T03:12:00.000Z',
            },
          ],
        }),
      })
    })

    await page.goto('/portal/documents', { waitUntil: 'domcontentloaded' })
    await expect(page.getByText('Catalyx master feed chart')).toBeVisible()
    await expect(page.getByText('Product guide')).toBeVisible()

    await page.goto('/portal/notifications', { waitUntil: 'domcontentloaded' })
    await expect(page.getByText('Support replied')).toBeVisible()
    await page.getByRole('button', { name: 'Mark read' }).click()
    await expect(page.getByText('Notification marked read.')).toBeVisible()
  })
})
