import { expect, test } from '@playwright/test'

const lockedKitNames = [
  'Base Kit',
  'Core Kit',
  'Enhancement Kit',
  'Final Stage Kit',
  'Performance Kit',
  'Complete Kit',
] as const

test.describe('public storefront launch surfaces', () => {
  test('homepage gives first-time visitors a clear starting path on mobile', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    await expect(page).toHaveTitle(/Catalyx Labs/i)
    await expect(page.getByRole('heading', { name: 'Know where to start. Know what each product does.' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Start in four simple moves.' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'How the system is structured' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Start with Base Kit' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Compare all kits' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Find your feed plan' })).toBeVisible()

    const kitsSection = page.locator('section').filter({ has: page.getByRole('heading', { name: /One locked naming system/i }) }).first()
    for (const kitName of lockedKitNames) {
      await expect(kitsSection.getByRole('heading', { name: kitName, exact: true })).toBeVisible()
    }
  })

  test('kits page uses locked kit names and directs users into Base Kit first', async ({ page }) => {
    await page.goto('/preorder', { waitUntil: 'domcontentloaded' })

    await expect(page.getByRole('heading', { name: 'Choose the right Catalyx kit.' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'View Base Kit' }).first()).toHaveAttribute('href', '/kits/base-kit')

    for (const kitName of lockedKitNames) {
      await expect(page.getByRole('heading', { name: kitName, exact: true }).last()).toBeVisible()
    }
  })

  test('kit detail page keeps direct trustworthy calls to action', async ({ page }) => {
    await page.goto('/kits/base-kit', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { name: 'Base Kit', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Add full kit to cart' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Why Base Kit feels safer to buy publicly' })).toBeVisible()
  })

  test('product page keeps direct trustworthy calls to action', async ({ page }) => {
    await page.goto('/products/ax-pro', { waitUntil: 'domcontentloaded' })

    await expect(page.getByRole('link', { name: 'Open feed chart' })).toBeVisible()
    await expect(page.getByText('Included in kits')).toBeVisible()
    await expect(page.getByText('Included in kits').locator('..').getByRole('link', { name: 'Base Kit', exact: true })).toBeVisible()
    await expect(page.getByText('Product-page trust signals')).toBeVisible()
  })

  test('support and team pages keep direct trustworthy calls to action', async ({ page }) => {
    await page.goto('/contact', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { name: 'Contact Catalyx Labs' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Compare kits' })).toBeVisible()
    await expect(page.locator('body')).not.toContainText('does not persist')

    await page.goto('/team', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { name: 'Catalyx team' })).toBeVisible()
    await expect(page.getByText('Founder & CEO')).toBeVisible()
    await expect(page.getByText('CTO')).toBeVisible()
  })
})
