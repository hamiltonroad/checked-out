// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Playwright configuration for smoke tests.
 *
 * Assumes servers are already running (started via ./scripts/start-all.sh).
 * Does NOT configure webServer — tests fail fast if servers are down.
 *
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './frontend/smoke',
  timeout: 30000,
  retries: 0,
  reporter: 'list',

  use: {
    baseURL: 'http://localhost:5173',
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
