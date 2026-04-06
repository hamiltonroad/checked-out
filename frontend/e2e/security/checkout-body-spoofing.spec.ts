import { test, expect } from '@playwright/test';
import { loginAs, apiRequestRaw } from '../fixtures';

/**
 * Security test 3 — Checkout body spoofing blocked.
 *
 * POST /api/v1/checkouts must always use req.patron.id from the session and
 * ignore any patron_id provided in the body. The Joi validator strips unknown
 * keys (stripUnknown: true) and the controller destructures only copy_id.
 *
 * Test: log in as the librarian seed (POST /checkouts requires LIBRARIAN),
 * forge a body with patron_id = 999999, and verify the created checkout's
 * patronId equals the session librarian id (NOT 999999).
 *
 * Cleanup: returns the book in finally so the run is idempotent.
 */
interface MeData {
  id: number;
}
interface BookListData {
  books?: Array<{ id: number }>;
}
interface AvailableCopiesData {
  copies?: Array<{ id: number }>;
  totalCopies?: number;
}
interface CheckoutData {
  id: number;
  patron_id: number;
}

test('POST /checkouts ignores body patron_id and uses session patron', async ({ page }) => {
  await loginAs(page, 'librarian');

  // Discover session patron id.
  const me = await apiRequestRaw<MeData>('GET', '/auth/me', { page });
  expect(me.status).toBe(200);
  const sessionPatronId = me.payload?.data?.id;
  expect(typeof sessionPatronId).toBe('number');

  // Discover an available copy by walking books and try to check it out.
  // Some "available" copies may still be blocked by holds/waitlists, so we
  // iterate until createCheckout succeeds with 201.
  const books = await apiRequestRaw<BookListData>('GET', '/books?limit=50', { page });
  expect(books.status).toBe(200);
  const bookList = books.payload?.data?.books ?? [];

  const FORGED_PATRON_ID = 999999;
  let createdId: number | null = null;
  let createdPatronId: number | undefined;
  let lastStatus = 0;
  let lastMessage = '';

  try {
    outer: for (const book of bookList) {
      const copies = await apiRequestRaw<AvailableCopiesData>(
        'GET',
        `/copies/book/${book.id}/available`,
        { page }
      );
      const list = copies.payload?.data?.copies ?? [];
      for (const copy of list) {
        const created = await apiRequestRaw<CheckoutData>('POST', '/checkouts', {
          page,
          body: { copy_id: copy.id, patron_id: FORGED_PATRON_ID },
        });
        lastStatus = created.status;
        lastMessage = String(created.payload?.message ?? '');
        if (created.status === 201 && created.payload?.success === true) {
          createdId = created.payload?.data?.id ?? null;
          createdPatronId = created.payload?.data?.patron_id;
          break outer;
        }
      }
    }

    expect(
      createdId,
      `failed to create a checkout for spoofing test; lastStatus=${lastStatus} lastMessage=${lastMessage}`
    ).not.toBeNull();
    expect(createdPatronId).toBe(sessionPatronId);
    expect(createdPatronId).not.toBe(FORGED_PATRON_ID);
  } finally {
    if (createdId !== null) {
      await apiRequestRaw('PUT', `/checkouts/${createdId}/return`, { page });
    }
  }
});
