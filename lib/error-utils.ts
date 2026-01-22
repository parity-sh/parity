/**
 * Frontend utilities for handling and displaying errors
 */

/**
 * Extract a user-friendly error message from any error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Check for common error patterns and provide friendly messages
    const msg = error.message.toLowerCase();

    if (msg.includes("unauthorized") || msg.includes("logged in")) {
      return "Please sign in to continue.";
    }

    if (msg.includes("not found")) {
      return error.message;
    }

    if (msg.includes("network") || msg.includes("fetch failed")) {
      return "Network error. Please check your connection and try again.";
    }

    if (msg.includes("timeout")) {
      return "Request timed out. Please try again.";
    }

    if (msg.includes("rate limit") || msg.includes("too many requests")) {
      return "Too many requests. Please wait a moment and try again.";
    }

    // Return the original message if it's already user-friendly
    return error.message || "An unexpected error occurred.";
  }

  if (typeof error === "string") {
    return error;
  }

  return "An unexpected error occurred. Please try again.";
}

/**
 * Check if an error indicates the user needs to authenticate
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return msg.includes("unauthorized") || msg.includes("logged in");
  }
  return false;
}

/**
 * Check if an error is a network-related error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes("network") ||
      msg.includes("fetch failed") ||
      msg.includes("connection")
    );
  }
  return false;
}

/**
 * Check if an error is a validation error
 */
export function isValidationError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes("invalid") ||
      msg.includes("required") ||
      msg.includes("must be")
    );
  }
  return false;
}
