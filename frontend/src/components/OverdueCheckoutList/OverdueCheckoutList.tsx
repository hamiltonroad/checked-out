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

const EM_DASH = '\u2014';

interface OverdueCheckoutListProps {
  checkouts: OverdueCheckout[];
  onReturn: (id: number) => void;
  isLoading: boolean;
}

/**
 * OverdueCheckoutList displays overdue checkouts with patron contact info and return actions
 */
function OverdueCheckoutList({ checkouts, onReturn, isLoading }: OverdueCheckoutListProps) {
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
                  onClick={() => handleReturn(checkout.id)}
                  disabled={returningId === checkout.id}
                >
                  Return
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default OverdueCheckoutList;
