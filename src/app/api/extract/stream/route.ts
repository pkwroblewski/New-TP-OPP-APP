import { NextRequest } from "next/server";
import { fetchAction } from "convex/nextjs";
import { api } from "../../../../../convex/_generated/api";
import { DEMO_EXTRACTION_RESULT } from "@/lib/demo-data";
import { ExtractionResult } from "@/types/extraction";
import { ExtractionResultSchema } from "@/lib/schema";

// Check if Convex is configured (API key is now stored in Convex env)
const isConvexConfigured = () => {
  const convexUrl = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
  return convexUrl && convexUrl.length > 0;
};

// Rate limiting - simple in-memory store with cleanup
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // requests per window
const RATE_WINDOW = 60 * 1000; // 1 minute
const CLEANUP_INTERVAL = 5 * 60 * 1000; // Clean up every 5 minutes
let lastCleanup = Date.now();

/**
 * Remove expired entries from the rate limit map to prevent memory leaks
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  // Only run cleanup periodically to avoid overhead on every request
  if (now - lastCleanup < CLEANUP_INTERVAL) return;

  lastCleanup = now;
  for (const [ip, record] of requestCounts.entries()) {
    if (now > record.resetTime) {
      requestCounts.delete(ip);
    }
  }
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();

  // Periodically clean up expired entries
  cleanupExpiredEntries();

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

  // Step 2: Send governance (200ms delay) - NEW
  await new Promise((resolve) => setTimeout(resolve, 200));
  sendSSEEvent(controller, encoder, "governance", {
    entity_governance: result.entity_governance,
  });

  // Step 3: Send entity classification (200ms delay)
  await new Promise((resolve) => setTimeout(resolve, 200));
  sendSSEEvent(controller, encoder, "entity", {
    entity_classification: result.entity_classification,
  });

  // Step 4: Send balance sheet (400ms delay)
  await new Promise((resolve) => setTimeout(resolve, 400));
  sendSSEEvent(controller, encoder, "balance_sheet", {
    balance_sheet: result.balance_sheet,
  });

  // Step 5: Send P&L (300ms delay)
  await new Promise((resolve) => setTimeout(resolve, 300));
  sendSSEEvent(controller, encoder, "profit_and_loss", {
    profit_and_loss: result.profit_and_loss,
  });

  // Step 6: Send notes extraction (300ms delay)
  await new Promise((resolve) => setTimeout(resolve, 300));
  sendSSEEvent(controller, encoder, "notes", {
    notes_extraction: result.notes_extraction,
  });

  // Step 7: Send TP analysis (400ms delay)
  await new Promise((resolve) => setTimeout(resolve, 400));
  sendSSEEvent(controller, encoder, "tp_analysis", {
    tp_analysis: result.tp_analysis,
    extraction_cost_usd: result.extraction_cost_usd,
  });

  // Final: Send complete event
  sendSSEEvent(controller, encoder, "complete", { success: true });
}

// Stream real extraction data via Convex action (bypasses Vercel timeout)
async function streamRealData(
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  base64: string
) {
  try {
    // Call Convex action (has 10-minute timeout vs Vercel's 10 seconds)
    // fetchAction uses CONVEX_URL env var automatically
    const response = await fetchAction(api.actions.extractPdf.extractPdf, {
      pdfBase64: base64,
    });

    // Validate the result with Zod schema
    const validationResult = ExtractionResultSchema.safeParse(response.result);
    if (!validationResult.success) {
      console.error("Validation errors:", validationResult.error.errors);
      throw new Error(
        `Extraction validation failed: ${validationResult.error.errors.map((e) => e.message).join(", ")}`
      );
    }

    const result = validationResult.data as ExtractionResult;

    // Stream in chunks with minimal delay for smoother UX
    sendSSEEvent(controller, encoder, "metadata", {
      metadata: result.metadata,
    });
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Send governance if available
    sendSSEEvent(controller, encoder, "governance", {
      entity_governance: result.entity_governance,
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
      extraction_cost_usd: response.cost_usd,
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

        if (!isConvexConfigured()) {
          console.log("Convex not configured - streaming demo data");
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
