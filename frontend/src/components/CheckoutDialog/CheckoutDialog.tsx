import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
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
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { useAvailableCopies } from '../../hooks/useAvailableCopies';
import type { FieldError as ApiFieldError } from '../../types';
import CopyRadioGroup from '../CopyRadioGroup';
import PatronSearchField from './PatronSearchField';

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
  const { patron: authPatron } = useAuth();
  const {
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    defaultValues: { patronId: null },
  });

  const { data: copiesRes, isLoading: loadingCopies } = useAvailableCopies(open ? bookId : null);

  const copies = copiesRes?.data?.copies || [];
  const totalCopies = copiesRes?.data?.totalCopies || 0;
  const dueDate = computeDueDate();
  const noCopiesAvailable = !loadingCopies && copies.length === 0;

  useEffect(() => {
    if (open && authPatron) {
      setValue('patronId', authPatron as Patron);
    } else if (!open) {
      reset({ patronId: null });
      setSelectedCopyId('');
    }
  }, [open, reset, setValue, authPatron]);

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
        <PatronSearchField
          control={control}
          errors={errors}
          fieldErrors={fieldErrors}
          isSubmitting={isSubmitting}
          setValue={setValue}
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
