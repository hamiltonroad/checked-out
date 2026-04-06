import { withApiSession, ApiSession } from './api';

/**
 * Seed/cleanup helpers for flow-layer tests. Test isolation otherwise
 * relies on the database seed; these helpers cover state preconditions
 * that the seed cannot guarantee (e.g., a book with zero available
 * copies for the waitlist flow, or a single copy that the librarian
 * can actually check out via the UI).
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

interface WaitlistEntry {
  format: string;
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
 * Result of finding a single copy that is provably checkoutable by the
 * librarian (no hold gating, no waitlist gating).
 */
export interface UngatedCopy {
  book: BookSummary;
  format: string;
  copyId: number;
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
  return withApiSession('librarian', async (session) => {
    for (let pageNum = 1; pageNum <= 6; pageNum += 1) {
      const list = await session.request<BooksListResponse>(
        'GET',
        `books?page=${pageNum}&limit=12`
      );
      for (const book of list?.books ?? []) {
        const data = await session.request<AvailableCopiesResponse>(
          'GET',
          `copies/book/${book.id}/available`
        );
        const copies = data?.copies ?? [];
        if (copies.length === 0) continue;
        const created: number[] = [];
        let aborted = false;
        for (const copy of copies) {
          try {
            const checkout = await session.request<{ id: number }>('POST', 'checkouts', {
              copy_id: copy.id,
            });
            if (checkout?.id) created.push(checkout.id);
          } catch {
            aborted = true;
            break;
          }
        }
        if (aborted) {
          await rollback(session, created);
          continue;
        }
        return { book, checkoutIds: created };
      }
    }
    throw new Error('No fully drainable book found in catalog');
  });
}

/**
 * Find a single copy the librarian can definitely check out via the UI.
 *
 * Strategy: page the catalog, fetch each book's available copies and
 * its waitlist, filter out waitlist-gated formats, then probe remaining
 * candidates by creating + immediately returning a checkout via the
 * API. A copy that survives the probe is provably free of hold gating
 * AND waitlist gating, so the UI checkout will succeed.
 *
 * The probe is the only available signal: there is no read-only
 * "is-checkoutable" endpoint (the holds-by-copy state is not exposed
 * via GET), and the available-copies endpoint does not exclude copies
 * held for another patron. Adding such an endpoint would let us replace
 * the probe with a pure GET — see issue #220 follow-up notes.
 *
 * Each probe spends two strict-rate-limiter slots (POST + PUT). Tests
 * using this helper should expect ~6 strict slots in worst case.
 */
export async function findUngatedCopy(): Promise<UngatedCopy> {
  return withApiSession('librarian', async (session) => {
    for (let pageNum = 1; pageNum <= 6; pageNum += 1) {
      const list = await session.request<BooksListResponse>(
        'GET',
        `books?page=${pageNum}&limit=12`
      );
      for (const book of list?.books ?? []) {
        const copiesData = await session.request<AvailableCopiesResponse>(
          'GET',
          `copies/book/${book.id}/available`
        );
        const copies = copiesData?.copies ?? [];
        if (copies.length === 0) continue;
        const waitlist =
          (await session.request<WaitlistEntry[]>('GET', `books/${book.id}/waitlist`)) ?? [];
        const gatedFormats = new Set(waitlist.map((w) => w.format));
        const candidates = copies.filter((c) => !gatedFormats.has(c.format));
        for (const candidate of candidates) {
          try {
            const checkout = await session.request<{ id: number }>('POST', 'checkouts', {
              copy_id: candidate.id,
            });
            if (checkout?.id) {
              try {
                await session.request('PUT', `checkouts/${checkout.id}/return`);
              } catch {
                // best-effort revert
              }
            }
            return { book, format: candidate.format, copyId: candidate.id };
          } catch {
            // Probe failed (likely hold-gated). Try the next candidate.
          }
        }
      }
    }
    throw new Error('No ungated checkoutable copy found in catalog');
  });
}

async function rollback(session: ApiSession, ids: number[]): Promise<void> {
  for (const id of [...ids].reverse()) {
    try {
      await session.request('PUT', `checkouts/${id}/return`);
    } catch {
      // ignore
    }
  }
}

/**
 * Return the given checkout IDs (reverse order) as the librarian. Safe
 * to call with an empty array. Errors are swallowed individually so a
 * single bad ID does not block cleanup of the rest.
 */
export async function releaseCheckouts(checkoutIds: number[]): Promise<void> {
  if (checkoutIds.length === 0) return;
  await withApiSession('librarian', async (session) => {
    await rollback(session, checkoutIds);
  });
}
