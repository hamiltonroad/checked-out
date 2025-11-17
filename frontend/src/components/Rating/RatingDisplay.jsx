import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Rating as MuiRating } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';

/**
 * Display component for book ratings
 * Shows star rating and optional review count
 */
function RatingDisplay({ rating, totalRatings, size = 'medium', showCount = true }) {
  const displayRating = parseFloat(rating) || 0;

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

RatingDisplay.propTypes = {
  rating: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  totalRatings: PropTypes.number,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  showCount: PropTypes.bool,
};

RatingDisplay.defaultProps = {
  rating: 0,
  totalRatings: 0,
  size: 'medium',
  showCount: true,
};

export default RatingDisplay;