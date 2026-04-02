import { createContext, useState, useMemo, useCallback, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import authService from '../services/authService';

const AuthContext = createContext();

/**
 * AuthProvider — manages patron authentication state via JWT cookies.
 * On mount, attempts to fetch the current patron from /auth/me.
 * Exposes login, logout, and loading state to the component tree.
 */
export function AuthProvider({ children }) {
  const [patron, setPatron] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      try {
        const { data } = await authService.me();

        if (!cancelled) {
          setPatron(data);
        }
      } catch {
        if (!cancelled) {
          setPatron(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogin = useCallback(async (cardNumber, password) => {
    const { data } = await authService.login(cardNumber, password);
    setPatron(data);
    return data;
  }, []);

  const handleLogout = useCallback(async () => {
    await authService.logout();
    setPatron(null);
  }, []);

  const value = useMemo(
    () => ({
      patron,
      isAuthenticated: Boolean(patron),
      loading,
      login: handleLogin,
      logout: handleLogout,
    }),
    [patron, loading, handleLogin, handleLogout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Hook to consume auth context.
 * Must be used inside an AuthProvider.
 *
 * @returns {{ patron: Object|null, isAuthenticated: boolean, loading: boolean, login: Function, logout: Function }}
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
