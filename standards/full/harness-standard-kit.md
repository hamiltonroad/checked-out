# Harness Maturity Standard — Full Reference

## Overview

The harness maturity model defines four tiers that describe how well a project's structured environment supports AI coding agents. The model is implemented as audit rules in `harness-cli` — each rule is assigned to the minimum tier that requires it.

The formula: **Agent = Model + Harness**. The model is a constant. The harness is everything else — instructions, verification, constraints, context management, tools, continuity, and architecture enforcement. This standard describes what a mature harness looks like at each level.

## Maturity Tiers

Tiers are cumulative. A project must achieve all lower tiers before claiming a higher one. A single failing rule at a lower tier blocks achievement of all tiers above it.

### Tier 1: Minimal (2 rules)

**What it means:** The agent has _something_ to work with.

**Requirements:**

| Rule             | Category     | What it checks                                                   |
| ---------------- | ------------ | ---------------------------------------------------------------- |
| claude-md-exists | Instructions | A CLAUDE.md file exists at the project root                      |
| claude-md-length | Instructions | CLAUDE.md contains meaningful content (not empty or single-line) |

**Rationale:** Without a CLAUDE.md file, the agent operates with zero project-specific context. It will guess at conventions, architecture, and constraints — and guess wrong. The Minimal tier sets the absolute floor: the agent can at least read _something_ about the project.

**What this tier does NOT provide:** Any guarantee that the content is useful, specific, or enforced.

---

### Tier 2: Structured (12 rules)

**What it means:** The agent has specific, actionable instructions across all harness pillars.

**Requirements:**

| Rule               | Category     | What it checks                                                       |
| ------------------ | ------------ | -------------------------------------------------------------------- |
| has-tech-stack     | Instructions | CLAUDE.md lists the tech stack with specific technologies            |
| has-architecture   | Instructions | CLAUDE.md describes the project's architecture (directories, layers) |
| has-constraints    | Instructions | CLAUDE.md specifies what the agent should NOT do                     |
| specificity        | Instructions | Instructions use concrete file paths and patterns, not vague advice  |
| subdirectory-files | Instructions | Subdirectory CLAUDE.md files exist where conventions differ by area  |
| session-scoping    | Context      | CLAUDE.md includes guidance on session scope and focus               |
| compact-guidance   | Context      | CLAUDE.md includes guidance on using /compact and context management |
| subagent-guidance  | Context      | CLAUDE.md includes guidance on sub-agent delegation                  |
| mcp-configured     | Tools        | MCP server configuration exists if the project uses external tools   |
| mcp-count          | Tools        | MCP server count is reasonable (not over-tooled)                     |
| config-exists      | Architecture | Architecture configuration file exists (.harness/architecture.json)  |
| onboarding-quality | Continuity   | Onboarding documentation is sufficient for a new session             |

**Rationale:** Structured projects have invested in telling the agent what to do. The instructions cover the four harness pillars: documentation/memory, architecture/constraints, verification (documented but not yet enforced), and context management. This tier catches the most common failure modes — convention drift, copy-paste explosion, and the blank-slate problem — through documentation alone.

**Key insight:** Documentation is the weakest enforcement level. An agent _tries_ to follow instructions but takes shortcuts, loses context over long sessions, and lacks the ability to verify its own compliance. Structured is necessary but not sufficient.

**Example — Structured but not Verified:**

```
# CLAUDE.md
## Testing
- Run `npm test` before committing
- All new code must have tests
```

The agent sees this instruction. Whether it actually runs tests before committing depends on the agent's diligence — there is no mechanical guarantee.

---

### Tier 3: Verified (12 rules)

**What it means:** The harness mechanically enforces its own rules. Documentation is backed by automation.

**Requirements:**

| Rule                   | Category     | What it checks                                             |
| ---------------------- | ------------ | ---------------------------------------------------------- |
| hooks-configured       | Verification | Claude Code hooks are configured in .claude/settings.json  |
| hook-scripts-exist     | Verification | Hook scripts referenced in settings actually exist on disk |
| lint-hook              | Verification | A PostToolUse hook runs linting after file writes          |
| test-hook              | Verification | A pre-commit hook runs the test suite                      |
| forbidden-patterns     | Verification | Hooks or rules block known anti-patterns                   |
| clear-feedback         | Verification | Failed checks provide clear, actionable error messages     |
| permissions-configured | Constraints  | Permission settings exist and match risk levels            |
| deny-rules             | Constraints  | Explicit deny rules prevent dangerous operations           |
| off-limits-files       | Constraints  | Protected files/directories are defined                    |
| scope-rules            | Constraints  | Rules limit what the agent can modify                      |
| banned-patterns        | Architecture | Architecture enforcement detects banned code patterns      |
| enforcement-level      | Architecture | Enforcement goes beyond documentation to active checking   |

**Rationale:** The gap between Structured and Verified is the gap between _telling_ the agent what to do and _catching it_ when it does not comply. This is the single most impactful tier transition for most projects.

At Verified, the harness embodies the three enforcement levels from the core concepts:

1. **Documentation** (Structured tier) — rules in CLAUDE.md
2. **Custom linters/hooks** (Verified tier) — scripts that parse output and report violations
3. **CI/CD gates** — PR cannot merge if checks fail

Verified projects catch phantom completions (agent declares work done that doesn't pass tests), convention drift (agent uses wrong patterns), and confidence without verification (agent presents incorrect output with certainty).

**Example — Verified enforcement:**

```json
// .claude/settings.json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "command": "npx eslint --fix $FILE && npx prettier --write $FILE"
      }
    ]
  }
}
```

Now the agent cannot write a file that violates lint rules — the hook catches it immediately, before errors compound.

**What "clear feedback" means:** When a hook fails, the error message must tell the agent exactly what went wrong and how to fix it. "Lint failed" is insufficient. "ESLint: no-unused-vars in src/utils/helper.ts:42 — remove unused import `foo`" is clear feedback. Without clear feedback, verification creates frustration rather than improvement.

---

### Tier 4: Self-Correcting (7 rules)

**What it means:** The harness detects and corrects its own decay. It improves over time rather than degrading.

**Requirements:**

| Rule                          | Category     | What it checks                                                              |
| ----------------------------- | ------------ | --------------------------------------------------------------------------- |
| contradictions                | Instructions | CLAUDE.md is checked for internal contradictions                            |
| stale-references              | Instructions | CLAUDE.md references are checked for staleness (paths that no longer exist) |
| code-review-results           | Continuity   | Code review results are tracked and stored                                  |
| structure-drift               | Continuity   | Project structure matches the declared structure (structure.json)           |
| memory-curated                | Continuity   | Memory files are curated, not just accumulated                              |
| critical-decisions-documented | Continuity   | Important architectural decisions are documented (ADRs)                     |
| self-verification             | Tools        | The agent has tools to verify its own work                                  |

**Rationale:** Every harness degrades over time. File paths change but CLAUDE.md references do not get updated. New conventions emerge but old ones remain documented. Memory files accumulate stale context. Structure drifts from the declared layout.

Self-correcting projects have mechanisms to detect this decay:

- **Stale reference detection** catches CLAUDE.md entries pointing to files that no longer exist
- **Contradiction detection** catches conflicting instructions within the same document
- **Structure drift detection** catches files that exist on disk but are not registered in structure.json (or vice versa)
- **Code review tracking** creates a feedback loop — findings from reviews drive harness improvements
- **Memory curation** ensures the agent's persistent context stays relevant

**The feedback loop:** Code review findings at the Self-Correcting tier are not just bug reports — they are harness audits. Every finding that reaches review is evidence of a gap: the documentation did not prevent it, automation did not catch it, or the agent lacked context. Tracking these findings over time reveals patterns and drives systematic improvement.

---

## Enforcement vs. Existence

The central insight of this maturity model: **the presence of a rule in CLAUDE.md is not the same as enforcement of that rule.**

| Level           | Mechanism                                                  | Strength                                            | Tier            |
| --------------- | ---------------------------------------------------------- | --------------------------------------------------- | --------------- |
| Documentation   | Written instructions in CLAUDE.md                          | Weakest — agent tries to follow but skips shortcuts | Structured      |
| Automation      | Hooks, linters, scripts that catch violations              | Strong — mechanical, consistent, immediate feedback | Verified        |
| Gates           | CI/CD checks that block merging on failure                 | Strongest — ultimate guarantee                      | Verified        |
| Self-correction | Mechanisms that detect harness decay and drive improvement | Sustaining — keeps the system healthy over time     | Self-Correcting |

A project with a 200-line CLAUDE.md and zero hooks is Structured, not Verified. A project with hooks that run but produce unclear error messages is not fully Verified (clear-feedback rule fails). The tier system measures what the harness _does_, not what it _says_.

## Recommendations

### Mechanisms that work (proven in this project)

- **PostToolUse hooks on Edit/Write** for immediate lint + format feedback
- **Pre-commit hooks** (husky + lint-staged) as a safety net for manual edits
- **Deny rules** in .claude/settings.json for dangerous operations (force push, destructive git commands)
- **Off-limits file lists** to protect critical configuration
- **structure.json** as a declarative manifest of project layout — agents reference it instead of hardcoding paths
- **Code review results tracked per issue** to create a measurable feedback loop
- **ADRs** (Architecture Decision Records) for documenting decisions the agent needs to know about

### Progression path

1. **Start with Minimal:** Create a CLAUDE.md with real content
2. **Move to Structured:** Add tech stack, architecture, constraints, context management guidance
3. **Move to Verified:** Add hooks, permissions, deny rules — this is where the biggest improvement happens
4. **Move to Self-Correcting:** Add contradiction detection, code review tracking, structure drift detection

Most projects should aim for Verified as a working target. Self-Correcting is for projects with active, ongoing AI-assisted development where harness maintenance is a continuous concern.

## Anti-Patterns

### Decorative configurations

A .claude/settings.json that exists but contains no hooks, no permissions, and no deny rules. The file's presence satisfies no audit rules — the rules check for specific content, not file existence.

### Untested fixtures

Test fixtures (sample project directories) that demonstrate harness patterns but are never actually validated by tests. The fixture looks like a good harness but nothing verifies it works.

### Open feedback loops

Code review findings that are noted but never tracked, never measured, and never drive harness improvements. Without closing the loop (finding leads to harness change leads to fewer findings), the same mistakes repeat.

### Vague instructions

CLAUDE.md entries like "follow best practices" or "use established patterns" that provide no actionable guidance. The specificity rule at Structured tier catches this — instructions must reference concrete file paths, specific technologies, and measurable requirements.

### Over-tooling

Configuring many MCP servers "just in case." Each additional tool increases the agent's decision space and wastes tokens on tool selection. The mcp-count rule flags projects with excessive tool configurations. Fewer, well-scoped tools outperform many loosely-scoped ones.

### Instructions without enforcement

The most common anti-pattern: writing detailed instructions in CLAUDE.md but never adding hooks to verify compliance. This creates a false sense of security — the instructions exist, so the project feels well-harnessed, but there is no mechanical guarantee the agent follows them.

## Scoring

Rules are weighted by severity:

- **Critical:** 3 points
- **Important:** 2 points
- **Recommended:** 1 point

Tier assignment uses total earned points against calibrated thresholds. A tier is "achieved" only when all non-skipped rules at that tier (and all lower tiers) pass. This means a single failing Minimal rule blocks achievement of Structured, Verified, and Self-Correcting tiers.

## Categories

The audit organizes rules into seven categories that map to the harness pillars:

| Category     | Pillar                     | What it covers                                   |
| ------------ | -------------------------- | ------------------------------------------------ |
| Instructions | Documentation/Memory       | CLAUDE.md content quality and completeness       |
| Verification | Verification/Back-pressure | Hooks, linters, automated checks                 |
| Constraints  | Architecture/Constraints   | Permissions, deny rules, scope limits            |
| Context      | Context Management         | Session scoping, compact guidance, sub-agents    |
| Tools        | Tools/Capabilities         | MCP configuration, tool scoping                  |
| Continuity   | Documentation/Memory       | Memory curation, onboarding, decision tracking   |
| Architecture | Architecture/Constraints   | Config files, enforcement level, banned patterns |
