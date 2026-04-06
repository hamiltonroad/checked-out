import { Page, expect } from '@playwright/test';

/**
 * Page object for the patron detail page (`/patrons/:id`).
 *
 * Asserts the heading and the presence of the "Current Checkouts"
 * section. The section is always rendered (even when the patron has no
 * active checkouts), so its visibility is sufficient evidence that the
 * page mounted with patron data.
 */
export class PatronDetailPage {
  constructor(private readonly page: Page) {}

  async expectLoaded(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Patron Detail' })).toBeVisible();
  }

  async expectCurrentCheckoutsSection(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Current Checkouts' })).toBeVisible();
  }
}
