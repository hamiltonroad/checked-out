# Frontend E2E Tests

End-to-end tests for the Checked Out frontend, organised as a three-layer pyramid.
The bottom is fast and broad; the top is narrow and deep. New tests should pick the
**lowest** layer that can express the assertion.

## Pyramid Layers

| Layer    | Directory                  | Purpose                                                                  |
| -------- | -------------------------- | ------------------------------------------------------------------------ |
| smoke    | `frontend/e2e/smoke/`      | Fast sanity. App loads, public pages render, no console errors.          |
| flow     | `frontend/e2e/flow/`       | Multi-step authenticated user journeys (checkout/return, waitlist, etc). |
| security | `frontend/e2e/security/`   | RBAC, body-spoofing, redirect guards. Asserts non-2xx contracts.         |

See `standards/quick-ref/testing-guide.md` (section: **Pyramid E2E Layers**) for the
decision rules and naming conventions.

## Layout

```
frontend/e2e/
├── fixtures/        # loginAs, apiRequest, withApiSession, apiRequestRaw, seed data
├── page-objects/    # Reusable Page Object Models (BooksPage, CheckoutDialog, ...)
├── smoke/           # Layer 1 — fast, mostly unauthenticated
├── flow/            # Layer 2 — authenticated user journeys
└── security/        # Layer 3 — authorization and contract assertions
```

## Running Tests

```bash
# Single layer
npx playwright test --project=smoke
npx playwright test --project=flow
npx playwright test --project=security

# Full pyramid (smoke + flow + security)
./scripts/e2e-test.sh

# Story-runner / batch-runner gate (smoke project only)
./scripts/smoke-test.sh
```

Both scripts accept `--start-servers` to launch backend + frontend before running.

## Fixture: `loginAs`

Cookie-based real login. Primes CSRF, posts `/auth/login`, leaves the auth cookie on
the page context. **Never** call `page.goto('/login')` and fill the form yourself, and
**never** set the dev `X-Patron-Id` header.

```ts
import { test, expect } from '@playwright/test';
import { loginAs } from '../fixtures';

test('librarian sees the patrons nav link', async ({ page }) => {
  await loginAs(page, 'librarian');
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Patrons' })).toBeVisible();
});
```

Available roles come from `SEED_PATRONS` in `fixtures/testData.ts`.

## Fixture: `apiRequest` and `withApiSession`

`apiRequest` is a one-shot helper for **unauthenticated** reads or simple setup. It
parses the `ApiResponse` envelope and throws on non-2xx.

```ts
import { apiRequest } from '../fixtures';

const books = await apiRequest<{ books: unknown[] }>('GET', 'books?limit=1');
```

`withApiSession` opens a single authenticated context and reuses it for every call
inside the callback. Use this for **batched mutations** so you do not burn the strict
rate-limiter (ADR-031) with one login per call.

```ts
import { withApiSession } from '../fixtures';

await withApiSession('librarian', async (s) => {
  await s.request('POST', 'checkouts', { book_id: 1, patron_id: 2 });
  await s.request('POST', 'checkouts/1/return');
});
```

`apiRequestRaw` is the **non-throwing** sibling for security tests that need to assert
HTTP 401/403 or `{ success: false }` envelopes:

```ts
import { apiRequestRaw } from '../fixtures';

const res = await apiRequestRaw('POST', 'checkouts', { body: { book_id: 1 } });
expect(res.status).toBe(401);
```

## Page Objects

Page Objects encapsulate selectors and common interactions. Use them whenever a
locator or flow appears in two or more specs.

```ts
import { test, expect } from '@playwright/test';
import { BooksPage } from '../page-objects/BooksPage';

test('book card opens detail dialog', async ({ page }) => {
  const books = new BooksPage(page);
  await books.goto();
  await expect(books.getBookCards().first()).toBeVisible();
  const dialog = await books.openBookDetail(0);
  await expect(dialog).toBeVisible();
});
```

See `frontend/e2e/page-objects/` for the full surface.

## Troubleshooting

- **CSRF errors on POST/PUT/DELETE.** Do not call `/auth/login` or other write endpoints
  from a spec directly — let `loginAs`, `apiRequest`, `withApiSession`, or `apiRequestRaw`
  handle priming. They are the single source of truth for the `_csrf` cookie/header
  handshake.
- **HTTP 429 / rate-limit failures.** You are probably logging in once per request.
  Switch to `withApiSession` so one login covers the whole batch (see ADR-031).
- **Flaky waits.** Never use `page.waitForTimeout()`. Use Locator assertions
  (`await expect(locator).toBeVisible()`) or `waitForSelector` / `waitForLoadState`.
  This is enforced by CLAUDE.md.

## TEST_MODE

`TEST_MODE` is a backend environment flag that replaces both rate-limiter
tiers with a no-op middleware at module load time. It exists so the six
parallel Playwright workers — all hitting the backend from a single IP —
do not exhaust the strict tier (20 requests / 15 minutes) during a flow
or security run.

**Who sets it:**

- `scripts/e2e-test.sh` — exports `TEST_MODE=true` before any work
- `scripts/smoke-test.sh` — same

Those are the only two writers. `TEST_MODE` must never be set in dev,
staging, or production. The backend exits at startup if `TEST_MODE=true`
and `NODE_ENV=production`.

**Gotcha: already-running backend:** the flag is read once at module
load. If a backend is already running on port 3000, `start-backend.sh`
will not restart it and your fresh `export TEST_MODE=true` will have no
effect. Restart first:

```sh
./scripts/stop-all.sh
./scripts/e2e-test.sh --start-servers
```

**How to verify it is active:** the backend logs a single warning line
at startup:

```sh
grep TEST_MODE logs/backend.log
# -> "TEST_MODE active: rate limiting disabled (no-op middleware in place)"
```

If you do not see that line, the running backend is NOT in TEST_MODE and
your flow/security run will flake on 429s.
