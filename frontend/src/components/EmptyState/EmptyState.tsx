import type { ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';
import type { EmptyStateAction } from '../../types';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  message: string;
  action?: EmptyStateAction;
}

/**
 * EmptyState displays a centered message with an icon when content is empty
 */
function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 6,
        px: 3,
        textAlign: 'center',
        bgcolor: 'surface.variant',
        borderRadius: 2,
      }}
      role="status"
      aria-live="polite"
    >
      <Box
        sx={{
          fontSize: { xs: '3rem', sm: '4rem', md: '5rem' },
          color: 'text.secondary',
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </Box>
      <Typography
        variant="h5"
        component="h2"
        gutterBottom
        sx={{
          fontWeight: 500,
          color: 'text.primary',
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{
          maxWidth: 500,
          mb: action ? 3 : 0,
        }}
      >
        {message}
      </Typography>
      {action && (
        <Button variant="contained" onClick={action.onClick} aria-label={action.label}>
          {action.label}
        </Button>
      )}
    </Box>
  );
}

export default EmptyState;
