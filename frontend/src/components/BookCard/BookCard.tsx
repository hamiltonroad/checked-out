import type React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import ProfanityWarning from '../ProfanityWarning';
import { RatingDisplay } from '../Rating';
import { getGenreStyle } from '../../utils/genreColors';
import { getCopyCountText } from '../../utils/copyUtils';
import type { Book } from '../../types';

interface BookCardProps {
  book: Book;
  onClick: (bookId: number) => void;
}

/**
 * BookCard displays book information in a card format with a genre-based cover placeholder
 */
function BookCard({ book, onClick }: BookCardProps) {
  const { bgColor, iconColor, Icon } = getGenreStyle(book.genre);
  const handleClick = () => {
    onClick(book.id);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
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
      <Box
        sx={{
          height: (theme) => theme.spacing(20),
          bgcolor: bgColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        data-testid="genre-placeholder"
      >
        <Icon sx={{ fontSize: 48, color: iconColor }} />
      </Box>
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
        {(book.average_rating || (book.total_ratings && book.total_ratings > 0)) && (
          <Box sx={{ mb: 1 }}>
            <RatingDisplay
              rating={book.average_rating}
              totalRatings={book.total_ratings}
              size="small"
            />
          </Box>
        )}
        <Typography variant="body2" color="text.secondary">
          {getCopyCountText(book.copies)}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default BookCard;
