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
      // Config guard tests (no browser / no server needed) — e.g. the
      // console-error allowlist integrity check from issue #229 item #8.
      name: 'config',
      testDir: './frontend/e2e/config',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'smoke',
      testDir: './frontend/e2e/smoke',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'flow',
      testDir: './frontend/e2e/flow',
      // Flow tests mutate shared database state (checkouts, waitlists)
      // and must run serially to avoid cross-test interference.
      fullyParallel: false,
      workers: 1,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'security',
      testDir: './frontend/e2e/security',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
