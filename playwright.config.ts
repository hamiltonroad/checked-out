import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for layered e2e tests (smoke/flow/security).
 *
 * Assumes servers are already running (started via ./scripts/start-all.sh).
 * Does NOT configure webServer — tests fail fast if servers are down.
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  timeout: 30_000,
  retries: 0,
  reporter: 'list',

  use: {
    baseURL: process.env.SMOKE_BASE_URL ?? 'http://localhost:5173',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },

  projects: [
    {
      name: 'smoke',
      testDir: './frontend/e2e/smoke',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'flow',
      testDir: './frontend/e2e/flow',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'security',
      testDir: './frontend/e2e/security',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
