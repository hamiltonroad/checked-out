import type { PatronRole } from '../types';

/** Role constants — use these instead of raw strings */
export const ROLES: Record<string, PatronRole> = {
  PATRON: 'patron',
  LIBRARIAN: 'librarian',
  ADMIN: 'admin',
} as const;

/**
 * Role hierarchy levels for comparison.
 * Higher number = more privileges.
 */
const ROLE_LEVELS: Record<PatronRole, number> = {
  patron: 0,
  librarian: 1,
  admin: 2,
};

/**
 * Check whether a patron's role meets or exceeds the required minimum.
 * @param patronRole - The patron's current role
 * @param requiredRole - The minimum role needed
 * @returns True if patronRole >= requiredRole in the hierarchy
 */
export const hasMinimumRole = (
  patronRole: PatronRole | null | undefined,
  requiredRole: PatronRole
): boolean => {
  if (!patronRole) {
    return false;
  }

  const patronLevel = ROLE_LEVELS[patronRole];
  const requiredLevel = ROLE_LEVELS[requiredRole];

  return patronLevel >= requiredLevel;
};
