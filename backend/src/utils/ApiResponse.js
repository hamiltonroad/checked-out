/**
 * Standard API response envelope.
 *
 * Returned objects are deeply frozen in non-production environments so that any
 * accidental mutation — including nested objects/arrays — throws a TypeError at
 * runtime (Issue #228 Rec #4). In production we skip the freeze to avoid the
 * (small) overhead.
 */

const deepFreeze = (obj) => {
  if (obj === null || typeof obj !== 'object' || Object.isFrozen(obj)) {
    return obj;
  }
  Object.values(obj).forEach((value) => {
    deepFreeze(value);
  });
  return Object.freeze(obj);
};

const freezeIfNotProd = (obj) => (process.env.NODE_ENV === 'production' ? obj : deepFreeze(obj));

class ApiResponse {
  static success(data, message = 'Success') {
    return freezeIfNotProd({
      success: true,
      message,
      data,
    });
  }

  static error(message = 'Error', statusCode = 500, extras = {}) {
    return freezeIfNotProd({
      success: false,
      message,
      statusCode,
      ...extras,
    });
  }
}

module.exports = ApiResponse;
