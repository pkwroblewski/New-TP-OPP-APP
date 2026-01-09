import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT, USER_PROMPT } from "./prompts";
import { ExtractionResultSchema } from "./schema";
import {
  calculateCost,
  cleanJsonResponse,
  stripBase64Prefix,
  handleAnthropicError,
} from "./claude-helpers";
import type { ExtractionResult } from "@/types/extraction";

// Lazily initialize Anthropic client to ensure env vars are available
let anthropicClient: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY environment variable is not configured");
    }
    anthropicClient = new Anthropic({ apiKey });
  }
  return anthropicClient;
}

export interface ExtractionResponse {
  result: ExtractionResult;
  cost_usd: number;
  input_tokens: number;
  output_tokens: number;
}

/**
 * Extract financial data from a PDF using Claude
 */
export async function extractFromPDF(pdfBase64: string): Promise<ExtractionResponse> {
  const base64Data = stripBase64Prefix(pdfBase64);

  let response;
  try {
    const anthropic = getAnthropicClient();

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
    handleAnthropicError(error);
  }

  // Extract text content from response
  const textContent = response.content.find((c) => c.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("No text response from Claude");
  }

  // Parse JSON response
  let parsedResult: unknown;
  try {
    const jsonText = cleanJsonResponse(textContent.text);
    parsedResult = JSON.parse(jsonText);
  } catch {
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
  const cost = calculateCost(inputTokens, outputTokens);

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
