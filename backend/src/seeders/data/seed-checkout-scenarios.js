/**
 * Checkout scenario definitions for the test data seeder.
 * Each scenario specifies relative day offsets for checkout_date, due_date, and return_date.
 * Patron and copy indices reference the SEED- prefixed records.
 */

// Scenario: { copyIdx, patronIdx, checkoutDaysAgo, dueDaysAgo (neg = future), returnDaysAgo (null = active) }

const OVERDUE = [
  { copyIdx: 0, patronIdx: 0, checkoutDaysAgo: 30, dueDaysAgo: 2, returnDaysAgo: null },
  { copyIdx: 1, patronIdx: 1, checkoutDaysAgo: 25, dueDaysAgo: 7, returnDaysAgo: null },
  { copyIdx: 2, patronIdx: 2, checkoutDaysAgo: 28, dueDaysAgo: 14, returnDaysAgo: null },
];

const DUE_SOON = [
  { copyIdx: 3, patronIdx: 3, checkoutDaysAgo: 18, dueDaysAgo: -1, returnDaysAgo: null },
  { copyIdx: 4, patronIdx: 4, checkoutDaysAgo: 19, dueDaysAgo: -2, returnDaysAgo: null },
  { copyIdx: 8, patronIdx: 5, checkoutDaysAgo: 17, dueDaysAgo: -3, returnDaysAgo: null },
];

const ACTIVE_NOT_DUE = [
  { copyIdx: 5, patronIdx: 0, checkoutDaysAgo: 7, dueDaysAgo: -7, returnDaysAgo: null },
  { copyIdx: 6, patronIdx: 1, checkoutDaysAgo: 5, dueDaysAgo: -9, returnDaysAgo: null },
  { copyIdx: 7, patronIdx: 2, checkoutDaysAgo: 3, dueDaysAgo: -11, returnDaysAgo: null },
  { copyIdx: 9, patronIdx: 3, checkoutDaysAgo: 2, dueDaysAgo: -14, returnDaysAgo: null },
  { copyIdx: 10, patronIdx: 4, checkoutDaysAgo: 1, dueDaysAgo: -21, returnDaysAgo: null },
];

const RETURNED_ON_TIME = [
  { copyIdx: 0, patronIdx: 1, checkoutDaysAgo: 60, dueDaysAgo: 46, returnDaysAgo: 50 },
  { copyIdx: 1, patronIdx: 2, checkoutDaysAgo: 55, dueDaysAgo: 41, returnDaysAgo: 45 },
  { copyIdx: 2, patronIdx: 3, checkoutDaysAgo: 50, dueDaysAgo: 36, returnDaysAgo: 40 },
  { copyIdx: 3, patronIdx: 4, checkoutDaysAgo: 45, dueDaysAgo: 31, returnDaysAgo: 35 },
  { copyIdx: 4, patronIdx: 5, checkoutDaysAgo: 40, dueDaysAgo: 26, returnDaysAgo: 30 },
  { copyIdx: 5, patronIdx: 0, checkoutDaysAgo: 35, dueDaysAgo: 21, returnDaysAgo: 25 },
];

const RETURNED_OVERDUE = [
  { copyIdx: 6, patronIdx: 1, checkoutDaysAgo: 70, dueDaysAgo: 56, returnDaysAgo: 52 },
  { copyIdx: 7, patronIdx: 2, checkoutDaysAgo: 65, dueDaysAgo: 51, returnDaysAgo: 48 },
  { copyIdx: 8, patronIdx: 3, checkoutDaysAgo: 62, dueDaysAgo: 48, returnDaysAgo: 44 },
  { copyIdx: 9, patronIdx: 4, checkoutDaysAgo: 58, dueDaysAgo: 44, returnDaysAgo: 40 },
];

const ALL_SCENARIOS = [
  ...OVERDUE,
  ...DUE_SOON,
  ...ACTIVE_NOT_DUE,
  ...RETURNED_ON_TIME,
  ...RETURNED_OVERDUE,
];

module.exports = { ALL_SCENARIOS };
