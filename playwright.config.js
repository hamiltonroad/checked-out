// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for smoke tests.
 *
 * Assumes servers are already running (started via ./scripts/start-all.sh).
 * Does NOT configure webServer — tests fail fast if servers are down.
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './frontend/smoke',
  timeout: 30000,
  retries: 0,
  reporter: 'list',

  use: {
    baseURL: process.env.SMOKE_BASE_URL || 'http://localhost:5173',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'off',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
