# ADR-001: Layered Architecture

**Status:** Accepted
**Date:** 2026-04-01

**Context:** The backend needs a clear separation of concerns so that each layer has a single responsibility and new developers can quickly understand where code belongs.

**Decision:** Adopt a strict four-layer architecture: routes -> controllers -> services -> models. Dependencies flow downward only — no layer may import from a layer above it.

- **Routes** define Express endpoints and attach validation/auth middleware.
- **Controllers** parse HTTP requests, call services, and format HTTP responses.
- **Services** contain all business logic and interact with models.
- **Models** define Sequelize schemas and associations.

**Consequences:**
- Enforces single responsibility at each layer.
- Business logic is testable independently of HTTP concerns.
- Prevents circular dependencies by mandating one-way data flow.
- Requires discipline to avoid "shortcut" imports across layers.
