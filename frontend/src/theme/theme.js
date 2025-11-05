/**
 * Material Design 3 Theme System
 *
 * This file integrates all Material Design 3 design tokens (palette, typography,
 * spacing, motion) into a cohesive theme object that supports both light and dark modes.
 *
 * Theme Structure:
 * - palette: Material Design 3 color system (light/dark mode)
 * - typography: Complete MD3 type scale with responsive sizing
 * - spacing: 8px grid system with spacing function and scale
 * - motion: Animation durations and easing curves
 * - components: Component style overrides (reserved for future use)
 *
 * Usage:
 * ```jsx
 * // Default light theme
 * import theme from './theme/theme';
 * <ThemeProvider theme={theme}>
 *
 * // Dynamic theme with mode switching
 * import { getTheme } from './theme/theme';
 * const theme = getTheme('dark');
 * <ThemeProvider theme={theme}>
 * ```
 *
 * @see https://m3.material.io/
 * @see https://mui.com/material-ui/customization/theming/
 */

import { createTheme } from '@mui/material/styles';
import { lightPalette, darkPalette } from './palette.js';
import typography from './typography.js';
import spacing from './spacing.js';
import motion from './motion.js';
import { components } from './components.js';

/**
 * Creates a theme object with all Material Design 3 tokens integrated
 *
 * @param {('light'|'dark')} mode - Theme mode (defaults to 'light')
 * @returns {Object} Material UI theme object with MD3 tokens
 *
 * @example
 * // Create light theme
 * const lightTheme = getTheme('light');
 *
 * @example
 * // Create dark theme
 * const darkTheme = getTheme('dark');
 *
 * @example
 * // Dynamic theme based on user preference
 * const theme = getTheme(userPreference);
 */
export const getTheme = (mode = 'light') => {
  // Select palette based on mode
  const palette = mode === 'dark' ? darkPalette : lightPalette;

  return createTheme({
    // Material Design 3 color palette
    palette,

    // Material Design 3 typography scale
    typography,

    // Material UI spacing function (8px base unit)
    // Can be used as theme.spacing(2) for 16px
    spacing: 8,

    // Custom spacing utilities (imported from spacing.js)
    // Provides spacingScale array for direct pixel values
    customSpacing: {
      spacing,
    },

    // Motion tokens for animations (imported from motion.js)
    // Provides duration and easing tokens for consistent animations
    motion,

    // Component style overrides
    // Global focus indicators, touch targets, and component customizations
    // following Material Design 3 specifications and WCAG 2.1 AA accessibility
    components,
  });
};

// Default theme (light mode) for backward compatibility
// This ensures existing imports continue to work without changes
const theme = getTheme('light');

export default theme;
