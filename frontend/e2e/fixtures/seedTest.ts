import { test as base } from '@playwright/test';
import {
  seedAvailableCopy,
  seedPatronWithHolds,
  seedCheckedOutCopy,
  releaseCheckouts,
} from './seed';

/**
 * Playwright fixtures that wrap the seed helpers in seed.ts and register
 * automatic teardown via Playwright's fixture lifecycle (issue #229 item
 * #13, code review fix).
 *
 * Specs that need a precondition import `test` from this module:
 *
 *   import { test, expect } from '../fixtures/seedTest';
 *
 *   test('returning a checked-out copy', async ({ page, checkedOutCopy }) => {
 *     // checkedOutCopy is { bookId, copyId, checkoutId }
 *     // cleanup happens automatically when the test finishes
 *   });
 *
 * The wrapped helpers are:
 *
 *   - availableCopy   — provides { bookId, copyId, format }, no teardown
 *                       (the helper does not create persistent state)
 *   - patronWithHolds — provides { bookId }, releases drained checkouts
 *                       in afterEach
 *   - checkedOutCopy  — provides { bookId, copyId, checkoutId }, returns
 *                       the copy in afterEach
 *
 * Use these instead of calling seedCheckedOutCopy / seedPatronWithHolds
 * directly so the spec author cannot forget to clean up.
 */

type SeedFixtures = {
  availableCopy: {
    bookId: number;
    copyId: number;
    format: string;
  };
  patronWithHolds: {
    bookId: number;
  };
  checkedOutCopy: {
    bookId: number;
    copyId: number;
    checkoutId: number;
  };
};

/* eslint-disable react-hooks/rules-of-hooks -- Playwright fixture `use` callback is not a React hook */
export const test = base.extend<SeedFixtures>({
  // eslint-disable-next-line no-empty-pattern
  availableCopy: async ({}, use) => {
    const data = await seedAvailableCopy();
    await use(data);
    // No teardown — seedAvailableCopy probes-and-returns; nothing to release.
  },
  // eslint-disable-next-line no-empty-pattern
  patronWithHolds: async ({}, use) => {
    const seeded = await seedPatronWithHolds();
    await use({ bookId: seeded.bookId });
    await releaseCheckouts(seeded.checkoutIds);
  },
  // eslint-disable-next-line no-empty-pattern
  checkedOutCopy: async ({}, use) => {
    const seeded = await seedCheckedOutCopy();
    await use(seeded);
    await releaseCheckouts([seeded.checkoutId]);
  },
});
/* eslint-enable react-hooks/rules-of-hooks */

export { expect } from '@playwright/test';
