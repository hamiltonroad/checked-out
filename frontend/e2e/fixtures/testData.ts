/**
 * Shared test data constants for e2e tests.
 * Sourced from backend seeders — canonical dev password lives in
 * backend/src/config/auth.js. Override via DEV_PASSWORD env var; the
 * fallback below MUST match that canonical value.
 */

export const DEV_PASSWORD = process.env.DEV_PASSWORD ?? 'welcome123';

export type PatronRole = 'admin' | 'librarian' | 'patron';

export interface SeedPatron {
  cardNumber: string;
  role: PatronRole;
  name?: string;
}

export const SEED_PATRONS: Record<PatronRole, SeedPatron> = {
  admin: { cardNumber: 'SEED-001', role: 'admin', name: 'Dana Reyes' },
  librarian: { cardNumber: 'SEED-002', role: 'librarian', name: 'Marcus Thornton' },
  patron: { cardNumber: 'LIB001', role: 'patron' },
};
