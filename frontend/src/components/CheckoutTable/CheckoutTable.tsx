import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from '@mui/material';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import EmptyState from '../EmptyState';
import type { Checkout } from '../../types';

interface CheckoutTableProps {
  checkouts: Checkout[];
  onReturn: (id: number) => void;
}

/**
 * Format a date string for display
 */
function formatDate(dateString?: string): string {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * CheckoutTable displays a table of checkout records with return functionality
 */
function CheckoutTable({ checkouts, onReturn }: CheckoutTableProps) {
  if (checkouts.length === 0) {
    return (
      <EmptyState
        icon={<AssignmentReturnIcon sx={{ fontSize: 'inherit' }} />}
        title="No checkouts found"
        message="There are no checkout records to display."
      />
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'action.hover' }}>
            <TableCell sx={{ fontWeight: 600 }}>Patron Name</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Book Title</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Checkout Date</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Return Date</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {checkouts.map((checkout, index) => {
            const isActive = !checkout.returnDate;
            const isLastRow = index === checkouts.length - 1;
            const tableCellSx = {
              borderBottom: isLastRow ? 'none' : '1px solid',
              borderColor: 'divider',
            };

            return (
              <TableRow key={checkout.id}>
                <TableCell sx={tableCellSx}>{checkout.patronName}</TableCell>
                <TableCell sx={tableCellSx}>{checkout.bookTitle}</TableCell>
                <TableCell sx={tableCellSx}>{formatDate(checkout.checkoutDate)}</TableCell>
                <TableCell sx={tableCellSx}>{formatDate(checkout.returnDate)}</TableCell>
                <TableCell sx={tableCellSx}>
                  {isActive && (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => onReturn(checkout.id)}
                      startIcon={<AssignmentReturnIcon />}
                    >
                      Return
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default CheckoutTable;
