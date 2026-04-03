import { createContext, useState, useMemo, useCallback, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';
import authService from '../services/authService';
import type { Patron } from '../types';

interface AuthContextValue {
  patron: Patron | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (cardNumber: string, password: string) => Promise<Patron>;
  logout: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * AuthProvider — manages patron authentication state via JWT cookies.
 * On mount, attempts to fetch the current patron from /auth/me.
 * Exposes login, logout, and loading state to the component tree.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [patron, setPatron] = useState<Patron | null>(null);
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

  const handleLogin = useCallback(async (cardNumber: string, password: string) => {
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

/**
 * Hook to consume auth context.
 * Must be used inside an AuthProvider.
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
