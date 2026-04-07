import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
  Link,
  Skeleton,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import EmptyState from '../EmptyState';
import { formatDate } from '../../utils/checkoutUtils';
import type { OverdueCheckout } from '../../types';
import { ConfirmDialog } from '../ConfirmDialog';

const EM_DASH = '\u2014';

interface OverdueCheckoutListProps {
  checkouts: OverdueCheckout[];
  onReturn: (id: number) => Promise<void>;
  isLoading: boolean;
}

/**
 * OverdueCheckoutList displays overdue checkouts with patron contact info and return actions
 */
function OverdueCheckoutList({ checkouts, onReturn, isLoading }: OverdueCheckoutListProps) {
  const [returningId, setReturningId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const handleReturnClick = (id: number) => {
    setConfirmId(id);
  };

  const handleConfirmReturn = async () => {
    if (confirmId === null) return;
    const id = confirmId;
    setReturningId(id);
    try {
      await onReturn(id);
    } catch {
      // parent surfaces the error; just clear local pending state
    } finally {
      setReturningId(null);
      setConfirmId(null);
    }
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
        icon={<WarningAmberIcon sx={{ fontSize: 'inherit' }} />}
        title="No overdue checkouts"
        message="All checkouts are within their due dates."
      />
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'action.hover' }}>
            <TableCell sx={{ fontWeight: 600 }}>Book Title</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Patron</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Due Date</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Days Overdue</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {checkouts.map((checkout) => (
            <TableRow key={checkout.id}>
              <TableCell>{checkout.book.title}</TableCell>
              <TableCell>
                <Link
                  component={RouterLink}
                  to={`/patrons/${checkout.patron.id}`}
                  underline="hover"
                >
                  {checkout.patron.name}
                </Link>
              </TableCell>
              <TableCell>{checkout.patron.email || EM_DASH}</TableCell>
              <TableCell>{checkout.patron.phone || EM_DASH}</TableCell>
              <TableCell>{formatDate(checkout.dueDate)}</TableCell>
              <TableCell>
                <Typography component="span" color="error" sx={{ fontWeight: 600 }}>
                  {checkout.daysOverdue} {checkout.daysOverdue === 1 ? 'day' : 'days'}
                </Typography>
              </TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={() => handleReturnClick(checkout.id)}
                  disabled={returningId === checkout.id || confirmId === checkout.id}
                >
                  Return
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ConfirmDialog
        open={confirmId !== null}
        title="Return this book?"
        description="The patron's overdue checkout will be closed."
        confirmLabel="Return"
        loading={returningId !== null}
        onConfirm={handleConfirmReturn}
        onCancel={handleCancelReturn}
      />
    </TableContainer>
  );
}

export default OverdueCheckoutList;
