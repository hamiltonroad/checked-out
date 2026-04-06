import { Page, Locator } from '@playwright/test';

/**
 * Page object encapsulating the Books landing page (`/`).
 *
 * Selectors are intentionally semantic (role + accessible name) since
 * BookCard exposes `role="button"` with `aria-label="View details for ..."`.
 */
export class BooksPage {
  constructor(private readonly page: Page) {}

  /**
   * Navigate to the Books page. Callers should await a specific element
   * (e.g., `getBookCards().first()`) to confirm readiness — avoid
   * `waitForLoadState('networkidle')` which is flaky with React Query.
   */
  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  /**
   * Locator matching every BookCard via its accessible name.
   * Use `.first()`, `.nth(i)`, or `.count()` from the caller.
   */
  getBookCards(): Locator {
    return this.page.getByRole('button', { name: /^View details for / });
  }

  /**
   * Click the Nth book card and return the resulting modal dialog locator.
   * Awaits visibility of the dialog before returning.
   */
  async openBookDetail(index: number): Promise<Locator> {
    const card = this.getBookCards().nth(index);
    await card.click();
    const dialog = this.page.getByRole('dialog');
    await dialog.waitFor({ state: 'visible' });
    return dialog;
  }
}
