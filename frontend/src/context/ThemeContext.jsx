/**
 * Theme Context Provider
 *
 * Provides theme mode management (light/dark) with localStorage persistence
 * and system preference detection.
 *
 * Features:
 * - Light/dark mode toggle
 * - Persistent mode preference in localStorage
 * - System preference detection (prefers-color-scheme)
 * - Automatic Material UI theme integration
 *
 * Usage:
 * ```jsx
 * import { ThemeProvider, useThemeMode } from './context/ThemeContext';
 *
 * // Wrap app with provider
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 *
 * // Use in components
 * const { mode, toggleMode } = useThemeMode();
 * ```
 */

import { createContext, useState, useMemo, useContext } from 'react';
import PropTypes from 'prop-types';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { getTheme } from '../theme/theme';

// Create context for theme mode state
const ThemeContext = createContext();

/**
 * ThemeProvider component that manages theme mode state and wraps the app
 * with Material UI ThemeProvider
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to wrap
 */
export function ThemeProvider({ children }) {
  // Initialize mode from localStorage or system preference
  const [mode, setMode] = useState(() => {
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
   */
  const toggleMode = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', newMode);
      return newMode;
    });
  };

  // Generate theme object based on current mode
  // Memoized to prevent unnecessary recalculations
  const theme = useMemo(() => getTheme(mode), [mode]);

  // Provide mode and toggleMode to consuming components
  const contextValue = useMemo(() => ({ mode, toggleMode }), [mode]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Custom hook to access theme mode context
 *
 * @returns {Object} Theme context value
 * @returns {('light'|'dark')} return.mode - Current theme mode
 * @returns {Function} return.toggleMode - Function to toggle theme mode
 *
 * @throws {Error} If used outside of ThemeProvider
 *
 * @example
 * const { mode, toggleMode } = useThemeMode();
 * <Button onClick={toggleMode}>
 *   Current mode: {mode}
 * </Button>
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useThemeMode = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeProvider');
  }

  return context;
};
