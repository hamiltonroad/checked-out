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
  Box,
  Typography,
  IconButton,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import checkoutService from '../../services/checkoutService';

/**
 * CheckoutDialog - Dialog for checking out a book to a patron
 */
function CheckoutDialog({ open, onClose, bookTitle, onCheckoutSuccess }) {
  const [patronId, setPatronId] = useState('');
  const [copyId, setCopyId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Calculate due date (14 days from now)
  const calculateDueDate = () => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);
    return dueDate.toLocaleDateString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate fields
    if (!patronId || !copyId) {
      setError('Please fill in all fields');
      return;
    }

    // Validate numeric values
    const patronIdNum = parseInt(patronId, 10);
    const copyIdNum = parseInt(copyId, 10);

    if (isNaN(patronIdNum) || isNaN(copyIdNum)) {
      setError('Patron ID and Copy ID must be valid numbers');
      return;
    }

    setIsSubmitting(true);

    try {
      await checkoutService.createCheckout({
        patron_id: patronIdNum,
        copy_id: copyIdNum,
      });

      // Reset form
      setPatronId('');
      setCopyId('');

      // Call success callback
      if (onCheckoutSuccess) {
        onCheckoutSuccess();
      }

      // Close dialog
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create checkout');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setPatronId('');
    setCopyId('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LibraryBooksIcon />
          <span>Check Out Book</span>
        </Box>
        <IconButton
          onClick={handleClose}
          size="small"
          aria-label="close"
          sx={{ color: 'text.secondary' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Checking out: <strong>{bookTitle}</strong>
          </Typography>

          <TextField
            label="Patron ID"
            type="number"
            value={patronId}
            onChange={(e) => setPatronId(e.target.value)}
            fullWidth
            required
            margin="normal"
            disabled={isSubmitting}
            helperText="Enter the patron's ID number"
          />

          <TextField
            label="Copy ID"
            type="number"
            value={copyId}
            onChange={(e) => setCopyId(e.target.value)}
            fullWidth
            required
            margin="normal"
            disabled={isSubmitting}
            helperText="Enter the copy ID to check out"
          />

          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Due Date (14 days):
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {calculateDueDate()}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={<LibraryBooksIcon />}
          >
            {isSubmitting ? 'Checking Out...' : 'Check Out'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

CheckoutDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  bookTitle: PropTypes.string,
  onCheckoutSuccess: PropTypes.func,
};

export default CheckoutDialog;
