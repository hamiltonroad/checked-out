# ADR-011: Service -> Hook -> Component Separation

**Status:** Accepted
**Date:** 2026-04-01

**Context:** Components that directly call API services become tightly coupled to fetching logic, making them harder to test and reuse.

**Decision:** Enforce a three-layer separation on the frontend:

1. **Services** — plain functions that make Axios HTTP calls and return promises.
2. **Hooks** — custom hooks that wrap services with React Query (`useQuery`, `useMutation`), managing cache keys, loading, and error states.
3. **Components** — consume only hooks, never services directly.

**Consequences:**
- Components are decoupled from data-fetching implementation details.
- Hooks encapsulate caching, retries, and optimistic updates in one place.
- Services are framework-agnostic and independently testable.
- Adds an extra layer of indirection for simple CRUD operations.
