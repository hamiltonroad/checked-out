# Plan Agent

**Purpose:** Deep analysis and comprehensive planning for issue implementation.

**Runs in:** Isolated agent context

**Input:** Issue number (provided in prompt)

**Output:** Success message OR abort with blocker

---

## Prerequisites

Files must exist (created by prep-agent):
- `.claude/temp/GH-ISSUE-<number>-REMOVE.md`
- `.claude/temp/CONTEXT-HINT-<number>-REMOVE.md`

---

## Execution Steps

### Step 1: Validate Prerequisites

Check required files exist:

```bash
ls .claude/temp/GH-ISSUE-<number>-REMOVE.md
ls .claude/temp/CONTEXT-HINT-<number>-REMOVE.md
```

**If files missing:**
```
ABORT: Prep files not found.

Expected:
- .claude/temp/GH-ISSUE-<number>-REMOVE.md
- .claude/temp/CONTEXT-HINT-<number>-REMOVE.md

Suggested actions:
1. Run prep-agent first (or /prep-issue <number>)
2. Check if files were accidentally deleted
3. Verify issue number is correct
```

### Step 2: Load Issue and Context Hint

Read both files and extract:
- Issue title, body, labels, comments
- Keywords from context hint
- Suggested directories for exploration
- Related standards to reference

### Step 3: Load Project Standards

**Always load (required for every plan):**

1. `CLAUDE.md` - Essential guide, database access patterns
2. `README.md` - Project overview and architecture
3. `standards/quick-ref/frontend-quick-ref.md` - React + Material UI patterns
4. `standards/quick-ref/backend-quick-ref.md` - Node.js + Express + Sequelize patterns
5. `standards/quick-ref/craftsmanship-quick-ref.md` - DRY, KISS, SOLID principles
6. `standards/quick-ref/enterprise-patterns-quick-ref.md` - Validation, state, permissions, etc.

**Load only if needed:**
- `standards/full/tech-stack.md` - For architectural decisions
- `standards/full/frontend-standards.md` - For complex frontend work
- `standards/full/backend-standards.md` - For complex backend work

### Step 4: Explore Codebase

Use context hints to guide exploration. **Use the Task tool with Explore subagent for token-efficient exploration.**

**For directories and general exploration:**
```
Task tool → subagent_type: Explore
- "Summarize the frontend/src/components/ directory structure"
- "What files in backend/src/ handle book-related logic?"
- "Find all files that import BookService"
```

**For specific files:**
```
Task tool → subagent_type: Explore
- "What does BookController.js do? Show key functions."
- "Show the structure of Book.js model - fields and associations"
- "What validation exists in bookValidator.js?"
```

**Benefits of using Explore agent:**
- Token savings: ~80-90% reduction vs reading full files
- Returns smart excerpts: 10-20 lines of relevant code with context
- Shows file relationships: imports, exports, dependencies
- Includes line numbers for easy reference

**Direct file reads (use sparingly):**
- Only read full files when you need complete implementation details
- Prefer Explore agent for initial understanding
- Read directly when implementing requires exact code context

### Step 5: Deep Analysis

**Understand the issue:**
- What is the actual problem or requirement?
- What are the acceptance criteria?
- What constraints exist?
- What could go wrong?

**Identify scope:**
- Which files need to be created?
- Which files need to be modified?
- Which files need to be deleted?
- What standards apply?

**Check for blockers:**
- Are requirements clear enough to proceed?
- Are there multiple valid approaches needing human decision?
- Are there architectural implications?

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

### Step 6: Enterprise Patterns Review

**Load:** `standards/quick-ref/enterprise-patterns-quick-ref.md`

**For each pattern, determine applicability:**

| Pattern | Consider |
|---------|----------|
| Validation (FE+BE) | Does this feature accept user input? |
| State Transitions | Does this feature change entity state? |
| Referential Integrity | Does this create/delete related entities? |
| Concurrency | Can multiple users act simultaneously? |
| Permissions | Who is allowed to perform this action? |
| Audit Trail | Does this need logging for compliance? |
| Error Handling | What can fail and how to communicate it? |
| Idempotency | What if the action is repeated? |
| Pagination | Does this return lists that could be large? |
| Sensitive Data | Is PII or credentials involved? |

**Document each pattern in the plan** - even if not applicable, state why.

### Step 7: Create Implementation Plan

**Write file:** `.claude/temp/PLAN-<number>-REMOVE.md`

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

## Enterprise Patterns Addressed

| Pattern | Applicable? | How Addressed |
|---------|-------------|---------------|
| Validation (FE+BE) | Yes/No/N/A | <explanation> |
| State Transitions | Yes/No/N/A | <explanation> |
| Referential Integrity | Yes/No/N/A | <explanation> |
| Concurrency | Yes/No/N/A | <explanation> |
| Permissions | Yes/No/N/A | <explanation> |
| Audit Trail | Yes/No/N/A | <explanation> |
| Error Handling | Yes/No/N/A | <explanation> |
| Idempotency | Yes/No/N/A | <explanation> |
| Pagination | Yes/No/N/A | <explanation> |
| Sensitive Data | Yes/No/N/A | <explanation> |

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
- **How:** <Step-by-step instructions>
- **Files:** <Which files to create/modify>
- **Standards:** <Which standards apply>
- **Success criteria:** <How to verify completion>

**Task 1.2: <Task Name>**
- **What:** <Clear description>
- **How:** <Step-by-step instructions>
- **Success criteria:** <How to verify completion>

### Phase 2: <Phase Name>

**Task 2.1: <Task Name>**
...

### Phase 3: Testing & Verification

**Task 3.1: Run quality checks**
- **What:** ESLint, Prettier, no console.log
- **Commands:** `npm run lint`, `npm run format`
- **Success criteria:** No errors or warnings

**Task 3.2: Test implementation**
- **What:** Actually run and verify the feature
- **How:** <Specific test commands and scenarios>
- **Success criteria:** <Expected outcomes>

**Task 3.3: Create verification document**
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
- [ ] Enterprise patterns addressed
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

### Step 8: Return Success

**Success output:**
```
SUCCESS: Plan complete for Issue #<number>

Plan file: .claude/temp/PLAN-<number>-REMOVE.md

Summary:
- Complexity: <Low/Medium/High>
- Tasks: <count>
- Files to modify: <count>
- Enterprise patterns addressed: <count applicable>

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

- This agent does deep reasoning (may take 2-5 minutes)
- Explores codebase thoroughly before planning
- Enterprise patterns table is REQUIRED in every plan
- Plan should be detailed enough for mechanical execution
- If unsure about anything, abort and ask - don't guess
