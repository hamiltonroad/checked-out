# Generate Issue

**Purpose:** Create a well-structured GitHub issue from a one-line value statement by drafting scope/approach options for human selection.

**Usage:** `/generate-issue <one-line value statement>`

**Example:** `/generate-issue patrons should be able to rate books they've read`

---

## WHAT THIS COMMAND DOES

1. Accept a one-line value statement describing user need
2. Draft 2-3 issue options that vary in **scope or approach** (not just wording)
3. Present options to human for selection (with ability to request edits)
4. Create GitHub issue immediately after selection

**This command does NOT:**

- Refine the issue with ADRs, affected files, or UI specs (that's `/refine-issue`)
- Create an implementation plan (that's `/plan-issue`)
- Write any code (that's `/implement-issue`)

---

## EXECUTION STEPS

### Step 1: Validate Input

Extract value statement from `$ARGUMENTS`.

**If empty or missing:**

```
Usage: /generate-issue <one-line value statement>

Example: /generate-issue patrons should be able to rate books they've read

The value statement should describe what the user needs, not how to build it.
```

### Step 2: Analyze Value Statement

Read `CLAUDE.md` and `standards/issue-authoring-guide-kit.md` for issue format conventions.

Consider:

- Who is the user?
- What value does this deliver?
- What areas of the codebase are likely involved (frontend, backend, database, harness)?

### Step 3: Draft 2-3 Options

Each option MUST vary in **scope or approach**, not just wording. Examples of meaningful variation:

- Backend-only API vs full-stack with UI
- Minimal viable feature vs comprehensive implementation
- Single-resource change vs multi-resource orchestration
- New feature vs extension of existing feature

**For each option, produce:**

```markdown
## Option [N]: [Short title]

**Scope:** [One sentence describing scope/approach difference]

### Narrative

[2-3 sentences framing the user value. Written from the perspective of why this matters.]

### Acceptance Criteria

- [ ] [Specific deliverable 1]
- [ ] [Specific deliverable 2]
- [ ] [Edge case or quality requirement]
```

### Step 4: Present Options to Human

Display all options clearly. Ask the human to:

1. Select an option number, OR
2. Request edits to a specific option before finalizing

**If human requests edits:** Apply edits and re-present the modified option for confirmation.

**If human selects an option:** Continue to Step 5.

### Step 5: Create GitHub Issue

```bash
gh issue create --title "<title>" --label "enhancement" --body "$(cat <<'EOF'
<selected option narrative and acceptance criteria, formatted per issue-authoring-guide-kit.md>
EOF
)"
```

Capture the issue URL from the output.

### Step 6: Display Result

```
Issue created successfully.

URL: <issue URL>
Title: <title>

Next steps:
1. Run /refine-issue <number> to enrich with ADRs, affected files, and UI specs
2. Then run /story-runner <number> or add to a /batch-runner batch
```

---

## ERROR HANDLING

- **Empty input:** Display usage with example
- **GH CLI failure:** Display error output and suggest checking `gh auth status`
- **Human cancels:** Exit cleanly with no issue created

---

## NOTES

- Options should be meaningfully different in scope or technical approach
- Do NOT include implementation details in the issue body -- that's for `/refine-issue` and `/plan-issue`
- The issue body follows the format in `standards/issue-authoring-guide-kit.md`
- After creation, the issue is a draft -- `/refine-issue` adds implementation context
