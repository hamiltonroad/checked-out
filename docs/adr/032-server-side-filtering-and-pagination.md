# ADR-032: Server-Side Filtering and Pagination

**Status:** Accepted
**Date:** 2026-04-01

**Context:** The books listing endpoint returned all records in a single response, and the frontend performed search, filtering, and pagination entirely in the browser using `useMemo`. This approach works for small datasets but does not scale: as the catalogue grows, response payloads increase, memory consumption rises on the client, and the database does unnecessary full-table scans. Search across related tables (authors) compounded the issue because every book's author associations had to be loaded before the client could filter.

**Decision:** Move search, genre filtering, profanity filtering, and pagination to the server:

| Capability | Before | After |
|-----------|--------|-------|
| Text search (title, author) | Client-side `useMemo` + `Array.filter` | Sequelize `Op.like` with two-pass ID lookup |
| Genre filter | Not implemented server-side | `where.genre` clause |
| Profanity filter | Client-side checkbox | `where.has_profanity` clause via query param |
| Pagination | Client fetches all, displays all | `findAndCountAll` with `offset`/`limit`; metadata returned |
| Availability filter | Client-side (computed from copies/checkouts) | Remains client-side — status depends on nested checkout state |

Implementation details:

- The `GET /api/v1/books` endpoint accepts `search`, `genre`, `profanity`, `page`, `limit`, and `offset` query parameters, all validated by Joi middleware.
- The book service uses `Book.findAndCountAll` with `distinct: true` to produce correct counts when eager-loading associations.
- Text search performs a two-pass lookup: first finding book IDs matching by title, then book IDs matching via author names, and combining the sets with `Op.in`.
- The response includes a `pagination` object (`{ page, limit, total, totalPages }`) alongside the `books` array inside `ApiResponse.success()`.
- The frontend `useBooks` hook accepts a params object that is included in the React Query cache key, ensuring automatic re-fetches when filters change.
- A database index on `books.genre` was added via migration to support the new genre filter.

**Alternatives Considered:**

1. **Full-text search (MySQL FULLTEXT index):** More powerful for natural-language queries but adds complexity and MySQL-specific coupling. Deferred until search requirements grow.
2. **Cursor-based pagination:** Better for real-time feeds but adds implementation complexity. Offset-based pagination is sufficient for a catalogue browse UI.
3. **GraphQL:** Would allow clients to request exactly the fields and filters they need, but introduces a new paradigm inconsistent with the existing REST API.
4. **Keep client-side filtering, add virtual scrolling:** Reduces DOM pressure but still transfers all data over the network and loads all associations in memory.

**Consequences:**

- Network payloads are bounded by the page size (default 20) rather than the full catalogue.
- Database indexes on `genre` and existing indexes on `title` improve query performance.
- The `useBookSearch` client-side hook is removed, reducing frontend bundle size.
- Availability filtering remains client-side because it depends on computed status from nested copy/checkout data; moving it server-side would require a SQL subquery or denormalization (potential future ADR).
- API consumers must handle the new response shape (`{ books, pagination }`) instead of a flat array.
