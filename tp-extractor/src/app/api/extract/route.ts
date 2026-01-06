import { NextRequest, NextResponse } from "next/server";
import { extractFromPDF } from "@/lib/claude";

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
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

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
