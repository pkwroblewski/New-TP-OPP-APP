import { NextRequest, NextResponse } from "next/server";
import { extractFromPDF } from "@/lib/claude";
import { DEMO_EXTRACTION_RESULT } from "@/lib/demo-data";

// Check if API key is configured
const isApiKeyConfigured = () => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  return apiKey && apiKey !== "your_api_key_here" && apiKey.length > 10;
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

export async function POST(request: NextRequest) {
  // Get client IP for rate limiting
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown";

  // Check rate limit
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait before trying again." },
      { status: 429 }
    );
  }

  try {
    // Parse form data
    const formData = await request.formData();
    const fileField = formData.get("file");

    // Type check - formData.get() can return string, File, or null
    if (!fileField) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!(fileField instanceof File)) {
      return NextResponse.json(
        { error: "Invalid file field. Expected a file upload." },
        { status: 400 }
      );
    }

    const file = fileField;

    // Validate file type
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a PDF file." },
        { status: 400 }
      );
    }

    // Validate file size (50MB max)
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 50MB." },
        { status: 400 }
      );
    }

    // Check if API key is configured - if not, return demo data
    if (!isApiKeyConfigured()) {
      console.log("API key not configured - returning demo data");
      // Simulate extraction delay for realistic UX
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return NextResponse.json(DEMO_EXTRACTION_RESULT);
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    // Extract data using Claude
    const { result } = await extractFromPDF(base64);

    // Return extraction result
    return NextResponse.json(result);
  } catch (error) {
    console.error("Extraction error:", error);

    // Handle specific error types
    if (error instanceof Error) {
      // Handle authentication errors from Anthropic API
      if (error.message.includes("authentication") || error.message.includes("invalid x-api-key") || error.message.includes("401")) {
        return NextResponse.json(
          {
            error:
              "API key not configured. Please set ANTHROPIC_API_KEY in environment variables.",
          },
          { status: 401 }
        );
      }

      if (error.message.includes("API")) {
        return NextResponse.json(
          {
            error:
              "Failed to connect to extraction service. Please try again.",
          },
          { status: 503 }
        );
      }

      if (error.message.includes("validation")) {
        return NextResponse.json(
          {
            error:
              "Failed to parse document. The PDF may be corrupt or unreadable.",
          },
          { status: 422 }
        );
      }

      if (error.message.includes("timeout")) {
        return NextResponse.json(
          {
            error:
              "Extraction timed out. Please try with a smaller document.",
          },
          { status: 408 }
        );
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "An unexpected error occurred during extraction." },
      { status: 500 }
    );
  }
}

// Handle timeout
export const maxDuration = 60; // 60 seconds max
