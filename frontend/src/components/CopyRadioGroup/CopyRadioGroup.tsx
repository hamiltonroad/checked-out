import {
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';

interface Copy {
  id: number;
  copy_number: number;
  format: string;
  barcode: string | null;
  asin: string | null;
}

interface CopyRadioGroupProps {
  copies: Copy[];
  value: string;
  onChange: (copyId: string) => void;
  disabled?: boolean;
  totalCopies?: number;
  isLoading?: boolean;
}

/**
 * Format the display label for a copy based on its format type
 */
function formatCopyLabel(copy: Copy): string {
  const formatLabel = copy.format === 'physical' ? 'Physical' : 'Kindle';
  const identifier = copy.format === 'physical' ? copy.barcode : copy.asin;
  const identifierLabel = identifier ? ` — ${identifier}` : '';
  return `${formatLabel} · Copy #${copy.copy_number}${identifierLabel}`;
}

/**
 * CopyRadioGroup displays a radio group of available book copies for checkout selection
 */
function CopyRadioGroup({
  copies,
  value,
  onChange,
  disabled = false,
  totalCopies = 0,
  isLoading = false,
}: CopyRadioGroupProps) {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  const availableCount = copies.length;

  return (
    <Box sx={{ mt: 1 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {availableCount} of {totalCopies} copies available
      </Typography>

      {availableCount === 0 ? (
        <Typography variant="body2" color="error" sx={{ py: 1 }}>
          No copies are currently available
        </Typography>
      ) : (
        <RadioGroup value={value} onChange={(e) => onChange(e.target.value)}>
          {copies.map((copy) => (
            <FormControlLabel
              key={copy.id}
              value={String(copy.id)}
              control={<Radio />}
              label={formatCopyLabel(copy)}
              disabled={disabled}
            />
          ))}
        </RadioGroup>
      )}
    </Box>
  );
}

export default CopyRadioGroup;
