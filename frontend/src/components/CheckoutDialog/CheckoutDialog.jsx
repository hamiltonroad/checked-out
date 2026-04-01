import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Typography,
  CircularProgress,
  Box,
} from '@mui/material';

/**
 * Compute due date as today + 14 days, formatted for display
 * @returns {string} Formatted due date string
 */
function computeDueDate() {
  const due = new Date();
  due.setDate(due.getDate() + 14);
  return due.toLocaleDateString();
}

/**
 * CheckoutDialog displays a form for checking out a book copy to a patron
 */
function CheckoutDialog({ open, onClose, onSubmit, isSubmitting, error }) {
  const [patronId, setPatronId] = useState('');
  const [copyId, setCopyId] = useState('');
  const [validationError, setValidationError] = useState('');
  const dueDate = computeDueDate();

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setPatronId('');
      setCopyId('');
      setValidationError('');
    }
  }, [open]);

  const handleSubmit = () => {
    setValidationError('');

    const parsedPatronId = parseInt(patronId, 10);
    const parsedCopyId = parseInt(copyId, 10);

    if (!patronId || !copyId || Number.isNaN(parsedPatronId) || Number.isNaN(parsedCopyId)) {
      setValidationError('Both Patron ID and Copy ID are required.');
      return;
    }

    if (parsedPatronId <= 0 || parsedCopyId <= 0) {
      setValidationError('IDs must be greater than 0.');
      return;
    }

    onSubmit({ patron_id: parsedPatronId, copy_id: parsedCopyId });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Check Out Book</DialogTitle>
      <DialogContent>
        {(error || validationError) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {validationError || error}
          </Alert>
        )}
        <TextField
          autoFocus
          margin="dense"
          label="Patron ID"
          type="number"
          fullWidth
          value={patronId}
          onChange={(e) => setPatronId(e.target.value)}
          disabled={isSubmitting}
          inputProps={{ min: 1 }}
        />
        <TextField
          margin="dense"
          label="Copy ID"
          type="number"
          fullWidth
          value={copyId}
          onChange={(e) => setCopyId(e.target.value)}
          disabled={isSubmitting}
          inputProps={{ min: 1 }}
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
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={16} /> : null}
        >
          {isSubmitting ? 'Processing...' : 'Check Out'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

CheckoutDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
  error: PropTypes.string,
};

CheckoutDialog.defaultProps = {
  isSubmitting: false,
  error: null,
};

export default CheckoutDialog;
