/**
 * Shared helper functions for Claude API interactions
 */

import Anthropic from "@anthropic-ai/sdk";

/**
 * Pricing for Claude Sonnet (per 1M tokens)
 */
export const SONNET_INPUT_PRICE = 3.0;
export const SONNET_OUTPUT_PRICE = 15.0;

/**
 * Calculate cost from token usage
 */
export function calculateCost(inputTokens: number, outputTokens: number): number {
  return (inputTokens * SONNET_INPUT_PRICE + outputTokens * SONNET_OUTPUT_PRICE) / 1_000_000;
}

/**
 * Clean markdown code blocks from JSON response
 * Claude sometimes wraps JSON in markdown code blocks
 */
export function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();

  // Remove opening code fence with optional language tag
  const openingMatch = cleaned.match(/^```(?:json)?\s*/);
  if (openingMatch) {
    cleaned = cleaned.slice(openingMatch[0].length);
  }

  // Remove closing code fence
  const closingMatch = cleaned.match(/\s*```\s*$/);
  if (closingMatch) {
    cleaned = cleaned.slice(0, -closingMatch[0].length);
  }

  return cleaned.trim();
}

/**
 * Remove data URL prefix from base64 PDF string
 */
export function stripBase64Prefix(base64: string): string {
  return base64.replace(/^data:application\/pdf;base64,/, "");
}

/**
 * Handle Anthropic API errors and return user-friendly messages
 */
export function handleAnthropicError(error: unknown): never {
  console.error("Claude API error:", error);

  // Handle connection errors
  if (error instanceof Anthropic.APIConnectionError) {
    throw new Error(
      "Unable to connect to the AI service. Please check your internet connection and try again."
    );
  }

  // Handle Claude API errors with user-friendly messages
  if (error instanceof Anthropic.APIError) {
    const errorMessage = error.message || "";

    // Check for invalid PDF error
    if (
      errorMessage.includes("PDF specified was not valid") ||
      (errorMessage.includes("pdf") && errorMessage.includes("invalid"))
    ) {
      throw new Error(
        "The PDF file could not be processed. Please ensure it is a valid, non-corrupted PDF document with readable content."
      );
    }

    // Check for rate limiting
    if (error.status === 429) {
      throw new Error(
        "API rate limit exceeded. Please wait a moment and try again."
      );
    }

    // Check for authentication errors
    if (error.status === 401) {
      throw new Error(
        "API authentication failed. Please check the API key configuration."
      );
    }

    // Check for overloaded API
    if (error.status === 529 || errorMessage.includes("overloaded")) {
      throw new Error(
        "The AI service is currently overloaded. Please try again in a few moments."
      );
    }

    // Generic API error
    throw new Error(
      `API error: ${errorMessage || "An error occurred while processing your request."}`
    );
  }

  // Handle generic errors with useful message
  if (error instanceof Error) {
    // Check for common error patterns
    if (
      error.message.includes("fetch") ||
      error.message.includes("network") ||
      error.message.includes("ECONNREFUSED")
    ) {
      throw new Error(
        "Network error: Unable to reach the AI service. Please try again."
      );
    }
    throw new Error(`Extraction failed: ${error.message}`);
  }

  // Re-throw unknown errors with generic message
  throw new Error("An unexpected error occurred during extraction. Please try again.");
}
