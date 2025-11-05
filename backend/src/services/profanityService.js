const { getProfanityWords } = require('../utils/profanityWords');

/**
 * Profanity Detection Service
 *
 * Provides profanity detection for book titles and other text content.
 * Uses whole-word matching to avoid false positives.
 */
class ProfanityService {
  constructor() {
    this.profanityWords = getProfanityWords();

    // Create word boundary regex pattern for whole-word matching
    this.pattern = new RegExp(`\\b(${this.profanityWords.join('|')})\\b`, 'gi');
  }

  /**
   * Check if text contains profanity
   * @param {string} text - Text to check for profanity
   * @returns {boolean} True if text contains profanity, false otherwise
   */
  containsProfanity(text) {
    if (!text || typeof text !== 'string') {
      return false;
    }

    // Test against regex pattern for whole-word matches
    return this.pattern.test(text);
  }

  /**
   * Clean profanity from text by replacing with asterisks
   * @param {string} text - Text to clean
   * @returns {string} Cleaned text with profanity replaced
   */
  cleanText(text) {
    if (!text || typeof text !== 'string') {
      return text;
    }

    return text.replace(this.pattern, (match) => '*'.repeat(match.length));
  }

  /**
   * Check if a book title contains profanity
   * @param {string} title - Book title to check
   * @returns {boolean} True if title contains profanity
   */
  checkBookTitle(title) {
    return this.containsProfanity(title);
  }
}

module.exports = new ProfanityService();
