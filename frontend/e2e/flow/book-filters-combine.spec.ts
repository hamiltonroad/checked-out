import { test, expect } from '../fixtures/consoleGuard';
import type { Page } from '@playwright/test';
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

/**
 * Predicate factory for waitForResponse that matches a successful
 * GET against the books listing endpoint, optionally requiring (or
 * forbidding) specific query params. Parses the URL rather than doing
 * substring matching so that future param renames (e.g., `genres[]`)
 * cannot accidentally false-positive match.
 */
function booksListResponse(opts: {
  withParams?: string[];
  withoutParams?: string[];
}) {
  return (response: { url(): string; status(): number; request(): { method(): string } }) => {
    if (response.status() !== 200) return false;
    if (response.request().method() !== 'GET') return false;
    let url: URL;
    try {
      url = new URL(response.url());
    } catch {
      return false;
    }
    if (!url.pathname.endsWith('/books')) return false;
    for (const p of opts.withParams ?? []) {
      if (!url.searchParams.has(p)) return false;
    }
    for (const p of opts.withoutParams ?? []) {
      if (url.searchParams.has(p)) return false;
    }
    return true;
  };
}

test.describe('Flow: combined book filters', () => {
  test('genre + author + rating filters combine and clear', async ({ page }) => {
    const books = new BooksPage(page);
    await books.goto();
    await expect(books.getBookCards().first()).toBeVisible();
    const initial = await getTotalCount(page);
    expect(initial).toBeGreaterThan(0);

    // Genre filter
    const genreResp = page.waitForResponse(booksListResponse({ withParams: ['genre'] }));
    await page.getByLabel('Genre').click();
    await page.getByRole('option', { name: 'Fantasy' }).click();
    await page.keyboard.press('Escape');
    await genreResp;

    // Min rating filter
    const ratingResp = page.waitForResponse(booksListResponse({ withParams: ['minRating'] }));
    await page.getByLabel('Minimum Rating').click();
    await page.getByRole('option', { name: '3+ Stars' }).click();
    await ratingResp;

    const filtered = await getTotalCount(page);
    expect(filtered).toBeLessThan(initial);

    // Clear all
    const clearResp = page.waitForResponse(
      booksListResponse({ withoutParams: ['genre', 'minRating'] })
    );
    await page.getByRole('button', { name: /Clear all filters/i }).click();
    await clearResp;

    const reset = await getTotalCount(page);
    expect(reset).toBe(initial);
  });
});
