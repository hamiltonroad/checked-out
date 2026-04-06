import { withApiSession } from './api';

/**
 * Seed/cleanup helpers for flow-layer tests. Test isolation otherwise
 * relies on the database seed; these helpers cover state preconditions
 * that the seed cannot guarantee (e.g., a book with zero available
 * copies for the waitlist flow).
 *
 * Each helper opens a single librarian session (one login) and reuses
 * it for every request, minimizing pressure on the strict rate limiter
 * (20 requests / 15 minutes per IP).
 */

interface AvailableCopy {
  id: number;
  book_id: number;
  format: string;
}

interface AvailableCopiesResponse {
  copies: AvailableCopy[];
}

interface BookSummary {
  id: number;
  title: string;
}

interface BooksListResponse {
  books: BookSummary[];
}

/**
 * Result of finding a book the librarian can fully check out: the book
 * itself plus the checkout IDs created (so the test can release them).
 */
export interface SeedTargetBook {
  book: BookSummary;
  checkoutIds: number[];
}

/**
 * Find the first catalog book whose available copies can ALL be checked
 * out by the librarian, then check them out. If a copy is hold-gated for
 * a different patron the entire book is skipped (its 409 leaves
 * partial state which we release before moving on). Returns the book
 * plus the resulting checkout IDs for cleanup.
 *
 * Used by the waitlist flow which needs a book with zero available
 * copies and no librarian-blocking holds.
 */
export async function findAndDrainBook(): Promise<SeedTargetBook> {
  return withApiSession('librarian', async ({ request }) => {
    for (let pageNum = 1; pageNum <= 6; pageNum += 1) {
      const list = await request<BooksListResponse>(
        'GET',
        `books?page=${pageNum}&limit=12`
      );
      for (const book of list?.books ?? []) {
        const data = await request<AvailableCopiesResponse>(
          'GET',
          `copies/book/${book.id}/available`
        );
        const copies = data?.copies ?? [];
        if (copies.length === 0) continue;
        const created: number[] = [];
        let aborted = false;
        for (const copy of copies) {
          try {
            const checkout = await request<{ id: number }>('POST', 'checkouts', {
              copy_id: copy.id,
            });
            if (checkout?.id) created.push(checkout.id);
          } catch {
            aborted = true;
            break;
          }
        }
        if (aborted) {
          // Roll back partial checkouts and try the next book
          for (const id of [...created].reverse()) {
            try {
              await request('PUT', `checkouts/${id}/return`);
            } catch {
              // ignore
            }
          }
          continue;
        }
        return { book, checkoutIds: created };
      }
    }
    throw new Error('No fully drainable book found in catalog');
  });
}

/**
 * Check out every available copy of the given book as the librarian
 * seed user, returning the resulting checkout IDs in the order they
 * were created. Pair with `releaseCheckouts(ids)` in afterEach to
 * restore state even on failure.
 */
export async function ensureBookHasNoAvailableCopies(bookId: number): Promise<number[]> {
  return withApiSession('librarian', async ({ request }) => {
    const data = await request<AvailableCopiesResponse>(
      'GET',
      `copies/book/${bookId}/available`
    );
    const copies = data?.copies ?? [];
    const checkoutIds: number[] = [];
    for (const copy of copies) {
      const checkout = await request<{ id: number }>('POST', 'checkouts', {
        copy_id: copy.id,
      });
      if (checkout?.id) checkoutIds.push(checkout.id);
    }
    return checkoutIds;
  });
}

/**
 * Return the given checkout IDs (reverse order) as the librarian. Safe
 * to call with an empty array. Errors are swallowed individually so a
 * single bad ID does not block cleanup of the rest.
 */
export async function releaseCheckouts(checkoutIds: number[]): Promise<void> {
  if (checkoutIds.length === 0) return;
  await withApiSession('librarian', async ({ request }) => {
    for (const id of [...checkoutIds].reverse()) {
      try {
        await request('PUT', `checkouts/${id}/return`);
      } catch {
        // ignore — best-effort cleanup
      }
    }
  });
}

// Backwards-compatible no-op exports for older callers.
export async function seedTestData(): Promise<void> {}
export async function cleanupTestData(): Promise<void> {}
