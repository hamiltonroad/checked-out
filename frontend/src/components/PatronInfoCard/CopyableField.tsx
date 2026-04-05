import { Typography, Tooltip, IconButton, Box } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { useOverflowDetection } from '../../hooks/useOverflowDetection';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';

interface CopyableFieldProps {
  label: string;
  value: string | null;
  copyable?: boolean;
}

/**
 * Displays a labeled field with text truncation, overflow tooltip,
 * and optional click-to-copy functionality.
 */
function CopyableField({ label, value, copyable = false }: CopyableFieldProps) {
  const { contentRef, isOverflowing } = useOverflowDetection();
  const { copyToClipboard, isCopied } = useCopyToClipboard();
  const displayValue = value || 'N/A';

  const handleCopy = () => {
    if (value) {
      copyToClipboard(value);
    }
  };

  return (
    <Box>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
        <Tooltip title={displayValue} disableHoverListener={!isOverflowing}>
          <Typography
            ref={contentRef}
            variant="body1"
            noWrap
            sx={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}
          >
            {displayValue}
          </Typography>
        </Tooltip>
        {copyable && value && (
          <IconButton
            size="small"
            onClick={handleCopy}
            aria-label={`Copy ${label.toLowerCase()}`}
            sx={{ ml: 0.5, flexShrink: 0 }}
          >
            {isCopied ? (
              <CheckIcon fontSize="small" color="success" />
            ) : (
              <ContentCopyIcon fontSize="small" />
            )}
          </IconButton>
        )}
      </Box>
    </Box>
  );
}

export default CopyableField;
