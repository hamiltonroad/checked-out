import { Box, IconButton } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import PropTypes from 'prop-types';
import { useState } from 'react';

/**
 * ReviewStars displays or allows selection of star ratings
 * @param {Object} props - Component props
 * @param {number} props.rating - Current rating (0-5)
 * @param {function} props.onRatingChange - Callback when rating changes (makes it interactive)
 * @param {string} props.size - Size of stars ('small', 'medium', 'large')
 * @param {boolean} props.readOnly - If true, stars are display-only
 */
function ReviewStars({ rating = 0, onRatingChange, size = 'medium', readOnly = false }) {
  const [hoverRating, setHoverRating] = useState(0);

  // Determine if this is interactive mode
  const isInteractive = !readOnly && onRatingChange;

  // Size mapping for icons
  const sizeMap = {
    small: '1rem',
    medium: '1.5rem',
    large: '2rem',
  };

  const iconSize = sizeMap[size] || sizeMap.medium;

  // Calculate which rating to display
  const displayRating = isInteractive && hoverRating > 0 ? hoverRating : rating;

  // Render a single star
  const renderStar = (index) => {
    const starValue = index + 1;
    let IconComponent;

    if (displayRating >= starValue) {
      // Full star
      IconComponent = StarIcon;
    } else if (displayRating >= starValue - 0.5 && !isInteractive) {
      // Half star (only in display mode)
      IconComponent = StarHalfIcon;
    } else {
      // Empty star
      IconComponent = StarBorderIcon;
    }

    if (isInteractive) {
      return (
        <IconButton
          key={index}
          size="small"
          onClick={() => onRatingChange(starValue)}
          onMouseEnter={() => setHoverRating(starValue)}
          onMouseLeave={() => setHoverRating(0)}
          sx={{
            padding: '2px',
            color: displayRating >= starValue ? 'warning.main' : 'action.disabled',
            '&:hover': {
              backgroundColor: 'transparent',
            },
          }}
          aria-label={`Rate ${starValue} star${starValue > 1 ? 's' : ''}`}
        >
          <IconComponent sx={{ fontSize: iconSize }} />
        </IconButton>
      );
    }

    // Read-only display
    return (
      <IconComponent
        key={index}
        sx={{
          fontSize: iconSize,
          color: displayRating >= starValue - 0.5 ? 'warning.main' : 'action.disabled',
        }}
      />
    );
  };

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.25,
      }}
      role={isInteractive ? 'radiogroup' : 'img'}
      aria-label={isInteractive ? 'Rating selection' : `Rating: ${rating} stars`}
    >
      {[0, 1, 2, 3, 4].map((index) => renderStar(index))}
    </Box>
  );
}

ReviewStars.propTypes = {
  rating: PropTypes.number,
  onRatingChange: PropTypes.func,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  readOnly: PropTypes.bool,
};

export default ReviewStars;
