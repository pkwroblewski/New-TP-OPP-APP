/**
 * Retry helpers for transient error handling
 * Implements exponential backoff with jitter for Claude API calls
 */

/**
 * Promise-based delay
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff with jitter
 * @param attempt - Current attempt number (0-indexed)
 * @param baseMs - Base delay in milliseconds (default 1000ms)
 * @returns Delay in milliseconds with random jitter
 */
export function calculateBackoff(attempt: number, baseMs = 1000): number {
  // Exponential: 1s, 2s, 4s, 8s...
  const exponentialDelay = baseMs * Math.pow(2, attempt);
  // Add random jitter (0-25% of delay) to prevent thundering herd
  const jitter = Math.random() * exponentialDelay * 0.25;
  return Math.floor(exponentialDelay + jitter);
}

/**
 * Check if an error is retryable (transient)
 * Retryable errors: 429 (rate limit), 529 (overloaded), network errors
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Network errors
    if (
      message.includes("network") ||
      message.includes("timeout") ||
      message.includes("econnreset") ||
      message.includes("econnrefused") ||
      message.includes("socket hang up")
    ) {
      return true;
    }

    // Check for Anthropic API error codes in message
    if (message.includes("429") || message.includes("rate limit")) {
      return true;
    }
    if (message.includes("529") || message.includes("overloaded")) {
      return true;
    }
    if (message.includes("503") || message.includes("service unavailable")) {
      return true;
    }
  }

  // Check for Anthropic SDK error shape
  if (error && typeof error === "object") {
    const err = error as { status?: number; error?: { type?: string } };

    // HTTP status codes that are retryable
    if (err.status === 429 || err.status === 529 || err.status === 503) {
      return true;
    }

    // Anthropic error types
    if (err.error?.type === "overloaded_error" || err.error?.type === "rate_limit_error") {
      return true;
    }
  }

  return false;
}

/**
 * Options for retry wrapper
 */
export interface RetryOptions {
  /** Maximum number of retry attempts (default 3) */
  maxRetries?: number;
  /** Base delay in milliseconds (default 1000) */
  baseDelayMs?: number;
  /** Optional callback for logging retry attempts */
  onRetry?: (attempt: number, error: unknown, delayMs: number) => void;
}

/**
 * Wrap an async function with retry logic
 * @param fn - Async function to retry
 * @param options - Retry configuration
 * @returns Result of the function
 * @throws Last error if all retries fail
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxRetries = 3, baseDelayMs = 1000, onRetry } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // If not retryable or last attempt, throw immediately
      if (!isRetryableError(error) || attempt === maxRetries) {
        throw error;
      }

      // Calculate delay and wait
      const delayMs = calculateBackoff(attempt, baseDelayMs);

      // Log retry attempt if callback provided
      if (onRetry) {
        onRetry(attempt + 1, error, delayMs);
      }

      await sleep(delayMs);
    }
  }

  // Should never reach here, but TypeScript needs this
  throw lastError;
}
