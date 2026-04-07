# Frontend Quick Reference

React 18 + Vite + Material UI + React Query + TypeScript. Summary of `standards/full/frontend-standards.md`.

---

## Structure

```
src/
├── components/   # Reusable UI (BookCard/, Layout/)
├── pages/        # Route-level
├── hooks/        # use* custom hooks
├── services/     # API integration (one per resource)
├── utils/        # Pure functions, shared formatters
├── types/        # Shared TS interfaces (index.ts)
├── constants/    # Shared domain constants
└── theme/        # MUI theme
```

---

## Naming

| Type | Convention |
|---|---|
| Components/Files | `PascalCase.tsx` |
| Props | `camelCase` |
| Event handlers | `handle*` |
| Hooks | `use*` |
| Boolean props | `is/has/should*` |
| Callback props | `on*` |

---

## Component Rules

- All components are `.tsx` with props typed via a TypeScript `interface`.
- Zero-prop components use `interface Props {}`.
- Local prop types live in the same file unless shared across 3+ consumers (then `types/index.ts`).
- `prop-types` is forbidden — `HARNESS-NO-PROP-TYPES`.
- Use default parameters; never `defaultProps`.
- Functional components only.
- Components under 200 lines.

---

## State

| Layer | Use for |
|---|---|
| `useState` | Local UI state, form inputs |
| Context | Auth, theme, preferences |
| React Query | All server state |

**React Query mutations MUST invalidate every query key displaying affected data.** Use prefix matching.

---

## API

- Base Axios instance in `services/api.ts` with auth interceptor.
- One service per resource. Services return promises.
- Components never call APIs directly — use hooks.
- Never `response.data || response`. Trust the envelope or throw.

---

## Styling

- `sx` prop for one-off, `styled()` for reusable.
- Always use theme tokens — no inline styles, no inline color/spacing literals.
- `theme.spacing(1)` = 8px.

---

## Testing

- Test behavior, not implementation.
- Query priority: `getByRole` > `getByLabelText` > `getByText` > `getByTestId`.
- Mock external dependencies. Cover loading, error, empty.
- When extracting a component to its own file, migrate its tests with it.

---

## Accessibility

- Keyboard nav for all interactive elements.
- Contrast ≥ 4.5:1 (text), ≥ 3:1 (UI).
- Alt text on images, labels on inputs.
- Semantic HTML before ARIA.

---

## Don'ts

- Class components
- Data fetching in components
- Hardcoded API URLs
- `console.log`
- Inline styles
- `<Link>`/`navigate()` to routes that don't exist in `router.tsx`
- Mixing presentation and business logic

---

## Pre-commit Checklist

- [ ] ESLint + Prettier pass
- [ ] Props typed via TS interface
- [ ] Tests passing
- [ ] No `console.log`
- [ ] Accessible
- [ ] Loading/error states handled
- [ ] React Query mutations invalidate affected keys
