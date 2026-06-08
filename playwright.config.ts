import { defineConfig } from '@playwright/test'

const port = Number(process.env.PLAYWRIGHT_PORT ?? '3012')
const host = process.env.PLAYWRIGHT_HOST ?? '127.0.0.1'
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://${host}:${port}`

export default defineConfig({
  testDir: './tests',
  timeout: 45_000,
  workers: 1,
  expect: {
    timeout: 20_000,
  },
  fullyParallel: false,
  reporter: 'line',
  outputDir: 'output/playwright/test-results',
  use: {
    baseURL,
    headless: true,
    viewport: { width: 390, height: 844 },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: `npm run dev -- -H ${host} -p ${port}`,
    url: `${baseURL}/cart`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
