import { test, expect } from '@playwright/test';
import { loginAs } from '../fixtures';
import { BooksPage } from '../page-objects/BooksPage';

/**
 * Smoke test: clicking a book card on the Books page opens the
 * BookDetailModal with its title, per-format availability section,
 * and genre field visible.
 */

test.describe('Book detail modal smoke', () => {
  test('opens on card click and shows details with availability', async ({ page }) => {
    await loginAs(page, 'patron');
    const booksPage = new BooksPage(page);
    await booksPage.goto();

    const modal = await booksPage.openBookDetail(0);

    await expect(modal.getByText('Book Details', { exact: true })).toBeVisible();
    await expect(modal.getByText('Copies', { exact: true })).toBeVisible();
    await expect(modal.getByText('Genre', { exact: true })).toBeVisible();

    // Per-format availability rendered as e.g. "hardcover: 2 of 3 available"
    await expect(modal.getByText(/of \d+ available/i).first()).toBeVisible();
  });
});
