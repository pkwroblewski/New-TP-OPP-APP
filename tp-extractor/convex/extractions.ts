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

    // Note: Without userId filter, we use default ordering with filter
    // For better performance with large datasets, consider a separate index
    const allExtractions = await ctx.db
      .query("extractions")
      .order("desc")
      .collect();

    // Filter in memory for 30-day window (acceptable for small team usage)
    return allExtractions.filter((e) => e._creationTime >= thirtyDaysAgo);
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

// Get single extraction by ID
export const get = query({
  args: { id: v.id("extractions") },
  returns: v.union(extractionValidator, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Delete an extraction
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

    // Team members can delete any extraction
    await ctx.db.delete(args.id);
    return null;
  },
});
