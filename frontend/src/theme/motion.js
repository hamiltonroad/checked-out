/**
 * Material Design 3 Motion System
 *
 * This file defines animation duration and easing tokens following Material Design 3
 * motion principles. Proper motion helps users understand relationships between elements,
 * provides feedback, and creates a polished, professional feel.
 *
 * Motion Usage Guidelines:
 *
 * DURATION TOKENS:
 *
 * Short (50-200ms) - Simple transitions
 * - short1 (50ms): Immediate feedback, tooltips
 * - short2 (100ms): Small component transitions, icon animations
 * - short3 (150ms): Standard transitions, hover states
 * - short4 (200ms): Component state changes
 *
 * Medium (250-400ms) - Standard animations
 * - medium1 (250ms): Standard entrance/exit animations
 * - medium2 (300ms): Card expansions, dialog appearances
 * - medium3 (350ms): Page transitions, drawer slides
 * - medium4 (400ms): Complex component animations
 *
 * Long (450-600ms) - Complex transitions
 * - long1 (450ms): Large content transitions
 * - long2 (500ms): Full-screen transitions
 * - long3 (550ms): Complex choreography
 * - long4 (600ms): Maximum recommended duration
 *
 * EASING TOKENS:
 *
 * - standard: cubic-bezier(0.2, 0, 0, 1)
 *   Most common easing, balanced feel
 *   Use for: Standard transitions, neutral motion
 *
 * - emphasized: cubic-bezier(0.2, 0, 0, 1)
 *   Emphasized motion with impact
 *   Use for: Important actions, focus changes
 *
 * - decelerated: cubic-bezier(0, 0, 0, 1)
 *   Starts fast, slows to rest
 *   Use for: Entering elements, appearing content
 *
 * - accelerated: cubic-bezier(0.3, 0, 1, 1)
 *   Starts slow, speeds up
 *   Use for: Exiting elements, disappearing content
 *
 * Best Practices:
 * - Keep animations under 400ms for most interactions
 * - Use decelerated for entrances (draws attention)
 * - Use accelerated for exits (quick removal)
 * - Use standard for neutral state changes
 * - Longer durations for larger elements
 * - Respect prefers-reduced-motion accessibility setting
 *
 * @see https://m3.material.io/styles/motion/overview
 * @see https://m3.material.io/styles/motion/easing-and-duration/tokens-specs
 */

/**
 * Motion token object containing duration and easing values
 *
 * @example
 * // Using duration in Material UI sx prop
 * <Box sx={{
 *   transition: `opacity ${motion.duration.medium2}ms ${motion.easing.standard}`
 * }}>
 *
 * @example
 * // Using in styled components
 * const StyledDiv = styled('div')(({ theme }) => ({
 *   transition: `all ${theme.motion.duration.short3}ms ${theme.motion.easing.emphasized}`,
 *   '&:hover': {
 *     transform: 'scale(1.05)',
 *   },
 * }));
 *
 * @example
 * // Respecting prefers-reduced-motion
 * const StyledDiv = styled('div')(({ theme }) => ({
 *   transition: `transform ${theme.motion.duration.medium1}ms ${theme.motion.easing.standard}`,
 *   '@media (prefers-reduced-motion: reduce)': {
 *     transition: 'none',
 *   },
 * }));
 */
export const motion = {
  /**
   * Duration tokens in milliseconds
   * Organized by speed: short (quick), medium (standard), long (complex)
   */
  duration: {
    // Short durations (50-200ms) - Quick feedback and simple transitions
    short1: 50, // Immediate feedback, tooltips appearing
    short2: 100, // Icon rotations, small UI changes
    short3: 150, // Hover states, focus indicators
    short4: 200, // Button presses, checkbox toggles

    // Medium durations (250-400ms) - Standard animations (most common)
    medium1: 250, // Fade in/out, standard transitions
    medium2: 300, // Card hover lifts, chip animations
    medium3: 350, // Snackbar slides, dialog fades
    medium4: 400, // Drawer slides, panel expansions

    // Long durations (450-600ms) - Complex or large animations
    long1: 450, // Full page transitions, large modal opens
    long2: 500, // Navigation drawer full slide
    long3: 550, // Complex multi-step animations
    long4: 600, // Maximum recommended duration for UI
  },

  /**
   * Easing tokens using cubic-bezier curves
   * Define the acceleration/deceleration of animations
   */
  easing: {
    /**
     * Standard easing - Balanced, neutral motion
     * Use for most transitions where no emphasis is needed
     */
    standard: 'cubic-bezier(0.2, 0, 0, 1)',

    /**
     * Emphasized easing - More pronounced motion with impact
     * Use for important state changes and focus movements
     */
    emphasized: 'cubic-bezier(0.2, 0, 0, 1)',

    /**
     * Decelerated easing - Fast start, slow end (ease-out)
     * Use for entering elements (appear quickly, settle gently)
     */
    decelerated: 'cubic-bezier(0, 0, 0, 1)',

    /**
     * Accelerated easing - Slow start, fast end (ease-in)
     * Use for exiting elements (leave quickly, minimal distraction)
     */
    accelerated: 'cubic-bezier(0.3, 0, 1, 1)',
  },
};

export default motion;
