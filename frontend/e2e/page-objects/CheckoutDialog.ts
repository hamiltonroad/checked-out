import { Page, Locator, expect } from '@playwright/test';

/**
 * Page object for the CheckoutDialog modal.
 *
 * The CheckoutDialog (frontend/src/components/CheckoutDialog) checks out
 * a copy for the *authenticated* patron — there is no patron picker.
 * The librarian flow exercises this by logging in as the librarian and
 * checking a copy out for themselves.
 *
 * Selectors target the accessible structure: a Dialog with title
 * "Check Out Book", a CopyRadioGroup of radio inputs (one per copy),
 * and a primary "Check Out" button. On success the dialog closes and a
 * "Book checked out successfully!" snackbar appears.
 */
export class CheckoutDialog {
  constructor(private readonly page: Page) {}

  /**
   * Click the "Check Out" button in the parent BookDetailModal to open
   * this dialog. Caller is responsible for first opening the BookDetail
   * modal via BooksPage.openBookDetail().
   */
  async openFromBookDetail(bookDetailDialog: Locator): Promise<void> {
    await bookDetailDialog.getByRole('button', { name: 'Check Out' }).click();
    await this.dialog().waitFor({ state: 'visible' });
  }

  dialog(): Locator {
    return this.page.getByRole('dialog', { name: 'Check Out Book' });
  }

  /** Select the Nth available copy radio. */
  async selectCopy(index: number): Promise<void> {
    const radios = this.dialog().getByRole('radio');
    await radios.nth(index).check();
  }

  /**
   * Select the radio for a specific copy id. CopyRadioGroup renders each
   * radio with value={String(copy.id)}, so we target by the value attribute.
   */
  async selectCopyById(copyId: number): Promise<void> {
    const radio = this.dialog().locator(`input[type="radio"][value="${copyId}"]`);
    await radio.waitFor({ state: 'attached' });
    await radio.check();
  }

  async submit(): Promise<void> {
    await this.dialog().getByRole('button', { name: /^Check Out$/ }).click();
  }

  /** Wait for the dialog to close and the success snackbar to appear. */
  async expectSuccess(): Promise<void> {
    await this.dialog().waitFor({ state: 'hidden' });
    await expect(this.page.getByText('Book checked out successfully!')).toBeVisible();
  }

  async cancel(): Promise<void> {
    await this.dialog().getByRole('button', { name: 'Cancel' }).click();
    await this.dialog().waitFor({ state: 'hidden' });
  }
}
