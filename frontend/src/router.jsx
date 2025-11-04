import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import BooksPage from './pages/BooksPage';
import TypographyTestPage from './pages/TypographyTestPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <BooksPage /> },
      { path: 'typography-test', element: <TypographyTestPage /> },
    ],
  },
]);

export default router;
