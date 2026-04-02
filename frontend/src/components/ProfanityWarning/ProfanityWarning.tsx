import { Tooltip, Box } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import type { IconSize } from '../../types';

interface ProfanityWarningProps {
  size?: IconSize;
}

/**
 * ProfanityWarning displays a warning icon for books with profane content
 */
function ProfanityWarning({ size = 'small' }: ProfanityWarningProps) {
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

export default ProfanityWarning;
