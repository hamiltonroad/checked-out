import PropTypes from 'prop-types';
import { Tooltip, Box } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';

/**
 * ProfanityWarning displays a warning icon for books with profane content
 * @param {Object} props - Component props
 * @param {string} [props.size='small'] - Size of the warning icon ('small', 'medium', 'large')
 */
function ProfanityWarning({ size = 'small' }) {
  return (
    <Tooltip title="Contains profanity in title" arrow>
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          ml: 1,
        }}
        role="img"
        aria-label="Warning: Contains profanity"
      >
        <WarningIcon
          fontSize={size}
          sx={{
            color: 'warning.main',
          }}
        />
      </Box>
    </Tooltip>
  );
}

ProfanityWarning.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
};

export default ProfanityWarning;
