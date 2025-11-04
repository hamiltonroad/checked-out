import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import BooksPage from './pages/BooksPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [{ index: true, element: <BooksPage /> }],
  },
]);

export default router;
