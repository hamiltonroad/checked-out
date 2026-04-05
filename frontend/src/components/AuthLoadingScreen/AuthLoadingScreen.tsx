import { Box, LinearProgress } from '@mui/material';

/**
 * AuthLoadingScreen — full-page loading state shown while auth status is being determined.
 *
 * Uses a subtle LinearProgress indicator per ADR-015 (loading skeletons over spinners).
 * Centered vertically and horizontally to match LoginPage layout.
 */
function AuthLoadingScreen() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        px: 2,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 400 }}>
        <LinearProgress />
      </Box>
    </Box>
  );
}

export default AuthLoadingScreen;
