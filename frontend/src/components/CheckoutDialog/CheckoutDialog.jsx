import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useCheckout } from '../../hooks/useCheckout';

/**
 * Dialog component for checking out books to patrons
 */
function CheckoutDialog({ open, onClose, bookId, bookTitle }) {
  const [patronId, setPatronId] = useState('');
  const [copyId, setCopyId] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const queryClient = useQueryClient();
  const checkout = useCheckout();

  // Calculate due date (14 days from now)
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14);
  const dueDateString = dueDate.toLocaleDateString();

  const handleSubmit = async () => {
    // Validate inputs
    const patronIdNum = parseInt(patronId, 10);
    const copyIdNum = parseInt(copyId, 10);

    if (!patronIdNum || patronIdNum <= 0) {
      setError('Please enter a valid Patron ID');
      return;
    }

    if (!copyIdNum || copyIdNum <= 0) {
      setError('Please enter a valid Copy ID');
      return;
    }

    setError(null);

    try {
      await checkout.mutateAsync({
        patronId: patronIdNum,
        copyId: copyIdNum,
      });

      // Show success message
      setSuccess(true);

      // Invalidate queries to refresh book data
      queryClient.invalidateQueries(['books']);
      queryClient.invalidateQueries(['book', bookId]);

      // Close dialog after short delay
      setTimeout(() => {
        setSuccess(false);
        setPatronId('');
        setCopyId('');
        onClose();
      }, 1500);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to check out book';
      setError(errorMessage);
    }
  };

  const handleClose = () => {
    if (!checkout.isPending) {
      setError(null);
      setSuccess(false);
      setPatronId('');
      setCopyId('');
      onClose();
    }
  };

  return (
    <Dialog open={open} maxWidth="sm" fullWidth onClose={handleClose}>
      <DialogTitle>
        Check Out Book
        <Typography variant="body2" color="text.secondary">
          {bookTitle}
        </Typography>
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Book checked out successfully!
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            label="Patron ID"
            type="number"
            value={patronId}
            onChange={(e) => setPatronId(e.target.value)}
            placeholder="Enter patron ID"
            required
            fullWidth
            disabled={checkout.isPending || success}
            inputProps={{ min: 1 }}
          />

          <TextField
            label="Copy ID"
            type="number"
            value={copyId}
            onChange={(e) => setCopyId(e.target.value)}
            placeholder="Enter copy ID"
            required
            fullWidth
            disabled={checkout.isPending || success}
            inputProps={{ min: 1 }}
          />

          <Typography variant="body2" color="text.secondary">
            Due Date: {dueDateString}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={checkout.isPending || success}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={checkout.isPending || success || !patronId || !copyId}
          startIcon={checkout.isPending && <CircularProgress size={20} />}
        >
          Check Out
        </Button>
      </DialogActions>
    </Dialog>
  );
}

CheckoutDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  bookId: PropTypes.number.isRequired,
  bookTitle: PropTypes.string.isRequired,
};

export default CheckoutDialog;
