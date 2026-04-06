/**
 * Shared narrow response shapes for e2e fixtures and specs.
 *
 * These are intentionally narrower than the canonical app types in
 * `frontend/src/types/index.ts` — e2e tests only need the fields they
 * actually assert against. Centralizing them here satisfies the CLAUDE.md
 * "shared types in one canonical location" rule for the e2e package.
 */

export interface MeData {
  id: number;
}

export interface BookListData {
  books?: Array<{ id: number }>;
}

export interface AvailableCopiesData {
  copies?: Array<{ id: number }>;
  totalCopies?: number;
}

/**
 * Sequelize Checkout instance shape returned by POST /api/v1/checkouts.
 * Uses snake_case (`patron_id`) because the controller returns the raw
 * model instance, not a formatted DTO.
 */
export interface CheckoutCreatedData {
  id: number;
  patron_id: number;
  copy_id: number;
}
