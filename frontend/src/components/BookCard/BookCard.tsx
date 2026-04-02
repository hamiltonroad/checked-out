import type React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import StatusChip from '../StatusChip';
import ProfanityWarning from '../ProfanityWarning';
import { RatingDisplay } from '../Rating';
import type { Book } from '../../types';

interface BookCardProps {
  book: Book;
  onClick: (bookId: number) => void;
}

/**
 * BookCard displays book information in a card format for mobile views
 */
function BookCard({ book, onClick }: BookCardProps) {
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
        <Box>
          <StatusChip status={book.status} size="small" />
        </Box>
      </CardContent>
    </Card>
  );
}

export default BookCard;
