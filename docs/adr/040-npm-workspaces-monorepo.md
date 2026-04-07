# ADR-040: npm Workspaces for Monorepo Structure

**Status:** Accepted
**Date:** 2026-04-01

**Context:** The Checked Out project has two independent packages (backend and frontend) with no unified dependency management or root-level scripting. Shared dev dependencies like Prettier, Husky, and lint-staged are duplicated in both packages with identical versions. There is no way to run commands across both packages from the repository root.

**Decision:** Adopt npm workspaces to manage the monorepo structure.

- Add a root `package.json` with `"workspaces": ["backend", "frontend"]`.
- Hoist shared dev dependencies (husky, lint-staged, prettier) to the root package.
- Keep package-specific dependencies (including ESLint, which uses different major versions) in their respective workspace packages.
- Add root-level convenience scripts for cross-workspace operations (lint, format, test, dev, build, migrate, seed).

**Alternatives Considered:**

- **No change (status quo):** Continue with independent packages. Simple but results in dependency duplication and no unified tooling.
- **Lerna:** Mature monorepo tool, but adds unnecessary complexity for a two-package project. npm workspaces covers our needs natively.
- **Turborepo:** Powerful build caching and task orchestration, but overkill for a teaching project with two packages.
- **Nx:** Full-featured monorepo toolkit with dependency graph analysis. Far too heavy for our use case.
- **pnpm workspaces:** Similar to npm workspaces but requires switching package managers. Unnecessary migration cost.

**Consequences:**
- `npm install` from the root installs dependencies for all workspaces, simplifying onboarding.
- Shared dev dependencies are maintained in one place, reducing version drift.
- Root-level scripts provide a single entry point for common operations.
- Individual workspace `npm run` commands continue to work as before.
- ESLint remains in each workspace due to incompatible major versions (v8 backend, v9 frontend).
- Husky `prepare` script moves to the root, simplifying git hook management.
- Developers must use `npm install` from the root rather than from individual package directories for initial setup.
