import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Alert,
  Button,
  Snackbar,
  type AlertColor,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useState } from 'react';
import { usePatron } from '../hooks/usePatron';
import { usePatronCheckouts } from '../hooks/usePatronCheckouts';
import { useReturnCheckout } from '../hooks/useReturnCheckout';
import PatronInfoCard from '../components/PatronInfoCard';
import PatronCurrentCheckouts from '../components/PatronCurrentCheckouts';
import PatronCheckoutHistory from '../components/PatronCheckoutHistory';
import PatronWaitlist from '../components/PatronWaitlist';
import type { PatronCheckout } from '../types';

/**
 * PatronDetailPage displays patron info, current checkouts, and checkout history
 */
function PatronDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const patronId = id ? parseInt(id, 10) : undefined;
  const validId = patronId && !Number.isNaN(patronId) ? patronId : undefined;

  const patronQuery = usePatron(validId);
  const currentQuery = usePatronCheckouts(validId, 'current');
  const historyQuery = usePatronCheckouts(validId, 'returned');
  const returnMutation = useReturnCheckout();

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({ open: false, message: '', severity: 'success' });

  const handleReturn = (checkoutId: number) => {
    returnMutation.mutate(checkoutId, {
      onSuccess: () => {
        setSnackbar({ open: true, message: 'Book returned successfully', severity: 'success' });
      },
      onError: () => {
        setSnackbar({ open: true, message: 'Failed to return book', severity: 'error' });
      },
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (!validId) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 3 }}>
          Invalid patron ID
        </Alert>
      </Container>
    );
  }

  const isNotFound =
    patronQuery.error && 'response' in (patronQuery.error as Record<string, unknown>)
      ? (patronQuery.error as { response?: { status?: number } }).response?.status === 404
      : false;

  if (isNotFound) {
    return (
      <Container>
        <Alert severity="warning" sx={{ mt: 3 }}>
          Patron not found
        </Alert>
      </Container>
    );
  }

  if (patronQuery.error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 3 }}>
          Error loading patron: {patronQuery.error.message || 'Unknown error'}
        </Alert>
      </Container>
    );
  }

  const patron = patronQuery.data?.data;
  const currentCheckouts: PatronCheckout[] = currentQuery.data?.data || [];
  const historyCheckouts: PatronCheckout[] = historyQuery.data?.data || [];

  return (
    <Container>
      <Box sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/checkouts')} sx={{ mb: 2 }}>
          Back to Checkouts
        </Button>
        <Typography variant="h4" component="h1" sx={{ color: 'primary.main', fontWeight: 600 }}>
          Patron Detail
        </Typography>
      </Box>

      {patron && <PatronInfoCard patron={patron} />}

      <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 500 }}>
        Current Checkouts
      </Typography>
      <Box sx={{ mb: 3 }}>
        <PatronCurrentCheckouts
          checkouts={currentCheckouts}
          onReturn={handleReturn}
          isLoading={currentQuery.isLoading}
        />
      </Box>

      <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 500 }}>
        Checkout History
      </Typography>
      <PatronCheckoutHistory checkouts={historyCheckouts} isLoading={historyQuery.isLoading} />

      <Typography variant="h5" component="h2" sx={{ mb: 2, mt: 3, fontWeight: 500 }}>
        Waitlist
      </Typography>
      <PatronWaitlist patronId={validId} />

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

export default PatronDetailPage;
