// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Smoke test: verifies the application starts and renders without
 * unexpected browser console errors.
 *
 * Assumes servers are already running via ./scripts/start-all.sh.
 */

const EXPECTED_ERROR_PATTERNS = [/401/, /Unauthorized/, /auth/i];

function isExpectedError(message) {
  return EXPECTED_ERROR_PATTERNS.some((pattern) => pattern.test(message));
}

test.describe('App smoke test', () => {
  let consoleErrors;

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
    let response;

    try {
      response = await page.goto('/');
    } catch (error) {
      if (error.message.includes('ECONNREFUSED') || error.message.includes('ERR_CONNECTION_REFUSED')) {
        throw new Error(
          'Could not connect to http://localhost:5173 — are servers running? ' +
            'Use ./scripts/start-all.sh to start them.'
        );
      }
      throw error;
    }

    expect(response).not.toBeNull();
    expect(response.status()).toBe(200);
  });

  test('app renders visible content', async ({ page }) => {
    try {
      await page.goto('/');
    } catch (error) {
      if (error.message.includes('ECONNREFUSED') || error.message.includes('ERR_CONNECTION_REFUSED')) {
        throw new Error(
          'Could not connect to http://localhost:5173 — are servers running? ' +
            'Use ./scripts/start-all.sh to start them.'
        );
      }
      throw error;
    }

    const body = page.locator('body');
    await expect(body).not.toBeEmpty();
    const textContent = await body.textContent();
    expect(textContent.trim().length).toBeGreaterThan(0);
  });

  test('no unexpected console errors', async ({ page }) => {
    try {
      await page.goto('/');
    } catch (error) {
      if (error.message.includes('ECONNREFUSED') || error.message.includes('ERR_CONNECTION_REFUSED')) {
        throw new Error(
          'Could not connect to http://localhost:5173 — are servers running? ' +
            'Use ./scripts/start-all.sh to start them.'
        );
      }
      throw error;
    }

    // Allow time for async errors to surface
    await page.waitForTimeout(2000);

    if (consoleErrors.length > 0) {
      throw new Error(
        `Found ${consoleErrors.length} unexpected console error(s):\n\n` +
          consoleErrors.map((err, i) => `  ${i + 1}. ${err}`).join('\n')
      );
    }
  });
});
