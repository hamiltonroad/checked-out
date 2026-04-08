import { test } from '../fixtures/consoleGuard';
import { loginAs } from '../fixtures/auth';
import { SEED_PATRONS } from '../fixtures/testData';
import { PatronsPage, PatronDetailPage } from '../page-objects';

/**
 * Flow 4 — Patron search and detail navigation.
 *
 * Logs in as admin, navigates to the Patrons list, searches by a
 * substring of a known seed patron name, opens the matching row, and
 * asserts the PatronDetailPage loads with its Current Checkouts
 * section visible. The current-checkouts section is always rendered
 * (even when empty) so its presence is sufficient evidence the page
 * mounted with patron data.
 */
test.describe('Flow: patron search and detail navigation', () => {
  test('admin can search patrons and open a detail page', async ({ page }) => {
    await loginAs(page, 'admin');

    const patrons = new PatronsPage(page);
    await patrons.goto();

    // Pick the librarian seed patron — they have a known name and will
    // appear in the patron list (librarian role still has a patron row).
    const fullName = SEED_PATRONS.librarian.name as string;
    const lastName = fullName.split(' ').pop() as string;
    await patrons.search(lastName);
    await patrons.openResult(lastName);

    const detail = new PatronDetailPage(page);
    await detail.expectLoaded();
    await detail.expectCurrentCheckoutsSection();
  });
});
