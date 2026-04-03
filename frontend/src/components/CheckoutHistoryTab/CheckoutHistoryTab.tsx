import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import EmptyState from '../EmptyState';
import type { Checkout } from '../../types';

interface CheckoutHistoryTabProps {
  checkouts: Checkout[];
  isLoading: boolean;
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
 * CheckoutHistoryTab displays returned checkout records
 */
function CheckoutHistoryTab({ checkouts, isLoading }: CheckoutHistoryTabProps) {
  if (isLoading) {
    return <Skeleton variant="rounded" height={300} />;
  }

  if (checkouts.length === 0) {
    return (
      <EmptyState
        icon={<HistoryIcon sx={{ fontSize: 'inherit' }} />}
        title="No checkout history"
        message="No checkout history yet."
      />
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'action.hover' }}>
            <TableCell sx={{ fontWeight: 600 }}>Book Title</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Patron Name</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Checkout Date</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Return Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {checkouts.map((checkout, index) => {
            const isLastRow = index === checkouts.length - 1;
            const tableCellSx = {
              borderBottom: isLastRow ? 'none' : '1px solid',
              borderColor: 'divider',
            };

            return (
              <TableRow key={checkout.id}>
                <TableCell sx={tableCellSx}>{checkout.bookTitle}</TableCell>
                <TableCell sx={tableCellSx}>{checkout.patronName}</TableCell>
                <TableCell sx={tableCellSx}>{formatDate(checkout.checkoutDate)}</TableCell>
                <TableCell sx={tableCellSx}>{formatDate(checkout.returnDate)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default CheckoutHistoryTab;
