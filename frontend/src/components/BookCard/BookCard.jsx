import PropTypes from 'prop-types';
import { Card, CardContent, Typography, Box } from '@mui/material';
import StatusChip from '../StatusChip';
import ProfanityWarning from '../ProfanityWarning';
import { RatingDisplay } from '../Rating';

/**
 * BookCard displays book information in a card format for mobile views
 * @param {Object} props - Component props
 * @param {Object} props.book - Book object with id, title, authors, and status
 * @param {Function} props.onClick - Handler function called when card is clicked with book.id
 */
function BookCard({ book, onClick }) {
  const handleClick = () => {
    onClick(book.id);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  // Format authors as comma-separated string
  const authorsText = book.authors
    .map((author) => `${author.first_name} ${author.last_name}`)
    .join(', ');

  return (
    <Card
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${book.title}`}
      sx={{
        width: '100%',
        cursor: 'pointer',
        transition: 'box-shadow 0.3s ease-in-out',
        '@media (prefers-reduced-motion: reduce)': {
          transition: 'none',
        },
        '&:hover': {
          boxShadow: 3,
        },
        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: '2px',
          boxShadow: 3,
        },
        boxShadow: 1,
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" component="h3">
            {book.title}
          </Typography>
          {book.has_profanity && <ProfanityWarning size="small" />}
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {authorsText}
        </Typography>
        {(book.average_rating || book.total_ratings > 0) && (
          <Box sx={{ mb: 1 }}>
            <RatingDisplay
              rating={book.average_rating}
              totalRatings={book.total_ratings}
              size="small"
            />
          </Box>
        )}
        <Box>
          <StatusChip status={book.status} size="small" />
        </Box>
      </CardContent>
    </Card>
  );
}

BookCard.propTypes = {
  book: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    authors: PropTypes.arrayOf(
      PropTypes.shape({
        first_name: PropTypes.string.isRequired,
        last_name: PropTypes.string.isRequired,
      })
    ).isRequired,
    status: PropTypes.oneOf(['available', 'checked_out', 'overdue']).isRequired,
    has_profanity: PropTypes.bool,
    average_rating: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    total_ratings: PropTypes.number,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
};

export default BookCard;
