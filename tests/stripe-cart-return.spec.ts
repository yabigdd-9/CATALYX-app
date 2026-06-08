import { expect, test } from '@playwright/test'

const sessionId = 'cs_test_cart_polling_success'
const seededCart = {
  state: {
    items: [
      { productId: 'ax-pro', quantity: 1, price: 49.99 },
      { productId: 'bx-pro', quantity: 1, price: 49.99 },
    ],
  },
  version: 0,
}

test.describe('product checkout return flow', () => {
  test('keeps cancellation returns readable and actionable on mobile', async ({ page }) => {
    await page.addInitScript((cart) => {
      window.localStorage.setItem('catalyx-cart', JSON.stringify(cart))
    }, seededCart)

    await page.goto('/cart?checkout=cancelled', { waitUntil: 'domcontentloaded' })

    await expect(page.locator('body')).toContainText('Your cart is still ready.')
    await expect(page.getByRole('link', { name: 'Review cart' })).toBeVisible()
    await expect(page.locator('#cart-summary')).toBeVisible()
    await expect(page.getByText('NZD $109.98')).toBeVisible()
  })

  test('settles to confirmed on the first success return after short verification polling', async ({ page }) => {
    let statusChecks = 0

    await page.addInitScript((cart) => {
      window.localStorage.setItem('catalyx-cart', JSON.stringify(cart))
    }, seededCart)

    await page.route('**/api/stripe/checkout-status?**', async (route) => {
      const requestUrl = new URL(route.request().url())
      expect(requestUrl.searchParams.get('session_id')).toBe(sessionId)

      statusChecks += 1
      const confirmed = statusChecks >= 3

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          complete: confirmed,
          paid: confirmed,
          mode: 'payment',
          checkoutType: 'product_order',
        }),
      })
    })

    await page.goto(`/cart?checkout=success&session_id=${sessionId}`, { waitUntil: 'domcontentloaded' })

    await expect.poll(() => statusChecks).toBeGreaterThanOrEqual(1)
    await expect(page.getByText('Your Catalyx order is confirmed.')).toBeVisible()
    await expect(page.getByText('Your cart is empty')).toBeVisible()
    await expect(page.getByText(sessionId)).toBeVisible()
    await expect.poll(() => statusChecks).toBeGreaterThanOrEqual(3)

    const persistedCart = await page.evaluate(() => window.localStorage.getItem('catalyx-cart'))
    expect(persistedCart).not.toBeNull()
    expect(JSON.parse(persistedCart ?? '{}')).toEqual({
      state: { items: [] },
      version: 0,
    })
  })

  test('falls back to a retryable verification error when the returned session is not a product order', async ({ page }) => {
    await page.addInitScript((cart) => {
      window.localStorage.setItem('catalyx-cart', JSON.stringify(cart))
    }, seededCart)

    await page.route('**/api/stripe/checkout-status?**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          complete: true,
          paid: true,
          mode: 'subscription',
          checkoutType: 'subscription',
          error: 'The returned Stripe session is not a Catalyx product order.',
        }),
      })
    })

    await page.goto('/cart?checkout=success&session_id=cs_test_cart_wrong_type', { waitUntil: 'domcontentloaded' })

    await expect(page.getByText('We could not verify this order yet.')).toBeVisible()
    await expect(page.getByText('The returned Stripe session is not a Catalyx product order.')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Retry verification' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'A-X PRO' }).first()).toBeVisible()
  })
})
