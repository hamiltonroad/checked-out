# Harness Gaps — 2026-04-06

Harvested from 14 code review files by `/harvest-reviews-kit`.

## Metrics Summary

| Severity | Total |
|----------|------:|
| Critical | 0 |
| High     | 6 |
| Medium   | 30 |
| Low      | 27 |
| **Total**| **63** |

Highest-finding reviews: #220 (12), #219 (9), #218 (8), #221 (7).

## Gaps (after dedup + validation)

### Architecture / Constraints Pillar

| # | Recommendation | Source Reviews | Why Still Needed |
|---|----------------|----------------|------------------|
| 1 | Add CLAUDE.md constraint: "Write operations that depend on aggregate queries (MAX, COUNT) MUST be wrapped in a serializable transaction." | 2026-04-05-issue-200.md | No current rule covers transactional wrapping around aggregate reads; waitlist/checkout race conditions flagged twice |
| 2 | Add CLAUDE.md constraint: "Role identifiers MUST reference constants from `roles.js`/`roles.ts` — never raw role strings in routes, middleware, navigation, or router config." | 2026-04-05-issue-211.md | Hardcoded role strings flagged in 13+ locations; existing no-magic-string rule is not role-specific |
| 3 | Add CLAUDE.md constraint: "When implementing a feature referenced by a seam/TODO comment, update or remove the comment in the same PR." | 2026-04-05-issue-211.md | No rule currently enforces seam-comment hygiene; stale "when role system is implemented" comment survived the PR that implemented it |
| 4 | Add CLAUDE.md constraint: "Service methods MUST NOT mutate formatted response objects — use a separate return shape or extend the formatter." | 2026-04-05-issue-214.md | No existing rule on response mutation; caught by review but not by harness |
| 5 | Strengthen `standards/quick-ref/backend-quick-ref.md` ApiResponse section: "Clients MUST NOT fall back to the raw payload if `data` is missing — trust the envelope or throw." | 2026-04-06-issue-218.md | Current guidance describes the success/error shape but does not address client-side fallback behavior |
| 6 | Add CLAUDE.md constraint: "Numeric literals used in multiple places or representing configuration MUST be extracted to named constants." (Exists as "Hardcoded Values" universal check but not in CLAUDE.md constraints.) | 2026-04-05-issue-204.md | Universal check exists in code-review.md but is not enforced as a CLAUDE.md constraint; missed a page-size magic number |

### E2E Test Quality Pillar

| # | Recommendation | Source Reviews | Why Still Needed |
|---|----------------|----------------|------------------|
| 7 | Add CLAUDE.md constraint (mirroring existing `page.waitForTimeout` ban): "Do NOT use `page.waitForLoadState('networkidle')` in Playwright tests. Use event-based waits or `waitForResponse` against specific endpoints." | 2026-04-06-issue-219.md | Current e2e rule only bans `waitForTimeout`; `networkidle` is similarly flaky and Playwright-discouraged |
| 8 | Add CLAUDE.md constraint: "Console error allowlists in e2e tests MUST list exact strings, not substrings or broad regex (e.g., `/auth/i`). Substring/regex patterns silently swallow real failures." | 2026-04-06-issue-219.md | No current rule on allowlist specificity; `/auth/i` pattern would hide `AuthProvider` crashes |
| 9 | Add CLAUDE.md constraint: "E2E test assertions on identifiers (cookie names, URL paths, role strings) MUST be exact-match — not substring or regex — unless the value is genuinely dynamic." | 2026-04-06-issue-219.md, 2026-04-06-issue-220.md | Loose cookie-name regex and substring `includes('genre')` URL matches both flagged; no current rule |
| 10 | Add CLAUDE.md constraint: "E2E spec files MUST NOT contain CSRF priming, login, or paging logic — extract all such logic to `frontend/e2e/fixtures/`." | 2026-04-06-issue-220.md, 2026-04-06-issue-221.md | 148-line inline login/drain loop duplicated fixture logic; security spec duplicated CSRF priming; no current rule on spec/fixture separation |
| 11 | Add CLAUDE.md constraint: "Page objects MUST NOT select by `.Mui*` CSS class names — use `getByRole`, labels, or `data-testid` attributes." | 2026-04-06-issue-220.md | Page object coupled to MUI internals; no current rule |
| 12 | Add CLAUDE.md constraint: "E2E tests MUST NOT hardcode database ids (e.g., `copy_id: 1`). Use fixtures or API discovery. If a sentinel is intentional, document why." | 2026-04-06-issue-221.md | Hardcoded `copy_id: 1` worked by accident; no current rule |
| 13 | Add CLAUDE.md constraint: "Security/mutation e2e tests MUST seed their own resources via a dedicated helper rather than scanning seed data." Provide a `seedAvailableCopy()` fixture. | 2026-04-06-issue-221.md | Brittle discovery loop burns rate-limiter slots; no current rule |
| 14 | Add a CI/pre-commit check enforcing test-to-code ratio ≥ 0.5 for new component and page files under `frontend/src/components/` and `frontend/src/pages/`. | 2026-04-05-issue-213.md | Quality budget exists in code-review standard but is not enforced at commit time; two component test files missing on #213 |
| 15 | Strengthen `implement-kit.md` and `implement-agent.md`: "Before declaring work done, cross-check every acceptance criterion bullet against a concrete `expect(...)` or code reference. Missing AC assertions = Medium finding." | 2026-04-06-issue-219.md | Status badge AC was missing an assertion; no current agent prompt for AC cross-check |

### Harness Enforcement / Verification Pillar

| # | Recommendation | Source Reviews | Why Still Needed |
|---|----------------|----------------|------------------|
| 16 | Add an ESLint `no-restricted-syntax` rule (or pre-commit grep) that flags any occurrence of the literal `'welcome123'` outside a single canonical config module. Document the canonical path in CLAUDE.md. | 2026-04-06-issue-218.md | CLAUDE.md rule "dev/seed passwords MUST use the same value from a single shared location" EXISTS but was still violated — the literal appears in 3 files. Rule needs enforcement, not just documentation. |
| 17 | Update `.claude/settings.json` PostToolUse ESLint hooks to match `*.ts` and `*.tsx` in addition to `*.js`/`*.jsx`. | 2026-04-05-issue-204.md | Confirmed drift: hooks only match JS extensions; TypeScript files bypass lint-on-save entirely |
| 18 | Add CLAUDE.md constraint: "ESLint rule overrides disabling `max-lines` are forbidden outside type/config globs." Add a CI grep check for `'max-lines': 'off'` in eslint configs. | 2026-04-06-issue-218.md | e2e config blanket-disables `max-lines`; CLAUDE.md only exempts "type/config files" but no enforcement |
| 19 | Add CLAUDE.md constraint: "Environment variable defaults (e.g., `API_BASE_URL`) MUST be defined once per concern and imported — not duplicated across modules." | 2026-04-06-issue-218.md | `API_BASE_URL` duplicated across two fixture files; no current DRY rule for env defaults |
| 20 | Add a pre-commit hook (or ESLint rule) that flags JSDoc blocks not immediately followed by their named export/function. | 2026-04-06-issue-220.md | Orphaned JSDoc block describing wrong function landed in PR; no current check |

## Validation Notes — Recommendations Already Addressed

These recommendations from the reviews were already covered by the existing harness and were NOT included in the gaps above:

- **"Exported helpers reserved for future use"** (218, 220) — CLAUDE.md already has the "no consumer" rule; reviewer notes suggested extending wording, but the rule already covers this case with its "If reserved for future use, add a comment referencing the planned consumer" clause.
- **"Shared TS types canonical location"** (221) — already a CLAUDE.md constraint; reviewer suggested reiterating for e2e package. Noted but not a new gap.
- **"Unused public service methods"** (214) — covered by existing "no consumer" rule.
- **"Duplicate NavigationItem interface"** (211) — covered by existing "Shared TypeScript interfaces and types MUST be defined in one canonical location" rule.
