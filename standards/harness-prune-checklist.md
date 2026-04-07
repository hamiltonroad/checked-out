# Harness Prune Checklist

A periodic checklist for pruning accumulated rot in the harness. Run this
during a deliberate "prune cycle" — not on every PR. The harness is a
primary deliverable, so the goal is to keep its weight proportional to the
signal it provides.

## When to run

- Quarterly, or whenever `CLAUDE.md` exceeds 120 lines (the
  `story-runner`/`batch-runner` warning will surface this).
- Before any major release or hand-off.
- After a burst of harness additions (3+ rules added in a single sprint).

## Checklist

### 1. Never-fired audit
- [ ] For each rule in `standards/enforcement-registry.md`, check whether
      it has fired in CI or pre-commit history. Rules that have never
      fired in 90+ days are candidates for retirement.
- [ ] Command: `git log --since="90 days ago" --grep="HARNESS-"`

### 2. eslint-disable tally
- [ ] Count `eslint-disable*` comments in `backend/src/` and
      `frontend/src/`. A growing tally for the same rule signals the rule
      is wrong for this codebase.
- [ ] Command: `grep -rn "eslint-disable" backend/src frontend/src | wc -l`

### 3. Recent harness-gaps review
- [ ] Read `.claude/temp/HARNESS-ROT-SUGGESTIONS-*.md` and any
      `harness-gaps` issues filed since the last prune. Triage each into
      fix-now / fix-later / won't-fix.

### 4. CLAUDE.md size delta
- [ ] Record `wc -l CLAUDE.md` before and after the prune. Target: keep
      under 120 lines. If growth is unavoidable, move detail into a
      `standards/quick-ref/*.md` file and link it.

### 5. Registry retire-when checks
- [ ] For each rule with a `retire-when` clause in
      `standards/enforcement-registry.md`, verify the retirement
      condition has not been met. If it has, remove the rule and the
      check.

### 6. ADR review reminder
- [ ] Skim `docs/adr/README.md` for ADRs that are now superseded in
      practice but still marked Accepted. Update status or add a
      superseded-by reference.
- [ ] Check for duplicate ADR numbers:
      `ls docs/adr/[0-9][0-9][0-9]-*.md | cut -c1-3 | sort | uniq -d`

### 7. `.claude/temp/` cleanup
- [ ] List `*-REMOVE.md` files in `.claude/temp/` whose issue is closed
      and merged. Delete them.
- [ ] Command: `gh issue view <number> --json state` per file.

### 8. Last-pruned date
- [ ] Update the line below.

---

**Last pruned:** 2026-04-06
