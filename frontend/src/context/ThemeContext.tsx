/**
 * Theme Context Provider
 *
 * Provides theme mode management (light/dark) with localStorage persistence
 * and system preference detection.
 */

import { createContext, useState, useMemo, useContext, useCallback } from 'react';
import type { ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { getTheme } from '../theme/theme';

type ThemeMode = 'light' | 'dark';

interface ThemeContextValue {
  mode: ThemeMode;
  toggleMode: () => void;
}

interface ThemeProviderProps {
  children: ReactNode;
}

// Create context for theme mode state
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * ThemeProvider component that manages theme mode state and wraps the app
 * with Material UI ThemeProvider
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  // Initialize mode from localStorage or system preference
  const [mode, setMode] = useState<ThemeMode>(() => {
    // Check localStorage first
    const savedMode = localStorage.getItem('themeMode');
    if (savedMode === 'light' || savedMode === 'dark') {
      return savedMode;
    }

    // Fall back to system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    // Default to light mode
    return 'light';
  });

  /**
   * Toggle between light and dark mode
   * Persists the new mode to localStorage
   * Memoized to prevent unnecessary re-renders of consuming components
   */
  const toggleMode = useCallback(() => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', newMode);
      return newMode;
    });
  }, []);

  // Generate theme object based on current mode
  // Memoized to prevent unnecessary recalculations
  const theme = useMemo(() => getTheme(mode), [mode]);

  // Provide mode and toggleMode to consuming components
  // Memoized to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({ mode, toggleMode }), [mode, toggleMode]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

/**
 * Custom hook to access theme mode context
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useThemeMode = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeProvider');
  }

  return context;
};
