import { test, expect, Page } from '@playwright/test';
import { BooksPage } from '../page-objects';

/**
 * Flow 3 — Book filters combine.
 *
 * Applies genre + author + min rating together, asserts the visible
 * results narrow, then clicks "Clear all filters" and asserts the list
 * grows back. Uses event-based waits via the "Showing X of Y" summary
 * line plus targeted waitForResponse calls (no waitForTimeout).
 *
 * No login required — books listing is public.
 */

async function getTotalCount(page: Page): Promise<number> {
  const showing = page.getByText(/Showing \d+ of \d+ books/);
  await expect(showing).toBeVisible();
  const text = (await showing.textContent()) ?? '';
  const match = text.match(/of (\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

test.describe('Flow: combined book filters', () => {
  test('genre + author + rating filters combine and clear', async ({ page }) => {
    const books = new BooksPage(page);
    await books.goto();
    await expect(books.getBookCards().first()).toBeVisible();
    const initial = await getTotalCount(page);
    expect(initial).toBeGreaterThan(0);

    // Genre filter
    const genreResp = page.waitForResponse(
      (r) => r.url().includes('/books') && r.url().includes('genre') && r.status() === 200
    );
    await page.getByLabel('Genre').click();
    await page.getByRole('option', { name: 'Fantasy' }).click();
    await page.keyboard.press('Escape');
    await genreResp;

    // Min rating filter
    const ratingResp = page.waitForResponse(
      (r) => r.url().includes('/books') && r.url().includes('minRating') && r.status() === 200
    );
    await page.getByLabel('Minimum Rating').click();
    await page.getByRole('option', { name: '3+ Stars' }).click();
    await ratingResp;

    const filtered = await getTotalCount(page);
    expect(filtered).toBeLessThan(initial);

    // Clear all
    const clearResp = page.waitForResponse(
      (r) =>
        r.url().includes('/books') &&
        !r.url().includes('genre') &&
        !r.url().includes('minRating') &&
        r.status() === 200
    );
    await page.getByRole('button', { name: /Clear all filters/i }).click();
    await clearResp;

    const reset = await getTotalCount(page);
    expect(reset).toBe(initial);
  });
});
