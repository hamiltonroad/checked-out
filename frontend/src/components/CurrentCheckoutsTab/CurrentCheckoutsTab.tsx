import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
  Tooltip,
  Box,
  CircularProgress,
} from '@mui/material';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import EmptyState from '../EmptyState';
import { formatDate, dueSoonSeverity, formatDueDateText } from '../../utils/checkoutUtils';
import type { CurrentCheckout } from '../../types';
import { ConfirmDialog } from '../ConfirmDialog';

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
  const [confirmId, setConfirmId] = useState<number | null>(null);

  // Clear returning state once the row no longer exists in the list (mutation succeeded).
  useEffect(() => {
    if (returningId !== null && !checkouts.some((c) => c.id === returningId)) {
      setReturningId(null);
      setConfirmId(null);
    }
  }, [checkouts, returningId]);

  const handleReturnClick = (id: number) => {
    setConfirmId(id);
  };

  const handleConfirmReturn = () => {
    if (confirmId === null) return;
    setReturningId(confirmId);
    onReturn(confirmId);
  };

  const handleCancelReturn = () => {
    if (returningId !== null) return;
    setConfirmId(null);
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
    <>
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
              const isPending = returningId === checkout.id;
              const returnButton = (
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleReturnClick(checkout.id)}
                  startIcon={
                    isPending ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <AssignmentReturnIcon />
                    )
                  }
                  disabled={isPending}
                >
                  Return
                </Button>
              );

              return (
                <TableRow key={checkout.id}>
                  <TableCell sx={tableCellSx}>{checkout.bookTitle}</TableCell>
                  <TableCell sx={tableCellSx}>
                    <Link
                      to={`/patrons/${checkout.patronId}`}
                      style={{ color: 'inherit', textDecoration: 'underline' }}
                    >
                      {checkout.patronName}
                    </Link>
                  </TableCell>
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
                    {isPending ? (
                      <Tooltip title="Processing…">
                        <Box component="span">{returnButton}</Box>
                      </Tooltip>
                    ) : (
                      returnButton
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <ConfirmDialog
        open={confirmId !== null}
        title="Return this book?"
        description="The patron's checkout will be closed."
        confirmLabel="Return"
        loading={returningId !== null}
        onConfirm={handleConfirmReturn}
        onCancel={handleCancelReturn}
      />
    </>
  );
}

export default CurrentCheckoutsTab;
