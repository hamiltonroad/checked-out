/**
 * Material Design 3 Component Overrides - Focus Indicators & Touch Targets
 *
 * This file defines global focus indicators and touch target optimizations for all
 * interactive Material UI components following Material Design 3 accessibility
 * guidelines and WCAG 2.1 AA standards.
 *
 * Focus Indicator System:
 * - Uses :focus-visible pseudo-class (keyboard navigation only, not mouse clicks)
 * - Primary color outline for consistency with brand (adapts to light/dark mode)
 * - 3px solid outline for buttons/icon buttons (prominent visibility)
 * - 2px solid outline for table rows (less intrusive in dense layouts)
 * - 2px positive offset for buttons (creates space between element and indicator)
 * - 2px negative offset for table rows (keeps indicator within row bounds)
 * - Smooth transitions with motion tokens (respects prefers-reduced-motion)
 *
 * Touch Target Optimization (Mobile UX):
 * - MuiButton: 48px minimum height, 16px horizontal padding
 * - MuiIconButton: 48x48px base size, 56x56px on touch devices (@media pointer: coarse)
 * - Meets WCAG 2.1 AA requirement of 44x44px minimum touch targets
 * - Improves tap accuracy and reduces misclicks on mobile devices
 *
 * Components Covered:
 * - MuiButton, MuiIconButton (3px outline + touch targets)
 * - MuiTableRow (2px outline, inside bounds)
 * - MuiOutlinedInput (powers TextField and Select)
 * - MuiMenuItem (dropdown navigation)
 * - MuiChip (filter chips)
 * - MuiDialog (modal focus)
 *
 * Not Yet Needed (verified 2025-11-04):
 * - MuiLink - No Link components in current codebase
 * - MuiListItem - No clickable ListItems in current codebase
 * (Add these overrides if/when these components are used for navigation)
 *
 * WCAG 2.1 AA Compliance:
 * - Focus indicators have 3:1 minimum contrast ratio with adjacent colors
 * - Primary color provides sufficient contrast in both light and dark modes
 * - Focus-visible ensures keyboard users can always see focused element
 * - Touch targets meet 44x44px minimum size requirement
 *
 * Usage:
 * This file is automatically applied to all MUI components via theme integration.
 * No per-component imports needed - focus indicators work globally.
 *
 * @see https://m3.material.io/foundations/interaction/states/state-layers
 * @see https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html
 */

/**
 * Creates component style overrides for focus indicators
 *
 * @returns {Object} MUI component overrides with focus-visible styles
 *
 * @example
 * // Automatically applied via theme
 * import { components } from './components';
 * const theme = createTheme({ components });
 *
 * @example
 * // Testing focus indicators
 * // 1. Press Tab to navigate through interactive elements
 * // 2. Verify 3px primary-colored outline appears around focused element
 * // 3. Click element with mouse - verify NO outline appears
 * // 4. Press Shift+Tab to navigate backwards
 */
export const components = {
  /**
   * Button focus indicators and touch targets
   * - 3px solid outline for high visibility (focus)
   * - 2px offset creates space between button and outline (focus)
   * - 48px minimum height for adequate touch targets (WCAG 2.1 AA)
   * - 16px horizontal padding for comfortable clickable area
   * - Smooth transition for polished appearance
   * - Works with all button variants (contained, outlined, text)
   */
  MuiButton: {
    styleOverrides: {
      root: ({ theme }) => ({
        // Touch target optimization - WCAG 2.1 AA requires minimum 44x44px
        minHeight: 48,
        paddingLeft: 16,
        paddingRight: 16,
        // Only show focus on keyboard navigation, not mouse clicks
        '&:focus-visible': {
          outline: `3px solid ${theme.palette.primary.main}`,
          outlineOffset: '2px',
          // Smooth transition for focus appearance
          transition: `outline ${theme.motion.duration.short3}ms ${theme.motion.easing.standard}`,
        },
        // Respect user's motion preferences
        '@media (prefers-reduced-motion: reduce)': {
          '&:focus-visible': {
            transition: 'none',
          },
        },
      }),
    },
  },

  /**
   * IconButton focus indicators and touch targets
   * - Same styling as regular buttons for consistency
   * - 3px solid outline, 2px offset (focus)
   * - 48px minimum width/height for adequate touch targets (WCAG 2.1 AA)
   * - 56px on touch devices for easier tapping (pointer: coarse)
   * - Essential for buttons without text labels (accessibility critical)
   */
  MuiIconButton: {
    styleOverrides: {
      root: ({ theme }) => ({
        // Touch target optimization - WCAG 2.1 AA requires minimum 44x44px
        minWidth: 48,
        minHeight: 48,
        // Increase size on touch devices (phones, tablets) for better UX
        '@media (pointer: coarse)': {
          minWidth: 56,
          minHeight: 56,
        },
        '&:focus-visible': {
          outline: `3px solid ${theme.palette.primary.main}`,
          outlineOffset: '2px',
          transition: `outline ${theme.motion.duration.short3}ms ${theme.motion.easing.standard}`,
        },
        '@media (prefers-reduced-motion: reduce)': {
          '&:focus-visible': {
            transition: 'none',
          },
        },
      }),
    },
  },

  /**
   * TableRow focus indicators
   * - 2px solid outline (thinner for less visual weight in tables)
   * - Negative offset (-2px) keeps outline inside row bounds
   * - Enables keyboard navigation through table data
   * - Critical for accessible data tables
   */
  MuiTableRow: {
    styleOverrides: {
      root: ({ theme }) => ({
        '&:focus-visible': {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: '-2px', // Negative offset keeps outline inside row
          transition: `outline ${theme.motion.duration.short3}ms ${theme.motion.easing.standard}`,
        },
        '@media (prefers-reduced-motion: reduce)': {
          '&:focus-visible': {
            transition: 'none',
          },
        },
      }),
    },
  },

  /**
   * TextField focus indicators
   * - Applied to OutlinedInput root (base for TextField and Select)
   * - 3px solid outline for consistency with buttons
   * - 2px positive offset creates space from input border
   * - Works automatically for TextField and Select components
   */
  MuiOutlinedInput: {
    styleOverrides: {
      root: ({ theme }) => ({
        '&:focus-visible': {
          outline: `3px solid ${theme.palette.primary.main}`,
          outlineOffset: '2px',
          transition: `outline ${theme.motion.duration.short3}ms ${theme.motion.easing.standard}`,
        },
        '@media (prefers-reduced-motion: reduce)': {
          '&:focus-visible': {
            transition: 'none',
          },
        },
      }),
    },
  },

  /**
   * MenuItem focus indicators
   * - Appears when navigating dropdown menus with keyboard (Arrow Up/Down)
   * - 2px solid outline with negative offset for compact appearance
   * - Essential for Select component accessibility
   * - Helps users see which option is currently focused
   */
  MuiMenuItem: {
    styleOverrides: {
      root: ({ theme }) => ({
        '&:focus-visible': {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: '-2px', // Keeps outline inside menu item bounds
          transition: `outline ${theme.motion.duration.short3}ms ${theme.motion.easing.standard}`,
        },
        '@media (prefers-reduced-motion: reduce)': {
          '&:focus-visible': {
            transition: 'none',
          },
        },
      }),
    },
  },

  /**
   * Chip focus indicators
   * - For filter chips and deletable tags
   * - 2px solid outline with positive offset
   * - Enables keyboard navigation through chip groups
   * - Delete button inherits IconButton focus styles
   */
  MuiChip: {
    styleOverrides: {
      root: ({ theme }) => ({
        '&:focus-visible': {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: '2px',
          transition: `outline ${theme.motion.duration.short3}ms ${theme.motion.easing.standard}`,
        },
        '@media (prefers-reduced-motion: reduce)': {
          '&:focus-visible': {
            transition: 'none',
          },
        },
      }),
    },
  },

  /**
   * Dialog focus indicators
   * - Ensures dialog itself can receive focus for screen readers
   * - 2px outline with negative offset to stay within dialog bounds
   * - Particularly important when dialog opens (focus moves to dialog)
   * - Part of proper focus trap implementation
   */
  MuiDialog: {
    styleOverrides: {
      root: ({ theme }) => ({
        '& .MuiDialog-paper:focus-visible': {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: '-2px',
          transition: `outline ${theme.motion.duration.short3}ms ${theme.motion.easing.standard}`,
        },
        '@media (prefers-reduced-motion: reduce)': {
          '& .MuiDialog-paper:focus-visible': {
            transition: 'none',
          },
        },
      }),
    },
  },
};

export default components;
