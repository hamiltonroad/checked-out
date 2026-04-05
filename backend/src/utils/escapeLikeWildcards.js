/**
 * Escape LIKE wildcard characters in a search string
 * @param {string} str - Raw search string
 * @returns {string} Escaped string safe for LIKE patterns
 */
function escapeLikeWildcards(str) {
  return str.replace(/[%_]/g, '\\$&');
}

module.exports = escapeLikeWildcards;
