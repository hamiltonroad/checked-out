# Harness Enforcement Registry

This file is the single source of truth for every mechanically-enforced
harness rule in the Checked Out repo. It exists so that:

1. The code-review agent's self-audit (Step 8.5) can verify every rule
   referenced in a harness-improvement issue is still active.
2. `scripts/harness-health.sh` greps each enforcement location for the
   listed marker string and fails if any marker is missing — catching
   silent rule deletion during refactors.
3. `/harvest-reviews-kit` appends new rule IDs here when it creates or
   updates harness-improvement issues.

## Adding a new rule

When you add a mechanically-enforced harness rule:

1. Pick a unique stable ID, prefixed `HARNESS-` (e.g.
   `HARNESS-DEV-PASSWORD-LITERAL`).
2. Embed the marker string `[HARNESS-<ID> issue #<n>]` (or
   `# HARNESS-<ID> (issue #<n>)` for shell scripts) in the enforcement
   site so it appears in `grep -F`.
3. Add a row to the table below.

## Registry

| Rule ID | Origin Issue | Enforcement Location | Marker String | Description |
|---|---|---|---|---|
| HARNESS-LINT-HOOK-TS | #230 | `.claude/settings.json` | `HARNESS-LINT-HOOK-TS` | PostToolUse hook runs `npx eslint` for `.ts/.tsx` files in addition to `.js/.jsx`. Sentinel embedded as a shell comment inside the hook `command` string (JSON disallows top-level comments). |
| HARNESS-DEV-PASSWORD-LITERAL | #230 | `backend/.eslintrc.json` | `HARNESS-DEV-PASSWORD-LITERAL` | ESLint `no-restricted-syntax` blocks the literal `'welcome123'` outside `backend/src/config/auth.js`. Top-level + per-override merges. |
| HARNESS-DEV-PASSWORD-LITERAL | #230 | `frontend/eslint.config.js` | `HARNESS-DEV-PASSWORD-LITERAL` | ESLint flat-config block bans `'welcome123'` outside `frontend/e2e/fixtures/testData.ts`. |
| HARNESS-DEV-PASSWORD-LITERAL | #230 | `scripts/check-welcome123.sh` | `HARNESS-DEV-PASSWORD-LITERAL` | Authoritative grep check (belt-and-suspenders for the ESLint rule which can be silently shadowed by per-file override blocks). |
| HARNESS-MAX-LINES-OVERRIDE-GUARD | #230 | `scripts/check-eslint-overrides.sh` | `HARNESS-MAX-LINES-OVERRIDE-GUARD` | Bash check fails if `'max-lines': 'off'` appears in any ESLint config outside the test/type/config/seeders allowlist. |
| HARNESS-ENV-SINGLE-SOURCE | #230 | `scripts/check-env-single-source.sh` | `HARNESS-ENV-SINGLE-SOURCE` | Bash grep: fails if any known env-var default literal appears in more than one source file. Shallow stand-in; the full tsconfig path-mapping refactor + `no-restricted-syntax` ban on direct `import.meta.env`/`process.env` access is tracked as the Rec #19 follow-up on issue #230. |
| HARNESS-ORPHAN-JSDOC | #230 | `scripts/check-orphan-jsdoc.sh` | `HARNESS-ORPHAN-JSDOC` | Bash check flags JSDoc blocks separated from their declaration by 2+ blank lines. **Conservative implementation** — a real ESLint plugin walking the AST is the future enhancement. |
| HARNESS-ROLE-LITERAL-BACKEND | #228 | `backend/.eslintrc.json` | `Use role constants from src/config/roles.js` | ESLint `no-restricted-syntax` bans raw role string literals in routes/middlewares. |
| HARNESS-ROLE-LITERAL-FRONTEND | #228 | `frontend/eslint.config.js` | `Use role constants from src/utils/roles.ts` | ESLint flat-config block bans raw role literals project-wide except `utils/roles.ts` and tests. |
| HARNESS-NO-ENVELOPE-FALLBACK | #228 | `frontend/eslint.config.js` | `Do not fall back to a default when ApiResponse data is missing` | Bans `response.data || response` style envelope fallback in services/hooks. |
| HARNESS-NO-MAGIC-NUMBERS-FRONTEND | #228 | `frontend/eslint.config.js` | `no-magic-numbers` | Warns on magic numbers in services/hooks/pages. |
| HARNESS-NO-MAGIC-NUMBERS-BACKEND | #228 | `backend/.eslintrc.json` | `no-magic-numbers` | Warns on magic numbers in services/controllers/middlewares. |
| HARNESS-E2E-NETWORKIDLE | #229 | `frontend/eslint.config.js` | `networkidle is flaky` | Bans `waitForLoadState('networkidle')` in e2e specs. |
| HARNESS-E2E-EXACT-MATCH | #229 | `frontend/eslint.config.js` | `Identifier assertions (URLs, cookies, paths) must be exact-match` | Bans substring `.includes()` checks on URL/cookie/path identifiers. |
| HARNESS-E2E-NO-HARDCODED-IDS | #229 | `frontend/eslint.config.js` | `Do not hardcode database ids in e2e specs` | Bans hardcoded numeric `*_id` properties in spec object literals. |
| HARNESS-E2E-NO-DIRECT-MUTATIONS | #229 | `frontend/eslint.config.js` | `Specs must not call mutation APIs directly` | Bans direct `fetch()`/`page.request.{post,put,patch,delete}`/`session.request('POST',...)` to mutation endpoints from specs. |
| HARNESS-E2E-NO-MUI-CLASSES | #229 | `frontend/eslint.config.js` | `Do not select by MUI class names` | Bans `.Mui*` class-name selectors in specs and page objects. |
| HARNESS-E2E-FIXTURE-IMPORTS | #229 | `frontend/eslint.config.js` | `Specs must import auth/csrf setup from frontend/e2e/fixtures/` | Bans `helpers/auth` and `helpers/csrf` imports from spec files. |
| HARNESS-E2E-MAX-LINES | #229 | `frontend/eslint.config.js` | `{ max: 150, skipBlankLines: true, skipComments: true }` | E2E spec files capped at 150 lines. |
| HARNESS-RACE-TEST-REQUIRED | (predates registry) | `scripts/check-race-tests.sh` | `check-race-tests` | Requires `*.race.test.js` for any service performing aggregate-then-write. Wired into `backend/npm run lint`. |
| HARNESS-PII-AUTH | (predates registry) | `scripts/check-pii-auth.sh` | `check-pii-auth` | Requires `authenticate` middleware on routes returning patron PII. |
| HARNESS-TEST-RATIO | (predates registry) | `scripts/check-test-ratio.sh` | `check-test-ratio` | Pre-commit ratio check enforced via Husky. |

## Health check

Run `bash scripts/harness-health.sh` (or `npm run harness:health`) to
verify every marker string above is still present at its enforcement
location.
