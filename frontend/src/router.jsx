import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import BooksPage from './pages/BooksPage';
import CheckoutsPage from './pages/CheckoutsPage';
import TypographyTestPage from './pages/TypographyTestPage';

const router = createBrowserRouter([
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
