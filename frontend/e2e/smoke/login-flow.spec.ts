import { test, expect } from '@playwright/test';
import { loginAs } from '../fixtures';
import { BooksPage } from '../page-objects/BooksPage';

/**
 * Smoke test: a patron can log in via the real cookie-based flow,
 * an auth token cookie is set, and the navbar reflects the patron
 * session via the PatronNavLink (link to /patrons/:id).
 */

test.describe('Login flow smoke', () => {
  test('patron logs in, token cookie set, navbar reflects session', async ({ page }) => {
    await loginAs(page, 'patron');

    const cookies = await page.context().cookies();
    const tokenCookie = cookies.find((c) => c.name === 'access_token');
    expect(tokenCookie, 'expected access_token cookie to be set').toBeDefined();

    const booksPage = new BooksPage(page);
    await booksPage.goto();

    expect(new URL(page.url()).pathname).toBe('/');

    // PatronNavLink renders as a link to /patrons/:id once authenticated.
    const patronNav = page.locator('a[href^="/patrons/"]').first();
    await expect(patronNav).toBeVisible();

    await expect(booksPage.getBookCards().first()).toBeVisible();
  });
});
