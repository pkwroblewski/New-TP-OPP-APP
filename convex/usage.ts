import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Record usage after a successful extraction
 * Called internally after extraction completes
 */
export const recordUsage = internalMutation({
  args: {
    userId: v.string(),
    costUsd: v.number(),
    inputTokens: v.number(),
    outputTokens: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 1-12

    // Find existing record for this user/month
    const existing = await ctx.db
      .query("usage_tracking")
      .withIndex("by_user_year_month", (q) =>
        q.eq("userId", args.userId).eq("year", year).eq("month", month)
      )
      .unique();

    if (existing) {
      // Update existing record
      await ctx.db.patch(existing._id, {
        extractionCount: existing.extractionCount + 1,
        totalCostUsd: existing.totalCostUsd + args.costUsd,
        inputTokensTotal: existing.inputTokensTotal + args.inputTokens,
        outputTokensTotal: existing.outputTokensTotal + args.outputTokens,
      });
    } else {
      // Create new record
      await ctx.db.insert("usage_tracking", {
        userId: args.userId,
        year,
        month,
        extractionCount: 1,
        totalCostUsd: args.costUsd,
        inputTokensTotal: args.inputTokens,
        outputTokensTotal: args.outputTokens,
      });
    }

    return null;
  },
});

/**
 * Get current month's usage for a user
 */
export const getMonthlyUsage = query({
  args: {},
  returns: v.union(
    v.object({
      userId: v.string(),
      year: v.number(),
      month: v.number(),
      extractionCount: v.number(),
      totalCostUsd: v.number(),
      inputTokensTotal: v.number(),
      outputTokensTotal: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const userId = identity.subject;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const usage = await ctx.db
      .query("usage_tracking")
      .withIndex("by_user_year_month", (q) =>
        q.eq("userId", userId).eq("year", year).eq("month", month)
      )
      .unique();

    if (!usage) {
      return null;
    }

    return {
      userId: usage.userId,
      year: usage.year,
      month: usage.month,
      extractionCount: usage.extractionCount,
      totalCostUsd: usage.totalCostUsd,
      inputTokensTotal: usage.inputTokensTotal,
      outputTokensTotal: usage.outputTokensTotal,
    };
  },
});

/**
 * Get user's usage for a date range
 */
export const getUserUsage = query({
  args: {
    startYear: v.optional(v.number()),
    startMonth: v.optional(v.number()),
    endYear: v.optional(v.number()),
    endMonth: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      year: v.number(),
      month: v.number(),
      extractionCount: v.number(),
      totalCostUsd: v.number(),
      inputTokensTotal: v.number(),
      outputTokensTotal: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const userId = identity.subject;
    const now = new Date();

    // Default to current year if not specified
    const startYear = args.startYear ?? now.getFullYear();
    const startMonth = args.startMonth ?? 1;
    const endYear = args.endYear ?? now.getFullYear();
    const endMonth = args.endMonth ?? 12;

    // Query all records for this user (we'll filter in memory since Convex
    // doesn't support complex range queries across multiple fields)
    const allRecords = await ctx.db
      .query("usage_tracking")
      .withIndex("by_user_year_month", (q) => q.eq("userId", userId))
      .collect();

    // Filter to date range
    const filtered = allRecords.filter((record) => {
      const recordDate = record.year * 12 + record.month;
      const startDate = startYear * 12 + startMonth;
      const endDate = endYear * 12 + endMonth;
      return recordDate >= startDate && recordDate <= endDate;
    });

    // Sort by date
    filtered.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

    return filtered.map((r) => ({
      year: r.year,
      month: r.month,
      extractionCount: r.extractionCount,
      totalCostUsd: r.totalCostUsd,
      inputTokensTotal: r.inputTokensTotal,
      outputTokensTotal: r.outputTokensTotal,
    }));
  },
});

/**
 * Check if user is under usage limit (for future quota enforcement)
 * Currently returns true (no limits enforced)
 */
export const checkUsageLimit = query({
  args: {
    monthlyLimit: v.optional(v.number()), // Max extractions per month
  },
  returns: v.object({
    allowed: v.boolean(),
    currentCount: v.number(),
    limit: v.union(v.number(), v.null()),
    remaining: v.union(v.number(), v.null()),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        allowed: false,
        currentCount: 0,
        limit: null,
        remaining: null,
      };
    }

    const userId = identity.subject;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const usage = await ctx.db
      .query("usage_tracking")
      .withIndex("by_user_year_month", (q) =>
        q.eq("userId", userId).eq("year", year).eq("month", month)
      )
      .unique();

    const currentCount = usage?.extractionCount ?? 0;
    const limit = args.monthlyLimit ?? null;

    // If no limit set, always allow
    if (limit === null) {
      return {
        allowed: true,
        currentCount,
        limit: null,
        remaining: null,
      };
    }

    const remaining = Math.max(0, limit - currentCount);
    return {
      allowed: currentCount < limit,
      currentCount,
      limit,
      remaining,
    };
  },
});
