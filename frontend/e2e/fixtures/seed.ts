import type { Page } from '@playwright/test';
import { apiRequestRaw } from './api';
import type { BookListData, AvailableCopiesData } from './types';

/**
 * Placeholder seed/cleanup hooks. Test isolation currently relies on the
 * database seed. Implement these when flow/security layers require
 * per-test data mutation.
 */
export async function seedTestData(): Promise<void> {
  // no-op
}

export async function cleanupTestData(): Promise<void> {
  // no-op
}

/**
 * Discover candidate available copy ids via the API for tests that need to
 * mutate checkout state. Walks the first `bookLimit` books and aggregates
 * the per-book "available copies" endpoint results.
 *
 * The /copies/book/:id/available endpoint reports copies with no active
 * checkout, but a copy can still be encumbered by an active hold or by a
 * waitlist queue head pointing at another patron — POST /checkouts will
 * 409 in those cases. Callers should iterate the returned ids and try
 * each until POST /checkouts returns 201.
 *
 * Centralizing discovery here keeps spec files free of pagination and
 * shape coupling, and gives us a single seam to swap in a dedicated
 * test-only seeding endpoint when one becomes available.
 *
 * @throws Error with a clear setup-error message if no candidates are found.
 */
export async function findAvailableCopyIds(page: Page, bookLimit = 100): Promise<number[]> {
  const books = await apiRequestRaw<BookListData>('GET', `/books?limit=${bookLimit}`, { page });
  if (books.status !== 200) {
    throw new Error(`findAvailableCopyIds: GET /books returned ${books.status}`);
  }
  const bookList = books.payload?.data?.books ?? [];

  const candidates: number[] = [];
  for (const book of bookList) {
    const copies = await apiRequestRaw<AvailableCopiesData>(
      'GET',
      `/copies/book/${book.id}/available`,
      { page }
    );
    if (copies.status !== 200) continue;
    const list = copies.payload?.data?.copies ?? [];
    for (const copy of list) {
      candidates.push(copy.id);
    }
  }

  if (candidates.length === 0) {
    throw new Error(
      `findAvailableCopyIds: no available copies found in the first ${bookLimit} books — ` +
        `seed data may need refresh`
    );
  }
  return candidates;
}
