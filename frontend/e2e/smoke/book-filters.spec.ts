import { test, expect } from '../fixtures/consoleGuard';
import type { Page } from '@playwright/test';

/**
 * Smoke tests for book filtering: author, rating, and genre filters.
 * Assumes servers are already running via ./scripts/start-all.sh.
 */

const BOOKS_URL = 'http://localhost:5173';

/** Extract the "of N" total from "Showing X of Y books" */
async function getTotalCount(page: Page): Promise<number> {
  const showingText = page.locator('text=/Showing \\d+ of \\d+ books/');
  await expect(showingText).toBeVisible();
  const text = (await showingText.textContent()) ?? '';
  const match = text.match(/of (\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

test.describe('Book filters', () => {
  test.beforeEach(async ({ page }) => {
    // Wait for the initial books fetch instead of 'networkidle' (flaky with
    // React Query background refetches).
    const initialBooks = page.waitForResponse(
      (resp) => resp.url().includes('/books') && resp.status() === 200
    );
    await page.goto(BOOKS_URL);
    await initialBooks;
  });

  test('author filter narrows book results', async ({ page }) => {
    const initialTotal = await getTotalCount(page);

    // Use the combobox role to target the input specifically
    const authorInput = page.getByRole('combobox', { name: 'Author(s)' });
    await authorInput.click();
    await authorInput.fill('Austen');

    // Wait for autocomplete option and select it
    const option = page.getByRole('option', { name: /Austen/i });
    await expect(option).toBeVisible();
    await option.click();

    // Wait for API request with authorId param to complete
    await page.waitForResponse(
      (resp) =>
        resp.url().includes('/books') && resp.url().includes('authorId') && resp.status() === 200
    );

    const filteredTotal = await getTotalCount(page);
    expect(filteredTotal).toBeLessThan(initialTotal);
    expect(filteredTotal).toBeGreaterThan(0);

    // Verify "Pride and Prejudice" is visible (Austen's book)
    await expect(page.getByText('Pride and Prejudice')).toBeVisible();
  });

  test('rating filter narrows book results', async ({ page }) => {
    const initialTotal = await getTotalCount(page);

    // Open the Minimum Rating dropdown
    await page.getByLabel('Minimum Rating').click();

    // Select "4+ Stars"
    await page.getByRole('option', { name: '4+ Stars' }).click();

    // Wait for API request with minRating param to complete
    await page.waitForResponse(
      (resp) =>
        resp.url().includes('/books') && resp.url().includes('minRating') && resp.status() === 200
    );

    const filteredTotal = await getTotalCount(page);
    expect(filteredTotal).toBeLessThan(initialTotal);
    expect(filteredTotal).toBeGreaterThan(0);
  });

  test('genre filter narrows book results', async ({ page }) => {
    // Set up response listener BEFORE triggering the interaction
    const genreResponse = page.waitForResponse(
      (resp) =>
        resp.url().includes('/books') && resp.url().includes('genre') && resp.status() === 200
    );

    // Open Genre dropdown and select "Fantasy"
    await page.getByLabel('Genre').click();
    await page.getByRole('option', { name: 'Fantasy' }).click();

    // Close dropdown by clicking outside
    await page.locator('body').click({ position: { x: 0, y: 0 } });

    // Wait for the response we set up earlier
    await genreResponse;

    const filteredTotal = await getTotalCount(page);
    expect(filteredTotal).toBeGreaterThan(0);
    expect(filteredTotal).toBeLessThan(61);
  });

  test('clear all resets filters', async ({ page }) => {
    // Apply author filter
    const authorInput = page.getByRole('combobox', { name: 'Author(s)' });
    await authorInput.click();
    await authorInput.fill('Austen');
    const option = page.getByRole('option', { name: /Austen/i });
    await expect(option).toBeVisible();
    await option.click();

    // Wait for filtered results
    await page.waitForResponse(
      (resp) =>
        resp.url().includes('/books') && resp.url().includes('authorId') && resp.status() === 200
    );

    // Click "Clear all filters"
    const clearAll = page.getByRole('button', { name: /Clear all filters/i });
    await expect(clearAll).toBeVisible();

    // Set up response listener BEFORE clicking
    const resetResponse = page.waitForResponse(
      (resp) =>
        resp.url().includes('/books') && !resp.url().includes('authorId') && resp.status() === 200
    );
    await clearAll.click();

    // Wait for unfiltered results
    await resetResponse;

    const resetTotal = await getTotalCount(page);
    expect(resetTotal).toBeGreaterThanOrEqual(61);
  });
});
