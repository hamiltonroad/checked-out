import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
  Autocomplete,
} from '@mui/material';
import { createFilterOptions } from '@mui/material/Autocomplete';
import { usePatrons } from '../../hooks/usePatrons';

const CHECKOUT_DURATION_DAYS = 14;

interface Patron {
  id: number;
  first_name: string;
  last_name: string;
  card_number: string;
}

interface CheckoutDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { patron_id: number; copy_id: number }) => void;
  isSubmitting?: boolean;
  error?: string | null;
}

interface CheckoutFormData {
  patronId: Patron | null;
  copyId: string;
}

const patronFilter = createFilterOptions<Patron>({
  stringify: (o) => `${o.first_name} ${o.last_name} ${o.card_number}`,
});

/**
 * Compute due date as today + CHECKOUT_DURATION_DAYS, formatted for display
 */
function computeDueDate(): string {
  const due = new Date();
  due.setDate(due.getDate() + CHECKOUT_DURATION_DAYS);
  return due.toLocaleDateString();
}

/**
 * CheckoutDialog displays a form for checking out a book copy to a patron
 */
function CheckoutDialog({
  open,
  onClose,
  onSubmit,
  isSubmitting = false,
  error = null,
}: CheckoutDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CheckoutFormData>({ defaultValues: { patronId: null, copyId: '' } });

  const {
    data: patronsRes,
    isLoading: loadingPatrons,
    isError: patronsError,
  } = usePatrons({ status: 'active' });
  const patrons: Patron[] = patronsRes?.data || [];
  const dueDate = computeDueDate();

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const handleFormSubmit = (data: CheckoutFormData) => {
    if (!data.patronId?.id) return;
    const parsedCopyId = parseInt(data.copyId, 10);
    onSubmit({ patron_id: data.patronId.id, copy_id: parsedCopyId });
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
        <Controller
          name="patronId"
          control={control}
          rules={{ required: 'Patron is required.' }}
          render={({ field }) => (
            <Autocomplete
              options={patrons}
              loading={loadingPatrons}
              disabled={isSubmitting || patronsError}
              getOptionLabel={(option) =>
                `${option.first_name} ${option.last_name} (${option.card_number})`
              }
              isOptionEqualToValue={(option, value) => option.id === value.id}
              filterOptions={patronFilter}
              noOptionsText="No patrons found"
              onChange={(_, selected) => field.onChange(selected)}
              value={field.value || null}
              renderInput={(params) => (
                <TextField
                  {...params}
                  margin="dense"
                  label="Patron"
                  required
                  fullWidth
                  error={!!errors.patronId || patronsError}
                  helperText={patronsError ? 'Failed to load patrons' : errors.patronId?.message}
                />
              )}
            />
          )}
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
          onClick={handleSubmit(handleFormSubmit)}
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

export default CheckoutDialog;
