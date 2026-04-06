import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import BooksPage from './pages/BooksPage';
import CheckoutsPage from './pages/CheckoutsPage';
import PatronDetailPage from './pages/PatronDetailPage';
import PatronListPage from './pages/PatronListPage';
import LoginPage from './pages/LoginPage';
import WishlistPage from './pages/WishlistPage';
import MyWaitlistPage from './pages/MyWaitlistPage';
import TypographyTestPage from './pages/TypographyTestPage';
import { ROLES } from './utils/roles';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <BooksPage /> },
      { path: 'typography-test', element: <TypographyTestPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'wishlist', element: <WishlistPage /> },
          { path: 'my-waitlist', element: <MyWaitlistPage /> },
        ],
      },
      {
        element: <ProtectedRoute requiredRole={ROLES.LIBRARIAN} />,
        children: [{ path: 'checkouts', element: <CheckoutsPage /> }],
      },
      {
        element: <ProtectedRoute requiredRole={ROLES.ADMIN} />,
        children: [
          { path: 'patrons', element: <PatronListPage /> },
          { path: 'patrons/:id', element: <PatronDetailPage /> },
        ],
      },
    ],
  },
]);

export default router;
