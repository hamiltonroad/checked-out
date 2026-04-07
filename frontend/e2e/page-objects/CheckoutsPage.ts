import { Page, Locator, expect } from '@playwright/test';

/**
 * Page object for the librarian Checkouts page (`/checkouts`).
 *
 * Wraps the tabbed interface (Current / History / Overdue) and the
 * underlying CheckoutTable rows. Selectors target accessible names from
 * the React components — see CheckoutsPage.tsx and CheckoutTable.tsx.
 */
export class CheckoutsPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/checkouts');
    await this.page.getByRole('heading', { name: 'Checkouts' }).waitFor({ state: 'visible' });
  }

  async currentTab(): Promise<void> {
    await this.page.getByRole('tab', { name: 'Current' }).click();
  }

  async historyTab(): Promise<void> {
    await this.page.getByRole('tab', { name: 'History' }).click();
  }

  /**
   * Locator for a table row containing the given book title (and
   * optionally a patron name to disambiguate when multiple patrons
   * have the same book checked out).
   */
  rowForBook(bookTitle: string, patronName?: string): Locator {
    let row = this.page.getByRole('row').filter({ hasText: bookTitle });
    if (patronName) row = row.filter({ hasText: patronName });
    return row;
  }

  async expectCheckout(bookTitle: string, patronName?: string): Promise<void> {
    await expect(this.rowForBook(bookTitle, patronName).first()).toBeVisible();
  }

  async expectNoCheckout(bookTitle: string, patronName?: string): Promise<void> {
    await expect(this.rowForBook(bookTitle, patronName)).toHaveCount(0);
  }

  /**
   * Click the Return button in the row matching the given book title and
   * wait for the row count to decrement. Pre-existing duplicate rows
   * (state pollution from prior runs) are tolerated — we only assert the
   * specific row we just operated on disappeared.
   */
  async returnCheckout(bookTitle: string, patronName?: string): Promise<void> {
    const before = await this.rowForBook(bookTitle, patronName).count();
    const row = this.rowForBook(bookTitle, patronName).first();
    await row.getByRole('button', { name: 'Return' }).click();
    // UX audit (#238) added a confirm dialog before destructive return.
    const confirmDialog = this.page.getByRole('dialog', { name: 'Return this book?' });
    await confirmDialog.waitFor({ state: 'visible' });
    await confirmDialog.getByRole('button', { name: 'Return' }).click();
    await confirmDialog.waitFor({ state: 'hidden' });
    await expect
      .poll(async () => this.rowForBook(bookTitle, patronName).count(), {
        timeout: 5000,
      })
      .toBeLessThan(before);
  }
}
