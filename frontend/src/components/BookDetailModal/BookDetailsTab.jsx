import PropTypes from 'prop-types';
import { Box, Typography, Stack } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import StatusChip from '../StatusChip';
import ProfanityWarning from '../ProfanityWarning';
import { RatingDisplay } from '../Rating';

/**
 * DetailField displays a labeled field value in the book details
 * @param {Object} props - Component props
 * @param {string} props.label - Field label
 * @param {string|number} [props.value] - Field value (if not using children)
 * @param {React.ReactNode} [props.children] - Custom field content
 */
function DetailField({ label, value, children }) {
  // Don't render if no value and no children
  if (!value && !children) return null;

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" color="text.secondary">
        {label}
      </Typography>
      {children || <Typography variant="body1">{value}</Typography>}
    </Box>
  );
}

DetailField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  children: PropTypes.node,
};

/**
 * BookDetailsTab displays book information including cover placeholder,
 * rating, authors, ISBN, publisher, year, genre, and status.
 */
function BookDetailsTab({ book, statsData }) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ pt: 1 }}>
      <Box
        sx={{
          width: { xs: '100%', sm: '33%' },
          maxWidth: { xs: 200, sm: 'none' },
          mx: { xs: 'auto', sm: 0 },
        }}
      >
        <Box
          sx={{
            aspectRatio: '2/3',
            bgcolor: 'grey.200',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MenuBookIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
        </Box>
      </Box>
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">{book.title}</Typography>
          {book.has_profanity && <ProfanityWarning size="medium" />}
        </Box>

        <DetailField label="Rating">
          <RatingDisplay
            rating={book.average_rating || statsData?.average_rating}
            totalRatings={book.total_ratings || statsData?.total_ratings}
            size="medium"
            showCount
          />
        </DetailField>

        <DetailField
          label="Author(s)"
          value={
            book.authors && book.authors.length > 0
              ? book.authors.map((author) => `${author.first_name} ${author.last_name}`).join(', ')
              : null
          }
        />

        <DetailField label="ISBN" value={book.isbn} />

        <DetailField label="Publisher" value={book.publisher} />

        <DetailField label="Publication Year" value={book.publication_year} />

        <DetailField label="Genre" value={book.genre} />

        <DetailField label="Status">
          <Box sx={{ mt: 0.5 }}>
            <StatusChip status={book.status || 'available'} size="medium" />
          </Box>
        </DetailField>
      </Box>
    </Stack>
  );
}

BookDetailsTab.propTypes = {
  book: PropTypes.shape({
    title: PropTypes.string.isRequired,
    has_profanity: PropTypes.bool,
    average_rating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    total_ratings: PropTypes.number,
    authors: PropTypes.arrayOf(
      PropTypes.shape({
        first_name: PropTypes.string.isRequired,
        last_name: PropTypes.string.isRequired,
      })
    ),
    isbn: PropTypes.string,
    publisher: PropTypes.string,
    publication_year: PropTypes.number,
    genre: PropTypes.string,
    status: PropTypes.string,
  }).isRequired,
  statsData: PropTypes.shape({
    average_rating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    total_ratings: PropTypes.number,
  }),
};

export default BookDetailsTab;
