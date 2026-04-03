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
import { formatDate, dueSoonSeverity, formatDueDateText } from '../../utils/checkoutUtils';
import type { CurrentCheckout } from '../../types';

interface CurrentCheckoutsTabProps {
  checkouts: CurrentCheckout[];
  onReturn: (id: number) => void;
  isLoading: boolean;
}

/**
 * CurrentCheckoutsTab displays active checkouts with due-date awareness and return actions
 */
function CurrentCheckoutsTab({ checkouts, onReturn, isLoading }: CurrentCheckoutsTabProps) {
  const [returningId, setReturningId] = useState<number | null>(null);

  const handleReturn = (id: number) => {
    setReturningId(id);
    onReturn(id);
  };

  if (isLoading) {
    return <Skeleton variant="rounded" height={300} />;
  }

  if (checkouts.length === 0) {
    return (
      <EmptyState
        icon={<AssignmentReturnIcon sx={{ fontSize: 'inherit' }} />}
        title="No current checkouts"
        message="No books are currently checked out."
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
            <TableCell sx={{ fontWeight: 600 }}>Due Date</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Days Until Due</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {checkouts.map((checkout, index) => {
            const severity = dueSoonSeverity(checkout.daysUntilDue);
            const isLastRow = index === checkouts.length - 1;
            const tableCellSx = {
              borderBottom: isLastRow ? 'none' : '1px solid',
              borderColor: 'divider',
            };

            return (
              <TableRow key={checkout.id}>
                <TableCell sx={tableCellSx}>{checkout.bookTitle}</TableCell>
                <TableCell sx={tableCellSx}>{checkout.patronName}</TableCell>
                <TableCell sx={tableCellSx}>{formatDate(checkout.dueDate)}</TableCell>
                <TableCell sx={tableCellSx}>
                  <Typography
                    component="span"
                    color={
                      severity === 'error'
                        ? 'error'
                        : severity === 'warning'
                          ? 'warning.main'
                          : 'text.primary'
                    }
                    sx={{ fontWeight: severity ? 600 : 400 }}
                  >
                    {formatDueDateText(checkout.daysUntilDue, checkout.dueDate)}
                  </Typography>
                </TableCell>
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

export default CurrentCheckoutsTab;
