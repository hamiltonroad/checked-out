# Plan Issue (Phase 2: Planning)

**Purpose:** Deep planning - analyze issue, load full context, create comprehensive implementation plan.

**Usage:** `/plan-issue-kit <issue-number>`

**Prerequisites:** Must run `/prep-issue-kit <issue-number>` first

**Next Steps:** After reviewing plan, run `/implement-issue-kit <issue-number>`

---

## WHAT THIS COMMAND DOES

1. Read issue from `.claude/temp/GH-ISSUE-<number>-REMOVE.md`
2. Read context hint from `.claude/temp/CONTEXT-HINT-<number>-REMOVE.md`
3. Load project context (CLAUDE.md, README.md)
4. Explore codebase to understand current state
5. Analyze issue deeply - requirements, constraints, risks
6. Create detailed implementation plan
7. Output plan to `.claude/temp/PLAN-<number>-REMOVE.md`

**This command does NOT:**

- Execute the plan (that's `/implement-issue-kit`)
- Write any code
- Make any changes to codebase (read-only analysis)

---

## EXECUTION STEPS

### Step 1: Validate Prerequisites

Check `.claude/temp/GH-ISSUE-<number>-REMOVE.md` and `.claude/temp/CONTEXT-HINT-<number>-REMOVE.md` exist.

### Step 2: Load Issue and Context Hint

Read both files, extract key information.

### Step 3: Load Project Context

**Always load:**

1. `CLAUDE.md` - Essential project guide
2. `README.md` - Project overview

### Step 4: Explore Codebase

Use Explore subagent or direct file reads to understand:

- Current project structure
- Existing components and patterns
- How new work fits with existing code

### Step 5: Deep Analysis

- What is the actual requirement?
- What are the acceptance criteria?
- What files need to be created/modified?
- What could go wrong?
- Are there integration points?

**Escalation protocol:**

- If issue is too complex or ambiguous: Stop and ask human
- If multiple valid approaches: Present options to human
- After 3 failed attempts: Request human guidance

### Step 6: Create Implementation Plan

**Write:** `.claude/temp/PLAN-<number>-REMOVE.md`

```markdown
# Implementation Plan for Issue #<number>

**TEMPORARY SESSION DOCUMENT - REMOVE AFTER SESSION**

---

## Issue Summary

**Title:** <title>
**Description:** <brief summary>
**Complexity:** Low/Medium/High
**Estimated Time:** <X hours>

---

## Analysis

**What needs to be done:**
<Clear explanation>

**Risks and concerns:**

- <Risk 1>
- <Risk 2>

---

## Files to Modify

**Create:**

- `path/to/new-file` — Purpose: <description>

**Modify:**

- `path/to/existing-file` — Changes: <what to change>

---

## Implementation Steps

### Phase 1: <Phase Name>

**Task 1.1: <Task Name>**

- **What:** <Clear description>
- **How:** <Step-by-step>
- **Files:** <Which files>
- **Success criteria:** <How to verify>

### Phase 2: Testing & Verification

**Task 2.1: Run quality checks**

- Run lint, build commands from `CLAUDE.md`

**Task 2.2: Test implementation**

- Specific test commands and scenarios

**Task 2.3: Create verification document**

- `.claude/temp/VERIFICATION-<number>-REMOVE.md`

---

## Verification Checklist

- [ ] All tasks completed
- [ ] Lint passing (per CLAUDE.md)
- [ ] Build passes (per CLAUDE.md)
- [ ] Quality checks pass
- [ ] Implementation tested
```

### Step 7: Output Summary

Display plan summary with complexity, estimated time, files to modify, and next steps.

---

## NOTES

- Planning may take 2-5 minutes
- Plan should be detailed enough for mechanical execution
- If unsure about anything, abort and ask - don't guess
