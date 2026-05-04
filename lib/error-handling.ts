/**
 * Error logging and handling utilities for Server Actions
 * Provides structured error context and logging
 */

export type ErrorContext = {
  action: string;
  userId?: string;
  postId?: string;
  error: unknown;
  context?: Record<string, any>;
};

/**
 * Log an error with context
 * In production, this could send to Sentry, DataDog, etc.
 */
export function logError(errorContext: ErrorContext): void {
  const { action, userId, error, context } = errorContext;

  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${action}]`, {
      userId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      context,
    });
  }

  // TODO: Send to external logging service in production
  // Example: Sentry.captureException(error, { tags: { action } })
}

/**
 * Assert that a value is not null or undefined
 * Useful for type narrowing in Server Actions
 */
export function assertExists<T>(
  value: T | null | undefined,
  message: string
): asserts value is T {
  if (value == null) {
    throw new Error(message);
  }
}

/**
 * Safely parse JSON with error logging
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    logError({ action: 'safeJsonParse', error });
    return fallback;
  }
}
