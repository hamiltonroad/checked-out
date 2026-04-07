# Frontend Development Standards

Standards for the React 18 + Vite + Material UI + React Query frontend. This file is canonical; the quick-ref summarizes it.

---

## Project Structure

```
src/
├── components/      # Reusable UI components (BookCard/, Layout/)
│   └── BookCard/
│       ├── BookCard.tsx
│       ├── BookCard.test.tsx
│       └── index.ts
├── pages/           # Route-level components
├── hooks/           # Custom React hooks (useBooks, useAuth)
├── context/         # React Context providers (auth, theme)
├── services/        # API integration layer (bookService.ts)
├── utils/           # Pure utility functions
├── types/           # Shared TypeScript interfaces (index.ts)
├── constants/       # Shared domain constants
├── theme/           # Material UI theme configuration
├── App.tsx
├── main.tsx
└── router.tsx
```

### Directory Guidelines

- **`components/`** — Each component in its own folder with component file, test file, and barrel export. Keep components under 200 lines.
- **`pages/`** — Route-level components that compose smaller components and own page-level data fetching.
- **`hooks/`** — Custom hooks (must start with `use`).
- **`services/`** — One service per resource. Services return promises and are consumed by hooks, never directly by components.
- **`utils/`** — Pure functions, no React dependencies. Shared formatting (dates, currency, names) lives here.
- **`types/index.ts`** — Single canonical home for shared TypeScript interfaces.
- **`constants/`** — Shared domain constants (status maps, color maps, label maps). Never duplicated across components.

---

## Component Standards

### Authoring Rules

- All components are `.tsx` with props typed via a TypeScript `interface` or `type`.
- Zero-prop components use an empty interface (`interface Props {}`).
- Component-local prop types live in the same file unless shared across 3+ consumers, in which case they belong in `types/index.ts`.
- `prop-types` is forbidden (enforced by ESLint, `HARNESS-NO-PROP-TYPES`).
- Use JavaScript default parameters for default prop values (`defaultProps` is deprecated in React 18.3+).

### Component File Order

1. Imports
2. Type/interface definitions
3. Component definition with JSDoc
4. Hooks (useState, useEffect, custom hooks)
5. Event handlers (`handle*`)
6. Render
7. Export

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Components/Files | PascalCase | `BookCard.tsx` |
| Props | camelCase | `bookTitle`, `isLoading` |
| Event handlers | `handle*` | `handleClick`, `handleSubmit` |
| Hooks | `use*` | `useBooks`, `useAuth` |
| Boolean props | `is/has/should` | `isOpen`, `hasError` |
| Callback props | `on*` | `onClick`, `onSubmit` |

### Component Pattern

```tsx
import { useState } from 'react';
import { Box, Button } from '@mui/material';

interface BookCardProps {
  book: { id: string; title: string };
  onCheckout: (id: string) => Promise<void>;
}

/** BookCard displays book information. */
function BookCard({ book, onCheckout }: BookCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);
    await onCheckout(book.id);
    setIsLoading(false);
  };

  return (
    <Box sx={{ p: 2 }}>
      <h3>{book.title}</h3>
      <Button onClick={handleCheckout} disabled={isLoading}>
        Checkout
      </Button>
    </Box>
  );
}

export default BookCard;
```

### Best Practices

**Do:** functional components only; small and focused; extract complex logic into custom hooks; compose, don't inherit; memoize expensive calculations with `useMemo`; memoize callbacks with `useCallback` when passed to children; use barrel exports; write tests for every component; validate parsed IDs in form submit handlers; verify routes exist in `router.tsx` before adding `<Link>` or `navigate()` calls.

**Don't:** class components; deeply nested component trees (>3 levels); business logic in components; data fetching inside components (use hooks); inline styles; mixing presentation and data logic; hardcoded API URLs.

---

## React Hooks

**Hook rules (required by React):**
1. Only call hooks at the top level — never inside loops, conditions, or nested functions.
2. Only call hooks from React functions (components or custom hooks).
3. Custom hooks must start with `use`.

**Guidelines:**
- Prefer multiple `useState` calls over one complex object.
- Include all dependencies in `useEffect` arrays (ESLint enforces).
- Wrap Context consumers in custom hooks with error checking.

```tsx
// hooks/useBooks.ts
import { useQuery } from '@tanstack/react-query';
import bookService from '../services/bookService';

export function useBooks(filters: BookFilters = {}) {
  return useQuery({
    queryKey: ['books', filters],
    queryFn: () => bookService.getAll(filters),
  });
}
```

---

## State Management

| Layer | Use for |
|---|---|
| `useState` | Form inputs, UI toggles, component-local state |
| Context API | Theme, auth, user preferences, global UI state |
| React Query | All server state, API data, caching, mutations |

### React Query Cache Invalidation

When a mutation succeeds, **invalidate every query key that displays affected data**. Use prefix matching to cover child keys automatically. This is enforced as a craftsmanship rule — stale cache is a recurring bug source.

```tsx
export function useCheckoutBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => checkoutService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkouts'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
}
```

---

## API Integration

**Service layer pattern:**
- Create a base Axios instance (`services/api.ts`) with interceptors for auth.
- One service file per resource. Services return promises and are consumed by hooks.
- Components never call APIs directly.
- Clients MUST NOT fall back to a raw payload if `data` is missing on an `ApiResponse` envelope. `response.data || response` is forbidden (enforced by ESLint).

```ts
// services/api.ts
import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

// services/bookService.ts
import api from './api';

const bookService = {
  getAll: (filters) => api.get('/books', { params: filters }).then((r) => r.data),
  getById: (id: string) => api.get(`/books/${id}`).then((r) => r.data),
  create: (data) => api.post('/books', data).then((r) => r.data),
};

export default bookService;
```

---

## Styling — Material UI

- `sx` prop for one-off styles.
- `styled()` API for reusable styled components.
- **Always use theme tokens** — no inline `style` objects, no inline color/spacing/typography literals.
- Spacing: `theme.spacing(1)` = 8px grid.
- Colors: `primary.main`, `error.light`, `grey[100]`.
- Breakpoints: `theme.breakpoints.up('md')`, responsive `xs/sm/md/lg/xl`.

```tsx
<Box sx={{
  p: 2,
  bgcolor: 'primary.main',
  '&:hover': { bgcolor: 'primary.dark' },
}}>

const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  '&:hover': { backgroundColor: theme.palette.grey[100] },
}));
```

---

## Testing

**Philosophy:** Test user behavior, not implementation. Use accessible queries. Mock external dependencies. Cover loading, error, and empty states.

**Query priority:** `getByRole` → `getByLabelText` → `getByPlaceholderText` → `getByText` → `getByTestId` (last resort).

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BookCard from './BookCard';

describe('BookCard', () => {
  it('calls onCheckout when button clicked', async () => {
    const user = userEvent.setup();
    const mockCheckout = vi.fn();
    render(<BookCard book={{ id: '1', title: 'Test' }} onCheckout={mockCheckout} />);
    await user.click(screen.getByRole('button', { name: /checkout/i }));
    expect(mockCheckout).toHaveBeenCalledWith('1');
  });
});
```

When extracting a component to its own file, migrate its applicable tests with it. Do not silently drop coverage.

---

## Routing — React Router v7

```tsx
// router.tsx
import { createBrowserRouter } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'books/:id', element: <BookDetailPage /> },
    ],
  },
]);
```

- `<Link>` for navigation, `useNavigate()` for programmatic navigation.
- `useParams()` for path params, `useSearchParams()` for query strings.
- Nested routes for shared layouts.

---

## Accessibility (WCAG 2.1 AA)

- Keyboard navigation for all interactive elements.
- Color contrast ≥ 4.5:1 for text, ≥ 3:1 for UI components.
- Alt text for all images.
- Labels for all form inputs.
- ARIA only when semantic HTML is insufficient.
- Visible focus indicators.
- Use semantic HTML: `<button>`, `<nav>`, `<main>`, `<article>`.

```tsx
// Good
<button onClick={handleClick}>Click me</button>
<img src="book.jpg" alt="Cover of Clean Code" />
<TextField label="Book Title" required />

// Bad
<div onClick={handleClick}>Click me</div>
<img src="book.jpg" />
<input placeholder="Enter title" />
```

---

## Performance

- Lazy load routes with `React.lazy()` + `<Suspense>`.
- Memoize expensive components with `React.memo()`.
- Memoize expensive calculations with `useMemo`, callbacks with `useCallback`.
- Virtualize long lists (react-window, react-virtuoso).
- Use the React DevTools Profiler to find real bottlenecks before optimizing.

```tsx
const BookDetailPage = lazy(() => import('./pages/BookDetailPage'));

<Suspense fallback={<CircularProgress />}>
  <BookDetailPage />
</Suspense>

const sortedBooks = useMemo(
  () => books.sort((a, b) => a.title.localeCompare(b.title)),
  [books],
);
```

---

## Error Handling

- Use Error Boundaries for component-level errors.
- Centralized error handling in API interceptors.
- Display user-friendly error messages — never raw stack traces.

---

## Code Quality Checklist

Before commit:

- [ ] ESLint passes (no warnings)
- [ ] Prettier formatted
- [ ] Props typed via TypeScript interface
- [ ] Tests written and passing
- [ ] No `console.log`
- [ ] Accessibility requirements met
- [ ] Responsive design verified
- [ ] Loading and error states handled
- [ ] No hardcoded URLs (use env vars)
- [ ] React Query mutations invalidate affected query keys

Use Conventional Commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`.
