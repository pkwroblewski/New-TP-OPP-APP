import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Validator for extraction document (for returns)
const extractionValidator = v.object({
  _id: v.id("extractions"),
  _creationTime: v.number(),
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
  extractionData: v.any(),
  extractionCostUsd: v.optional(v.number()),
  pdfStorageId: v.optional(v.id("_storage")),
});

// List user's extractions (last 30 days)
export const list = query({
  args: {},
  returns: v.array(extractionValidator),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    return await ctx.db
      .query("extractions")
      .withIndex("by_user", (q) =>
        q.eq("userId", identity.subject).gte("_creationTime", thirtyDaysAgo)
      )
      .order("desc")
      .collect();
  },
});

// List all extractions (for team view - no auth filter)
export const listAll = query({
  args: {},
  returns: v.array(extractionValidator),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    // Query with default ordering (by _creationTime) and filter in memory
    // This is efficient for small team usage; for large datasets consider pagination
    const allExtractions = await ctx.db
      .query("extractions")
      .order("desc")
      .collect();

    return allExtractions.filter((e) => e._creationTime >= thirtyDaysAgo);
  },
});

// Generate upload URL for PDF storage
export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    return await ctx.storage.generateUploadUrl();
  },
});

// Save a new extraction
export const save = mutation({
  args: {
    companyName: v.optional(v.string()),
    rcsNumber: v.optional(v.string()),
    financialYearStart: v.optional(v.string()),
    financialYearEnd: v.optional(v.string()),
    currency: v.string(),
    tpScore: v.union(v.literal("A"), v.literal("B"), v.literal("C")),
    totalAssets: v.optional(v.number()),
    totalIcExposure: v.optional(v.number()),
    flagsCount: v.number(),
    extractionData: v.any(),
    extractionCostUsd: v.optional(v.number()),
    pdfStorageId: v.optional(v.id("_storage")),
  },
  returns: v.id("extractions"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    return await ctx.db.insert("extractions", {
      userId: identity.subject,
      ...args,
    });
  },
});

// Get single extraction by ID (with ownership check)
export const get = query({
  args: { id: v.id("extractions") },
  returns: v.union(extractionValidator, v.null()),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const extraction = await ctx.db.get(args.id);
    if (!extraction) return null;

    // Ownership check - users can only access their own extractions
    if (extraction.userId !== identity.subject) {
      return null;
    }

    return extraction;
  },
});

// Delete an extraction (owner only)
export const remove = mutation({
  args: { id: v.id("extractions") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const extraction = await ctx.db.get(args.id);
    if (!extraction) {
      throw new Error("Extraction not found");
    }

    // Ownership check - users can only delete their own extractions
    if (extraction.userId !== identity.subject) {
      throw new Error("Not authorized to delete this extraction");
    }

    // Delete the PDF from storage if it exists
    if (extraction.pdfStorageId) {
      await ctx.storage.delete(extraction.pdfStorageId);
    }

    await ctx.db.delete(args.id);
    return null;
  },
});

// Get PDF URL for an extraction
export const getPdfUrl = query({
  args: { id: v.id("extractions") },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const extraction = await ctx.db.get(args.id);
    if (!extraction) return null;

    // Ownership check
    if (extraction.userId !== identity.subject) {
      return null;
    }

    if (!extraction.pdfStorageId) {
      return null;
    }

    return await ctx.storage.getUrl(extraction.pdfStorageId);
  },
});
