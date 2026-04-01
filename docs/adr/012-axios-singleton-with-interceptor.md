# ADR-012: Axios Singleton with Request Interceptor

**Status:** Accepted
**Date:** 2026-04-01

**Context:** Every API call needs the same base URL and authorization header. Configuring this per-request is error-prone and repetitive.

**Decision:** Create a single Axios instance with the base URL pre-configured. A request interceptor reads the auth token from `localStorage` and attaches it as an `Authorization` header on every outgoing request. All service modules import this shared instance.

**Consequences:**
- Auth header injection is automatic and consistent across all API calls.
- Base URL is configured in one place, simplifying environment changes.
- Interceptor logic is centralized and easy to modify (e.g., adding refresh token flow).
- Couples auth storage to `localStorage` — changing storage strategy requires updating the interceptor.
