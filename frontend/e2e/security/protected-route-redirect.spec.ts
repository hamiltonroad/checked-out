import { test, expect } from '../fixtures/consoleGuard';
import { SEED_PATRONS, DEV_PASSWORD } from '../fixtures';

/**
 * Security test 1 — Protected route redirect.
 *
 * Unauthenticated navigation to /checkouts must redirect to /login while
 * preserving the original destination so login lands the user on /checkouts
 * (not the default home).
 *
 * /checkouts is guarded by ProtectedRoute requiredRole=LIBRARIAN per
 * frontend/src/router.tsx, so we log in as the librarian seed.
 */
test('unauthenticated /checkouts redirects to /login then returns after login', async ({
  page,
}) => {
  await page.goto('/checkouts');

  await expect(page).toHaveURL(/\/login$/);

  const librarian = SEED_PATRONS.librarian;
  await page.getByLabel('Card Number').fill(librarian.cardNumber);
  await page.getByLabel('Password').fill(DEV_PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();

  await expect(page).toHaveURL(/\/checkouts$/);
});
