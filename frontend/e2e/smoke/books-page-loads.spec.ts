import { test, expect } from '@playwright/test';
import { BooksPage } from '../page-objects/BooksPage';

/**
 * Smoke test: anonymous Books page loads, renders at least one book card,
 * and produces no unexpected browser console errors.
 */

const EXPECTED_ERROR_PATTERNS: RegExp[] = [/401/, /Unauthorized/, /auth/i];

function isExpectedError(message: string): boolean {
  return EXPECTED_ERROR_PATTERNS.some((pattern) => pattern.test(message));
}

test.describe('Books page smoke', () => {
  let consoleErrors: string[];

  test.beforeEach(({ page }) => {
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

  test('renders at least one book card with no console errors', async ({ page }) => {
    const booksPage = new BooksPage(page);
    await booksPage.goto();

    const cards = booksPage.getBookCards();
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBeGreaterThan(0);

    expect(consoleErrors).toEqual([]);
  });
});
