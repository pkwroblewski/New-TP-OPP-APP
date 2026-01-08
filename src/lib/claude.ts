import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT, USER_PROMPT } from "./prompts";
import { ExtractionResultSchema } from "./schema";
import type { ExtractionResult } from "@/types/extraction";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Pricing for Claude Sonnet (per 1M tokens)
const SONNET_INPUT_PRICE = 3.0;
const SONNET_OUTPUT_PRICE = 15.0;

export interface ExtractionResponse {
  result: ExtractionResult;
  cost_usd: number;
  input_tokens: number;
  output_tokens: number;
}

/**
 * Extract financial data from a PDF using Claude
 */
export async function extractFromPDF(
  pdfBase64: string
): Promise<ExtractionResponse> {
  // Remove data URL prefix if present
  const base64Data = pdfBase64.replace(/^data:application\/pdf;base64,/, "");

  let response;
  try {
    // Note: Using type assertion because SDK types don't include "document" type yet
    response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: base64Data,
              },
            } as unknown as Anthropic.ImageBlockParam,
            {
              type: "text",
              text: USER_PROMPT,
            },
          ],
        },
      ],
    });
  } catch (error) {
    // Handle Claude API errors with user-friendly messages
    if (error instanceof Anthropic.APIError) {
      const errorMessage = error.message || "";

      // Check for invalid PDF error
      if (errorMessage.includes("PDF specified was not valid") ||
          errorMessage.includes("pdf") && errorMessage.includes("invalid")) {
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

      // Generic API error
      throw new Error(
        `API error: ${errorMessage || "An error occurred while processing your request."}`
      );
    }

    // Re-throw unknown errors
    throw error;
  }

  // Extract text content from response
  const textContent = response.content.find((c) => c.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("No text response from Claude");
  }

  // Parse JSON response
  let parsedResult: unknown;
  try {
    // Clean the response - sometimes Claude adds markdown code blocks
    let jsonText = textContent.text.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.slice(7);
    }
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.slice(3);
    }
    if (jsonText.endsWith("```")) {
      jsonText = jsonText.slice(0, -3);
    }
    parsedResult = JSON.parse(jsonText.trim());
  } catch (e) {
    console.error("Failed to parse Claude response:", textContent.text);
    throw new Error("Invalid JSON response from extraction");
  }

  // Validate with Zod schema
  const validationResult = ExtractionResultSchema.safeParse(parsedResult);
  if (!validationResult.success) {
    console.error("Validation errors:", validationResult.error.errors);
    throw new Error(
      `Extraction validation failed: ${validationResult.error.errors.map((e) => e.message).join(", ")}`
    );
  }

  // Calculate cost
  const inputTokens = response.usage.input_tokens;
  const outputTokens = response.usage.output_tokens;
  const cost =
    (inputTokens * SONNET_INPUT_PRICE + outputTokens * SONNET_OUTPUT_PRICE) /
    1_000_000;

  return {
    result: {
      ...validationResult.data,
      extraction_cost_usd: cost,
    } as ExtractionResult,
    cost_usd: cost,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
  };
}
