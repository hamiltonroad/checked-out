import PropTypes from 'prop-types';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import StatusChip from '../StatusChip';

/**
 * BooksTable displays a desktop table view of books with title, authors, and availability.
 */
function BooksTable({ books, onRowClick }) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'action.hover' }}>
            <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Author(s)</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Availability</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {books.map((book, index) => {
            const authors = book.authors
              .map((author) => `${author.first_name} ${author.last_name}`)
              .join(', ');
            const isLastRow = index === books.length - 1;
            const tableCellSx = {
              borderBottom: isLastRow ? 'none' : '1px solid',
              borderColor: 'divider',
            };

            return (
              <TableRow
                key={book.id}
                onClick={() => onRowClick(book.id)}
                sx={{
                  cursor: 'pointer',
                  transition: (theme) =>
                    theme.transitions.create(['background-color'], {
                      duration: theme.transitions.duration.short,
                    }),
                  '@media (prefers-reduced-motion: reduce)': {
                    transition: 'none',
                  },
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <TableCell sx={tableCellSx}>{book.title}</TableCell>
                <TableCell sx={tableCellSx}>{authors}</TableCell>
                <TableCell sx={tableCellSx}>
                  <StatusChip status={book.status} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

BooksTable.propTypes = {
  books: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      status: PropTypes.string,
      authors: PropTypes.arrayOf(
        PropTypes.shape({
          first_name: PropTypes.string.isRequired,
          last_name: PropTypes.string.isRequired,
        }),
      ).isRequired,
    }),
  ).isRequired,
  onRowClick: PropTypes.func.isRequired,
};

export default BooksTable;
