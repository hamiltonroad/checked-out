# Core Concepts

The foundational ideas from _Harness Engineering for Vibe Coders_ that the CLI encodes.

## The Formula

**Agent = Model + Harness**

- **Model**: Intelligence (constant at any given time)
- **Harness**: Everything else — constraints, tools, memory, verification, context curation, governance

If you're not the model, you're the harness.

## The Vibe Coding Wall

Vibe coding (describing features in natural language for AI agents to build) works beautifully for small projects (~500-1,000 lines) but hits a predictable wall at **2,000-5,000 lines**. The problem isn't the AI. The problem is the environment.

**Honeymoon Phase (500-1,000 lines):**

- Everything fits in context window
- No contradictions exist yet
- Blast radius of mistakes is tiny

**At the Wall:**

- Repetition: Agent duplicates code across files
- Contradiction: Agent makes conflicting architectural choices
- Phantom completion: Agent declares work done that doesn't actually work
- Cascade failure: Fixing one bug introduces others

## Harness Engineering Definition

The discipline of building a structured environment around an AI agent. Components:

- Documentation that tells the agent how your project works
- Architecture that constrains the solution space
- Tests and linters providing automated feedback
- Memory systems persisting decisions across sessions
- Quality gates verifying agent output before acceptance

## Three Eras of AI-Assisted Development

| Era                                   | Core Question                              | Innovation                                                         | Limitation                                 |
| ------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------ | ------------------------------------------ |
| **1: Prompt Engineering** (2023-2024) | "What should I tell the model?"            | Single-turn task quality                                           | Nothing linking responses together         |
| **2: Context Engineering** (2025)     | "What should the model see?"               | Optimized input window (RAG, AGENTS.md, tools)                     | Can show docs but can't enforce compliance |
| **3: Harness Engineering** (2026)     | "How should the whole system be designed?" | Quality gates, verification loops, constraints, session management | Each era subsumes the previous             |

## The Eight Failure Modes

Every agent failure maps to one of these. Each has a mechanical cause and a structural fix.

| #   | Failure Mode                        | Cause                                                     | Fix Category                      |
| --- | ----------------------------------- | --------------------------------------------------------- | --------------------------------- |
| 1   | **Context Overflow**                | Project exceeds context window capacity                   | Context management                |
| 2   | **Convention Drift**                | No persistent record of conventions                       | Documentation + linters           |
| 3   | **Copy-Paste Explosion**            | Agent unaware of existing utilities (8x duplication rate) | Architecture + documentation      |
| 4   | **Phantom Completions**             | Agent judges plausibility, not correctness                | Back-pressure (tests, linters)    |
| 5   | **Fixation Loop**                   | Local changes without global awareness                    | Automated test suites             |
| 6   | **Architecture Erosion**            | Architecture invisible unless encoded                     | Linters and CI gates              |
| 7   | **Blank Slate Problem**             | Agent is stateless across sessions                        | External memory (CLAUDE.md, ADRs) |
| 8   | **Confidence Without Verification** | Agent presents all output with equal certainty            | External verification             |

**Root cause beneath all eight:** The agent is unsupported — a stateless text generator in an empty environment with no persistent memory, automated verification, enforced constraints, or curated view of the codebase.

## Four Harness Pillars

1. **Documentation/Memory** — CLAUDE.md, ADRs, state files. Fixes: blank slate, convention drift, context overflow
2. **Architecture/Constraints** — Layered design, linters, CI gates. Fixes: erosion, drift, copy-paste explosion
3. **Verification/Back-pressure** — Tests, type checkers, linting. Fixes: phantoms, fixation loops, confidence without verification
4. **Context Management** — What agent sees, when. Fixes: overflow, copy-paste explosion

## Three Enforcement Levels

| Level              | Strength  | Mechanism                                                         |
| ------------------ | --------- | ----------------------------------------------------------------- |
| **Documentation**  | Weakest   | Rules in CLAUDE.md; agent tries to follow but skips shortcuts     |
| **Custom Linters** | Strong    | Scripts that parse code + report violations with fix instructions |
| **CI/CD Gates**    | Strongest | PR cannot merge if gate fails; ultimate guarantee                 |

All three are needed. Documentation alone is insufficient.

## Evidence That Harness > Model

- **LangChain**: Same model, different harness = 13.7-point benchmark improvement (Top 30 to Top 5)
- **Vercel**: 15 tools (80% accuracy) to 2 tools (100% accuracy), 37% fewer tokens, 3.5x faster
- **APEX-Agents**: Frontier models achieve 24% on realistic tasks vs. 90%+ on isolated benchmarks
- **Separate study**: 78% with harness vs. 42% without (86% improvement from scaffolding alone)

## Counterintuitive Truth: Constraints Improve Performance

- 15 tools: agent wastes tokens deciding which tool to use
- 2 tools: agent converges directly on the solution
- Constraints eliminate bad options without eliminating good ones
- LLM accuracy drops 24%+ when relevant information is embedded in longer contexts

## Six Things the Agent Cannot Provide for Itself

1. **Persistent Memory** — External state (CLAUDE.md, ADRs, progress files)
2. **Architectural Constraints** — Mechanical enforcement (linter rules, configs)
3. **Verification Mechanisms** — Back-pressure (tests, type checkers, linters)
4. **Tool Access** — Expanded capabilities (MCP servers, APIs)
5. **Context Curation** — Right info at right time (not "more is better")
6. **Governance** — Boundaries on what agent can/can't do

## Key Mindset Shifts

- "How do I build this?" → "How do I describe this so it gets built correctly?"
- "Fix the bug" → "Fix the system that allowed the bug"
- "Write it perfectly" → "Iterate rapidly with quality gates"
- "I am the coder" → "I am the architect"

## Build for Deletion

Design harness components so they can be cleanly removed when models improve. Constraints compensate for today's limitations; they shouldn't be load-bearing walls.
