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
import type { Book } from '../../types';

interface BooksTableProps {
  books: Book[];
  onRowClick: (bookId: number) => void;
}

/**
 * BooksTable displays a desktop table view of books with title, authors, and availability.
 */
function BooksTable({ books, onRowClick }: BooksTableProps) {
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

export default BooksTable;
