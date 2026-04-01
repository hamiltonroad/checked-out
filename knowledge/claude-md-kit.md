# CLAUDE.md Best Practices

How to write instruction files that agents actually follow.

## The Six Essential Sections

The canonical section names (used by audit rules to detect completeness):

1. **Tech Stack** — what the project is, language, framework, key tools
2. **Architecture** — structural rules, layer boundaries, dependency flow
3. **Commands** — exact commands to build, test, lint, run
4. **Constraints** — prohibitions and things NOT to do
5. **Conventions** — naming, style, patterns the linter doesn't catch
6. **Context Guidance** — pointers to where things are, session guidance

Fixtures and audit rules MUST use these canonical names for section matching. Synonyms (e.g., "Overview" for "Tech Stack", "Do NOT" for "Constraints") should not be used in fixtures — audit rules match on canonical headings.

### 1. Tech Stack

One paragraph: what the project is, what stack, what matters most.

```
This is a SaaS billing API built with Node.js/Express and PostgreSQL.
It handles subscription management, invoice generation, and payment
processing via Stripe. Reliability and data integrity are the top
priorities — this system handles real money.
```

### 2. Architecture

Three to five critical structural rules, stated plainly. Pointer to detailed docs if they exist.

```
- Four-layer architecture: routes → services → domain → repositories.
  Dependencies flow downward only.
- Domain layer has ZERO external dependencies.
- No cross-domain imports. Shared contracts live in src/shared/interfaces/.
- Database queries belong ONLY in repository files.
- Full architecture spec: .harness/architecture.json
```

### 3. Conventions

Five to ten tight rules your linters don't catch. Each must be machine-evaluable.

```
- Functions: camelCase. Files: kebab-case. Classes: PascalCase.
- Named exports only. No default exports.
- Errors: throw typed errors from src/shared/errors.ts with the
  original error as the cause.
- All async functions must have explicit error handling.
- Tests use Arrange-Act-Assert with section comments.
```

### 4. Commands

Exact commands to build, test, lint, and run the project.

```
- Install: `npm install`
- Run all tests: `npm test`
- Run single test: `npm test -- --grep "test name"`
- Lint: `npm run lint` (auto-fix: `npm run lint:fix`)
- Type check: `npx tsc --noEmit`
- Dev server: `npm run dev` (port 3000, requires local Postgres)
```

### 5. Constraints

Tell the agent what NOT to do. Prohibitions close shortcuts and force correct approaches.

```
- Do NOT use `db.query()` directly. Use the repository for that domain.
- Do NOT put business logic in route handlers.
- Do NOT import from another domain's internal files.
- Do NOT use console.log. Use the structured logger.
- Do NOT commit directly to main.
```

### 6. Context Guidance

Point to where things are without bloating the file.

```
- Architecture rules: .harness/architecture.json
- API design conventions: docs/api-conventions.md
- Shared types and interfaces: src/shared/
- Environment configuration: src/config/env.ts
```

## The 60-Line Rule

Keep CLAUDE.md under 60 lines. Under 80 is acceptable. Over 100, move content elsewhere.

**Why:**

- Frontier models follow ~150-200 discrete instructions with reasonable consistency. Beyond that, compliance degrades.
- When everything is important, nothing is.
- Every line takes up context window space the agent needs for reasoning.
- Research: LLM-generated instruction files degraded performance by 20%+. Hand-crafted files improved performance ~4%.

## The Three-Tier Hierarchy

### Tier 1: Personal (`~/.claude/CLAUDE.md`)

Personal defaults true across all projects. Never checked into version control.

```markdown
## My Preferences

- Use conventional commit format: type(scope): description
- Always run tests before considering a task complete.
- Prefer explicit return types on exported functions.
- Do not create documentation files unless I specifically ask.
```

### Tier 2: Project Root (`CLAUDE.md`)

Shared with team. Checked into git. Build commands, architecture rules, naming conventions.

### Tier 3: Subdirectory Files

Domain-specific details. Claude Code loads them when agent works in that directory.

```
my-project/
  CLAUDE.md                    ← Always loaded
  src/
    billing/
      CLAUDE.md                ← Loaded when working in billing/
    notifications/
      CLAUDE.md                ← Loaded when working in notifications/
```

**Layering:** Personal loads first → project root → subdirectory. More specific wins on conflict.

## Prohibition-First Thinking

Agents take the shortest path to working code. Without prohibitions:

- Agent puts database query in route handler because it works
- Agent imports directly from another domain because it works
- Agent uses deprecated functions because it works
- Agent creates duplicate utilities because it works

**Prohibitions close these shortcuts.** They force the agent toward the correct approach.

This section grows over time. Each entry corresponds to a real mistake the agent has made.

## Anti-Patterns

| Anti-Pattern                   | Problem                                        | Fix                                     |
| ------------------------------ | ---------------------------------------------- | --------------------------------------- |
| **Too long (>100 lines)**      | Each line competes for attention               | Move details to referenced files        |
| **Too vague**                  | "Write clean code" — can't evaluate compliance | Make every rule machine-testable        |
| **Missing prohibitions**       | Agent finds creative shortcuts                 | Add "Do NOT" entries for known mistakes |
| **Contradictory instructions** | Agent picks wrong one                          | Review periodically for consistency     |
| **Stale instructions**         | Actively point agent wrong                     | Update when project structure changes   |
| **Ephemeral information**      | Clutter that expires                           | Use PROGRESS.md or issues instead       |
