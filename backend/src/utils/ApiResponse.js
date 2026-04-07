/**
 * Standard API response envelope.
 *
 * Returned objects are deeply frozen in non-production environments so that any
 * accidental mutation — including nested objects/arrays — throws a TypeError at
 * runtime (Issue #228 Rec #4). In production we skip the freeze to avoid the
 * (small) overhead.
 */

/**
 * Recursively freeze plain data so accidental mutation throws. We intentionally
 * do NOT recurse into Sequelize Model instances: their enumerable graph includes
 * shared model options and association metadata, which (a) creates reference
 * cycles that blow the call stack and (b) freezes shared library state that
 * later queries rely on mutating. Services that want a frozen response shape
 * should pass plain objects (e.g. via `.toJSON()` or explicit mapping).
 */
const isSequelizeInstance = (obj) =>
  obj && typeof obj === 'object' && typeof obj.get === 'function' && 'dataValues' in obj;

const deepFreeze = (obj, seen = new WeakSet()) => {
  if (obj === null || typeof obj !== 'object' || Object.isFrozen(obj)) {
    return obj;
  }
  if (seen.has(obj)) {
    return obj;
  }
  if (isSequelizeInstance(obj)) {
    // Skip entirely — freezing the instance or its internals would corrupt
    // shared model state and break subsequent queries/saves. Services that
    // need mutation-safety should serialize to plain objects first.
    return obj;
  }
  seen.add(obj);
  Object.values(obj).forEach((value) => {
    deepFreeze(value, seen);
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
