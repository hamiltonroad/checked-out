# Frontend Quick Reference

React 18 + Vite + Material UI + React Query

---

## Project Structure

```
src/
├── components/    # Reusable UI (BookCard/, Layout/)
├── pages/         # Route-level components
├── hooks/         # Custom hooks (useBooks, useAuth)
├── context/       # React Context (auth, theme)
├── services/      # API integration (bookService.js)
├── utils/         # Pure utility functions
└── theme/         # MUI theme config
```

---

## Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Components/Files | PascalCase | `BookCard.jsx` |
| Props | camelCase | `bookTitle` |
| Event handlers | handle* | `handleClick` |
| Hooks | use* | `useBooks` |
| Booleans | is/has/should | `isOpen` |
| Callbacks | on* | `onClick` |

---

## Component Pattern

```jsx
import { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Button } from '@mui/material';

/**
 * BookCard displays book information
 */
function BookCard({ book, onCheckout }) {
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

BookCard.propTypes = {
  book: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
  onCheckout: PropTypes.func.isRequired,
};

export default BookCard;
```

### Zero-Prop PropTypes

All components must declare PropTypes — even those that accept no props. Use an empty object:

```jsx
const StatusBar = () => {
  return <Box sx={{ p: 1 }}>Ready</Box>;
};

StatusBar.propTypes = {};

export default StatusBar;
```

---

## State Management

**Local State:** Form inputs, UI toggles
```jsx
const [isOpen, setIsOpen] = useState(false);
```

**Context:** Auth, theme, preferences
```jsx
const { user, login, logout } = useAuth();
```

**React Query:** Server data
```jsx
const { data, isLoading, error } = useQuery({
  queryKey: ['books'],
  queryFn: bookService.getAll,
});
```

---

## Custom Hooks

```jsx
// hooks/useBooks.js
import { useQuery } from '@tanstack/react-query';
import bookService from '../services/bookService';

export function useBooks(filters = {}) {
  return useQuery({
    queryKey: ['books', filters],
    queryFn: () => bookService.getAll(filters),
  });
}

// Usage in component
const { data: books, isLoading, error } = useBooks({ genre: 'Fiction' });
```

---

## React Query Cache Invalidation

When a mutation succeeds, **invalidate all query keys that display affected data**. Use React Query prefix matching to cover all child keys automatically.

```jsx
// hooks/useCheckoutBook.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import checkoutService from '../services/checkoutService';

export function useCheckoutBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => checkoutService.create(data),
    onSuccess: () => {
      // Prefix match: invalidates ['checkouts'], ['checkouts', id], etc.
      queryClient.invalidateQueries({ queryKey: ['checkouts'] });
      // Also invalidate related data that changed
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
}
```

**Rule:** Every mutation hook MUST invalidate all query keys displaying affected data. Stale cache is a recurring bug source.

---

## API Service Layer

```javascript
// services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

// services/bookService.js
import api from './api';

const bookService = {
  getAll: (filters) => api.get('/books', { params: filters }).then(res => res.data),
  getById: (id) => api.get(`/books/${id}`).then(res => res.data),
  create: (data) => api.post('/books', data).then(res => res.data),
};

export default bookService;
```

---

## Material UI Styling

```jsx
// sx prop for one-off styles
<Box sx={{
  p: 2,
  bgcolor: 'primary.main',
  '&:hover': { bgcolor: 'primary.dark' }
}}>

// styled() for reusable components
import { styled } from '@mui/material/styles';
import { Card } from '@mui/material';

const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  '&:hover': {
    backgroundColor: theme.palette.grey[100],
  },
}));
```

**Always use theme values:**
- Spacing: `theme.spacing(1)` = 8px
- Colors: `primary.main`, `error.light`, `grey[100]`
- Breakpoints: `theme.breakpoints.up('md')`

---

## Testing

```jsx
// BookCard.test.jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BookCard from './BookCard';

describe('BookCard', () => {
  it('calls onCheckout when button clicked', async () => {
    const user = userEvent.setup();
    const mockCheckout = vi.fn();
    const book = { id: '1', title: 'Test Book' };

    render(<BookCard book={book} onCheckout={mockCheckout} />);

    await user.click(screen.getByRole('button', { name: /checkout/i }));

    expect(mockCheckout).toHaveBeenCalledWith('1');
  });
});
```

**Query priority:** `getByRole` > `getByLabelText` > `getByText` > `getByTestId`

---

## Routing (React Router v7)

```jsx
// router.jsx
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

// In component
import { Link, useNavigate, useParams } from 'react-router-dom';

const { id } = useParams();
const navigate = useNavigate();
```

---

## Performance

```jsx
// Lazy load routes
const BookDetailPage = lazy(() => import('./pages/BookDetailPage'));

<Suspense fallback={<CircularProgress />}>
  <BookDetailPage />
</Suspense>

// Memoize expensive components
const MemoizedBookList = memo(BookList);

// Memoize expensive calculations
const sortedBooks = useMemo(() =>
  books.sort((a, b) => a.title.localeCompare(b.title)),
  [books]
);

// Memoize callbacks
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

---

## Accessibility

- **Keyboard nav:** All interactive elements accessible via keyboard
- **Color contrast:** 4.5:1 for text, 3:1 for UI
- **Alt text:** All images
- **Labels:** All form inputs
- **Semantic HTML:** `<button>`, `<nav>`, `<main>`, `<article>`

```jsx
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

## Best Practices

### DO ✅
- **Functional components** with hooks only
- **PropTypes** for all props
- **Extract logic** into custom hooks
- **Service layer** for all API calls
- **Error boundaries** for error handling
- **Memoize** expensive calculations and callbacks
- **Accessibility** - keyboard nav, ARIA, semantic HTML
- **Test** user behavior, not implementation
- **Validate parsed IDs** in form submit handlers before passing to API calls (guard against undefined)
- **Extract formatting functions** (dates, currency, names) to `utils/` when used in 2+ components

### DON'T ❌
- Use class components
- Fetch data directly in components
- Hardcode API URLs (use env vars)
- Ignore PropTypes warnings
- Leave `console.log` statements
- Nest components deeply (>3 levels)
- Mix presentation and business logic
- Use inline styles (use `sx` or `styled()`)
- Add `<Link>` or `navigate()` to routes that don't exist in `router.jsx` — verify first

---

## Quick Checklist

Before commit:
- [ ] ESLint passes
- [ ] Prettier formatted
- [ ] PropTypes defined
- [ ] Tests passing
- [ ] No console.log
- [ ] Accessible
- [ ] Responsive
- [ ] Loading/error states handled
