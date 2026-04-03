# ADR-035: Migrate Frontend from JavaScript/PropTypes to TypeScript

## Status

Accepted

## Context

The frontend codebase used JavaScript with PropTypes for runtime type checking. PropTypes only catch type errors at runtime in development mode, provide no editor autocompletion, and add bundle size overhead. Additionally, `defaultProps` is deprecated in React 18.3+, which the codebase had already moved away from by using JavaScript default parameters.

TypeScript provides compile-time type safety, superior editor tooling (autocompletion, refactoring, go-to-definition), and eliminates the need for the `prop-types` runtime dependency.

## Decision

Migrate all frontend source files from JavaScript (`.js`/`.jsx`) to TypeScript (`.ts`/`.tsx`), replacing PropTypes with TypeScript interfaces.

Key decisions:

1. **Strict mode enabled** - `tsconfig.json` uses `strict: true` for maximum type safety including `strictNullChecks`, `noImplicitAny`, and `strictFunctionTypes`.
2. **Shared types file** - Common interfaces (`Book`, `Patron`, `Rating`, etc.) live in `frontend/src/types/index.ts` and are imported where needed.
3. **Interface-per-component pattern** - Each component defines a `Props` interface (e.g., `BookCardProps`) immediately above the component function.
4. **`react-jsx` transform** - Uses the modern JSX transform (`jsx: "react-jsx"` in tsconfig), so `import React` is not required for JSX but `import type React` is used where React type namespace is needed.
5. **Bundler module resolution** - Uses `moduleResolution: "bundler"` to match Vite's module resolution strategy.
6. **prop-types removed** - The `prop-types` package is removed from dependencies since TypeScript interfaces replace it entirely.

## Consequences

### Positive

- Compile-time type errors caught before runtime
- Full editor autocompletion and inline documentation for props, hooks, and services
- Eliminated ~15KB of `prop-types` runtime dependency from bundle
- Refactoring is safer with TypeScript's rename and find-references tooling
- Self-documenting interfaces serve as API contracts between components

### Negative

- Slightly more verbose code (interface definitions)
- Build step now includes type checking (though Vite skips type checking by default for speed)
- Team members need TypeScript familiarity

### Neutral

- ESLint config updated to use `@typescript-eslint/parser` and `@typescript-eslint/eslint-plugin`
- Prettier format script updated to target `.ts`/`.tsx` files
- Test files also converted to TypeScript for consistency
