import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import AuthLoadingScreen from '../AuthLoadingScreen';

/**
 * ProtectedRoute — route guard that redirects unauthenticated users to /login.
 *
 * While auth status is being determined, displays AuthLoadingScreen.
 * When authenticated, renders child routes via Outlet.
 * When unauthenticated, redirects to /login with the original path stored
 * in location state for post-login redirect.
 */
function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <AuthLoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ redirectTo: location.pathname }} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
