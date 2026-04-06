import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Fade,
  Skeleton,
  Card,
  CardContent,
  Alert,
  Snackbar,
  type AlertColor,
} from '@mui/material';
import QueueIcon from '@mui/icons-material/Queue';
import { useNavigate } from 'react-router-dom';
import { useMyWaitlist, useLeaveWaitlist } from '../hooks/useWaitlist';
import WaitlistCard from '../components/WaitlistCard';
import EmptyState from '../components/EmptyState';
import BookDetailModal from '../components/BookDetailModal';

/**
 * MyWaitlistPage displays the authenticated patron's waitlist entries
 * with leave actions and book detail modal integration.
 */
function MyWaitlistPage() {
  const { data: entries, isLoading } = useMyWaitlist();
  const leaveWaitlist = useLeaveWaitlist();
  const navigate = useNavigate();

  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [leavingKey, setLeavingKey] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleBookClick = (bookId: number) => {
    setSelectedBookId(bookId);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedBookId(null);
  };

  const handleLeave = (bookId: number, format: string) => {
    const key = `${bookId}:${format}`;
    setLeavingKey(key);
    leaveWaitlist.mutate(
      { bookId, format },
      {
        onSuccess: () => {
          setSnackbar({ open: true, message: 'Removed from waitlist', severity: 'success' });
          setLeavingKey(null);
        },
        onError: () => {
          setSnackbar({
            open: true,
            message: 'Failed to leave waitlist',
            severity: 'error',
          });
          setLeavingKey(null);
        },
      }
    );
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleBrowseCatalog = () => {
    navigate('/');
  };

  const waitlistEntries = entries || [];

  return (
    <Container>
      <Fade in timeout={300}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ color: 'primary.main', fontWeight: 600 }}>
            My Waitlist
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Books you are waiting for
          </Typography>
        </Box>
      </Fade>

      {isLoading &&
        Array.from({ length: 3 }).map((_, index) => (
          <Card key={`skeleton-${index}`} sx={{ mb: 2 }}>
            <CardContent>
              <Skeleton variant="text" width="60%" height={32} />
              <Skeleton variant="text" width="40%" height={20} />
              <Skeleton variant="text" width="30%" height={16} />
            </CardContent>
          </Card>
        ))}

      {!isLoading && waitlistEntries.length === 0 && (
        <EmptyState
          icon={<QueueIcon sx={{ fontSize: 'inherit' }} />}
          title="You're not on any waitlists"
          message="Browse the catalog to join a waitlist when a book is unavailable."
          action={{ label: 'Browse Catalog', onClick: handleBrowseCatalog }}
        />
      )}

      {!isLoading && waitlistEntries.length > 0 && (
        <Fade in timeout={500}>
          <Box>
            {waitlistEntries.map((entry) => (
              <WaitlistCard
                key={entry.id}
                entry={entry}
                onBookClick={handleBookClick}
                onLeave={handleLeave}
                isLeaving={leavingKey === `${entry.book_id}:${entry.format}`}
              />
            ))}
          </Box>
        </Fade>
      )}

      <BookDetailModal open={modalOpen} onClose={handleModalClose} bookId={selectedBookId} />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default MyWaitlistPage;
