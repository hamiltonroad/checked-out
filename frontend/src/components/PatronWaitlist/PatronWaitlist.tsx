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
import QueueIcon from '@mui/icons-material/Queue';
import EmptyState from '../EmptyState';
import { usePatronWaitlist } from '../../hooks/useWaitlist';

interface PatronWaitlistProps {
  patronId: number;
}

/**
 * PatronWaitlist displays a patron's active waitlist entries
 */
function PatronWaitlist({ patronId }: PatronWaitlistProps) {
  const { data: entries = [], isLoading } = usePatronWaitlist(patronId);

  if (isLoading) {
    return (
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableBody>
            {[1, 2, 3].map((i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton />
                </TableCell>
                <TableCell>
                  <Skeleton />
                </TableCell>
                <TableCell>
                  <Skeleton />
                </TableCell>
                <TableCell>
                  <Skeleton />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  if (entries.length === 0) {
    return (
      <EmptyState
        icon={<QueueIcon fontSize="inherit" />}
        title="No Waitlist Entries"
        message="This patron is not on any waitlists."
      />
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Book</TableCell>
            <TableCell>Format</TableCell>
            <TableCell>Position</TableCell>
            <TableCell>Date Joined</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell>{entry.book?.title || `Book #${entry.book_id}`}</TableCell>
              <TableCell sx={{ textTransform: 'capitalize' }}>{entry.format}</TableCell>
              <TableCell>#{entry.position}</TableCell>
              <TableCell>{new Date(entry.created_at).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default PatronWaitlist;
