import { createTheme } from '@mui/material/styles';
import lightPalette from './palette.js';
import typography from './typography.js';
import spacing from './spacing.js';
import motion from './motion.js';

const theme = createTheme({
  palette: lightPalette,
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
});

export default theme;
