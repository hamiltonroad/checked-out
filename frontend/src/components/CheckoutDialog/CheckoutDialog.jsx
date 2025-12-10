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
  CircularProgress,
} from '@mui/material';
import checkoutService from '../../services/checkoutService';

/**
 * CheckoutDialog - Modal for checking out a book copy to a patron
 */
function CheckoutDialog({ open, onClose, onSuccess }) {
  const [patronId, setPatronId] = useState('');
  const [copyId, setCopyId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Calculate due date (14 days from now)
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14);
  const dueDateString = dueDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await checkoutService.createCheckout(parseInt(patronId, 10), parseInt(copyId, 10));
      setSuccess(true);
      // Wait a moment to show success message
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
        handleClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create checkout. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setPatronId('');
      setCopyId('');
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  const isFormValid = patronId && copyId && !isNaN(patronId) && !isNaN(copyId);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Check Out Book</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {success ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              Book checked out successfully!
            </Alert>
          ) : (
            <>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Enter the patron ID and copy ID to check out this book.
              </Typography>

              <TextField
                label="Patron ID"
                type="number"
                value={patronId}
                onChange={(e) => setPatronId(e.target.value)}
                fullWidth
                required
                disabled={isSubmitting}
                sx={{ mb: 2 }}
                helperText="Enter the ID of the patron checking out the book"
              />

              <TextField
                label="Copy ID"
                type="number"
                value={copyId}
                onChange={(e) => setCopyId(e.target.value)}
                fullWidth
                required
                disabled={isSubmitting}
                sx={{ mb: 3 }}
                helperText="Enter the ID of the specific copy to check out"
              />

              <Box
                sx={{
                  p: 2,
                  bgcolor: 'grey.50',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'grey.300',
                }}
              >
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Due Date
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {dueDateString}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 0.5, display: 'block' }}
                >
                  (14 days from today)
                </Typography>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          {!success && (
            <Button
              type="submit"
              variant="contained"
              disabled={!isFormValid || isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={16} /> : null}
            >
              {isSubmitting ? 'Checking Out...' : 'Check Out'}
            </Button>
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
}

CheckoutDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};

export default CheckoutDialog;
