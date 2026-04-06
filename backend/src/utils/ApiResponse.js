/**
 * Standard API response envelope.
 *
 * Returned objects are frozen in non-production environments so that any
 * accidental mutation throws a TypeError at runtime (Issue #228 Rec #4).
 * In production we skip the freeze to avoid the (small) overhead.
 */

const freezeIfNotProd = (obj) => (process.env.NODE_ENV === 'production' ? obj : Object.freeze(obj));

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
