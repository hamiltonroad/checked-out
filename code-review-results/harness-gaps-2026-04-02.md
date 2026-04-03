# Harness Gaps — 2026-04-02

Harvested from 21 code review files by `/harvest-reviews-kit`.

## Gaps

| # | Recommendation | Source Review | Pillar | Why Still Needed |
| --- | --- | --- | --- | --- |
| 1 | Add a concrete code example in `frontend-quick-ref.md` showing the correct zero-prop PropTypes declaration (`Component.propTypes = {}`) | 2026-04-01-issue-113.md | Documentation | CLAUDE.md mentions the convention in text but no code example exists in the quick-ref; ambiguity leads to misinterpretation |
| 2 | Add a CLAUDE.md constraint: "Test files must extract repeated setup/teardown logic into shared helpers when a block appears 3+ times" | 2026-04-02-issue-151.md | Architecture | No DRY constraint specific to test files exists; copy-paste test boilerplate goes undetected |
| 3 | Add a CLAUDE.md constraint or linter rule: "Do not use `page.waitForTimeout()` in Playwright tests — use event-based waits" | 2026-04-02-issue-151.md | Verification | No Playwright-specific anti-pattern guidance exists in CLAUDE.md or linter config |
| 4 | Add a pre-commit or review checklist item: "`.claude/settings.json` hooks must have observable effect — flag no-op hooks" | 2026-04-02-issue-151.md | Verification | No mechanism to detect hooks that silently pass without gating anything |
| 5 | Add a CLAUDE.md constraint: "Every route file MUST include a Joi validator via `validateRequest` middleware. No route may accept query/body params without validation." | 2026-04-02-issue-94.md | Architecture | Joi is in the tech stack but no explicit constraint requires validation on every route; unvalidated params reach Sequelize |
| 6 | Add a CLAUDE.md constraint: "Endpoints that return patron PII (names, card numbers, emails) MUST use `authenticate` middleware." | 2026-04-02-issue-94.md | Verification | No data-sensitivity constraint exists; patron endpoints currently serve PII without auth |
| 7 | Add a CLAUDE.md or frontend-quick-ref guideline: "Form submit handlers must validate that parsed IDs are defined before passing to API calls." | 2026-04-02-issue-94.md | Verification | No defensive-coding guideline for form submit handlers; undefined IDs can silently propagate |
