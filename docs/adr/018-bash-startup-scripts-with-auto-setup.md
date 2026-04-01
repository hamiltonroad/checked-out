# ADR-018: Bash Startup Scripts with Auto-Setup

**Status:** Accepted
**Date:** 2026-04-01

**Context:** New developers need to get the application running quickly. Manual setup steps (installing dependencies, copying env files, checking port availability) are error-prone and slow onboarding.

**Decision:** Provide bash scripts (`scripts/start-all.sh`, `scripts/stop-all.sh`) that automate startup. The start script:

1. Checks if required ports are available.
2. Auto-installs dependencies if `node_modules` is missing or stale.
3. Copies `.env.example` to `.env` if no `.env` file exists.
4. Starts backend and frontend processes.

**Consequences:**
- One-command startup reduces onboarding friction.
- Port checks prevent confusing "address in use" errors.
- Auto-copy of `.env.example` ensures configuration is present without committing secrets.
- Scripts assume a bash environment (macOS/Linux); Windows users need WSL or equivalent.
