/**
 * Input validation and sanitization utilities for Server Actions
 */

/**
 * Sanitize text input by removing HTML tags and entities
 * @param text - Raw user input
 * @returns Sanitized text safe from XSS
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/<[^>]*>?/gm, '') // Remove HTML tags
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/[<>]/g, '') // Remove any remaining angle brackets
    .trim();
}

/**
 * Validate text length
 * @param text - Text to validate
 * @param minLength - Minimum length (default: 1)
 * @param maxLength - Maximum length (required)
 * @returns Error message if invalid, null if valid
 */
export function validateTextLength(
  text: string,
  maxLength: number,
  minLength: number = 1
): string | null {
  const trimmed = text?.trim() ?? '';

  if (trimmed.length < minLength) {
    return `Please write something before posting.`;
  }

  if (trimmed.length > maxLength) {
    return `Your input is too long. Please keep it under ${maxLength} characters.`;
  }

  return null;
}

/**
 * Check if text contains HTML tags
 * @param text - Text to check
 * @returns True if HTML tags are detected
 */
export function containsHtmlTags(text: string): boolean {
  return /<[^>]*>/.test(text);
}

/**
 * Validate post title
 * @param title - Post title to validate
 * @returns Error message if invalid, null if valid
 */
export function validatePostTitle(title: string): string | null {
  if (containsHtmlTags(title)) {
    return 'HTML tags are not allowed in posts.';
  }

  const lengthError = validateTextLength(title, 50, 1);
  if (lengthError) {
    return lengthError.replace('Your input', 'Your post');
  }

  return null;
}

/**
 * Validate comment text
 * @param comment - Comment text to validate
 * @returns Error message if invalid, null if valid
 */
export function validateCommentText(comment: string): string | null {
  if (containsHtmlTags(comment)) {
    return 'HTML tags are not allowed in comments.';
  }

  const lengthError = validateTextLength(comment, 30, 1);
  if (lengthError) {
    return lengthError.replace('Your input', 'Your comment');
  }

  return null;
}
