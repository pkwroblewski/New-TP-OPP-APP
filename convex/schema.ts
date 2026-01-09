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
  })
    .index("by_user", ["userId"]),
    // Note: _creationTime is automatically appended to all indexes,
    // so by_user already supports queries on userId + _creationTime
});
