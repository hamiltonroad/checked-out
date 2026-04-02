# Harness Gaps — 2026-04-01

Harvested from 3 code review files by `/harvest-reviews-kit`.

## Gaps

| # | Recommendation | Source Review | Why Still Needed |
| --- | --- | --- | --- |
| 1 | Add CLAUDE.md constraint: "Never interpolate user-supplied values into `sequelize.literal()`. Use parameterized Sequelize methods instead." | 2026-04-01-issue-109.md | CLAUDE.md says "No raw SQL" but `sequelize.literal()` with interpolation is a distinct injection vector not covered |
| 2 | Enforce `react-hooks/exhaustive-deps` as error in frontend ESLint config. Add PostToolUse lint hook to `.claude/settings.json` so lint runs after every file edit. | 2026-04-01-issue-109.md | Plugin installed but rule defaults to warn; no PostToolUse lint hook exists — stale closures go undetected |
| 3 | Clarify CLAUDE.md PropTypes convention: "All React components must define PropTypes — including zero-prop components (use empty `{}`). Use `shape()` for objects and `arrayOf(shape())` for arrays — never raw `object` or `array`." | 2026-04-01-issue-109.md | Current wording is ambiguous on zero-prop components and does not prohibit broad types |
| 4 | Add to CLAUDE.md Architecture: "Services must not import peer services. Orchestration of multiple services belongs in the controller layer." | 2026-04-01-issue-109.md | "Dependencies flow downward" implies this but is not explicit enough — cross-service imports still occur |
| 5 | Add CLAUDE.md constraint: "Use JavaScript default parameters instead of `defaultProps` for function components. `defaultProps` is deprecated in React 18.3+." | 2026-04-01-issue-92.md | No mention in CLAUDE.md or lint config; deprecated pattern will break on React 19 upgrade |
| 6 | Add CLAUDE.md constraint: "Source files must not exceed 200 lines (type/config files exempt)." | 2026-04-01-issue-92.md | Rule exists in standards/ files but is not in CLAUDE.md where agents read it first |
| 7 | Add references in CLAUDE.md Context Guidance to all harness artifacts: `.claude/commands/`, `.claude/agents/`, `knowledge/`, `standards/full/`. Currently 30 of 30 artifacts are unreachable from CLAUDE.md. | 2026-04-01-issue-109.md (drift) | Agents that only read CLAUDE.md have no path to discover commands, agents, knowledge files, or full standards |
| 8 | Add PostToolUse test hook to `.claude/settings.json` so tests run automatically after edits. | 2026-04-01-issue-109.md (drift) | No test hook exists — test failures are only caught when manually run |
| 9 | Add session management and sub-agent guidance to CLAUDE.md (compact behavior, context handoff, sub-agent scoping). | 2026-04-01-issue-109.md (drift) | No guidance exists for session continuity, compaction, or sub-agent behavior |
