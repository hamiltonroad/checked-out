import { test, expect, Page } from '@playwright/test';

/**
 * Smoke test: verifies the application starts and renders without
 * unexpected browser console errors.
 *
 * Assumes servers are already running via ./scripts/start-all.sh.
 */

const EXPECTED_ERROR_PATTERNS: RegExp[] = [/401/, /Unauthorized/, /auth/i];

function isExpectedError(message: string): boolean {
  return EXPECTED_ERROR_PATTERNS.some((pattern) => pattern.test(message));
}

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
        if (!isExpectedError(text)) {
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
    await safeGoto(page);

    await page.waitForLoadState('networkidle');

    if (consoleErrors.length > 0) {
      throw new Error(
        `Found ${consoleErrors.length} unexpected console error(s):\n\n` +
          consoleErrors.map((err, i) => `  ${i + 1}. ${err}`).join('\n')
      );
    }
  });
});
