import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Typography,
  CircularProgress,
  Box,
  TextField,
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { useAvailableCopies } from '../../hooks/useAvailableCopies';
import CopyRadioGroup from '../CopyRadioGroup';

const CHECKOUT_DURATION_DAYS = 14;

interface CheckoutDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { copy_id: number }) => void;
  bookId?: number | null;
  isSubmitting?: boolean;
  error?: string | null;
}

/**
 * Compute due date as today + CHECKOUT_DURATION_DAYS, formatted for display
 */
function computeDueDate(): string {
  const due = new Date();
  due.setDate(due.getDate() + CHECKOUT_DURATION_DAYS);
  return due.toLocaleDateString();
}

/**
 * CheckoutDialog displays a form for checking out a book copy.
 * The patron is always the authenticated user (read-only).
 */
function CheckoutDialog({
  open,
  onClose,
  onSubmit,
  bookId = null,
  isSubmitting = false,
  error = null,
}: CheckoutDialogProps) {
  const [selectedCopyId, setSelectedCopyId] = useState('');
  const { patron: authPatron } = useAuth();

  const { data: copiesRes, isLoading: loadingCopies } = useAvailableCopies(open ? bookId : null);

  const copies = copiesRes?.data?.copies || [];
  const totalCopies = copiesRes?.data?.totalCopies || 0;
  const dueDate = computeDueDate();
  const noCopiesAvailable = !loadingCopies && copies.length === 0;

  useEffect(() => {
    if (!open) {
      setSelectedCopyId('');
    }
  }, [open]);

  const handleCopyChange = (copyId: string) => {
    setSelectedCopyId(copyId);
  };

  const handleFormSubmit = () => {
    if (!authPatron || !selectedCopyId) return;
    const parsedCopyId = parseInt(selectedCopyId, 10);
    onSubmit({ copy_id: parsedCopyId });
  };

  const patronDisplayName = authPatron
    ? `${authPatron.first_name} ${authPatron.last_name}`
    : '';

  const isSubmitDisabled = isSubmitting || !selectedCopyId || noCopiesAvailable || !authPatron;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Check Out Book</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TextField
          margin="dense"
          label="Patron"
          value={patronDisplayName}
          fullWidth
          slotProps={{ input: { readOnly: true } }}
        />
        <CopyRadioGroup
          copies={copies}
          value={selectedCopyId}
          onChange={handleCopyChange}
          disabled={isSubmitting}
          totalCopies={totalCopies}
          isLoading={loadingCopies}
        />
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Due Date: {dueDate}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={handleFormSubmit}
          variant="contained"
          disabled={isSubmitDisabled}
          startIcon={isSubmitting ? <CircularProgress size={16} /> : null}
        >
          {isSubmitting ? 'Processing...' : 'Check Out'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CheckoutDialog;
