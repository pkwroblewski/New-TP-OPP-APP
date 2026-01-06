import { NextRequest } from "next/server";
import { extractFromPDF } from "@/lib/claude";
import { DEMO_EXTRACTION_RESULT } from "@/lib/demo-data";
import { ExtractionResult } from "@/types/extraction";

// Check if API key is configured
const isApiKeyConfigured = () => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  return apiKey && apiKey !== "your_api_key_here" && apiKey.length > 10;
};

// Rate limiting - simple in-memory store
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // requests per window
const RATE_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

// Helper to send SSE event
function sendSSEEvent(
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  eventType: string,
  data: unknown
) {
  const eventData = JSON.stringify(data);
  controller.enqueue(encoder.encode(`event: ${eventType}\n`));
  controller.enqueue(encoder.encode(`data: ${eventData}\n\n`));
}

// Split the demo result into streaming chunks with delays
async function streamDemoData(
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder
) {
  const result = DEMO_EXTRACTION_RESULT;

  // Step 1: Send metadata (400ms delay to simulate start)
  await new Promise((resolve) => setTimeout(resolve, 400));
  sendSSEEvent(controller, encoder, "metadata", {
    metadata: result.metadata,
  });

  // Step 2: Send entity classification (200ms delay)
  await new Promise((resolve) => setTimeout(resolve, 200));
  sendSSEEvent(controller, encoder, "entity", {
    entity_classification: result.entity_classification,
  });

  // Step 3: Send balance sheet (400ms delay)
  await new Promise((resolve) => setTimeout(resolve, 400));
  sendSSEEvent(controller, encoder, "balance_sheet", {
    balance_sheet: result.balance_sheet,
  });

  // Step 4: Send P&L (300ms delay)
  await new Promise((resolve) => setTimeout(resolve, 300));
  sendSSEEvent(controller, encoder, "profit_and_loss", {
    profit_and_loss: result.profit_and_loss,
  });

  // Step 5: Send notes extraction (300ms delay)
  await new Promise((resolve) => setTimeout(resolve, 300));
  sendSSEEvent(controller, encoder, "notes", {
    notes_extraction: result.notes_extraction,
  });

  // Step 6: Send TP analysis (400ms delay)
  await new Promise((resolve) => setTimeout(resolve, 400));
  sendSSEEvent(controller, encoder, "tp_analysis", {
    tp_analysis: result.tp_analysis,
    extraction_cost_usd: result.extraction_cost_usd,
  });

  // Final: Send complete event
  sendSSEEvent(controller, encoder, "complete", { success: true });
}

// Stream real extraction data
async function streamRealData(
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  base64: string
) {
  try {
    // Call Claude API
    const { result } = await extractFromPDF(base64);

    // Stream in chunks with minimal delay for smoother UX
    sendSSEEvent(controller, encoder, "metadata", {
      metadata: result.metadata,
    });
    await new Promise((resolve) => setTimeout(resolve, 50));

    sendSSEEvent(controller, encoder, "entity", {
      entity_classification: result.entity_classification,
    });
    await new Promise((resolve) => setTimeout(resolve, 50));

    sendSSEEvent(controller, encoder, "balance_sheet", {
      balance_sheet: result.balance_sheet,
    });
    await new Promise((resolve) => setTimeout(resolve, 50));

    sendSSEEvent(controller, encoder, "profit_and_loss", {
      profit_and_loss: result.profit_and_loss,
    });
    await new Promise((resolve) => setTimeout(resolve, 50));

    sendSSEEvent(controller, encoder, "notes", {
      notes_extraction: result.notes_extraction,
    });
    await new Promise((resolve) => setTimeout(resolve, 50));

    sendSSEEvent(controller, encoder, "tp_analysis", {
      tp_analysis: result.tp_analysis,
      extraction_cost_usd: result.extraction_cost_usd,
    });

    sendSSEEvent(controller, encoder, "complete", { success: true });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";
    sendSSEEvent(controller, encoder, "error", { error: errorMessage });
  }
}

export async function POST(request: NextRequest) {
  // Get client IP for rate limiting
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown";

  // Check rate limit
  if (!checkRateLimit(ip)) {
    return new Response(
      JSON.stringify({
        error: "Rate limit exceeded. Please wait before trying again.",
      }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return new Response(
        JSON.stringify({
          error: "Invalid file type. Please upload a PDF file.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate file size (50MB max)
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return new Response(
        JSON.stringify({ error: "File too large. Maximum size is 50MB." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Send initial connection event
        sendSSEEvent(controller, encoder, "connected", {
          message: "Extraction started",
        });

        if (!isApiKeyConfigured()) {
          console.log("API key not configured - streaming demo data");
          await streamDemoData(controller, encoder);
        } else {
          // Convert file to base64
          const arrayBuffer = await file.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString("base64");
          await streamRealData(controller, encoder, base64);
        }

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Extraction error:", error);

    if (error instanceof Error) {
      if (
        error.message.includes("authentication") ||
        error.message.includes("invalid x-api-key") ||
        error.message.includes("401")
      ) {
        return new Response(
          JSON.stringify({
            error:
              "API key not configured. Please set ANTHROPIC_API_KEY in environment variables.",
          }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }

      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred during extraction.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Handle timeout
export const maxDuration = 60; // 60 seconds max
