# Resolve Smoke Test Failure

**Purpose:** Systematically diagnose and fix a smoke test failure introduced by recent changes.

**Usage:** `/resolve-smoke-failure`

**When to use:** After a smoke test (`./scripts/smoke-test.sh`) fails and you believe your recent changes caused the failure.

---

## Core Principle

The bug was introduced by your changes. The diff against the last passing state IS the root cause list. Do not speculate beyond the diff.

---

## Execution

### Step 1: Capture the Failure

Run the smoke test and capture full output:

```bash
./scripts/smoke-test.sh 2>&1
```

Save the complete output — error messages, stack traces, HTTP status codes, console errors. You will reference this throughout.

**If the smoke test passes:** Report success and stop. There is nothing to fix.

### Step 2: Identify the Blast Radius

Get the diff of all changes since the last known-good state:

```bash
git diff main...HEAD --stat
git diff main...HEAD
```

Also check for uncommitted changes:

```bash
git diff
git diff --cached
```

**Write down:**
- Every file changed (with line counts)
- Every uncommitted modification
- The total number of changed files

This is your suspect list. The bug is in this diff. Do not look elsewhere.

### Step 3: Correlate Failure to Changes

Read the smoke test output from Step 1 carefully. Map the failure to the diff:

- **HTTP 500 / server crash:** Look at backend route, controller, service, or model changes in the diff
- **HTTP 200 but console errors:** Look at frontend component, hook, or service changes in the diff
- **Connection refused:** Look at server startup, config, or middleware changes in the diff
- **Render failure (empty body):** Look at frontend entry point, router, or provider changes in the diff

**Produce a ranked list of exactly 4 candidate root causes.** Each candidate must:
1. Name the specific file and change from the diff
2. Explain how that change could produce the observed failure
3. Rate confidence: HIGH / MEDIUM / LOW

Format:

```
CANDIDATE ROOT CAUSES (ranked by confidence):

1. [HIGH] backend/src/routes/bookRoutes.js:14 — Added Joi validation middleware
   but the schema rejects valid requests, returning 400 instead of passing through.

2. [MEDIUM] backend/src/services/bookService.js:45 — Changed findAll query to
   include association that doesn't exist yet (migration not run).

3. [LOW] frontend/src/hooks/useBooks.js:12 — Changed API endpoint path but
   backend route wasn't updated to match.

4. [LOW] backend/src/middleware/validate.js:8 — New middleware has syntax error
   that crashes on import.
```

**If you cannot identify 4 candidates:** You may list fewer, but you must list at least 2. If you genuinely cannot map the failure to any change in the diff, STOP and report this — the failure may be environmental, not code-related.

### Step 4: Write a Reproduction Test

**Before attempting any fix, write a test that fails the same way the smoke test fails.** This proves you understand the bug and prevents false fixes.

**Choose the lightest test that can reproduce the failure:**

1. **Unit test** (preferred) — If the failure traces to a single function with bad output or thrown error. Fast, no server needed.
2. **Integration test** — If the failure involves HTTP request/response (wrong status code, bad response shape, middleware rejection). Needs a running server or supertest.
3. **Extend the smoke test** — Only if the failure is purely a browser-render or client-side issue that unit/integration tests cannot catch.

**Rules for the reproduction test:**
- The test MUST fail right now (proving it reproduces the bug)
- The test MUST be minimal — test only the broken behavior, not the entire feature
- Place it in the appropriate test directory following project conventions
- Name it clearly: describe what's broken, not what you're building

**Run the test and confirm it fails:**

```bash
# For backend unit/integration tests:
cd backend && npx jest <test-file> --no-coverage 2>&1

# For extended smoke tests:
npm run test:smoke 2>&1
```

**If you cannot write a reproduction test after 2 attempts:** Skip to Step 5 with a note. Do not burn all your strikes here. The smoke test itself is already your reproduction.

### Step 5: Fix the Highest-Confidence Root Cause

Take candidate #1 from your ranked list. Apply the minimal fix.

**Minimal means:**
- Change the fewest lines possible
- Do not refactor surrounding code
- Do not add features
- Do not "improve" things while you're here
- If the fix is "revert this change," that's a valid fix

### Step 6: Verify the Fix

Run three checks in order:

```bash
# 1. Does the reproduction test pass now?
cd backend && npx jest <test-file> --no-coverage 2>&1

# 2. Do lint and format still pass?
cd backend && npm run lint 2>&1
cd frontend && npm run lint 2>&1

# 3. Does the smoke test pass now?
./scripts/smoke-test.sh 2>&1
```

**If the smoke test passes:** Go to Step 7.

**If the smoke test still fails:**
- Check if the failure is the SAME error or a DIFFERENT error
- If same error: Your candidate #1 was wrong. Revert the fix. Move to candidate #2. Return to Step 5.
- If different error: Your fix resolved one issue but exposed another. Return to Step 3 with the new error output and produce a new candidate list from the remaining diff.

### Step 7: Report Resolution

```
SMOKE TEST FAILURE RESOLVED

Root cause: <one-sentence description>
File: <file:line>
Fix: <what you changed and why>

Reproduction test: <test file path> (now passing)

Strikes used: <N> of 3
Candidates considered: <list which candidates were tried>

Smoke test: PASSING
Lint: PASSING
```

---

## Three-Strikes Rule

You have **3 fix attempts** total (not per candidate).

- Strike 1: Fix candidate #1 → verify
- Strike 2: Fix candidate #2 → verify
- Strike 3: Fix candidate #3 → verify

**If all 3 strikes are used and the smoke test still fails:**

```
SMOKE TEST FAILURE UNRESOLVED — ESCALATING

Failure: <smoke test error summary>
Diff scope: <N files changed>

Attempted fixes:
1. <candidate> — <what you tried> — <result>
2. <candidate> — <what you tried> — <result>
3. <candidate> — <what you tried> — <result>

Reproduction test: <path> (still failing)

Recommendation: <your best guess at what's actually wrong and why your fixes didn't work>
```

**After 3 strikes, STOP. Do not keep trying.** Revert all fix attempts so the codebase is in its pre-resolution state, and escalate to the user.

---

## Rules

- **Never fix without understanding.** If you don't know why a change works, it's not a fix.
- **Never widen the diff.** Your fix should touch only what's broken. If you're editing files that aren't in the original diff, stop and reconsider.
- **Never skip the reproduction test.** The smoke test alone is not sufficient — it tests too many things. A focused test pins the specific failure.
- **Revert failed fixes.** Each new attempt starts from a clean state. Do not stack speculative fixes.
- **The diff is the truth.** If the failure can't be explained by the diff, it's environmental. Report it and stop.
