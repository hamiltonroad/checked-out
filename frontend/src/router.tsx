import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import BooksPage from './pages/BooksPage';
import CheckoutsPage from './pages/CheckoutsPage';
import PatronDetailPage from './pages/PatronDetailPage';
import LoginPage from './pages/LoginPage';
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
          { path: 'patrons/:id', element: <PatronDetailPage /> },
        ],
      },
    ],
  },
]);

export default router;
