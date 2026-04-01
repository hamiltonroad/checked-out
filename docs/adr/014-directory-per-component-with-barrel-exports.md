# ADR-014: Directory-per-Component with Barrel Exports

**Status:** Accepted
**Date:** 2026-04-01

**Context:** As component complexity grows, co-locating styles, sub-components, and tests with the main component file improves discoverability. A consistent import pattern keeps consumer code clean.

**Decision:** Each non-trivial component gets its own directory containing the component file and an `index.js` barrel export. Supporting files (sub-components, constants, helpers) live alongside the main file.

```
BookCard/
  BookCard.jsx
  index.js          // export { default } from './BookCard';
```

**Consequences:**
- Related files are co-located and easy to find.
- Import paths stay clean: `import BookCard from './BookCard'` resolves via the barrel.
- Trivial components (pure display, no sub-files) may remain as single files.
- Adds directory and barrel file overhead for each component.
