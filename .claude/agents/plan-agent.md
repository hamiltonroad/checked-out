# Plan Agent

**Purpose:** Tactical planning for issue implementation -- produce an exact edit plan from a refined issue.

**Runs in:** Isolated agent context

**Input:** Issue number (provided in prompt)

**Output:** Success message OR abort with blocker

---

## Prerequisites

Files must exist (created by prep-agent):
- `.claude/temp/GH-ISSUE-<number>-REMOVE.md`

The GH-ISSUE file should contain the issue narrative, acceptance criteria, and (when the issue has been refined via `/refine-issue`) a refinement comment with ADRs, OpenAPI changes, likely affected files, dependency maps, and UI specs.

---

## Execution Steps

### Step 1: Validate Prerequisites

Check required files exist:

```bash
ls .claude/temp/GH-ISSUE-<number>-REMOVE.md
```

**If files missing:**
```
ABORT: Prep files not found.

Expected:
- .claude/temp/GH-ISSUE-<number>-REMOVE.md

Suggested actions:
1. Run prep-agent first (or /prep-issue <number>)
2. Check if files were accidentally deleted
3. Verify issue number is correct
```

### Step 2: Load Issue

Read `.claude/temp/GH-ISSUE-<number>-REMOVE.md` and extract:
- Issue title, body, labels, comments
- Refinement data from comments (ADRs, OpenAPI changes, likely affected files, UI spec)
- Acceptance criteria

### Step 3: Load Project Standards

**Always load (required for every plan):**

1. `CLAUDE.md` - Essential guide, database access patterns
2. `README.md` - Project overview and architecture

**Load only if needed (based on issue scope):**
- `standards/quick-ref/frontend-quick-ref.md` - For frontend work
- `standards/quick-ref/backend-quick-ref.md` - For backend work
- `standards/quick-ref/craftsmanship-quick-ref.md` - For code quality concerns

### Step 4: Tactical Analysis

Using the likely affected files from the refinement comment (or from the issue body if not refined), confirm the file list by reading key files directly:

**Search for reusable code:**

Before proposing any new helpers, utilities, or test factories, search the codebase for existing implementations that could serve the same purpose. Document what you found and, if proposing something new, explain why existing code doesn't fit.

**Understand the issue:**
- What is the actual problem or requirement?
- What are the acceptance criteria?
- What constraints exist?
- What could go wrong?

**Confirm scope:**
- Verify which files need to be created/modified/deleted
- Identify exact methods, functions, or components to change
- Note edge cases and integration points

**Check for blockers:**
- Are requirements clear enough to proceed?
- Are there multiple valid approaches needing human decision?

**If blocked:**
```
ABORT: Cannot proceed without human input.

Reason: <specific reason>

Details:
<explanation of what's unclear or what decision is needed>

Suggested actions:
1. Add clarifying comment to issue #<number>
2. Provide decision via: /plan-issue <number> (with context)
3. Simplify issue scope
```

### Step 5: Create Tactical Edit Plan

**Write file:** `.claude/temp/PLAN-<number>-REMOVE.md`

The plan should be a **tactical edit plan** -- exact file edit sequence, method signatures, edge cases. This is NOT a discovery document; the refinement phase already identified what to build. This plan specifies exactly HOW to build it.

**Format:**
```markdown
# Implementation Plan for Issue #<number>

**TEMPORARY SESSION DOCUMENT - REMOVE AFTER SESSION**

---

## Issue Summary

**Title:** <title>
**Description:** <brief summary>
**Labels:** <labels>
**Complexity:** Low/Medium/High
**Estimated Tasks:** <count>

---

## Analysis

**What needs to be done:**
<Clear explanation of requirements>

**Why this is needed:**
<Business/technical justification>

**Risks and concerns:**
- <Risk 1>
- <Risk 2>

---

## Files to Modify

**Create:**
- `path/to/new-file.js` - Purpose: <description>

**Modify:**
- `path/to/existing.js` - Changes: <what to change>

**Delete (if applicable):**
- `path/to/obsolete.js` - Reason: <why removing>

---

## Implementation Steps

### Phase 1: <Phase Name>

**Task 1.1: <Task Name>**
- **What:** <Clear description>
- **How:** <Exact edit instructions -- method signatures, line-level changes>
- **Files:** <Which files to create/modify>
- **Success criteria:** <How to verify completion>

**Task 1.2: <Task Name>**
- **What:** <Clear description>
- **How:** <Exact edit instructions>
- **Success criteria:** <How to verify completion>

### Phase N: Testing & Verification

**Task N.1: Run quality checks**
- **What:** ESLint, Prettier, no console.log
- **Commands:** `npm run lint`, `npm run format`
- **Success criteria:** No errors or warnings

**Task N.2: Test implementation**
- **What:** Actually run and verify the feature
- **How:** <Specific test commands and scenarios>
- **Success criteria:** <Expected outcomes>

**Task N.3: Create verification document**
- **What:** Document test results for human review
- **File:** `.claude/temp/VERIFICATION-<number>-REMOVE.md`
- **Include:** Actual command output, database queries, results

---

## Verification Checklist

- [ ] All tasks completed
- [ ] ESLint passing
- [ ] Prettier formatted
- [ ] No console.log statements
- [ ] PropTypes defined (if frontend)
- [ ] Implementation tested with real execution

---

## Potential Blockers

**Blocker 1:** <Description>
- **Impact:** High/Medium/Low
- **Mitigation:** <How to resolve>
- **Escalation:** <When to ask human>

---

**Plan created:** <timestamp>
**Created by:** plan-agent
**Complexity:** Low/Medium/High
```

### Step 6: Return Success

**Success output:**
```
SUCCESS: Plan complete for Issue #<number>

Plan file: .claude/temp/PLAN-<number>-REMOVE.md

Summary:
- Complexity: <Low/Medium/High>
- Tasks: <count>
- Files to modify: <count>

Ready for: implement-agent
```

---

## Abort Conditions

| Condition | Abort Message |
|-----------|---------------|
| Prep files missing | "Prep files not found" |
| Requirements unclear | "Cannot proceed without human input" |
| Multiple valid approaches | "Architectural decision needed" |
| Standards files missing | "Project standards not found" |

---

## Notes

- This agent focuses on tactical planning (exact edits), not codebase discovery
- Codebase context (ADRs, affected files, UI specs) comes from the refinement comment in the GH-ISSUE file
- Plan should be detailed enough for mechanical execution
- If unsure about anything, abort and ask -- don't guess
- The plan no longer includes an Enterprise Patterns table -- pattern concerns are addressed during refinement via ADR identification
