/**
 * Profanity Word List Configuration
 *
 * This file defines the default list of profane words for content filtering.
 * The list can be extended via the PROFANITY_WORDS_CUSTOM environment variable.
 *
 * Note: This is a minimal list of common English profanity. Libraries may wish
 * to customize this based on their community standards and policies.
 */

/**
 * Default profanity words list
 * @type {string[]}
 */
const DEFAULT_PROFANITY_WORDS = [
  // Common profanity - minimal list for demonstration
  'damn',
  'hell',
  'ass',
  'bastard',
  'bitch',
  'crap',
  'shit',
  'fuck',
  'piss',
];

/**
 * Get profanity words list with optional custom additions
 * @returns {string[]} Combined list of default and custom profanity words
 */
function getProfanityWords() {
  const words = [...DEFAULT_PROFANITY_WORDS];

  // Add custom words from environment variable if provided
  const customWords = process.env.PROFANITY_WORDS_CUSTOM;
  if (customWords) {
    const additionalWords = customWords
      .split(',')
      .map((word) => word.trim().toLowerCase())
      .filter((word) => word.length > 0);
    words.push(...additionalWords);
  }

  return words;
}

module.exports = {
  DEFAULT_PROFANITY_WORDS,
  getProfanityWords,
};
