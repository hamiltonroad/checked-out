import { Navigate, Outlet, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../../hooks/useAuth';
import { hasMinimumRole } from '../../utils/roles';
import AuthLoadingScreen from '../AuthLoadingScreen';
import type { PatronRole } from '../../types';

interface ProtectedRouteProps {
  requiredRole?: PatronRole;
}

/**
 * ProtectedRoute — route guard that redirects unauthenticated users to /login.
 *
 * While auth status is being determined, displays AuthLoadingScreen.
 * When authenticated, renders child routes via Outlet.
 * When unauthenticated, redirects to /login with the original path stored
 * in location state for post-login redirect.
 *
 * When `requiredRole` is specified, additionally checks that the patron's
 * role meets the minimum level. Insufficient role redirects to home (`/`).
 */
function ProtectedRoute({ requiredRole }: ProtectedRouteProps = {}) {
  const { isAuthenticated, loading, patron } = useAuth();
  const location = useLocation();

  if (loading) {
    return <AuthLoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ redirectTo: location.pathname }} replace />;
  }

  if (requiredRole && !hasMinimumRole(patron?.role, requiredRole)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

ProtectedRoute.propTypes = {
  requiredRole: PropTypes.oneOf(['patron', 'librarian', 'admin']),
};

export default ProtectedRoute;
