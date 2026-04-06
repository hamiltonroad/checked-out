import { Page } from '@playwright/test';
import { DEV_PASSWORD, SEED_PATRONS, PatronRole, SeedPatron } from './testData';

/**
 * Real cookie-based login for e2e tests. No dev X-Patron-Id header usage.
 * Primes CSRF via a safe GET, then POSTs to /auth/login. On success, the
 * page context retains the auth cookie for subsequent navigation.
 */
export async function loginAs(page: Page, role: PatronRole): Promise<SeedPatron> {
  const patron = SEED_PATRONS[role];
  const apiBase = process.env.API_BASE_URL ?? 'http://localhost:3000/api/v1';

  await page.request.get(`${apiBase}/books?limit=1`);
  const cookies = await page.context().cookies();
  const csrf = cookies.find((c) => c.name === '_csrf')?.value ?? '';

  const res = await page.request.post(`${apiBase}/auth/login`, {
    data: { card_number: patron.cardNumber, password: DEV_PASSWORD },
    headers: { 'X-CSRF-Token': csrf, 'Content-Type': 'application/json' },
  });

  if (!res.ok()) {
    throw new Error(`loginAs(${role}) failed: HTTP ${res.status()}`);
  }

  return patron;
}
