import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import BooksPage from './pages/BooksPage';
import CheckoutsPage from './pages/CheckoutsPage';
import PatronDetailPage from './pages/PatronDetailPage';
import PatronListPage from './pages/PatronListPage';
import LoginPage from './pages/LoginPage';
import WishlistPage from './pages/WishlistPage';
import TypographyTestPage from './pages/TypographyTestPage';

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
          { path: 'checkouts', element: <CheckoutsPage /> },
          { path: 'wishlist', element: <WishlistPage /> },
          { path: 'patrons', element: <PatronListPage /> },
          { path: 'patrons/:id', element: <PatronDetailPage /> },
        ],
      },
    ],
  },
]);

export default router;
