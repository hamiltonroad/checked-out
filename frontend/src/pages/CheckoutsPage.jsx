import { useState } from 'react';
import { Container, Typography, Box, Alert, Snackbar, Skeleton } from '@mui/material';
import { useCheckouts } from '../hooks/useCheckouts';
import { useReturnCheckout } from '../hooks/useReturnCheckout';
import CheckoutTable from '../components/CheckoutTable';

/**
 * CheckoutsPage displays all checkout records and allows returning active checkouts
 *
 * Features:
 * - Table of all checkout records with patron name, book title, dates
 * - Return button for active checkouts (no return_date)
 * - Success/error notifications via Snackbar
 * - Loading and error states
 * - Empty state when no checkouts exist
 */
function CheckoutsPage() {
  const { data, isLoading, error } = useCheckouts();
  const returnMutation = useReturnCheckout();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleReturn = (id) => {
    returnMutation.mutate(id, {
      onSuccess: (response) => {
        const message = response?.message || 'Book returned successfully';
        setSnackbar({ open: true, message, severity: 'success' });
      },
      onError: (err) => {
        const message = err?.response?.data?.message || 'Failed to return book';
        setSnackbar({ open: true, message, severity: 'error' });
      },
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (isLoading) {
    return (
      <Container>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ color: 'primary.main', fontWeight: 600 }}>
            Checkouts
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage library checkouts and returns
          </Typography>
        </Box>
        <Skeleton variant="rounded" height={300} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ color: 'primary.main', fontWeight: 600 }}>
            Checkouts
          </Typography>
        </Box>
        <Alert severity="error">Error loading checkouts: {error.message || 'Unknown error'}</Alert>
      </Container>
    );
  }

  const checkouts = data?.data || [];

  return (
    <Container>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ color: 'primary.main', fontWeight: 600 }}>
          Checkouts
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage library checkouts and returns
        </Typography>
      </Box>

      <CheckoutTable checkouts={checkouts} onReturn={handleReturn} />

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

export default CheckoutsPage;
