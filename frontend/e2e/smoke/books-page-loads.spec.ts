import { test, expect } from '@playwright/test';
import { BooksPage } from '../page-objects/BooksPage';

/**
 * Smoke test: anonymous Books page loads, renders at least one book card,
 * and produces no unexpected browser console errors.
 */

// Anonymous visitors trigger a /auth/me probe that returns 401. That network
// 401 is expected and benign; any other console error should fail the smoke.
const EXPECTED_401 = /401 \(Unauthorized\)/;

test.describe('Books page smoke', () => {
  test('renders at least one book card with no console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !EXPECTED_401.test(msg.text())) {
        consoleErrors.push(msg.text());
      }
    });

    const booksPage = new BooksPage(page);
    await booksPage.goto();

    await expect(booksPage.getBookCards().first()).toBeVisible();

    expect(consoleErrors).toEqual([]);
  });
});
