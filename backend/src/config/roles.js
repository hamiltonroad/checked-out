/**
 * Role constants and hierarchy for role-based access control.
 *
 * Roles are ordered by privilege level:
 *   patron (0) < librarian (1) < admin (2)
 */

const ROLES = Object.freeze({
  PATRON: 'patron',
  LIBRARIAN: 'librarian',
  ADMIN: 'admin',
});

const ROLE_LEVELS = Object.freeze({
  patron: 0,
  librarian: 1,
  admin: 2,
});

/**
 * Check whether a patron's role meets or exceeds the required minimum.
 * @param {string} patronRole - The patron's current role
 * @param {string} requiredRole - The minimum role needed
 * @returns {boolean} True if patronRole >= requiredRole in the hierarchy
 */
const hasMinimumRole = (patronRole, requiredRole) => {
  const patronLevel = ROLE_LEVELS[patronRole];
  const requiredLevel = ROLE_LEVELS[requiredRole];

  if (patronLevel === undefined || requiredLevel === undefined) {
    return false;
  }

  return patronLevel >= requiredLevel;
};

module.exports = { ROLES, ROLE_LEVELS, hasMinimumRole };
