import { Page, Locator, expect } from '@playwright/test';

/**
 * Page object for the admin/librarian Patrons list page (`/patrons`).
 *
 * Search uses a 300ms debounce, so callers should not wait by sleeping —
 * the matching row will appear via Playwright's auto-retrying assertions.
 */
export class PatronsPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/patrons');
    await this.page.getByRole('heading', { name: 'Patrons' }).waitFor({ state: 'visible' });
  }

  searchInput(): Locator {
    return this.page.getByPlaceholder('Name or card number');
  }

  async search(name: string): Promise<void> {
    await this.searchInput().fill(name);
  }

  rowForPatron(name: string): Locator {
    return this.page.getByRole('row').filter({ hasText: name });
  }

  async openResult(name: string): Promise<void> {
    const row = this.rowForPatron(name).first();
    await expect(row).toBeVisible();
    await row.click();
  }
}
