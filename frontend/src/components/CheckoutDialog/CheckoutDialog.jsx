import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Box,
  Typography,
} from '@mui/material';
import { useCreateCheckout } from '../../hooks/useCreateCheckout';

/**
 * CheckoutDialog - Modal for checking out a book to a patron
 */
function CheckoutDialog({ open, onClose, bookTitle }) {
  const [patronId, setPatronId] = useState('');
  const [copyId, setCopyId] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const { mutate: createCheckout, isPending, error } = useCreateCheckout();

  // Calculate due date (today + 14 days)
  const calculateDueDate = () => {
    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + 14);
    return dueDate.toLocaleDateString();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    createCheckout(
      {
        copyId: parseInt(copyId, 10),
        patronId: parseInt(patronId, 10),
      },
      {
        onSuccess: () => {
          setShowSuccess(true);
          // Close dialog after showing success message
          setTimeout(() => {
            setShowSuccess(false);
            setPatronId('');
            setCopyId('');
            onClose();
          }, 1500);
        },
      }
    );
  };

  const handleClose = () => {
    if (!isPending) {
      setPatronId('');
      setCopyId('');
      setShowSuccess(false);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Check Out Book</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            <strong>Book:</strong> {bookTitle}
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Patron ID"
              type="number"
              value={patronId}
              onChange={(e) => setPatronId(e.target.value)}
              required
              margin="normal"
              disabled={isPending}
            />

            <TextField
              fullWidth
              label="Copy ID"
              type="number"
              value={copyId}
              onChange={(e) => setCopyId(e.target.value)}
              required
              margin="normal"
              disabled={isPending}
            />

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              <strong>Due Date:</strong> {calculateDueDate()} (14 days from today)
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error.response?.data?.message || 'Failed to check out book. Please try again.'}
              </Alert>
            )}

            {showSuccess && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Book checked out successfully!
              </Alert>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isPending}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isPending || !patronId || !copyId}
        >
          {isPending ? 'Checking Out...' : 'Check Out'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

CheckoutDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  bookTitle: PropTypes.string.isRequired,
};

export default CheckoutDialog;
