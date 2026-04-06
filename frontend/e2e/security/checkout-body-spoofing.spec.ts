import { test, expect } from '@playwright/test';
import {
  loginAs,
  apiRequestRaw,
  findAvailableCopyIds,
  type MeData,
  type CheckoutCreatedData,
} from '../fixtures';

/**
 * Security test 3 — Checkout body spoofing blocked.
 *
 * POST /api/v1/checkouts must always use req.patron.id from the session and
 * ignore any patron_id provided in the body. The Joi validator strips unknown
 * keys (stripUnknown: true) and the controller destructures only copy_id.
 *
 * Test: log in as the librarian seed (POST /checkouts requires LIBRARIAN),
 * forge a body with patron_id = 999999, and verify the created checkout's
 * patron_id equals the session librarian id (NOT 999999).
 *
 * Cleanup: returns the book in finally so the run is idempotent.
 */

/** Sentinel forged id, deliberately out-of-range to make spoofing intent obvious. */
const FORGED_PATRON_ID = 999999;

test('POST /checkouts ignores body patron_id and uses session patron', async ({ page }) => {
  await loginAs(page, 'librarian');

  // Discover session patron id via /auth/me.
  const me = await apiRequestRaw<MeData>('GET', '/auth/me', { page });
  expect(me.status).toBe(200);
  const sessionPatronId = me.payload?.data?.id;
  expect(typeof sessionPatronId).toBe('number');

  // Get candidate available copy ids from the shared fixture helper. We may
  // need to try several because some "available" copies are still encumbered
  // by active holds or front-of-line waitlist entries (POST /checkouts 409s).
  const candidateCopyIds = await findAvailableCopyIds(page);

  let createdId: number | null = null;
  let createdPatronId: number | undefined;
  let lastStatus = 0;
  let lastMessage = '';

  try {
    for (const copyId of candidateCopyIds) {
      const created = await apiRequestRaw<CheckoutCreatedData>('POST', '/checkouts', {
        page,
        body: { copy_id: copyId, patron_id: FORGED_PATRON_ID },
      });
      lastStatus = created.status;
      lastMessage = String(created.payload?.message ?? '');
      if (created.status === 201 && created.payload?.success === true) {
        createdId = created.payload?.data?.id ?? null;
        createdPatronId = created.payload?.data?.patron_id;
        break;
      }
    }

    expect(
      createdId,
      `failed to create checkout from any candidate copy; lastStatus=${lastStatus} lastMessage=${lastMessage}`
    ).not.toBeNull();
    expect(createdPatronId).toBe(sessionPatronId);
    expect(createdPatronId).not.toBe(FORGED_PATRON_ID);
  } finally {
    if (createdId !== null) {
      await apiRequestRaw('PUT', `/checkouts/${createdId}/return`, { page });
    }
  }
});
