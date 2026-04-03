import { useEffect, useState } from 'react';
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
import { useAvailableCopies } from '../../hooks/useAvailableCopies';
import { getFieldError } from '../../utils/errorUtils';
import type { FieldError as ApiFieldError } from '../../types';
import CopyRadioGroup from '../CopyRadioGroup';

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
  bookId?: number | null;
  isSubmitting?: boolean;
  error?: string | null;
  fieldErrors?: ApiFieldError[];
}

interface CheckoutFormData {
  patronId: Patron | null;
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
  bookId = null,
  isSubmitting = false,
  error = null,
  fieldErrors = [],
}: CheckoutDialogProps) {
  const [selectedCopyId, setSelectedCopyId] = useState('');
  const {
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CheckoutFormData>({ defaultValues: { patronId: null } });

  const {
    data: patronsRes,
    isLoading: loadingPatrons,
    isError: patronsError,
  } = usePatrons({ status: 'active' });

  const { data: copiesRes, isLoading: loadingCopies } = useAvailableCopies(open ? bookId : null);

  const patrons: Patron[] = patronsRes?.data || [];
  const copies = copiesRes?.data?.copies || [];
  const totalCopies = copiesRes?.data?.totalCopies || 0;
  const dueDate = computeDueDate();
  const noCopiesAvailable = !loadingCopies && copies.length === 0;

  useEffect(() => {
    if (!open) {
      reset();
      setSelectedCopyId('');
    }
  }, [open, reset]);

  const handleCopyChange = (copyId: string) => {
    setSelectedCopyId(copyId);
  };

  const handleFormSubmit = (data: CheckoutFormData) => {
    if (!data.patronId?.id || !selectedCopyId) return;
    const parsedCopyId = parseInt(selectedCopyId, 10);
    onSubmit({ patron_id: data.patronId.id, copy_id: parsedCopyId });
  };

  const isSubmitDisabled = isSubmitting || !selectedCopyId || noCopiesAvailable;

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
                  error={
                    !!errors.patronId || patronsError || !!getFieldError(fieldErrors, 'patron_id')
                  }
                  helperText={
                    patronsError
                      ? 'Failed to load patrons'
                      : getFieldError(fieldErrors, 'patron_id') || errors.patronId?.message
                  }
                />
              )}
            />
          )}
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
          onClick={handleSubmit(handleFormSubmit)}
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
