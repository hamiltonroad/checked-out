import { Box, Typography, Paper } from '@mui/material';

/**
 * ColorContrastTest displays typography samples on various background colors
 * to verify WCAG AA contrast compliance.
 */
function ColorContrastTest() {
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h4" gutterBottom color="primary">
        Color Contrast Test with Palette
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Box sx={{ bgcolor: 'primary.main', p: 2, mb: 1 }}>
          <Typography sx={{ typography: 'bodyLarge', color: 'primary.contrastText' }}>
            Body Large on Primary Background - Should be readable (WCAG AA)
          </Typography>
        </Box>
        <Box sx={{ bgcolor: 'secondary.main', p: 2, mb: 1 }}>
          <Typography sx={{ typography: 'bodyLarge', color: 'secondary.contrastText' }}>
            Body Large on Secondary Background - Should be readable (WCAG AA)
          </Typography>
        </Box>
        <Box sx={{ bgcolor: 'surface.main', p: 2, mb: 1 }}>
          <Typography sx={{ typography: 'bodyLarge', color: 'text.primary' }}>
            Body Large on Surface Background - Should be readable (WCAG AA)
          </Typography>
        </Box>
        <Box sx={{ bgcolor: 'background.paper', p: 2 }}>
          <Typography sx={{ typography: 'bodyLarge', color: 'text.secondary' }}>
            Body Large with Secondary Text on Paper - Should be readable (WCAG AA)
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

ColorContrastTest.propTypes = {};

export default ColorContrastTest;
