# Harvest Reviews: Strengthen the Harness from Code Review Signals

**Purpose:** Scan code review result files, track finding metrics as a harness resilience signal, extract unaddressed harness improvement recommendations, validate them against the current harness, deduplicate, and create GitHub issues for harness strengthening work.

**Usage:** `/harvest-reviews-kit` or `/harvest-reviews-kit --dry-run`

**End Result:** Metrics track findings over time (the signal), unaddressed harness gaps are collected into a dated file, and GitHub issues are created to strengthen the harness. As harness improvements are made, finding counts should trend downward.

---

## WHAT THIS COMMAND DOES

1. Scans all `code-review-results/*.md` files (excludes `archive/` subdirectory)
2. Records **finding metrics** per review file to `code-review-results/metrics.csv` — one row per file with severity counts (this is the resilience signal)
3. Extracts **Harness Improvement Recommendations** where `Harness Change Made` is `No`
4. Validates each recommendation against the current harness (CLAUDE.md, standards/, knowledge/, hooks, etc.) to see if it has already been addressed
5. Writes still-needed recommendations to a dated gaps file: `code-review-results/harness-gaps-YYYY-MM-DD.md`
6. Deduplicates overlapping recommendations
7. Creates GitHub issues grouped by pillar, labeled `harness-improvement`
8. Archives processed review files to `code-review-results/archive/`

**This command does NOT:**

- Modify any source code
- Create issues for individual source code findings (those are symptoms; the harness is the cure)
- Process files already in the archive directory

---

## EXECUTION

### Step 0: Check for Dry-Run Mode

If `$ARGUMENTS` contains `--dry-run`, run the entire process but:

- Print what issues WOULD be created (do not actually create them)
- Print what metrics WOULD be written
- Print what files WOULD be archived
- Do not create GH issues, write to CSV, move files, or write the gaps file

Announce dry-run mode at the start:

```
DRY RUN MODE — no issues will be created, no files will be moved, no files will be written.
```

### Step 1: Discover Review Files

Check if `code-review-results/` directory exists. If it does not exist, treat it the same as "no files found."

List all markdown files in `code-review-results/` (top level only, not `archive/`).

**If directory does not exist or no files found:**

```
No unprocessed code review files found in code-review-results/.
Nothing to harvest.
```

Stop here.

### Step 2: Record Finding Metrics

For each review file, extract the findings table. Each row has columns like:

| Severity | File | Issue | Pillar | Resolved |

Count findings at each severity level (Critical, High, Medium, Low) — count ALL findings regardless of Resolved status, since the total count reflects what the harness failed to prevent.

**Clean review files:** If the file indicates no findings (e.g., "No issues found." with a summary count table showing all zeros), record zeros for all severity counts. Do not skip the file — a clean review is a valid data point.

Append one row per review file to `code-review-results/metrics.csv`. Create the file with a header row if it does not exist.

**CSV format:**

```csv
date,review_file,critical,high,medium,low,total
2026-03-27,2026-03-27-issue-21.md,0,1,2,3,6
2026-03-27,2026-03-27-issue-22.md,0,0,0,0,0
```

- `date`: the date from the review file name (YYYY-MM-DD)
- `review_file`: the review file name
- `critical/high/medium/low`: count of findings at each severity
- `total`: total findings in that review

**In dry-run mode:** Print the CSV rows but do not write them.

### Step 3: Extract Harness Improvement Recommendations

For each review file, extract the Harness Improvement Recommendations table. Each row typically has columns like:

| Finding | Harness Recommendation | Harness Change Made |

Collect all recommendations where `Harness Change Made` is `No` (case-insensitive). Skip recommendations where `Harness Change Made` is `Yes` or indicates the change was already made.

**Clean review files:** If no Harness Improvement Recommendations table exists (the file says "No recommendations" or similar), skip recommendation extraction for that file. This is expected for clean reviews.

### Step 4: Validate Recommendations Against Current Harness

For each unaddressed recommendation, check whether it has since been implemented by examining the relevant harness files:

- `CLAUDE.md` — for constraints, conventions, and rules
- `standards/` — for craftsmanship rules, code review standards
- `knowledge/` — for hooks guidance, agent operations
- `.claude/settings.json` — for hook configurations
- Project linter configuration (if any) — for lint rules
- Project compiler/type-checker configuration (if any) — for strictness flags

Mark each recommendation as:

- **Still needed** — the harness does not address this class of issue
- **Already addressed** — the harness now covers this (note where)

Report validation results:

```
## Harness Recommendation Validation

| Source Review | Recommendation | Status | Notes |
| --- | --- | --- | --- |
| 2026-03-27-issue-21.md | Add lint rule for unreachable patterns | Still needed | No lint rule configured |
| 2026-03-25-issue-1.md | Add CLAUDE.md constraint for named constants | Already addressed | In CLAUDE.md Constraints section |
...

Still needed: X
Already addressed: Y
```

### Step 5: Write Harness Gaps File

Write all still-needed recommendations to `code-review-results/harness-gaps-YYYY-MM-DD.md` (using today's date).

**Format:**

```markdown
# Harness Gaps — YYYY-MM-DD

Harvested from N code review files by `/harvest-reviews-kit`.

## Gaps

| #   | Recommendation                                          | Source Review          | Why Still Needed                                    |
| --- | ------------------------------------------------------- | ---------------------- | --------------------------------------------------- |
| 1   | Add CLAUDE.md constraint for magic number extraction    | 2026-03-27-issue-21.md | No rule or hook currently catches this pattern       |
| 2   | ...                                                     | ...                    | ...                                                 |
```

**In dry-run mode:** Print the file contents but do not write it.

### Step 6: Deduplicate

Review the gaps list for overlapping or redundant recommendations. Merge duplicates, keeping the most specific version and noting all source reviews. Remove any that are subsumed by a broader recommendation.

Update the gaps file (or dry-run output) to reflect the deduplicated list.

### Step 7: Create GitHub Issues

**Prerequisite:** Verify `gh` CLI is available and authenticated. If `gh` is not installed or not authenticated, skip issue creation entirely and report:

```
GitHub CLI not available or not authenticated — skipping issue creation.
Gaps file and metrics have been written. Create issues manually from the gaps file:
  cat code-review-results/harness-gaps-YYYY-MM-DD.md
```

Group the deduplicated, still-needed recommendations by the pillar tags found in the review files. Use the exact pillar names from the review files (e.g., "Documentation/Memory", "Architecture/Constraints", "Verification/Back-pressure", "Context Management") rather than hardcoded values. Create one GitHub issue per pillar group.

Ensure the `harness-improvement` label exists (create it if not).

**Title:** `harness: [pillar] — [brief description of recommendation group]`

**Body:**

```markdown
## Origin

Harvested from code review results by `/harvest-reviews-kit` on [DATE].

## Harness Gaps

| #   | Recommendation | Source Review          | Why Still Needed |
| --- | -------------- | ---------------------- | ---------------- |
| 1   | Description    | 2026-03-27-issue-21.md | Rationale        |
| 2   | ...            | ...                    | ...              |

## Acceptance Criteria

- [ ] Each recommendation above is implemented in the harness or documented as intentionally deferred
- [ ] Future code reviews in the affected pillar show reduced finding counts
```

**Labels:** `harness-improvement`

**In dry-run mode:** Print the issue title and body but do not create it.

### Step 8: Archive Processed Files

Move each processed review file to `code-review-results/archive/`:

```bash
mkdir -p code-review-results/archive
mv code-review-results/YYYY-MM-DD-issue-N.md code-review-results/archive/
```

Do NOT archive the gaps file or metrics.csv — those stay in the active directory.

**In dry-run mode:** Print which files would be moved but do not move them.

### Step 9: Summary Report

Display a final summary:

```
## Harvest Summary

- Review files processed: X
- Total findings recorded in metrics: X
- Harness recommendations extracted: X
- Already addressed: X
- Still needed (after dedup): X
- GitHub issues created: X (or "skipped — gh not available")
- Files archived: X

### Metrics

X rows appended to code-review-results/metrics.csv

### Issues Created

1. #[NUMBER] - [title] (X recommendations)
2. #[NUMBER] - [title] (X recommendations)
...

### Next Steps

1. Review the created issues and prioritize harness improvements
2. After implementing improvements, run `/harvest-reviews-kit` on the next batch of code reviews
3. Compare metrics.csv over time — finding counts should trend downward as the harness strengthens
```

---

## ERROR HANDLING

- **Malformed review file:** Skip it, log a warning, continue with other files
- **`code-review-results/` directory does not exist:** Report "nothing to harvest" and stop (same as no files found)
- **`gh` CLI not installed or not authenticated:** Skip issue creation, still produce metrics and gaps file
- **No harness recommendations found:** Report that all recommendations are addressed, still record metrics and archive files
- **Label does not exist:** Create the `harness-improvement` label, then apply it
- **Clean review file (no findings):** Record zero counts in metrics, skip recommendation extraction — do not skip the file entirely

---

## NOTES

- This command operates on the `code-review-results/` directory in the project root
- The `--dry-run` flag is recommended for first use to preview what will happen
- **Findings are the signal, not the target.** This command does not create issues for individual code findings — it uses finding counts to measure harness resilience and creates issues only for harness improvements that would prevent future findings
- Metrics CSV enables trend tracking: plot severity counts over time to see if the harness is getting stronger
- After archiving, only unprocessed review files remain in the active directory
- The command is idempotent on archived files — re-running will not reprocess them
- Pillar names are extracted dynamically from review files, not hardcoded — they match whatever the code-review agent tagged
