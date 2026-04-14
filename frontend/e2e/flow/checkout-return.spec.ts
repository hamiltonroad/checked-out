import { test, expect } from '../fixtures/consoleGuard';
import { loginAs } from '../fixtures/auth';
import { getCheckoutableCopy } from '../fixtures/api';
import { returnCheckoutForCopy } from '../fixtures/seed';
import { SEED_PATRONS } from '../fixtures/testData';
import { BooksPage, CheckoutDialog, CheckoutsPage } from '../page-objects';

/**
 * Flow 1 — Checkout to return round-trip.
 *
 * Logs in as librarian, picks a copy that the `getCheckoutableCopy`
 * API helper has confirmed is not actively checked out and not
 * waitlist-gated, opens the book detail modal, checks out that exact
 * copy through the UI, then verifies the checkout appears in Current
 * and moves to History after returning it via the CheckoutsPage page
 * object.
 *
 * Teardown: if the test fails after checkout but before return, the
 * afterEach hook returns the copy via API so subsequent runs start clean.
 */

test.describe('Flow: checkout and return round-trip', () => {
  test.setTimeout(90_000);
  let targetCopyId: number | null = null;

  test.beforeEach(async () => {
    targetCopyId = null;
  });

  test.afterEach(async () => {
    if (targetCopyId !== null) {
      await returnCheckoutForCopy(targetCopyId);
      targetCopyId = null;
    }
  });

  test('librarian can check out and return a copy', async ({ page }) => {
    const target = await getCheckoutableCopy();
    targetCopyId = target.copyId;
    const bookTitle = target.bookTitle;
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
    // Select the exact copy the seed helper probed — guarantees the UI
    // checkout will not hit hold gating or waitlist gating.
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
