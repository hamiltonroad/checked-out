import { test, expect, Page } from '@playwright/test';
import { isAllowlistedConsoleError } from '../config/console-allowlist';

/**
 * Smoke test: verifies the application starts and renders without
 * unexpected browser console errors.
 *
 * Assumes servers are already running via ./scripts/start-all.sh.
 *
 * Console-error filtering delegates to `frontend/e2e/config/console-allowlist.ts`,
 * which enforces exact-string (not substring, not regex) matching —
 * see issue #229 item #8.
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
  let consoleErrors: string[];

  test.beforeEach(async ({ page }) => {
    consoleErrors = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!isAllowlistedConsoleError(text)) {
          consoleErrors.push(text);
        }
      }
    });
  });

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

  test('no unexpected console errors', async ({ page }) => {
    // Wait for the initial catalog fetch instead of 'networkidle'
    // (flaky with React Query background refetches — issue #229 item #7).
    const booksResponse = page.waitForResponse(
      (resp) => resp.url().includes('/books') && resp.status() === 200
    );
    await safeGoto(page);
    await booksResponse;

    if (consoleErrors.length > 0) {
      throw new Error(
        `Found ${consoleErrors.length} unexpected console error(s):\n\n` +
          consoleErrors.map((err, i) => `  ${i + 1}. ${err}`).join('\n')
      );
    }
  });
});
