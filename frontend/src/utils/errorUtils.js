/**
 * Parse validation errors from an API error response.
 *
 * Handles the standardized format: { errors: [{ field, message }] }
 * Also handles legacy flat-string error messages for backward compatibility.
 *
 * @param {Error} error - Axios error or generic error object
 * @returns {{ message: string, fieldErrors: Array<{field: string, message: string}> }}
 */
export function parseApiError(error) {
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
 *
 * @param {Array<{field: string, message: string}>} fieldErrors - Field-level errors
 * @param {string} fieldName - The field name to look up
 * @returns {string|null} The error message for the field, or null if none
 */
export function getFieldError(fieldErrors, fieldName) {
  const found = fieldErrors.find((e) => e.field === fieldName);
  return found ? found.message : null;
}

/**
 * Format an API error into a single display string.
 *
 * If field-level errors exist, joins their messages with ". ".
 * Otherwise falls back to the top-level message.
 *
 * @param {Error} error - Axios error or generic error object
 * @param {string} fallback - Fallback message when nothing can be parsed
 * @returns {string} Human-readable error message
 */
export function formatApiError(error, fallback = 'An unexpected error occurred') {
  if (!error) {
    return fallback;
  }
  const { message, fieldErrors } = parseApiError(error);
  if (fieldErrors.length > 0) {
    return fieldErrors.map((e) => e.message).join('. ');
  }
  return message || fallback;
}
