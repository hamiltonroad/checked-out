import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  type AlertColor,
} from '@mui/material';
import { useCheckouts } from '../hooks/useCheckouts';
import { useCurrentCheckouts } from '../hooks/useCurrentCheckouts';
import { useReturnCheckout } from '../hooks/useReturnCheckout';
import CurrentCheckoutsTab from '../components/CurrentCheckoutsTab';
import CheckoutHistoryTab from '../components/CheckoutHistoryTab';

/**
 * CheckoutsPage displays checkouts in a tabbed interface:
 * - Current tab: active checkouts with due-date awareness and return actions
 * - History tab: returned checkout records
 */
function CheckoutsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const currentQuery = useCurrentCheckouts();
  const allQuery = useCheckouts();
  const returnMutation = useReturnCheckout();
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleReturn = (id: number) => {
    returnMutation.mutate(id, {
      onSuccess: (response: { message?: string }) => {
        const message = response?.message || 'Book returned successfully';
        setSnackbar({ open: true, message, severity: 'success' });
      },
      onError: (err: { response?: { data?: { message?: string } } }) => {
        const message = err?.response?.data?.message || 'Failed to return book';
        setSnackbar({ open: true, message, severity: 'error' });
      },
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleTabChange = (_event: unknown, newValue: number) => {
    setActiveTab(newValue);
  };

  const currentCheckouts = currentQuery.data?.data || [];
  const allCheckouts = allQuery.data?.data || [];
  const historyCheckouts = allCheckouts.filter(
    (c: { returnDate?: string }) => c.returnDate !== null && c.returnDate !== undefined
  );

  const activeError = activeTab === 0 ? currentQuery.error : allQuery.error;

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

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="Checkout tabs">
          <Tab label="Current" id="checkout-tab-0" aria-controls="checkout-tabpanel-0" />
          <Tab label="History" id="checkout-tab-1" aria-controls="checkout-tabpanel-1" />
        </Tabs>
      </Box>

      {activeError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading checkouts: {activeError.message || 'Unknown error'}
        </Alert>
      )}

      <Box role="tabpanel" id="checkout-tabpanel-0" hidden={activeTab !== 0}>
        {activeTab === 0 && (
          <CurrentCheckoutsTab
            checkouts={currentCheckouts}
            onReturn={handleReturn}
            isLoading={currentQuery.isLoading}
          />
        )}
      </Box>

      <Box role="tabpanel" id="checkout-tabpanel-1" hidden={activeTab !== 1}>
        {activeTab === 1 && (
          <CheckoutHistoryTab checkouts={historyCheckouts} isLoading={allQuery.isLoading} />
        )}
      </Box>

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
