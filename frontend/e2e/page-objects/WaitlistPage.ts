import { Page, Locator, expect } from '@playwright/test';

/**
 * Page object for the patron Waitlist & Holds page (`/waitlist-holds`).
 *
 * Wraps WaitlistCard rendering: each entry shows the book title (as a
 * button), a position label "Position: #N of M", and a "Leave Waitlist"
 * action button.
 */
export class WaitlistPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/waitlist-holds');
    await this.page
      .getByRole('heading', { name: 'Waitlist & Holds' })
      .waitFor({ state: 'visible' });
  }

  /** Locator for a waitlist card containing the given book title. */
  cardForBook(bookTitle: string): Locator {
    return this.page
      .locator('.MuiCard-root')
      .filter({ has: this.page.getByRole('button', { name: bookTitle }) });
  }

  async expectEntry(bookTitle: string, position: number): Promise<void> {
    const card = this.cardForBook(bookTitle).first();
    await expect(card).toBeVisible();
    await expect(
      card.getByText(new RegExp(`Position:\\s*#${position}\\b`)).first()
    ).toBeVisible();
  }

  async leave(bookTitle: string): Promise<void> {
    const card = this.cardForBook(bookTitle).first();
    const before = await this.cardForBook(bookTitle).count();
    await card.getByRole('button', { name: 'Leave Waitlist' }).click();
    await expect
      .poll(async () => this.cardForBook(bookTitle).count(), { timeout: 5000 })
      .toBeLessThan(before);
  }

  async expectEmpty(): Promise<void> {
    await expect(this.page.getByText('Not on any waitlists')).toBeVisible();
  }
}
