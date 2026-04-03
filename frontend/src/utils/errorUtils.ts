import type { FieldError } from '../types';

interface ApiErrorResponse {
  response?: {
    data?: {
      errors?: FieldError[];
      message?: string;
    };
  };
  message?: string;
}

interface ParsedError {
  message: string;
  fieldErrors: FieldError[];
}

/**
 * Parse validation errors from an API error response.
 *
 * Handles the standardized format: { errors: [{ field, message }] }
 * Also handles legacy flat-string error messages for backward compatibility.
 */
export function parseApiError(error: ApiErrorResponse): ParsedError {
  const response = error?.response?.data;

  if (!response) {
    return {
      message: error?.message || 'An unexpected error occurred',
      fieldErrors: [],
    };
  }

  const fieldErrors = Array.isArray(response.errors) ? response.errors : [];
  const message = response.message || 'An error occurred';

  return { message, fieldErrors };
}

/**
 * Get the error message for a specific field from a list of field errors.
 */
export function getFieldError(fieldErrors: FieldError[], fieldName: string): string | null {
  const found = fieldErrors.find((e) => e.field === fieldName);
  return found ? found.message : null;
}

/**
 * Format an API error into a single display string.
 *
 * If field-level errors exist, joins their messages with ". ".
 * Otherwise falls back to the top-level message.
 */
export function formatApiError(
  error: ApiErrorResponse | null | undefined,
  fallback = 'An unexpected error occurred'
): string {
  if (!error) {
    return fallback;
  }
  const { message, fieldErrors } = parseApiError(error);
  if (fieldErrors.length > 0) {
    return fieldErrors.map((e) => e.message).join('. ');
  }
  return message || fallback;
}
