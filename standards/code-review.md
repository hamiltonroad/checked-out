# Code Review Standard — Checked Out

This file fills the project-specific slots required by `.claude/agents/code-review-kit.md`. It does **not** duplicate universal checks (DRY, KISS, security, hardcoded values) — those live in the agent. It does **not** restate mechanically-enforced rules — those live in `standards/enforcement-registry.md` and `CLAUDE.md`.

When in doubt about what belongs here vs elsewhere, see "What this file does NOT cover" at the bottom.

---

## Severity Levels

| Severity | Action Required |
|---|---|
| **Critical** | Must fix before merge. Breaks functionality, security vulnerability, data loss risk, or violates a `MUST NOT` rule from CLAUDE.md. |
| **High** | Must fix before merge. Architectural violation, missing required test, missing required validator, harness drift. |
| **Medium** | Fix if straightforward. Code quality issue with no immediate functional impact. |
| **Low** | Note for future. Style preference, optional improvement, suggested refactor. |

This table matches the agent's default and overrides nothing. Reviews must use exactly these four levels.

PRs with unresolved Critical or High findings MUST NOT be merged.

---

## File Categorization

Reviews bucket changed files into the categories below. Categorization determines which focus areas apply.

| Category | Glob | Focus areas |
|---|---|---|
| Backend route | `backend/src/routes/**` | Joi validator on every body/query/params; `authenticate` middleware on every PII route; no business logic; role constants from `config/roles.js` |
| Backend controller | `backend/src/controllers/**` | HTTP parsing only; no DB access; no business logic; orchestrates services for multi-service operations; uses `ApiResponse.success/error` |
| Backend service | `backend/src/services/**` | No peer service imports; throws typed errors; serializable transactions for aggregate-then-write; race tests required if applicable |
| Backend model | `backend/src/models/**` | `underscored: true`; `timestamps: true`; no business logic; no raw SQL outside the model |
| Backend validator | `backend/src/validators/**` | Joi schemas only; does not accept fields the controller ignores |
| Backend middleware | `backend/src/middlewares/**` | Single responsibility; no business logic; auth constants imported from `config/auth.js` |
| Backend migration | `backend/src/migrations/**` | Reversible (`up` and `down`); descriptive timestamp name; foreign keys declared; no destructive drops without explicit comment |
| Backend seeder | `backend/src/seeders/**` | Data extracted to `seeders/data/` if file exceeds 200 lines; uses `DEV_PASSWORD` from `config/auth.js`; never the dev-password literal (must come from `DEV_PASSWORD`) |
| Backend config | `backend/src/config/**` | Single source of truth for the concern; environment-validated; no duplication across files |
| Backend utils | `backend/src/utils/**` | Pure functions; reusable across services; no peer service imports |
| Backend test | `backend/src/**/*.test.js`, `backend/src/test-utils/**` | Real database (no mocks for integration); shared setup extracted when used 3+ times; race tests for aggregate-then-write services |
| Frontend page | `frontend/src/pages/**` | `.tsx`; route-level data fetching only; composes smaller components; under 200 lines |
| Frontend component | `frontend/src/components/**` | `.tsx`; props typed via TS interface; no `prop-types`; no inline styles; theme tokens only; under 200 lines; barrel export when consumed |
| Frontend hook | `frontend/src/hooks/**` | Mutations invalidate every affected query key (prefix matching); no `response.data \|\| response` envelope fallback; `use*` naming |
| Frontend service | `frontend/src/services/**` | Returns promises; consumed by hooks not components; no envelope fallback; uses base axios instance |
| Frontend context | `frontend/src/context/**` | Wrapped by a custom hook with error checking; theme tokens only |
| Frontend types | `frontend/src/types/**` | Single canonical home for shared interfaces; no redeclaration in constants or other files |
| Frontend constants | `frontend/src/constants/**` | Domain constants only (status maps, color maps, label maps); no duplication across components |
| Frontend utils | `frontend/src/utils/**` | Pure functions; no React deps; shared formatters (dates, currency, names) live here |
| Frontend theme | `frontend/src/theme/**` | MUI theme config only; theme tokens defined here are the canonical source |
| Frontend router | `frontend/src/router.tsx` | Routes referenced by `<Link>` or `navigate()` must exist here |
| Frontend test | `frontend/src/**/*.test.tsx` | Test behavior not implementation; accessible queries (`getByRole` first); tests migrate with extracted components |
| E2E smoke spec | `frontend/e2e/smoke/**` | No `waitForTimeout`; no `networkidle`; no MUI class selectors; no hardcoded DB ids; no direct mutation API calls; under 150 lines |
| E2E flow spec | `frontend/e2e/flow/**` | Same rules as smoke; uses fixtures from `e2e/fixtures/`; no `helpers/auth` or `helpers/csrf` imports |
| E2E security spec | `frontend/e2e/security/**` | Same rules as flow; identifier assertions are exact-match (no `.includes()`) |
| E2E fixtures/page-objects | `frontend/e2e/fixtures/**`, `frontend/e2e/page-objects/**` | dev-password literal allowed only in `fixtures/testData.ts`; no spec-side selectors leaking in |
| OpenAPI | `backend/api/**` | New paths added to `openapi.yaml`; schemas in `components/schemas.yaml`; matches actual route behavior |
| ADR | `docs/adr/**` | Unique number; status set; supersedes/superseded-by linked if reversing a prior decision |
| Harness — agents/commands | `.claude/agents/**`, `.claude/commands/**` | Project files (no `-kit` suffix) are canonical; `-kit` files must not be edited; flag drift between project version and its kit counterpart |
| Harness — standards | `standards/**` | New mechanically-enforced rules registered in `enforcement-registry.md` with marker string; no orphaned rules |
| Harness — scripts | `scripts/check-*.sh`, `scripts/harness-*.sh` | Each rule embeds a `HARNESS-<ID>` marker grep-able from `harness-health.sh`; failure messages reference the rule ID |
| Harness — config | `.claude/settings.json`, `backend/.eslintrc.json`, `frontend/eslint.config.js` | New rules must have a corresponding registry entry; `eslint-disable` overrides outside the allowlist are findings |
| Documentation | `*.md` (excluding `.claude/temp/**`) | CLAUDE.md changes do not exceed the 150-line soft cap; harness docs reference canonical sources rather than restating them |
| Generated/vendored | `node_modules/**`, `dist/**`, `build/**`, `package-lock.json` | Skip — not reviewed |

If a changed file does not match any glob above, categorize by extension and flag the gap so this table can be extended.

---

## Project-Specific Focus Areas

These are checks the universal agent (`.claude/agents/code-review-kit.md`) cannot know without project context. Do not restate rules that ESLint, check scripts, or the enforcement registry already enforce — those are listed in `standards/enforcement-registry.md` and the agent should treat their **absence** in the codebase as a separate failure mode (the harness has a hole).

### Architecture
- Three-tier dependency direction: routes → controllers → services → models. Any upward import is a Critical finding.
- Business logic in controllers is a Critical finding.
- Service-to-service imports are a Critical finding. Multi-service orchestration belongs in a controller.
- Frontend dependency direction: pages → components → hooks → services. Components calling services directly is a High finding.

### Backend
- Joi validators must not accept fields the controller ignores. If a migration plan exists, the validator may include the field but must reference the issue number in a comment.
- Aggregate-then-write operations (`MAX`, `COUNT`, `MIN` followed by an `INSERT`/`UPDATE`) require a serializable transaction wrapper from `withSerializableTransaction.js`. A `*.race.test.js` is required.
- Routes returning patron PII (names, card numbers, emails) require `authenticate` middleware. This is a Critical finding if missing.
- Status checks must test for the expected positive state (`=== 'active'`), not enumerate negative states.

### Frontend
- Components are `.tsx` with props typed via a TypeScript `interface`. `prop-types` is a Critical finding (`HARNESS-NO-PROP-TYPES`).
- React Query mutations must invalidate every query key displaying affected data. Missing invalidation is a High finding — stale cache is a recurring bug source.
- `response.data || response` envelope fallback is forbidden. High finding.
- Inline styles, inline color/spacing/typography literals in MUI components are findings. Use `sx` or `styled()` with theme tokens.
- `<Link>` or `navigate()` calls to routes that do not exist in `router.tsx` are High findings.

### Testing
- Integration tests must hit a real database. Mocked database tests for integration paths are a High finding (prior incident: mocked tests passed, prod migration broke).
- Race-condition tests required for any service performing aggregate-then-write.
- E2E specs must use event-based waits (`waitForSelector`, `waitForLoadState('domcontentloaded')`, Locator assertions). `waitForTimeout` and `networkidle` are findings.
- When extracting a component to its own file, applicable tests must migrate with it.

### Security
- The dev-password literal may appear ONLY in `backend/src/config/auth.js` and `frontend/e2e/fixtures/testData.ts`. Anywhere else is a Critical finding.
- Auth constants (`SALT_ROUNDS`, token expiry) must come from `backend/src/config/auth.js` — never redefined locally.
- Role checks must use constants from `config/roles.js` (backend) or `utils/roles.ts` (frontend) — never raw string literals.
- No interpolation of user-supplied values into `sequelize.literal()`.

### Harness
- New mechanically-enforced rules must register a marker string in `standards/enforcement-registry.md`.
- New rules should declare a "Retire when:" condition (this column is on the prune-cycle todo list).
- Any `eslint-disable` added in the diff without a justification comment is a Medium finding.
- New ADRs must have a unique number. Duplicate numbers are a High finding.

---

## What this file does NOT cover

The following are handled elsewhere — do not restate them here, and do not extend this file with rules that belong in those locations:

| Concern | Canonical home |
|---|---|
| DRY / KISS / SOLID universal checks | `.claude/agents/code-review-kit.md` Step 4 |
| Security universal checks (credentials, injection, XSS) | `.claude/agents/code-review-kit.md` Step 4 |
| Mechanically-enforced rules (ESLint, check scripts) | `standards/enforcement-registry.md` |
| Rules that always apply to every file in the repo | `CLAUDE.md` |
| Specific architecture decisions and their rationale | `docs/adr/` |
| Backend tech-stack and pattern detail | `standards/full/backend-standards.md` |
| Frontend tech-stack and pattern detail | `standards/full/frontend-standards.md` |
| E2E testing rules in detail | `standards/e2e-testing.md` |
| Craftsmanship principles in detail | `standards/full/craftsmanship.md` |
| UX principles, heuristics, and review checklist | `standards/full/ux-standards.md` |

If a rule belongs in two places, this file is the wrong one.
