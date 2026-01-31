import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  extractions: defineTable({
    userId: v.string(),
    companyName: v.optional(v.string()),
    rcsNumber: v.optional(v.string()),
    financialYearStart: v.optional(v.string()),
    financialYearEnd: v.optional(v.string()),
    currency: v.string(),
    tpScore: v.union(v.literal("A"), v.literal("B"), v.literal("C")),
    totalAssets: v.optional(v.number()),
    totalIcExposure: v.optional(v.number()),
    flagsCount: v.number(),
    extractionData: v.any(), // Full JSON extraction result
    extractionCostUsd: v.optional(v.number()),
    pdfStorageId: v.optional(v.id("_storage")), // PDF file in Convex storage
    // Schema version for tracking extraction format changes (Phase 2)
    schemaVersion: v.optional(v.string()),
  })
    .index("by_user", ["userId"]),
    // Note: _creationTime is automatically appended to all indexes,
    // so by_user already supports queries on userId + _creationTime

  // Phase 3: Usage tracking - monthly counters per user
  usage_tracking: defineTable({
    userId: v.string(),
    year: v.number(),
    month: v.number(), // 1-12
    extractionCount: v.number(),
    totalCostUsd: v.number(),
    inputTokensTotal: v.number(),
    outputTokensTotal: v.number(),
  }).index("by_user_year_month", ["userId", "year", "month"]),

  // Phase 3: Audit trail for compliance and debugging
  audit_trail: defineTable({
    userId: v.string(),
    action: v.union(
      v.literal("extraction_started"),
      v.literal("extraction_completed"),
      v.literal("extraction_failed"),
      v.literal("extraction_deleted")
    ),
    extractionId: v.optional(v.id("extractions")),
    pdfStorageId: v.optional(v.id("_storage")),
    metadata: v.optional(v.any()), // Additional context (cost, tokens, error details)
    errorMessage: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_extraction", ["extractionId"]),

  // Phase 3: Rate limiting - sliding window per user
  rate_limits: defineTable({
    userId: v.string(),
    windowStart: v.number(), // Timestamp of window start
    requestCount: v.number(),
    lastRequestAt: v.number(), // Timestamp of last request
  }).index("by_user", ["userId"]),
});
