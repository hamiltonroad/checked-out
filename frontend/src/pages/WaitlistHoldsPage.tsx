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
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { useNavigate } from 'react-router-dom';
import { useMyWaitlist, useLeaveWaitlist } from '../hooks/useWaitlist';
import { useMyHolds, useCheckoutHold } from '../hooks/useHolds';
import WaitlistCard from '../components/WaitlistCard';
import HoldCard from '../components/HoldCard';
import EmptyState from '../components/EmptyState';
import BookDetailModal from '../components/BookDetailModal';

function SkeletonCards() {
  return (
    <>
      {Array.from({ length: 2 }).map((_, index) => (
        <Card key={`skeleton-${index}`} sx={{ mb: 2 }}>
          <CardContent>
            <Skeleton variant="text" width="60%" height={32} />
            <Skeleton variant="text" width="40%" height={20} />
          </CardContent>
        </Card>
      ))}
    </>
  );
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

/**
 * WaitlistHoldsPage displays the authenticated patron's active holds
 * (ready for checkout) and waitlist entries (in queue) in a unified view.
 */
function WaitlistHoldsPage() {
  const { data: holds, isLoading: holdsLoading, error: holdsError } = useMyHolds();
  const { data: entries, isLoading: waitlistLoading, error: waitlistError } = useMyWaitlist();
  const leaveWaitlist = useLeaveWaitlist();
  const checkoutHold = useCheckoutHold();
  const navigate = useNavigate();

  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [leavingKey, setLeavingKey] = useState<string | null>(null);
  const [checkingOutCopyId, setCheckingOutCopyId] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
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

  const handleCheckout = (copyId: number) => {
    setCheckingOutCopyId(copyId);
    checkoutHold.mutate(copyId, {
      onSuccess: () => {
        setSnackbar({ open: true, message: 'Book checked out successfully', severity: 'success' });
        setCheckingOutCopyId(null);
      },
      onError: () => {
        setSnackbar({ open: true, message: 'Failed to check out book', severity: 'error' });
        setCheckingOutCopyId(null);
      },
    });
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
          setSnackbar({ open: true, message: 'Failed to leave waitlist', severity: 'error' });
          setLeavingKey(null);
        },
      }
    );
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const holdsList = holds || [];
  const waitlistEntries = entries || [];

  return (
    <Container>
      <Fade in timeout={300}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ color: 'primary.main', fontWeight: 600 }}>
            Waitlist & Holds
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Books reserved for you and your waitlist positions
          </Typography>
        </Box>
      </Fade>

      <Typography variant="h5" component="h2" sx={{ mb: 2, mt: 3 }}>
        Ready for Checkout
      </Typography>
      {holdsError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Couldn&apos;t load your holds.
        </Alert>
      )}
      {holdsLoading && <SkeletonCards />}
      {!holdsLoading && holdsList.length === 0 && (
        <EmptyState
          icon={<BookmarkIcon sx={{ fontSize: 'inherit' }} />}
          title="No books ready for checkout"
          message="When a book you are waiting for becomes available, it will appear here."
        />
      )}
      {!holdsLoading && holdsList.length > 0 && (
        <Fade in timeout={500}>
          <Box>
            {holdsList.map((hold) => (
              <HoldCard
                key={hold.id}
                hold={hold}
                onBookClick={handleBookClick}
                onCheckout={handleCheckout}
                isCheckingOut={checkingOutCopyId === hold.copy_id}
              />
            ))}
          </Box>
        </Fade>
      )}

      <Typography variant="h5" component="h2" sx={{ mb: 2, mt: 4 }}>
        In Queue
      </Typography>
      {waitlistError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Couldn&apos;t load your waitlist.
        </Alert>
      )}
      {waitlistLoading && <SkeletonCards />}
      {!waitlistLoading && waitlistEntries.length === 0 && (
        <EmptyState
          icon={<QueueIcon sx={{ fontSize: 'inherit' }} />}
          title="Not on any waitlists"
          message="Browse the catalog to join a waitlist when a book is unavailable."
          action={{ label: 'Browse Catalog', onClick: () => navigate('/') }}
        />
      )}
      {!waitlistLoading && waitlistEntries.length > 0 && (
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

export default WaitlistHoldsPage;
