/**
 * Parse tags from snippet data, handling both string and array formats
 * @param {string|array} tags - Tags data from snippet
 * @returns {array} Parsed tags array
 */
export const parseTags = (tags) => {
  if (!tags) return [];
  
  try {
    return typeof tags === 'string' ? JSON.parse(tags) : tags;
  } catch (e) {
    console.warn('Failed to parse tags:', e);
    return [];
  }
};

/**
 * Parse attachments from snippet data, handling both string and array formats
 * @param {string|array} attachments - Attachments data from snippet
 * @returns {array} Parsed attachments array
 */
export const parseAttachments = (attachments) => {
  if (!attachments) return [];
  
  try {
    return typeof attachments === 'string' ? JSON.parse(attachments) : attachments;
  } catch (e) {
    console.warn('Failed to parse attachments:', e);
    return [];
  }
};

/**
 * Format date safely with validation
 * @param {string} dateString - Date string to format
 * @param {string} fallback - Fallback text if date is invalid
 * @returns {string} Formatted date or fallback
 */
export const formatDate = (dateString, fallback = 'Unknown date') => {
  if (!dateString) return fallback;
  
  const date = new Date(dateString);
  return !isNaN(date) ? date.toLocaleDateString() : fallback;
};

/**
 * Get language-specific color classes for UI
 * @param {string} language - Programming language
 * @returns {string} CSS classes for language badge
 */
export const getLanguageColor = (language) => {
  const colors = {
    JavaScript: 'bg-warning-light/10 text-warning-light dark:bg-warning-dark/10 dark:text-warning-dark',
    Python: 'bg-success-light/10 text-success-light dark:bg-success-dark/10 dark:text-success-dark',
    CSS: 'bg-info-light/10 text-info-light dark:bg-info-dark/10 dark:text-info-dark',
    HTML: 'bg-danger-light/10 text-danger-light dark:bg-danger-dark/10 dark:text-danger-dark',
    TypeScript: 'bg-primary-light/10 text-primary-light dark:bg-primary-dark/10 dark:text-primary-dark',
    Java: 'bg-secondary-light/10 text-secondary-light dark:bg-secondary-dark/10 dark:text-secondary-dark',
    Go: 'bg-info-light/10 text-info-light dark:bg-info-dark/10 dark:text-info-dark',
    Rust: 'bg-danger-light/10 text-danger-light dark:bg-danger-dark/10 dark:text-danger-dark',
    PHP: 'bg-primary-light/10 text-primary-light dark:bg-primary-dark/10 dark:text-primary-dark',
    Ruby: 'bg-danger-light/10 text-danger-light dark:bg-danger-dark/10 dark:text-danger-dark',
    Swift: 'bg-warning-light/10 text-warning-light dark:bg-warning-dark/10 dark:text-warning-dark',
    Kotlin: 'bg-primary-light/10 text-primary-light dark:bg-primary-dark/10 dark:text-primary-dark',
    Shell: 'bg-text-secondary-light/10 text-text-secondary-light dark:bg-text-secondary-dark/10 dark:text-text-secondary-dark',
    JSON: 'bg-warning-light/10 text-warning-light dark:bg-warning-dark/10 dark:text-warning-dark',
    XML: 'bg-info-light/10 text-info-light dark:bg-info-dark/10 dark:text-info-dark',
    SQL: 'bg-success-light/10 text-success-light dark:bg-success-dark/10 dark:text-success-dark'
  };
  
  return colors[language] || 'bg-primary-light/10 text-primary-light dark:bg-primary-dark/10 dark:text-primary-dark';
};

/**
 * Truncate text to specified length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Generate a random public ID for snippets
 * @param {number} length - Length of the ID
 * @returns {string} Random public ID
 */
export const generatePublicId = (length = 6) => {
  return Math.random().toString(36).substring(2, 2 + length);
};