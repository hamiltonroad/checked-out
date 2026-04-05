import { Box, Typography, Paper } from '@mui/material';
import PropTypes from 'prop-types';

interface VariantItem {
  typography: string;
  label: string;
  details: string;
}

interface TypographyVariantSectionProps {
  title: string;
  variants: VariantItem[];
}

/**
 * TypographyVariantSection displays a group of typography variants in a Paper card.
 * Each variant shows a sample text and its font specifications.
 */
function TypographyVariantSection({ title, variants }: TypographyVariantSectionProps) {
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h4" gutterBottom color="primary">
        {title}
      </Typography>
      {variants.map((variant) => (
        <Box key={variant.typography} sx={{ mb: 2 }}>
          <Typography sx={{ typography: variant.typography }}>{variant.label}</Typography>
          <Typography variant="caption" color="text.secondary">
            {variant.details}
          </Typography>
        </Box>
      ))}
    </Paper>
  );
}

TypographyVariantSection.propTypes = {
  title: PropTypes.string.isRequired,
  variants: PropTypes.arrayOf(
    PropTypes.shape({
      typography: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      details: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default TypographyVariantSection;
