import { test, expect } from '@playwright/test';
import { loginAs, apiRequestRaw } from '../fixtures';

/**
 * Security test 2 — Role-based API enforcement.
 *
 * A patron-role session must be denied on routes guarded by a higher role.
 * Verified contracts (see backend/src/routes/patronRoutes.js and
 * checkoutRoutes.js):
 *   - GET  /api/v1/patrons   requires ROLES.ADMIN     -> 403 for patron
 *   - POST /api/v1/checkouts requires ROLES.LIBRARIAN -> 403 for patron
 *
 * Error envelope (backend/src/utils/ApiResponse.js):
 *   { success: false, message: string, statusCode: number }
 *
 * Single loginAs per test to stay under strictLimiter budget.
 */
test('patron role is denied on librarian/admin API routes', async ({ page }) => {
  await loginAs(page, 'patron');

  const listPatrons = await apiRequestRaw('GET', '/patrons', { page });
  expect(listPatrons.status).toBe(403);
  expect(listPatrons.payload?.success).toBe(false);
  expect(typeof listPatrons.payload?.message).toBe('string');

  const createCheckout = await apiRequestRaw('POST', '/checkouts', {
    page,
    body: { copy_id: 1 },
  });
  expect(createCheckout.status).toBe(403);
  expect(createCheckout.payload?.success).toBe(false);
  expect(typeof createCheckout.payload?.message).toBe('string');
});
