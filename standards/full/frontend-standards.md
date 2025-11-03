# Frontend Development Standards

## Overview

Standards for React-based frontend development focusing on maintainability, consistency, and professional code quality.

---

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── BookCard/
│   │   ├── BookCard.jsx
│   │   ├── BookCard.test.jsx
│   │   └── index.js
│   └── Layout/
├── pages/               # Route-level components
├── hooks/               # Custom React hooks
├── context/             # React Context providers
├── services/            # API calls and external services
├── utils/               # Pure utility functions
├── theme/               # Material UI theme configuration
├── App.jsx
├── main.jsx
└── router.jsx
```

### Directory Guidelines

**`/components/`** - Reusable UI components
- Each component in its own folder with component file, test file, and barrel export (index.js)
- Keep components focused and under 200 lines

**`/pages/`** - Route-level components that handle page-level data fetching and compose smaller components

**`/hooks/`** - Custom React hooks (must start with "use" prefix)

**`/context/`** - React Context for global state (auth, theme, preferences)

**`/services/`** - API integration layer (one service file per resource, return promises)

**`/utils/`** - Pure utility functions with no React dependencies

**`/theme/`** - Material UI theme customization

---

## Component Standards

### Component Organization

1. Imports
2. Component definition with JSDoc
3. Hooks (useState, useEffect, custom hooks)
4. Event handlers
5. Render
6. PropTypes validation
7. Export

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `BookCard`, `UserProfile` |
| Files | PascalCase.jsx | `BookCard.jsx` |
| Props | camelCase | `bookTitle`, `isLoading` |
| Event handlers | handle + Event | `handleClick`, `handleSubmit` |
| Hooks | use + Name | `useBooks`, `useAuth` |
| Boolean props | is/has/should | `isOpen`, `hasError`, `shouldValidate` |
| Callback props | on + Event | `onClick`, `onSubmit` |

### Component Best Practices

**DO ✅**
- Use functional components with hooks
- Keep components small and focused (single responsibility)
- Use PropTypes for all props
- Write meaningful component and prop names
- Extract complex logic into custom hooks
- Use composition over inheritance
- Memoize expensive calculations with `useMemo`
- Memoize callbacks with `useCallback` when passed to children
- Use barrel exports (`index.js`) for cleaner imports
- Write tests for all components

**DON'T ❌**
- Use class components (legacy pattern)
- Create deeply nested component structures
- Put business logic directly in components
- Hardcode values that should be configurable
- Ignore PropTypes warnings
- Create monolithic components
- Fetch data directly in components (use hooks/services)
- Mix presentation and data logic

---

## React Hooks

### Hook Rules (Required)

1. **Only call hooks at the top level** - Never inside loops, conditions, or nested functions
2. **Only call hooks from React functions** - Components or custom hooks
3. **Custom hooks must start with "use"** - Enables linting rules

### Hook Guidelines

- Prefer multiple `useState` calls over one complex object
- Include all dependencies in `useEffect` dependency arrays (ESLint enforces this)
- Wrap Context consumers in custom hooks with error checking
- Use `useMemo` for expensive calculations
- Use `useCallback` for callbacks passed to child components

---

## State Management

**Local State (`useState`)** - Form inputs, UI toggles, component-specific state

**Context API** - Theme, authentication, user preferences, global UI state

**React Query (TanStack Query)** - Server state, API data, caching, mutations

---

## Styling Standards

**`sx` prop** - Use for component-specific styles

**`styled()` API** - Use for reusable styled components

**Best Practices:**
- Use theme values (spacing, colors, breakpoints)
- Avoid inline styles
- Use responsive breakpoints (xs, sm, md, lg, xl)
- Consistent spacing with `theme.spacing()` (8px grid)

---

## API Integration

**Service Layer Pattern:**
- Create base Axios instance (`services/api.js`) with interceptors for auth
- One service file per resource (e.g., `bookService.js`)
- Services return promises, work with React Query
- Never call APIs directly from components

---

## Testing Standards

**Philosophy:**
- Test user behavior, not implementation details
- Use accessible queries (prefer `getByRole`, `getByLabelText`)
- Mock external dependencies (API calls, localStorage)
- Test loading, error, and empty states
- One concept per test

**Query Priority:**
1. `getByRole` (preferred)
2. `getByLabelText` (forms)
3. `getByPlaceholderText`
4. `getByText`
5. `getByTestId` (last resort)

---

## Routing

- Use React Router v7 with `createBrowserRouter`
- Define routes in `router.jsx` with nested route support
- Use `<Link>` for navigation, `useNavigate()` for programmatic navigation
- Access params with `useParams()`, search params with `useSearchParams()`

---

## Accessibility (WCAG 2.1 AA)

- Keyboard navigation for all interactive elements
- Color contrast: 4.5:1 (text), 3:1 (UI components)
- Alt text for all images
- Labels for all form inputs
- ARIA attributes when semantic HTML insufficient
- Visible focus indicators
- Semantic HTML elements

---

## Performance

- Lazy load routes with `React.lazy()` and `<Suspense>`
- Memoize expensive components with `React.memo()`
- Virtualize long lists (react-window, react-virtuoso)
- Optimize images (WebP, lazy loading)
- Use React DevTools Profiler to identify bottlenecks

---

## Error Handling

- Use Error Boundaries for component-level errors
- Centralized error handling in API interceptors
- Handle API errors consistently (response vs request vs generic errors)
- Display user-friendly error messages

---

## Code Quality Checklist

Before committing:
- [ ] ESLint passes (no warnings)
- [ ] Prettier formatted
- [ ] PropTypes defined for all components
- [ ] Tests written and passing
- [ ] No console.log statements
- [ ] Accessibility requirements met
- [ ] Responsive design verified
- [ ] Loading and error states handled
- [ ] No hardcoded values (use env vars)

Use Conventional Commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`
