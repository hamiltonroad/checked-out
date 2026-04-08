import { test, expect } from '../fixtures/consoleGuard';
import { BooksPage } from '../page-objects/BooksPage';

/**
 * Smoke test: anonymous Books page loads and renders at least one book
 * card. Console + uncaught-error guard is installed automatically by
 * the `consoleGuard` fixture (issue #241).
 */
test.describe('Books page smoke', () => {
  test('renders at least one book card with no console errors', async ({ page }) => {
    const booksPage = new BooksPage(page);
    await booksPage.goto();

    await expect(booksPage.getBookCards().first()).toBeVisible();
  });
});
