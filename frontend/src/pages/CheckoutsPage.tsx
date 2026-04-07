import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Badge,
  type AlertColor,
} from '@mui/material';
import { useCheckouts } from '../hooks/useCheckouts';
import { useCurrentCheckouts } from '../hooks/useCurrentCheckouts';
import { useOverdueCheckouts } from '../hooks/useOverdueCheckouts';
import { useReturnCheckout } from '../hooks/useReturnCheckout';
import CurrentCheckoutsTab from '../components/CurrentCheckoutsTab';
import CheckoutHistoryTab from '../components/CheckoutHistoryTab';
import OverdueCheckoutList from '../components/OverdueCheckoutList';
import type { OverdueCheckout } from '../types';

/**
 * CheckoutsPage displays checkouts in a tabbed interface:
 * - Current tab: active checkouts with due-date awareness and return actions
 * - History tab: returned checkout records
 */
function CheckoutsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const currentQuery = useCurrentCheckouts();
  const allQuery = useCheckouts();
  const overdueQuery = useOverdueCheckouts();
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

  const handleReturn = async (id: number) => {
    try {
      const response = (await returnMutation.mutateAsync(id)) as { message?: string };
      setSnackbar({
        open: true,
        message: response?.message || 'Book returned successfully',
        severity: 'success',
      });
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to return book';
      setSnackbar({ open: true, message, severity: 'error' });
      throw err;
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleTabChange = (_event: unknown, newValue: number) => {
    setActiveTab(newValue);
  };

  const currentCheckouts = currentQuery.data?.data || [];
  const allCheckouts = allQuery.data?.data || [];
  const overdueCheckouts: OverdueCheckout[] = overdueQuery.data?.data || [];
  const historyCheckouts = allCheckouts.filter(
    (c: { returnDate?: string }) => c.returnDate !== null && c.returnDate !== undefined
  );

  const tabErrors = [currentQuery.error, allQuery.error, overdueQuery.error];
  const activeError = tabErrors[activeTab] || null;

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
          <Tab
            label={
              <Badge badgeContent={overdueCheckouts.length} color="error">
                Overdue
              </Badge>
            }
            id="checkout-tab-2"
            aria-controls="checkout-tabpanel-2"
          />
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

      <Box role="tabpanel" id="checkout-tabpanel-2" hidden={activeTab !== 2}>
        {activeTab === 2 && (
          <OverdueCheckoutList
            checkouts={overdueCheckouts}
            onReturn={handleReturn}
            isLoading={overdueQuery.isLoading}
          />
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
