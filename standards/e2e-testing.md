# E2E Testing Standards

Proactive standards for Playwright end-to-end tests in `frontend/e2e/`.
These rules exist to keep the suite deterministic, cheap to debug, and
free of coupling to implementation details. Most are mechanically
enforced by ESLint in `frontend/eslint.config.js`; the rest are
checked by `frontend/e2e/config/allowlist.test.ts` or reviewed at PR
time.

**Authority:** When a rule here conflicts with a habit from other
Playwright projects, this document wins. It was assembled after a
series of flake-driven code reviews (issues #213, #219, #220, #221);
every rule has blood on it.

---

## 1. Waiting Strategy

**Do** use event-based waits tied to a specific thing you care about:

```ts
// Wait for the catalog fetch that backs the page
const booksReq = page.waitForResponse(
  (r) => r.url().includes('/books') && r.status() === 200
);
await page.goto('/');
await booksReq;

// Or wait on a Locator assertion
await expect(page.getByRole('heading', { name: 'Catalog' })).toBeVisible();
```

**Don't**:

- `page.waitForTimeout(ms)` — arbitrary sleeps hide real races.
- `page.waitForLoadState('networkidle')` — Playwright itself
  [discourages it](https://playwright.dev/docs/api/class-page#page-wait-for-load-state).
  React Query background refetches make "idle" a moving target.
- Polling with `while` loops unless there is no event to listen to.

Both bans are enforced by ESLint (`no-restricted-syntax`) in
`frontend/e2e/{smoke,security,flow}/**`.

---

## 2. Selector Hierarchy

Select elements in this order of preference. Drop down a level only
when the one above is genuinely impossible.

1. `getByRole(role, { name })` — accessible, role-based.
2. `getByLabel(text)` — form controls with associated labels.
3. `getByTestId('...')` — when roles/labels are ambiguous; add the
   `data-testid` in the component source.
4. `getByText('exact text')` — for static copy.

**Forbidden**:

- MUI CSS class names such as `.MuiButton-root`, `.MuiDialogTitle-root`.
  These are implementation detail and change between MUI versions.
  Enforced by ESLint against any `Literal` matching `/\.Mui[A-Z]/` in
  `frontend/e2e/page-objects/**`.
- Deep descendant chains (`.foo .bar .baz > span`). One level of
  structural nesting is the maximum.

---

## 3. Fixture Discipline

Spec files contain `test(...)` blocks, `expect(...)` assertions, and
page-object method calls. **Nothing else.**

**Every** login, CSRF prime, paging loop, rate-limiter workaround,
API seeding call, or cleanup loop belongs in `frontend/e2e/fixtures/`.
Specs import from there; they do not reinvent it.

**Enforced by**:

- `no-restricted-imports` banning `**/helpers/auth`, `**/helpers/csrf`
  from the spec dirs — specs must import from `fixtures/`.
- `max-lines: 150` on spec files (issue #229). Anything longer is
  smuggling in logic that belongs in a fixture.

**Do**:

```ts
import { seedAvailableCopy, releaseCheckouts } from '../fixtures';

test('librarian can check out a copy', async ({ page }) => {
  const { copyId } = await seedAvailableCopy();
  // drive the UI ...
});
```

**Don't**: inline a 40-line loop that pages through `/books` looking
for one that isn't encumbered. That loop lives in
`fixtures/seed.ts::findUngatedCopy()`; call it.

---

## 4. Seeding Rules

Mutation tests (`security/`, `flow/`) must seed their own preconditions
through a named fixture helper. Available today:

- `seedAvailableCopy()` — returns `{ bookId, copyId, format }` for a
  copy the librarian can provably check out.
- `seedPatronWithHolds()` — returns `{ bookId, checkoutIds }` with
  every copy of the book already drained. Caller passes `checkoutIds`
  to `releaseCheckouts()` on teardown.
- `seedCheckedOutCopy()` — returns `{ bookId, copyId, checkoutId }`
  for a copy that has already been checked out as the librarian.

**Forbidden**:

- Hardcoded database ids (`copy_id: 1`). Enforced by ESLint
  `no-restricted-syntax` against `{ *_id: <numeric literal> }` in
  the spec dirs. If you need a poison-pill id for a negative test,
  import it from `fixtures/testData.ts` as a named constant
  (e.g. `SENTINEL_COPY_ID`) — the rule only catches raw literals.
- Scanning seed data in-spec. Call `seedAvailableCopy()` instead.
- Direct `fetch('/api/copies'|'/api/patrons'|'/api/checkouts', ...)`
  calls from specs. Enforced by ESLint — route through fixtures.

---

## 5. Assertion Rules

Identifiers (cookie names, URL pathnames, role strings) are
**exact-match**. Only genuinely dynamic values (request ids, ISO
timestamps) are allowed to use regex.

```ts
// Good
expect(cookieName).toBe('_csrf');
expect(new URL(page.url()).pathname).toBe('/books/42');

// Bad — substring match hides the wrong cookie being set
expect(cookieName.includes('csrf')).toBe(true);
// Bad — regex in an identifier assertion
expect(pathname).toMatch(/books/i);
```

Substring `.includes()` on variables named `url`, `cookie`, or
`pathname` is enforced-banned by ESLint.

**Console error allowlists** follow the same rule:

- Entries must be plain strings, matched by equality or `startsWith`.
- No `RegExp`. No case-insensitive matches. No short prefixes.
- The single source of truth is
  `frontend/e2e/config/console-allowlist.ts`; its integrity is
  guarded by `frontend/e2e/config/allowlist.test.ts`.

---

## 6. Quality Budget

- **Spec file length:** max 150 lines (enforced). If you're hitting the
  cap, extract to a fixture or page object.
- **Test-to-code ratio:** new `frontend/src/pages/**` or
  `frontend/src/components/**` files require a sibling `.test.tsx`.
  Enforced by `scripts/check-test-ratio.sh` in the pre-commit hook.
- **Timeouts:** never longer than 15s per assertion. Longer means
  you're waiting on the wrong event.
- **Rate-limiter pressure:** strict routes (`POST /checkouts`,
  `POST /auth/login`) cost 1 slot out of 20 per 15 minutes per IP.
  Batch operations through `withApiSession` so one test burns one
  login, not N.

---

## 7. Review Checklist

Before opening a PR that adds or modifies a spec, run through this
list. The code reviewer will.

- [ ] No `waitForTimeout`. No `waitForLoadState('networkidle')`.
- [ ] No MUI class selectors anywhere under `page-objects/`.
- [ ] Every selector uses `getByRole`/`getByLabel`/`getByTestId`
      first.
- [ ] No inline login, CSRF prime, paging loop, or discovery scan.
      Imports come from `fixtures/`.
- [ ] No hardcoded numeric database ids. Seeding goes through a
      named helper.
- [ ] Every identifier assertion (cookie, URL, role, pathname) uses
      exact equality.
- [ ] Any added console-error allowlist entry is a plain string
      (>= 10 chars) and is paired with a comment explaining which
      network call produces it.
- [ ] Spec file is under 150 lines.
- [ ] Cleanup is handled — `releaseCheckouts`, `afterEach`, or the
      fixture's teardown.
- [ ] `cd frontend && npm run lint` is clean.
- [ ] `npm run test:smoke` passes locally against running servers.
