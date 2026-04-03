import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Skeleton,
} from '@mui/material';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import EmptyState from '../EmptyState';
import { formatDate } from '../../utils/checkoutUtils';
import type { PatronCheckout } from '../../types';

interface PatronCurrentCheckoutsProps {
  checkouts: PatronCheckout[];
  onReturn: (id: number) => void;
  isLoading: boolean;
}

/**
 * PatronCurrentCheckouts displays a patron's active checkouts with return action
 */
function PatronCurrentCheckouts({ checkouts, onReturn, isLoading }: PatronCurrentCheckoutsProps) {
  const [returningId, setReturningId] = useState<number | null>(null);

  const handleReturn = (id: number) => {
    setReturningId(id);
    onReturn(id);
  };

  if (isLoading) {
    return <Skeleton variant="rounded" height={200} />;
  }

  if (checkouts.length === 0) {
    return (
      <EmptyState
        icon={<AssignmentReturnIcon sx={{ fontSize: 'inherit' }} />}
        title="No active checkouts"
        message="This patron has no books currently checked out."
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
            <TableCell sx={{ fontWeight: 600 }}>Due Date</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
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
                <TableCell sx={tableCellSx}>{formatDate(checkout.dueDate)}</TableCell>
                <TableCell sx={tableCellSx}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleReturn(checkout.id)}
                    startIcon={<AssignmentReturnIcon />}
                    disabled={returningId === checkout.id}
                  >
                    Return
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default PatronCurrentCheckouts;
