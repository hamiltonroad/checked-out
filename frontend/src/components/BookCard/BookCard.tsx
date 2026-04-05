import type React from 'react';
import { useState, type KeyboardEvent, type MouseEvent } from 'react';
import { Card, CardContent, Typography, Box, IconButton, Collapse } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ProfanityWarning from '../ProfanityWarning';
import { RatingDisplay } from '../Rating';
import { getGenreStyle } from '../../utils/genreColors';
import { getCopyCountText } from '../../utils/copyUtils';
import { useOverflowDetection } from '../../hooks/useOverflowDetection';
import type { Book } from '../../types';

const CONTENT_MAX_HEIGHT = 160;

interface BookCardProps {
  book: Book;
  onClick: (bookId: number) => void;
}

/**
 * BookCard displays book information in a card format with a genre-based cover placeholder.
 * Cards render at a standardized height with expand/collapse for overflow content.
 */
function BookCard({ book, onClick }: BookCardProps) {
  const { bgColor, iconColor, Icon } = getGenreStyle(book.genre);
  const [isExpanded, setIsExpanded] = useState(false);
  const { contentRef, isOverflowing } = useOverflowDetection();

  const handleClick = () => {
    onClick(book.id);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  const handleToggleExpand = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setIsExpanded((prev) => !prev);
  };

  const handleToggleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.stopPropagation();
    }
  };

  const authorsText = book.authors
    .map((author) => `${author.first_name} ${author.last_name}`)
    .join(', ');

  const showToggle = isOverflowing || isExpanded;

  const titleClampSx = !isExpanded
    ? {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical' as const,
      }
    : {};

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
        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
        '&:hover': { boxShadow: 3 },
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
        <Collapse in={isExpanded} collapsedSize={CONTENT_MAX_HEIGHT}>
          <Box ref={contentRef} data-testid="book-card-content">
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" component="h3" title={book.title} sx={titleClampSx}>
                {book.title}
              </Typography>
              {book.has_profanity && <ProfanityWarning size="small" />}
            </Box>
            <Typography
              variant="body2"
              color="text.secondary"
              title={authorsText}
              noWrap={!isExpanded}
              sx={{ mb: 1 }}
            >
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
          </Box>
        </Collapse>
        {showToggle && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 0.5 }}>
            <IconButton
              size="small"
              onClick={handleToggleExpand}
              onKeyDown={handleToggleKeyDown}
              aria-label={isExpanded ? 'Show less' : 'Show more'}
              aria-expanded={isExpanded}
            >
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default BookCard;
