/**
 * Material Design 3 Typography System
 *
 * This file defines the complete typography system for the application following
 * Material Design 3 guidelines. The type scale includes 15 distinct roles organized
 * into five categories: Display, Headline, Title, Body, and Label.
 *
 * Typography Usage Guidelines:
 *
 * DISPLAY (Large, expressive text for hero sections)
 * - displayLarge: Hero headlines, major marketing messages (57px)
 * - displayMedium: Large section headers, landing pages (45px)
 * - displaySmall: Prominent page titles, feature callouts (36px)
 *
 * HEADLINE (High-emphasis text for important content)
 * - headlineLarge: Main page headings, dialog titles (32px)
 * - headlineMedium: Section headings, card titles (28px)
 * - headlineSmall: Subsection headings, list headers (24px)
 *
 * TITLE (Medium-emphasis text for structure)
 * - titleLarge: Toolbar titles, tab labels (22px)
 * - titleMedium: List item titles, card subtitles (16px, medium weight)
 * - titleSmall: Overlines, dense list items (14px, medium weight)
 *
 * BODY (Default text for reading)
 * - bodyLarge: Longer form content, article text (16px)
 * - bodyMedium: Default body text, descriptions (14px)
 * - bodySmall: Captions, helper text, metadata (12px)
 *
 * LABEL (Text on components)
 * - labelLarge: Prominent buttons, tabs (14px, medium weight)
 * - labelMedium: Standard buttons, chips (12px, medium weight)
 * - labelSmall: Small buttons, dense chips (11px, medium weight)
 *
 * Font Weight Guide:
 * - 400 (Regular): Body text, headlines, display text
 * - 500 (Medium): Titles, labels, emphasized text
 *
 * Responsive Scaling:
 * - Display and Headline types scale down on mobile devices
 * - Body and Label types remain consistent across breakpoints
 * - Line heights are unitless for proper scaling
 *
 * MUI Variant Mapping:
 * - h1 → displayLarge
 * - h2 → displayMedium
 * - h3 → displaySmall
 * - h4 → headlineLarge
 * - h5 → headlineMedium
 * - h6 → headlineSmall
 * - body1 → bodyLarge
 * - body2 → bodyMedium
 *
 * @see https://m3.material.io/styles/typography/overview
 */

/**
 * Font family stack
 * Primary: Roboto (Material Design standard)
 * Fallbacks: System fonts for performance and universal availability
 */
const fontFamily = '"Roboto", "Helvetica", "Arial", sans-serif';

/**
 * Material Design 3 Type Scale
 * All values follow MD3 specifications exactly
 * fontSize: pixels, lineHeight: unitless ratio, fontWeight: 400 or 500
 */
const typography = {
  fontFamily,

  // ============================================================================
  // DISPLAY - Large, expressive text for hero sections and major statements
  // Use sparingly for maximum impact
  // ============================================================================

  displayLarge: {
    fontFamily,
    fontSize: {
      xs: 40, // Mobile: scaled down for readability
      sm: 48, // Tablet: scaled down moderately
      md: 57, // Desktop: full MD3 spec size
    },
    lineHeight: 64 / 57, // 1.12
    fontWeight: 400, // MD3 spec: 400 (browsers display 400 as Regular)
    letterSpacing: '-0.25px',
  },

  displayMedium: {
    fontFamily,
    fontSize: {
      xs: 32, // Mobile: scaled down for readability
      sm: 38, // Tablet: scaled down moderately
      md: 45, // Desktop: full MD3 spec size
    },
    lineHeight: 52 / 45, // 1.16
    fontWeight: 400,
    letterSpacing: 0,
  },

  displaySmall: {
    fontFamily,
    fontSize: {
      xs: 28, // Mobile: scaled down for readability
      sm: 32, // Tablet: scaled down moderately
      md: 36, // Desktop: full MD3 spec size
    },
    lineHeight: 44 / 36, // 1.22
    fontWeight: 400,
    letterSpacing: 0,
  },

  // ============================================================================
  // HEADLINE - High-emphasis text for important content and structure
  // Use for page titles, major sections, dialog headers
  // ============================================================================

  headlineLarge: {
    fontFamily,
    fontSize: {
      xs: 26, // Mobile: scaled down for readability
      sm: 29, // Tablet: scaled down moderately
      md: 32, // Desktop: full MD3 spec size
    },
    lineHeight: 40 / 32, // 1.25
    fontWeight: 400,
    letterSpacing: 0,
  },

  headlineMedium: {
    fontFamily,
    fontSize: {
      xs: 24, // Mobile: scaled down for readability
      sm: 26, // Tablet: scaled down moderately
      md: 28, // Desktop: full MD3 spec size
    },
    lineHeight: 36 / 28, // 1.29
    fontWeight: 400,
    letterSpacing: 0,
  },

  headlineSmall: {
    fontFamily,
    fontSize: {
      xs: 21, // Mobile: scaled down for readability
      sm: 22, // Tablet: scaled down moderately
      md: 24, // Desktop: full MD3 spec size
    },
    lineHeight: 32 / 24, // 1.33
    fontWeight: 400,
    letterSpacing: 0,
  },

  // ============================================================================
  // TITLE - Medium-emphasis text for organizing content
  // Use for list items, card headers, secondary structure
  // ============================================================================

  titleLarge: {
    fontFamily,
    fontSize: 22,
    lineHeight: 30 / 22, // 1.36 (corrected from 28/22 to match MD3 spec)
    fontWeight: 400,
    letterSpacing: 0,
  },

  titleMedium: {
    fontFamily,
    fontSize: 16,
    lineHeight: 24 / 16, // 1.5
    fontWeight: 500,
    letterSpacing: '0.15px',
  },

  titleSmall: {
    fontFamily,
    fontSize: 14,
    lineHeight: 20 / 14, // 1.43
    fontWeight: 500,
    letterSpacing: '0.1px',
  },

  // ============================================================================
  // BODY - Default text for reading and content
  // Use for paragraphs, descriptions, article text
  // ============================================================================

  bodyLarge: {
    fontFamily,
    fontSize: 16,
    lineHeight: 24 / 16, // 1.5
    fontWeight: 400,
    letterSpacing: '0.5px',
  },

  bodyMedium: {
    fontFamily,
    fontSize: 14,
    lineHeight: 20 / 14, // 1.43
    fontWeight: 400,
    letterSpacing: '0.25px',
  },

  bodySmall: {
    fontFamily,
    fontSize: 12,
    lineHeight: 16 / 12, // 1.33
    fontWeight: 400,
    letterSpacing: '0.4px',
  },

  // ============================================================================
  // LABEL - Text on interactive components
  // Use for buttons, tabs, chips, and other UI elements
  // Medium weight (500) for better readability on components
  // ============================================================================

  labelLarge: {
    fontFamily,
    fontSize: 14,
    lineHeight: 20 / 14, // 1.43
    fontWeight: 500,
    letterSpacing: '0.1px',
  },

  labelMedium: {
    fontFamily,
    fontSize: 12,
    lineHeight: 16 / 12, // 1.33
    fontWeight: 500,
    letterSpacing: '0.5px',
  },

  labelSmall: {
    fontFamily,
    fontSize: 11,
    lineHeight: 16 / 11, // 1.45
    fontWeight: 500,
    letterSpacing: '0.5px',
  },

  // ============================================================================
  // MUI STANDARD VARIANTS - Backward compatibility with Material UI
  // These map MD3 type roles to familiar MUI variant names
  // Allows using both variant="h1" and sx={{ typography: 'displayLarge' }}
  // ============================================================================

  h1: {
    fontFamily,
    fontSize: {
      xs: 40, // Mobile: scaled down
      sm: 48, // Tablet: scaled down
      md: 57, // Desktop: full size
    },
    lineHeight: 64 / 57,
    fontWeight: 400,
    letterSpacing: '-0.25px',
  },

  h2: {
    fontFamily,
    fontSize: {
      xs: 32, // Mobile: scaled down
      sm: 38, // Tablet: scaled down
      md: 45, // Desktop: full size
    },
    lineHeight: 52 / 45,
    fontWeight: 400,
    letterSpacing: 0,
  },

  h3: {
    fontFamily,
    fontSize: {
      xs: 28, // Mobile: scaled down
      sm: 32, // Tablet: scaled down
      md: 36, // Desktop: full size
    },
    lineHeight: 44 / 36,
    fontWeight: 400,
    letterSpacing: 0,
  },

  h4: {
    fontFamily,
    fontSize: {
      xs: 26, // Mobile: scaled down
      sm: 29, // Tablet: scaled down
      md: 32, // Desktop: full size
    },
    lineHeight: 40 / 32,
    fontWeight: 400,
    letterSpacing: 0,
  },

  h5: {
    fontFamily,
    fontSize: {
      xs: 24, // Mobile: scaled down
      sm: 26, // Tablet: scaled down
      md: 28, // Desktop: full size
    },
    lineHeight: 36 / 28,
    fontWeight: 400,
    letterSpacing: 0,
  },

  h6: {
    fontFamily,
    fontSize: {
      xs: 21, // Mobile: scaled down
      sm: 22, // Tablet: scaled down
      md: 24, // Desktop: full size
    },
    lineHeight: 32 / 24,
    fontWeight: 400,
    letterSpacing: 0,
  },

  body1: {
    fontFamily,
    fontSize: {
      xs: 14, // Mobile: smaller for readability on small screens
      sm: 16, // Tablet+: full MD3 spec size
    },
    lineHeight: 24 / 16, // 1.5
    fontWeight: 400,
    letterSpacing: '0.5px',
  },

  body2: {
    fontFamily,
    fontSize: {
      xs: 12, // Mobile: smaller for readability on small screens
      sm: 14, // Tablet+: full MD3 spec size
    },
    lineHeight: 20 / 14, // 1.43
    fontWeight: 400,
    letterSpacing: '0.25px',
  },

  button: {
    fontFamily,
    fontSize: 14,
    lineHeight: 20 / 14,
    fontWeight: 500,
    letterSpacing: '0.1px',
    textTransform: 'none', // MD3 uses sentence case, not uppercase
  },

  caption: {
    fontFamily,
    fontSize: 12,
    lineHeight: 16 / 12,
    fontWeight: 400,
    letterSpacing: '0.4px',
  },

  overline: {
    fontFamily,
    fontSize: 11,
    lineHeight: 16 / 11,
    fontWeight: 500,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
};

export default typography;
