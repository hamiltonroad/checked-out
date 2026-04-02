import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import BooksPage from './pages/BooksPage';
import CheckoutsPage from './pages/CheckoutsPage';
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
      { path: 'checkouts', element: <CheckoutsPage /> },
      { path: 'typography-test', element: <TypographyTestPage /> },
    ],
  },
]);

export default router;
