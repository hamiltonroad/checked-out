import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Typography,
  Box,
} from '@mui/material';
import { useCheckout } from '../../hooks/useCheckout';

/**
 * CheckoutDialog - Dialog component for checking out a book
 */
function CheckoutDialog({ open, onClose, bookTitle, onSuccess }) {
  const [patronId, setPatronId] = useState('');
  const [copyId, setCopyId] = useState('');
  const [errors, setErrors] = useState({});

  const checkoutMutation = useCheckout();

  // Calculate due date (today + 14 days)
  const calculateDueDate = () => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);
    return dueDate.toLocaleDateString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validate inputs
    const newErrors = {};
    if (!patronId || isNaN(patronId)) {
      newErrors.patronId = 'Patron ID must be a valid number';
    }
    if (!copyId || isNaN(copyId)) {
      newErrors.copyId = 'Copy ID must be a valid number';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await checkoutMutation.mutateAsync({
        copyId: parseInt(copyId, 10),
        patronId: parseInt(patronId, 10),
      });

      // Success callback
      if (onSuccess) {
        onSuccess();
      }

      // Reset form and close
      setPatronId('');
      setCopyId('');
      setErrors({});
      onClose();
    } catch (error) {
      // Error is already handled by mutation
      setErrors({
        submit: error.response?.data?.message || 'Failed to create checkout. Please try again.',
      });
    }
  };

  const handleClose = () => {
    // Reset form
    setPatronId('');
    setCopyId('');
    setErrors({});
    checkoutMutation.reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Check Out Book</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Book: {bookTitle}
          </Typography>

          {errors.submit && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.submit}
            </Alert>
          )}

          <TextField
            label="Patron ID"
            type="number"
            value={patronId}
            onChange={(e) => setPatronId(e.target.value)}
            error={!!errors.patronId}
            helperText={errors.patronId}
            fullWidth
            required
            sx={{ mb: 2 }}
          />

          <TextField
            label="Copy ID"
            type="number"
            value={copyId}
            onChange={(e) => setCopyId(e.target.value)}
            error={!!errors.copyId}
            helperText={errors.copyId}
            fullWidth
            required
            sx={{ mb: 2 }}
          />

          <Box
            sx={{
              p: 2,
              bgcolor: 'grey.100',
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Due Date
            </Typography>
            <Typography variant="body1">{calculateDueDate()}</Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={checkoutMutation.isPending}>
          {checkoutMutation.isPending ? 'Checking out...' : 'Check Out'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

CheckoutDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  bookTitle: PropTypes.string,
  onSuccess: PropTypes.func,
};

export default CheckoutDialog;
