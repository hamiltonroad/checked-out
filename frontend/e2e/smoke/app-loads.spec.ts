import { test, expect } from '../fixtures/consoleGuard';
import type { Page } from '@playwright/test';

/**
 * Smoke test: verifies the application starts and renders without
 * unexpected browser console errors.
 *
 * Assumes servers are already running via ./scripts/start-all.sh.
 *
 * Console-error filtering is installed automatically by the
 * `consoleGuard` fixture (issue #241) — see
 * `frontend/e2e/fixtures/consoleGuard.ts`.
 */

async function safeGoto(page: Page, path = '/') {
  try {
    return await page.goto(path);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('ECONNREFUSED') || message.includes('ERR_CONNECTION_REFUSED')) {
      throw new Error(
        'Could not connect to http://localhost:5173 — are servers running? ' +
          'Use ./scripts/start-all.sh to start them.'
      );
    }
    throw error;
  }
}

test.describe('App smoke test', () => {
  test('app returns HTTP 200', async ({ page }) => {
    const response = await safeGoto(page);

    expect(response).not.toBeNull();
    expect(response!.status()).toBe(200);
  });

  test('app renders visible content', async ({ page }) => {
    await safeGoto(page);

    const body = page.locator('body');
    await expect(body).not.toBeEmpty();
    const textContent = await body.textContent();
    expect((textContent ?? '').trim().length).toBeGreaterThan(0);
  });
});
