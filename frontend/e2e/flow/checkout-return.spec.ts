import { test, expect, request, APIRequestContext } from '@playwright/test';
import { loginAs } from '../fixtures/auth';
import { API_BASE_URL } from '../fixtures/api';
import { DEV_PASSWORD, SEED_PATRONS } from '../fixtures/testData';
import { BooksPage, CheckoutDialog, CheckoutsPage } from '../page-objects';

/**
 * Flow 1 — Checkout to return round-trip.
 *
 * Logs in as librarian, defensively picks a book that has at least one
 * available copy (queried via the API as the librarian), opens the book
 * detail modal, checks out the first available copy through the UI,
 * then verifies the checkout appears in Current and moves to History
 * after returning it via the CheckoutsPage page object.
 */

interface BookSummary {
  id: number;
  title: string;
}

interface BooksListResponse {
  books: BookSummary[];
}

interface AvailableCopy {
  id: number;
  format: string;
}

interface WaitlistEntry {
  format: string;
}

interface CopiesResponse {
  copies: AvailableCopy[];
}


async function getJson<T>(ctx: APIRequestContext, path: string): Promise<T> {
  const res = await ctx.get(path);
  if (!res.ok()) throw new Error(`GET ${path} failed: HTTP ${res.status()}`);
  const body = (await res.json()) as { data?: T };
  return body.data as T;
}

/**
 * Page through the catalog using a single authenticated session and
 * return the first book that has at least one available copy AND no
 * active waitlist (which would gate the librarian from checking it
 * out). Performing this in one shared APIRequestContext avoids
 * tripping the strict login limiter on every probe.
 */
interface CheckoutableTarget {
  book: BookSummary;
  format: string;
  copyId: number;
}

async function findCheckoutableBook(): Promise<CheckoutableTarget> {
  const ctx = await request.newContext({
    baseURL: API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`,
  });
  try {
    await ctx.get('books?limit=1');
    const state = await ctx.storageState();
    const csrf = state.cookies.find((c) => c.name === '_csrf')?.value ?? '';
    const loginRes = await ctx.post('auth/login', {
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
      data: { card_number: SEED_PATRONS.librarian.cardNumber, password: DEV_PASSWORD },
    });
    if (!loginRes.ok()) throw new Error(`login failed: HTTP ${loginRes.status()}`);

    const csrf2State = await ctx.storageState();
    const csrfHeader =
      csrf2State.cookies.find((c) => c.name === '_csrf')?.value ?? csrf;

    for (let page = 1; page <= 6; page += 1) {
      const list = await getJson<BooksListResponse>(ctx, `books?page=${page}&limit=12`);
      for (const book of list?.books ?? []) {
        const copiesData = await getJson<CopiesResponse>(
          ctx,
          `copies/book/${book.id}/available`
        );
        const copies = copiesData?.copies ?? [];
        if (copies.length === 0) continue;
        const waitlist =
          (await getJson<WaitlistEntry[]>(ctx, `books/${book.id}/waitlist`)) ?? [];
        const gatedFormats = new Set(waitlist.map((w) => w.format));
        const candidates = copies.filter((c) => !gatedFormats.has(c.format));
        for (const candidate of candidates) {
          // Probe by creating + immediately returning a checkout. If it
          // succeeds, the copy is truly checkoutable (no hold gating)
          // and the test can re-do it via the UI. This burns one strict
          // limiter slot per probe but is the only signal available.
          const probeRes = await ctx.post('checkouts', {
            headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfHeader },
            data: { copy_id: candidate.id },
          });
          if (probeRes.ok()) {
            const probeBody = (await probeRes.json()) as { data?: { id: number } };
            const probeId = probeBody.data?.id;
            if (probeId) {
              await ctx.put(`checkouts/${probeId}/return`, {
                headers: {
                  'Content-Type': 'application/json',
                  'X-CSRF-Token': csrfHeader,
                },
                data: {},
              });
            }
            return { book, format: candidate.format, copyId: candidate.id };
          }
        }
      }
    }
    throw new Error('No book with a checkoutable copy found in catalog');
  } finally {
    await ctx.dispose();
  }
}

test.describe('Flow: checkout and return round-trip', () => {
  test.setTimeout(90_000);
  test('librarian can check out and return a copy', async ({ page }) => {
    const target = await findCheckoutableBook();
    const bookTitle = target.book.title;
    await loginAs(page, 'librarian');

    const books = new BooksPage(page);
    const checkoutDialog = new CheckoutDialog(page);
    await books.goto();
    await expect(books.getBookCards().first()).toBeVisible();

    // Use the search field to surface the target book regardless of
    // catalog ordering / pagination.
    await page.getByPlaceholder(/Search by title/i).fill(bookTitle);
    const targetCard = page.getByRole('button', { name: `View details for ${bookTitle}` });
    await expect(targetCard).toBeVisible();
    await targetCard.click();
    const dialog = page.getByRole('dialog');
    await dialog.waitFor({ state: 'visible' });

    await checkoutDialog.openFromBookDetail(dialog);
    // Select the exact copy that the API probe confirmed is checkoutable
    // (passes hold gating + waitlist gating). Selecting by copy id avoids
    // accidentally landing on a different gated copy of the same format.
    await checkoutDialog.selectCopyById(target.copyId);
    await checkoutDialog.submit();
    await checkoutDialog.expectSuccess();

    const checkouts = new CheckoutsPage(page);
    const patronName = SEED_PATRONS.librarian.name as string;
    await checkouts.goto();
    await checkouts.currentTab();
    await checkouts.expectCheckout(bookTitle, patronName);

    await checkouts.returnCheckout(bookTitle, patronName);

    await checkouts.historyTab();
    await checkouts.expectCheckout(bookTitle, patronName);
  });
});
