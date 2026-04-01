# Sample CLAUDE.md Template

A starter CLAUDE.md for projects using harness-kit. Copy this to your project root as `CLAUDE.md` and fill in the project-specific sections.

This template includes kit defaults that agents depend on. Sections marked `<!-- FILL IN -->` need your project details. Sections marked `<!-- KIT DEFAULT -->` work out of the box but can be customized.

---

## Template

```markdown
# CLAUDE.md

## Tech Stack
<!-- FILL IN: One paragraph — what the project is, language, framework, key tools, top priority. -->

This is a [DESCRIPTION] built with [LANGUAGE/FRAMEWORK]. [KEY TOOLS/SERVICES].
[TOP PRIORITY — e.g., reliability, performance, developer experience].

## Architecture
<!-- FILL IN: 3-5 critical structural rules. Pointer to detailed docs if they exist. -->

- [LAYER STRUCTURE — e.g., routes → services → domain → repositories]
- [DEPENDENCY RULE — e.g., dependencies flow downward only]
- [BOUNDARY RULE — e.g., no cross-domain imports]
- [DATA ACCESS RULE — e.g., database queries only in repository files]

## Commands

| Action | Command |
|---|---|
| Install | `TBD` |
| Build | `TBD` |
| Test (all) | `TBD` |
| Test (single) | `TBD` |
| Lint | `TBD` |
| Lint (fix) | `TBD` |
| Type check | `TBD` |
| Dev server | `TBD` |

<!-- Kit agents read this table. Replace TBD with actual commands. Agents skip TBD entries. -->

## Conventions
<!-- FILL IN: 5-10 rules your linters don't catch. Each should be machine-evaluable. -->

- Functions: camelCase. Files: kebab-case. Classes: PascalCase.
- Named exports only. No default exports.
- Tests use Arrange-Act-Assert with section comments.
- [ADD YOUR CONVENTIONS]

## Constraints
<!-- FILL IN: Prohibitions that close shortcuts. Grows over time as the agent makes mistakes. -->

- Do NOT commit directly to main.
- Do NOT leave TBD entries in code — resolve or create an issue.
- [ADD YOUR CONSTRAINTS]

## Context Guidance

- Architecture rules: [PATH OR TBD]
- Shared types/interfaces: [PATH OR TBD]
- Project standards: standards/
- Kit knowledge: knowledge/

## Git
<!-- KIT DEFAULT — customize branch naming and commit style to match your team. -->

- Branch naming: `feature/issue-<number>-<description>`
- Commit style: conventional commits — `type(scope): description`
- Co-author line: `Co-Authored-By: Claude <noreply@anthropic.com>`

## Error Protocol
<!-- KIT DEFAULT — the three-strikes rule agents follow when a task fails. -->

When a task or command fails:

1. **Strike 1:** Read the error message. Identify the root cause. Fix and retry.
2. **Strike 2:** Try a different approach. Do not repeat the same fix.
3. **Strike 3:** Stop. Report the failure with what was tried and what failed.

Do not retry more than three times. Do not loop on the same error.

## Agent Model Assignments
<!-- KIT DEFAULT — which models run which agents. Adjust based on your Anthropic plan. -->

| Agent | Model | Rationale |
|---|---|---|
| prep-agent | haiku | Fast, low-cost setup tasks |
| plan-agent | opus | Deep analysis needs strongest reasoning |
| implement-agent | (default) | Inherits from session model |
| code-review-agent | (default) | Inherits from session model |

## Code Review
<!-- FILL IN or create standards/code-review.md for detailed review criteria. -->

Severity levels:

| Severity | Action Required |
|---|---|
| Critical | Must fix before merge |
| High | Must fix before merge |
| Medium | Fix if straightforward |
| Low | Note for future |

Focus areas: [ADD PROJECT-SPECIFIC FOCUS AREAS OR SEE standards/code-review.md]

File categorization: [ADD RULES OR SEE standards/code-review.md]
```

---

## Usage Notes

- **Keep it under 60 lines** once filled in. Move detailed content to referenced files.
- **Commands table is critical** — every kit agent reads it. TBD entries are skipped, but missing entries cause agents to guess.
- **Error protocol and git conventions** are referenced by name in kit agents. Changing section names will break agent references.
- **Agent model assignments** can be removed if you want all agents to inherit the session model.
- The template is intentionally longer than 60 lines to include guidance comments. Strip the `<!-- comments -->` in your final version.
- See `knowledge/claude-md-kit.md` for the full best practices guide.
- See `knowledge/sample-files-kit.md` for tech-stack-specific examples (TypeScript/React, Python/FastAPI, Monorepo).
