import { test, expect } from '../fixtures/consoleGuard';
import { loginAs } from '../fixtures/auth';
import { findAndDrainBook, releaseCheckouts, leaveWaitlist } from '../fixtures/seed';
import { BooksPage, WaitlistPage } from '../page-objects';

/**
 * Flow 2 — Waitlist join to leave.
 *
 * Pre-condition: a book with zero available copies. We pick the first
 * book in the catalog and check out all of its available copies via
 * the API as the librarian, capturing the checkout IDs for cleanup.
 *
 * Then logs in as a patron, opens the book detail modal, joins the
 * waitlist for an unavailable format, visits the Waitlist & Holds page,
 * verifies position #1, leaves the waitlist, and asserts the empty
 * state. Cleanup runs in afterEach regardless of pass/fail.
 *
 * Teardown: releases draining checkouts AND removes any waitlist entry
 * the patron may have joined, so subsequent runs start clean.
 */

test.describe('Flow: waitlist join and leave', () => {
  let bookId: number;
  let bookTitle: string;
  let joinedFormat: string | null = null;
  let checkoutIds: number[] = [];

  test.beforeEach(async () => {
    const target = await findAndDrainBook();
    bookId = target.book.id;
    bookTitle = target.book.title;
    checkoutIds = target.checkoutIds;
    // Clean up any waitlist entries left by a prior failed run.
    // Format values are lowercase in the database (physical, kindle).
    await leaveWaitlist('patron', bookId, 'physical');
    await leaveWaitlist('patron', bookId, 'kindle');
  });

  test.afterEach(async () => {
    if (joinedFormat) {
      await leaveWaitlist('patron', bookId, joinedFormat);
      joinedFormat = null;
    }
    await releaseCheckouts(checkoutIds);
    checkoutIds = [];
  });

  test('patron can join then leave a book waitlist', async ({ page }) => {
    await loginAs(page, 'patron');

    const books = new BooksPage(page);
    await books.goto();
    await expect(books.getBookCards().first()).toBeVisible();

    // Surface the target book regardless of catalog ordering / pagination —
    // findAndDrainBook walks API pages and may pick a book that does not
    // appear on the first UI page.
    await page.getByPlaceholder(/Search by title/i).fill(bookTitle);
    const targetCard = page.getByRole('button', { name: `View details for ${bookTitle}` });
    await expect(targetCard).toBeVisible();
    await targetCard.click();
    const dialog = page.getByRole('dialog');
    await dialog.waitFor({ state: 'visible' });

    // Join the first available format waitlist. Capture the format name
    // from the button text (e.g. "Join Physical Waitlist" → "Physical")
    // so afterEach can clean up if the test fails before leaving.
    const joinBtn = dialog.getByRole('button', { name: /^Join .+ Waitlist$/ }).first();
    await expect(joinBtn).toBeVisible();
    const btnText = (await joinBtn.textContent()) ?? '';
    const formatMatch = btnText.match(/^Join (.+) Waitlist$/);
    joinedFormat = formatMatch ? formatMatch[1].toLowerCase() : null;
    await joinBtn.click();
    // Match the exact confirmation phrasing from WaitlistSection.tsx:
    // "You are #N in line for {format}" or "You're next! Check out now."
    await expect(
      dialog.getByText(/^(You are #\d+ in line for |You're next! Check out now\.)/)
    ).toBeVisible();

    await dialog.getByRole('button', { name: 'Close', exact: true }).click();
    await dialog.waitFor({ state: 'hidden' });

    const waitlist = new WaitlistPage(page);
    await waitlist.goto();
    await waitlist.expectEntry(bookTitle, 1);
    await waitlist.leave(bookTitle);
  });
});
