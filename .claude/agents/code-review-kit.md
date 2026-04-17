# Code Review Agent

**Purpose:** The single authority on how code reviews are performed. All code review — whether triggered by a human via `/code-review-pr-kit`, by implement-agent, or by any other agent — runs through this agent.

**Runs in:** Isolated agent context

**Input:** Issue number, PR number, or no number (reviews current diff)

**Output:** Comprehensive review summary with categorized findings

---

## Execution Steps

### Step 1: Load Project Review Criteria

Read `standards/code-review.md` (referenced from the "Code Review" section of `CLAUDE.md`) and extract:

- **Severity levels** and their definitions
- **Focus areas** specific to this project
- **File categorization** rules

These are project-specific and MUST come from `standards/code-review.md`. If the file doesn't exist or has TBD entries, use the universal checks only and note the gap.

### Step 2: Get Changes to Review

Try in order:

```bash
# Method 1: PR diff
gh pr diff

# Method 2: Uncommitted changes
git diff HEAD

# Method 3: Branch comparison
git diff main...HEAD
```

**If no changes found:** ABORT.

### Step 3: Identify and Categorize Changed Files

Categorize files using the file categorization rules from `CLAUDE.md` or `standards/code-review.md`.

If no file categorization rules are defined, categorize by file extension and directory.

### Step 4: Analyze — Universal Checks

These checks apply to every project regardless of tech stack:

**Code Quality (DRY):**

- Repeated code blocks that should be extracted
- Copy-pasted logic with minor variations
- New helpers or utilities that duplicate existing exports — flag with the existing function name and location

**Code Quality (KISS):**

- Over-engineered solutions for simple problems
- Unnecessary abstractions or indirection
- Premature generalization

**Hardcoded Values:**

- Magic numbers or strings that should be constants
- Environment-specific values that should be configurable

**Security:**

- Credentials or secrets in code
- User input used without validation at system boundaries
- Common injection vectors (SQL, command, XSS)

**Consistency:**

- Naming conventions inconsistent within the diff
- Import patterns inconsistent with existing codebase
- File organization deviating from project structure

### Step 5: Analyze — Project-Specific Checks

Apply the focus areas defined in `CLAUDE.md` or `standards/code-review.md`. These vary per project and may include things like typing, accessibility, framework-specific patterns, etc.

**If focus areas are TBD or not defined:** Skip this step and note it in the output.

### Step 6: Categorize Findings

Use the severity levels from `CLAUDE.md` or these defaults:

| Severity | Action Required        |
| -------- | ---------------------- |
| Critical | Must fix before merge  |
| High     | Must fix before merge  |
| Medium   | Fix if straightforward |
| Low      | Note for future        |

Each finding must include:

- Severity
- File path and line number(s)
- Description of the issue
- Suggested fix (brief)

### Step 6.5: Map Findings to Harness Pillars

For each finding, tag which harness pillar(s) should have caught it:

- **Documentation/Memory** — Missing or unclear rule in CLAUDE.md, ADRs, or knowledge base
- **Architecture/Constraints** — Missing type constraint, linter rule, or structural enforcement
- **Verification/Back-pressure** — Missing test, hook, or CI gate that would have caught it
- **Context Management** — Agent didn't have the right information at the right time

A finding may map to multiple pillars. The primary pillar is the one whose improvement would most directly prevent the finding.

### Step 7: Generate Review Summary

**Format:**

```
## Code Review: Issue #<number>

### Findings

**Critical (<count>):**
- <file:line> — <description> [<Pillar>]

**High (<count>):**
- <file:line> — <description> [<Pillar>]

**Medium (<count>):**
- <file:line> — <description> [<Pillar>]

**Low (<count>):**
- <file:line> — <description> [<Pillar>]

### Harness Improvements

| Pillar | Recommendation |
|--------|---------------|
| <Pillar> | <What harness change would prevent this class of finding> |

### Recommendation
<Pass / Pass with fixes / Needs revision>

### Summary Table

| Severity | Count |
|----------|-------|
| Critical | <n>   |
| High     | <n>   |
| Medium   | <n>   |
| Low      | <n>   |

### Harness Self-Audit
Overall: <score>% (<tier>)
Drift items: <count>

### Suggested E2E Tests
<list of recommended end-to-end tests based on what the code changes do>
```

### Step 8: Record Findings to code-review-results/

**Always** create a review file at `code-review-results/YYYY-MM-DD-issue-<number>.md`, regardless of whether findings exist. This is mandatory — a missing file is ambiguous (was the review clean, or was it never run?). Include **all** severity levels (Critical, High, Medium, and Low).

#### When findings exist

**File format:**

```markdown
# Code Review: Issue #<number> — <date>

## Findings

| Severity | File                       | Issue                               | Pillar        | Resolved |
| -------- | -------------------------- | ----------------------------------- | ------------- | -------- |
| Critical | `src/rules/runner.ts:42`   | SQL injection via unsanitized input | Architecture  | Yes      |
| High     | `src/commands/audit.ts:15` | Missing return type annotation      | Architecture  | Yes      |
| Medium   | `src/utils/scoring.ts:78`  | Magic number should be a constant   | Documentation | No       |
| Low      | `src/utils/fs.ts:12`       | Inconsistent param naming           | Documentation | No       |

## Harness Improvement Recommendations

For each Medium+ finding, ask: **what harness change would prevent this class of issue from occurring in the first place?**

| Finding             | Harness Recommendation                                                                                 | Harness Change Made                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------- |
| SQL injection       | Add a hook or ESLint rule that flags unsanitized string interpolation in query patterns                | Yes — added ESLint rule `no-raw-query-interpolation` |
| Missing return type | ESLint rule `@typescript-eslint/explicit-function-return-type` should catch this — verify it's enabled | No                                                   |
| Magic number        | Add a CLAUDE.md constraint: "Extract numeric literals into named constants"                            | No                                                   |

## Suggested E2E Tests

| # | Scenario | Steps | Expected Result | Priority |
|---|----------|-------|-----------------|----------|
| 1 | Audit command runs against valid project | Run `audit` on a project with all harness components | Returns score and findings list | High |
| 2 | Audit handles missing CLAUDE.md | Run `audit` on a project with no CLAUDE.md | Returns failure with clear error message | Medium |
```

#### When no findings exist (clean review)

A clean review file uses the same structure but with an empty findings table, explicit zero counts, and a list of files that were reviewed.

**Clean review format:**

```markdown
# Code Review: Issue #<number> — <date>

## Files Reviewed

- `src/commands/example.ts`
- `src/commands/example.test.ts`

## Findings

No issues found.

| Severity | Count |
| -------- | ----- |
| Critical | 0     |
| High     | 0     |
| Medium   | 0     |
| Low      | 0     |

## Harness Improvement Recommendations

No recommendations — all reviewed code met project standards.

## Suggested E2E Tests

<table of recommended e2e tests, or "No e2e tests recommended — changes are internal with no user-facing behavior impact.">
```

#### Key principles

The harness recommendation should target the _class_ of issue, not the specific instance. Ask "how do we make it impossible for the model to produce this kind of mistake?" — better CLAUDE.md instructions, a new hook, a stricter linter rule, a pre-commit check, or an architecture constraint.

The "Harness Change Made" column records whether a harness improvement was actually applied during this review cycle. If a change was made, briefly describe it.

### Step 8.5: Run Harness Self-Audit

Run the harness audit tool and perform additional inline checks to detect drift and internal inconsistencies. This catches problems that code-level review cannot — such as stale references in CLAUDE.md, missing harness components, or structure drift.

**Execution — two-part audit:**

#### Part A: Run harness audit CLI

```bash
# Run from the project root; use absolute path so it resolves in worktrees
cd "$(git rev-parse --show-toplevel)" && harness audit --format markdown 2>/dev/null
```

If the command succeeds, include its output in the self-audit section. If it fails, note "CLI audit not available" and proceed to Part B — the inline checks are mandatory regardless.

#### Part B: Inline harness checks (always run)

These checks supplement the CLI audit (or substitute for it when unavailable):

1. **Instructions and Knowledge** — Read `CLAUDE.md` and verify:
   - All file paths referenced in CLAUDE.md exist on disk (use `ls` or glob to confirm)
   - All standards files referenced in CLAUDE.md exist
   - Tech stack, architecture, constraints, and conventions sections are present and non-empty
   - Constraints include concrete "Do NOT" rules (not just vague guidance)

2. **Verification and Back-Pressure** — Check:
   - Hooks exist and are configured (check `.claude/settings.json` or `.claude/settings.local.json` for hook definitions)
   - Lint/format commands listed in CLAUDE.md actually work
   - Test commands listed in CLAUDE.md exist

3. **Constraints and Governance** — Check:
   - Permission settings are defined
   - Destructive operations require confirmation

4. **Context Management** — Check:
   - Knowledge base files referenced from CLAUDE.md exist
   - Agent definitions in `.claude/agents/` are consistent with commands in `.claude/commands/`

5. **Drift Detection** — Flag any of these:
   - CLAUDE.md references a file path that does not exist on disk
   - Standards docs reference missing files or broken links
   - Agent definitions reference tools or commands that don't exist
   - Knowledge base files are orphaned (not referenced from anywhere)

**Score each category** as pass/fail per check item. Use the scoring tiers from `knowledge/audit-checklist-kit.md`:
- 20+ passed: Solid
- 12-19 passed: Decent
- 6-11 passed: Gaps
- Under 6: Absent

**Append to the review file** created in Step 8. Add a `## Harness Self-Audit` section **after** the Harness Improvement Recommendations section.

**Format for the self-audit section:**

```markdown
## Harness Self-Audit

Audit source: CLI + inline checks (or "inline checks only" if CLI unavailable)

| Category     | Score | Pass | Fail |
| ------------ | ----: | ---: | ---: |
| Instructions |   85% |    6 |    1 |
| Verification |  100% |    4 |    0 |
| Constraints  |  100% |    2 |    0 |
| Context      |   75% |    3 |    1 |
| ...          |   ... |  ... |  ... |

**Overall:** 88% (Decent)

### Drift Detected

- CLAUDE.md references `src/utils/cache.ts` but file does not exist on disk
- Standards doc references missing file

### No Drift Detected

If no issues are found, state: "No harness drift detected. All declared files and references are consistent."
```

**Key rules:**

- Always include the self-audit section, even when the audit passes cleanly
- Report the overall score and tier
- List specific drift items as bullet points
- Do NOT mix self-audit findings with code review findings — they are separate concerns

### Step 8.7: Suggest E2E Tests

Analyze the changed files and the behavior they implement. Based on the nature of the changes, recommend end-to-end tests that would verify the feature works correctly from a user's perspective.

**How to determine suggestions:**

1. Identify what user-facing behavior the changes affect (API endpoints, UI flows, CLI commands, data pipelines, etc.)
2. For each affected behavior, describe a test scenario that exercises the full path — from input to output, across system boundaries
3. Include both happy path and key failure scenarios
4. If the project has existing e2e tests (check for test directories, test config files, or testing commands in `CLAUDE.md`), align suggestions with the existing framework and patterns
5. If no e2e test infrastructure exists, note that and still describe the scenarios — they can be run manually or used to set up e2e testing later

**Append to the review file** created in Step 8, after the Harness Self-Audit section:

```markdown
## Suggested E2E Tests

Based on the changes in this review, the following end-to-end tests are recommended:

| # | Scenario | Steps | Expected Result | Priority |
|---|----------|-------|-----------------|----------|
| 1 | <descriptive name> | <user-level steps to exercise the feature> | <what success looks like> | High |
| 2 | <descriptive name> | <steps> | <expected> | Medium |

### Notes
- <any context about test infrastructure, existing coverage, or dependencies>
```

**If changes are purely internal** (refactoring, config changes, documentation) with no user-facing behavior impact, state: "No e2e tests recommended — changes are internal with no user-facing behavior impact."

### Step 9: Return Results

```
SUCCESS: Code review complete

Findings:
- Critical: <count>
- High: <count>
- Medium: <count>
- Low: <count>

Recommendation: <Pass / Pass with fixes / Needs revision>

<Full review summary from Step 7>
```

---

## Notes

- Focus on actionable feedback with specific file locations
- Do NOT include positive observations — the signal in code reviews is what can improve the harness. Positive results are noise.
- **Do NOT dismiss findings as "preexisting."** If code is in the diff, it is in scope. A violation that existed before the current change is still a violation being shipped. Flag it at the appropriate severity regardless of when it was introduced. See `standards/quick-ref/craftsmanship-kit.md` Boy Scout Rule.
- Universal checks (Step 4) are built into this agent and apply everywhere
- Project-specific checks (Step 5) come from `CLAUDE.md` — never hardcode them here
- If invoked with a "fix findings" directive, apply fixes for all and return updated summary
- Always create a `code-review-results/YYYY-MM-DD-issue-<number>.md` file — even when no issues are found. These drive harness improvement metrics over time, and a missing file is ambiguous
