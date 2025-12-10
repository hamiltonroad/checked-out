import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Rating as MuiRating,
  LinearProgress,
  Paper,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';

/**
 * Component to display rating statistics and distribution
 */
function RatingStats({ stats }) {
  const { average_rating, total_ratings, distribution } = stats;

  const getPercentage = (count) => {
    if (total_ratings === 0) return 0;
    return (count / total_ratings) * 100;
  };

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', gap: 4 }}>
        {/* Average Rating Section */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h2" fontWeight="bold">
            {average_rating || '0.0'}
          </Typography>
          <MuiRating
            value={parseFloat(average_rating) || 0}
            precision={0.1}
            readOnly
            size="large"
            emptyIcon={<StarIcon style={{ opacity: 0.3 }} fontSize="inherit" />}
          />
          <Typography variant="body2" color="text.secondary">
            {total_ratings} {total_ratings === 1 ? 'rating' : 'ratings'}
          </Typography>
        </Box>

        {/* Distribution Section */}
        <Box sx={{ flexGrow: 1 }}>
          {[5, 4, 3, 2, 1].map((star) => (
            <Box key={star} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 60 }}>
                <Typography variant="body2" sx={{ mr: 0.5 }}>
                  {star}
                </Typography>
                <StarIcon sx={{ fontSize: 16, color: 'primary.main' }} />
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={getPercentage(distribution?.[star] || 0)}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                    },
                  }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 40 }}>
                {distribution?.[star] || 0}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
}

RatingStats.propTypes = {
  stats: PropTypes.shape({
    average_rating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    total_ratings: PropTypes.number,
    distribution: PropTypes.objectOf(PropTypes.number),
  }).isRequired,
};

export default RatingStats;