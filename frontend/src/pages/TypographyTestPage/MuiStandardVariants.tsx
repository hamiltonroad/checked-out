import { Box, Typography, Paper } from '@mui/material';

/**
 * MuiStandardVariants displays the standard MUI typography variants
 * for backward compatibility reference.
 */
function MuiStandardVariants() {
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h4" gutterBottom color="primary">
        MUI Standard Variants (Backward Compatibility)
      </Typography>
      <Box sx={{ mb: 1 }}>
        <Typography variant="h1">h1 (57px) - Same as displayLarge</Typography>
      </Box>
      <Box sx={{ mb: 1 }}>
        <Typography variant="h2">h2 (45px) - Same as displayMedium</Typography>
      </Box>
      <Box sx={{ mb: 1 }}>
        <Typography variant="h3">h3 (36px) - Same as displaySmall</Typography>
      </Box>
      <Box sx={{ mb: 1 }}>
        <Typography variant="h4">h4 (32px) - Same as headlineLarge</Typography>
      </Box>
      <Box sx={{ mb: 1 }}>
        <Typography variant="h5">h5 (28px) - Same as headlineMedium</Typography>
      </Box>
      <Box sx={{ mb: 1 }}>
        <Typography variant="h6">h6 (24px) - Same as headlineSmall</Typography>
      </Box>
      <Box sx={{ mb: 1 }}>
        <Typography variant="body1">
          body1 (16px) - Same as bodyLarge. Default paragraph text.
        </Typography>
      </Box>
      <Box sx={{ mb: 1 }}>
        <Typography variant="body2">
          body2 (14px) - Same as bodyMedium. Secondary paragraph text.
        </Typography>
      </Box>
      <Box sx={{ mb: 1 }}>
        <Typography variant="button">button (14px, Medium) - Button text</Typography>
      </Box>
      <Box sx={{ mb: 1 }}>
        <Typography variant="caption">caption (12px) - Caption text</Typography>
      </Box>
      <Box>
        <Typography variant="overline">overline (11px) - Overline text</Typography>
      </Box>
    </Paper>
  );
}

MuiStandardVariants.propTypes = {};

export default MuiStandardVariants;
