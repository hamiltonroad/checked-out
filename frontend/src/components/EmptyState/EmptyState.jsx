import PropTypes from 'prop-types';
import { Box, Typography, Button } from '@mui/material';

/**
 * EmptyState displays a centered message with an icon when content is empty
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.icon - Icon to display (Material-UI Icon component)
 * @param {string} props.title - Title text to display
 * @param {string} props.message - Message text to display
 * @param {Object} props.action - Optional action button configuration
 * @param {string} props.action.label - Button label
 * @param {Function} props.action.onClick - Button click handler
 */
function EmptyState({ icon, title, message, action }) {
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

EmptyState.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  action: PropTypes.shape({
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
  }),
};

export default EmptyState;
