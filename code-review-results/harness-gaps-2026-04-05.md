# Harness Gaps — 2026-04-05

Harvested from 21 code review files by `/harvest-reviews-kit`.

## Gaps

| # | Recommendation | Source Review(s) | Why Still Needed |
| --- | --- | --- | --- |
| 1 | Add automation (hook or CI check) to detect PII endpoints missing `authenticate` middleware | 2026-04-03-issue-99.md | CLAUDE.md constraint exists but is not enforced by any automation; agent may miss it |
| 2 | Add ESLint rule or tooling (`ts-prune`, `knip`) to flag unused exports and dead code (parameters, files) | 2026-04-03-issue-99.md, 2026-04-05-issue-188.md, 2026-04-05-issue-197.md | CLAUDE.md says "no unused parameters" but no automated enforcement exists |
| 3 | Add CLAUDE.md constraint: shared interfaces must be defined in one canonical location (`types/index.ts`) — do not redeclare in constants files | 2026-04-04-issue-177.md | No rule prevents duplicate interface definitions across files |
| 4 | Add CLAUDE.md constraint: shared domain constants (status maps, color maps, magic numbers) must live in `frontend/src/constants/` — never duplicated across components | 2026-04-04-issue-180.md, 2026-04-05-issue-186.md | No rule prevents duplicated constant objects across components |
| 5 | Update `.claude/settings.json` ESLint and test hooks to match `.ts` and `.tsx` files in addition to `.js`/`.jsx` | 2026-04-05-issue-189.md | Current hooks only fire for `.js`/`.jsx` — TypeScript files bypass all automated lint and test checks |
| 6 | Clarify CLAUDE.md PropTypes convention for `.tsx` files: either TypeScript interfaces satisfy the requirement or PropTypes are required alongside TS interfaces | 2026-04-05-issue-189.md | 40+ `.tsx` components use TS interfaces without PropTypes; convention contradicts codebase reality |
| 7 | Add CLAUDE.md constraint: when extracting a component from an existing component, migrate all applicable tests to the new component's test file — do not silently drop test coverage | 2026-04-05-issue-190.md | No rule prevents losing test coverage during component extraction refactors |
| 8 | Add CLAUDE.md constraint: validators must not accept fields the controller ignores unless there is a documented migration plan with issue reference | 2026-04-05-issue-197.md | No rule catches misleading validator schemas that accept unused fields |
| 9 | Add CLAUDE.md guidance for Sequelize ORM alternatives to raw SQL (HAVING, GROUP, subqueries) to strengthen "no raw SQL" constraint | 2026-04-05-issue-186.md | Constraint says "no raw SQL" but provides no guidance on ORM alternatives for complex queries |
| 10 | Add automated PropTypes check (ESLint rule or pre-commit hook) for component files | 2026-04-05-issue-186.md | PropTypes convention exists but has no automated enforcement |
