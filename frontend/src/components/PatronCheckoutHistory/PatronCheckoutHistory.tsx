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
import { formatDate } from '../../utils/checkoutUtils';
import type { PatronCheckout } from '../../types';

interface PatronCheckoutHistoryProps {
  checkouts: PatronCheckout[];
  isLoading: boolean;
}

/**
 * PatronCheckoutHistory displays a patron's returned checkout records
 */
function PatronCheckoutHistory({ checkouts, isLoading }: PatronCheckoutHistoryProps) {
  if (isLoading) {
    return <Skeleton variant="rounded" height={200} />;
  }

  if (checkouts.length === 0) {
    return (
      <EmptyState
        icon={<HistoryIcon sx={{ fontSize: 'inherit' }} />}
        title="No checkout history"
        message="This patron has no returned checkouts."
      />
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'action.hover' }}>
            <TableCell sx={{ fontWeight: 600 }}>Book Title</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Author</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Checkout Date</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Returned Date</TableCell>
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
                <TableCell sx={tableCellSx}>{checkout.author}</TableCell>
                <TableCell sx={tableCellSx}>{formatDate(checkout.checkoutDate)}</TableCell>
                <TableCell sx={tableCellSx}>{formatDate(checkout.returnedAt)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default PatronCheckoutHistory;
