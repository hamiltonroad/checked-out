const SALT_ROUNDS = 12;
const HOLD_EXPIRY_DAYS = 3;

// Canonical dev/seed password. Used by seeders and e2e tests
// (frontend e2e reads via DEV_PASSWORD env var, fallback must match).
const DEV_PASSWORD = 'welcome123';

module.exports = { SALT_ROUNDS, HOLD_EXPIRY_DAYS, DEV_PASSWORD };
