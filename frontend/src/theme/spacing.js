/**
 * Material Design 3 Spacing System
 *
 * This file defines consistent spacing tokens based on an 8px grid system.
 * Material Design 3 uses an 8px base unit for harmonious spacing throughout
 * the interface. This creates visual rhythm and makes layouts feel balanced.
 *
 * Spacing Usage Guidelines:
 *
 * SPACING FUNCTION:
 * - spacing(1) = 8px   - Minimal spacing, tight padding
 * - spacing(2) = 16px  - Standard component padding
 * - spacing(3) = 24px  - Section padding, card spacing
 * - spacing(4) = 32px  - Large section gaps
 * - spacing(5) = 40px  - Major layout spacing
 * - spacing(6) = 48px  - Hero section padding
 *
 * SPACING SCALE ARRAY:
 * Direct pixel values for use in situations where the function isn't available.
 * Values: 0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48
 *
 * Common Patterns:
 * - Component internal padding: spacing(2) = 16px
 * - Between related components: spacing(3) = 24px
 * - Between sections: spacing(4-6) = 32-48px
 * - Inline spacing (gaps): 4px or 8px from spacingScale
 *
 * Grid System:
 * - Base unit: 8px (optimal for most screen densities)
 * - Sub-base: 4px (for fine-tuning alignment)
 * - Maximum: 48px (larger spacing handled by layout)
 *
 * @see https://m3.material.io/foundations/layout/applying-layout/spacing
 */

/**
 * Spacing function that multiplies by 8px base unit
 *
 * @param {number} factor - Multiplier for the 8px base (e.g., 2 = 16px)
 * @returns {number} Spacing value in pixels
 *
 * @example
 * // Using in Material UI sx prop
 * <Box sx={{ p: spacing(2) }}> // 16px padding
 * <Box sx={{ mb: spacing(3) }}> // 24px margin bottom
 *
 * @example
 * // Using in styled components
 * const StyledDiv = styled('div')(({ theme }) => ({
 *   padding: theme.spacing(2), // 16px
 *   marginBottom: theme.spacing(4), // 32px
 * }));
 */
export const spacing = (factor) => factor * 8;

/**
 * Spacing scale array with all available spacing values
 * Values align with 4px/8px grid system for consistent spacing
 *
 * Scale: 0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48
 *
 * Use cases:
 * - 0px: No spacing
 * - 4px: Minimal spacing, inline gaps
 * - 8px: Small padding, tight layouts
 * - 12px: Between small related elements
 * - 16px: Standard component padding
 * - 20px: Between medium elements
 * - 24px: Section spacing, card padding
 * - 28px: Large component spacing
 * - 32px: Major section gaps
 * - 36px: Extra large spacing
 * - 40px: Hero section padding
 * - 44px: Maximum standard spacing
 * - 48px: Maximum grid spacing
 *
 * @example
 * // Direct access for specific values
 * const smallGap = spacingScale[1]; // 4px
 * const standardPadding = spacingScale[4]; // 16px
 * const sectionGap = spacingScale[6]; // 24px
 */
export const spacingScale = [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48];

export default spacing;
