import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
function CheckoutDialog({ open, onClose, onSubmit, isSubmitting = false, error = null }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: { patronId: '', copyId: '' } });
  const dueDate = computeDueDate();

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const onFormSubmit = (data) => {
    const parsedPatronId = parseInt(data.patronId, 10);
    const parsedCopyId = parseInt(data.copyId, 10);
    onSubmit({ patron_id: parsedPatronId, copy_id: parsedCopyId });
  };

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
          autoFocus
          margin="dense"
          label="Patron ID"
          type="number"
          fullWidth
          disabled={isSubmitting}
          inputProps={{ min: 1 }}
          error={!!errors.patronId}
          helperText={errors.patronId?.message}
          {...register('patronId', {
            required: 'Patron ID is required.',
            validate: (value) => {
              const num = parseInt(value, 10);
              if (Number.isNaN(num)) return 'Patron ID must be a number.';
              if (num <= 0) return 'Patron ID must be greater than 0.';
              return true;
            },
          })}
        />
        <TextField
          margin="dense"
          label="Copy ID"
          type="number"
          fullWidth
          disabled={isSubmitting}
          inputProps={{ min: 1 }}
          error={!!errors.copyId}
          helperText={errors.copyId?.message}
          {...register('copyId', {
            required: 'Copy ID is required.',
            validate: (value) => {
              const num = parseInt(value, 10);
              if (Number.isNaN(num)) return 'Copy ID must be a number.';
              if (num <= 0) return 'Copy ID must be greater than 0.';
              return true;
            },
          })}
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
          onClick={handleSubmit(onFormSubmit)}
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

export default CheckoutDialog;
