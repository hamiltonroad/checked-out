import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, LinearProgress } from '@mui/material';

/**
 * Display rating statistics and distribution
 */
function RatingStats({ stats }) {
  if (!stats) return null;

  const { average_rating, total_ratings, distribution } = stats;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Rating Distribution
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2">
          Average: {average_rating} ({total_ratings} ratings)
        </Typography>
      </Box>
      {distribution && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {[5, 4, 3, 2, 1].map((star) => (
            <Box key={star} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ minWidth: 60 }}>
                {star} stars
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(distribution[star] / total_ratings) * 100 || 0}
                sx={{ flex: 1 }}
              />
              <Typography variant="body2" sx={{ minWidth: 40, textAlign: 'right' }}>
                {distribution[star] || 0}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

RatingStats.propTypes = {
  stats: PropTypes.shape({
    average_rating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    total_ratings: PropTypes.number,
    distribution: PropTypes.object,
  }),
};

export default RatingStats;
