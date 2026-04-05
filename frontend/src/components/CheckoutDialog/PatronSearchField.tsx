import { useState } from 'react';
import { Controller } from 'react-hook-form';
import type { Control, FieldErrors } from 'react-hook-form';
import { TextField, Autocomplete, Chip, Box } from '@mui/material';
import { usePatronSearch } from '../../hooks/usePatronSearch';
import { useRecentPatrons } from '../../hooks/useRecentPatrons';
import { getFieldError } from '../../utils/errorUtils';
import type { FieldError as ApiFieldError } from '../../types';
import type { CheckoutPatron, CheckoutFormData } from './types';

const MIN_SEARCH_LENGTH = 2;

interface PatronSearchFieldProps {
  control: Control<CheckoutFormData>;
  errors: FieldErrors<CheckoutFormData>;
  fieldErrors: ApiFieldError[];
  isSubmitting: boolean;
  setValue: (name: 'patronId', value: CheckoutPatron | null) => void;
}

/**
 * PatronSearchField provides a server-side patron search autocomplete
 * with recent patron quick-select chips
 */
function PatronSearchField({
  control,
  errors,
  fieldErrors,
  isSubmitting,
  setValue,
}: PatronSearchFieldProps) {
  const [searchInput, setSearchInput] = useState('');
  const { data: searchRes, isLoading: searchLoading } = usePatronSearch(searchInput);
  const { data: recentRes } = useRecentPatrons();

  const searchResults: CheckoutPatron[] = searchRes?.data || [];
  const recentPatrons: CheckoutPatron[] = recentRes?.data || [];

  const handleChipClick = (patron: CheckoutPatron) => {
    setValue('patronId', patron);
    setSearchInput('');
  };

  const noOptionsText =
    searchInput.length < MIN_SEARCH_LENGTH ? 'Type 2+ characters to search' : 'No patrons found';

  return (
    <>
      <Controller
        name="patronId"
        control={control}
        rules={{ required: 'Patron is required.' }}
        render={({ field }) => (
          <Autocomplete
            options={searchResults}
            loading={searchLoading}
            disabled={isSubmitting}
            getOptionLabel={(option: CheckoutPatron) =>
              `${option.first_name} ${option.last_name} (${option.card_number})`
            }
            isOptionEqualToValue={(option: CheckoutPatron, value: CheckoutPatron) =>
              option.id === value.id
            }
            noOptionsText={noOptionsText}
            onInputChange={(_, value, reason) => {
              if (reason === 'input') setSearchInput(value);
            }}
            onChange={(_, selected) => {
              field.onChange(selected);
              setSearchInput('');
            }}
            value={field.value || null}
            renderInput={(params) => (
              <TextField
                {...params}
                margin="dense"
                label="Patron"
                required
                fullWidth
                error={!!errors.patronId || !!getFieldError(fieldErrors, 'patron_id')}
                helperText={getFieldError(fieldErrors, 'patron_id') || errors.patronId?.message}
              />
            )}
          />
        )}
      />
      {recentPatrons.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
          {recentPatrons.map((p) => (
            <Chip
              key={p.id}
              label={`${p.first_name} ${p.last_name}`}
              size="small"
              onClick={() => handleChipClick(p)}
            />
          ))}
        </Box>
      )}
    </>
  );
}

PatronSearchField.propTypes = {};

export default PatronSearchField;
