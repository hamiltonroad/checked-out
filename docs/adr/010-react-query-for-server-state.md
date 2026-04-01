# ADR-010: React Query for Server State, Context for UI State

**Status:** Accepted
**Date:** 2026-04-01

**Context:** The frontend needs to manage two distinct kinds of state: server data (books, users, checkouts) that must be cached, refetched, and synchronized, and client-only UI state (theme preferences).

**Decision:** Use TanStack React Query v5 for all server state management. React Context is reserved exclusively for UI-only concerns such as theming. No global state library (Redux, Zustand) is used.

**Consequences:**
- Server state benefits from built-in caching, background refetch, and stale-while-revalidate.
- Clear boundary: if data comes from the API, it lives in React Query; if it is UI-only, it lives in Context.
- Eliminates the need for a heavy global state library.
- Developers must learn React Query's cache key and invalidation model.
