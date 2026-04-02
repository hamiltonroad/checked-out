import { Box, Typography, Rating as MuiRating } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import type { RatingSize } from '../../types';

interface RatingDisplayProps {
  rating?: number | string;
  totalRatings?: number;
  size?: RatingSize;
  showCount?: boolean;
}

/**
 * Display component for book ratings
 * Shows star rating and optional review count
 */
function RatingDisplay({
  rating = 0,
  totalRatings = 0,
  size = 'medium',
  showCount = true,
}: RatingDisplayProps) {
  const displayRating = parseFloat(String(rating)) || 0;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <MuiRating
        value={displayRating}
        precision={0.1}
        readOnly
        size={size}
        emptyIcon={<StarIcon style={{ opacity: 0.3 }} fontSize="inherit" />}
      />
      {showCount && totalRatings > 0 && (
        <Typography variant="body2" color="text.secondary">
          ({totalRatings})
        </Typography>
      )}
      {showCount && totalRatings === 0 && (
        <Typography variant="body2" color="text.secondary">
          No ratings yet
        </Typography>
      )}
    </Box>
  );
}

export default RatingDisplay;
