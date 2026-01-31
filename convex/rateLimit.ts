import { query, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

/**
 * Rate limit configuration
 */
const DEFAULT_REQUESTS_PER_MINUTE = 10;
const WINDOW_SIZE_MS = 60 * 1000; // 1 minute

/**
 * Rate limit status returned to callers
 */
const rateLimitStatusValidator = v.object({
  allowed: v.boolean(),
  remaining: v.number(),
  resetAt: v.number(), // Timestamp when window resets
  retryAfterMs: v.union(v.number(), v.null()), // Ms to wait if rate limited
});

/**
 * Check if a user is rate limited (internal query for actions)
 * Uses sliding window algorithm
 */
export const checkRateLimit = internalQuery({
  args: {
    userId: v.string(),
    maxRequests: v.optional(v.number()),
  },
  returns: rateLimitStatusValidator,
  handler: async (ctx, args) => {
    const maxRequests = args.maxRequests ?? DEFAULT_REQUESTS_PER_MINUTE;
    const now = Date.now();
    const windowStart = now - WINDOW_SIZE_MS;

    // Get existing rate limit record
    const existing = await ctx.db
      .query("rate_limits")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    // If no record exists or window has expired, user is allowed
    if (!existing || existing.windowStart < windowStart) {
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetAt: now + WINDOW_SIZE_MS,
        retryAfterMs: null,
      };
    }

    // Check if under limit
    const remaining = Math.max(0, maxRequests - existing.requestCount);
    const resetAt = existing.windowStart + WINDOW_SIZE_MS;

    if (existing.requestCount < maxRequests) {
      return {
        allowed: true,
        remaining: remaining - 1, // Account for this request
        resetAt,
        retryAfterMs: null,
      };
    }

    // Rate limited
    const retryAfterMs = Math.max(0, resetAt - now);
    return {
      allowed: false,
      remaining: 0,
      resetAt,
      retryAfterMs,
    };
  },
});

/**
 * Record a request for rate limiting (internal mutation for actions)
 * Should be called after checkRateLimit returns allowed: true
 */
export const recordRequest = internalMutation({
  args: {
    userId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const now = Date.now();
    const windowStart = now - WINDOW_SIZE_MS;

    // Get existing record
    const existing = await ctx.db
      .query("rate_limits")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (!existing) {
      // Create new record
      await ctx.db.insert("rate_limits", {
        userId: args.userId,
        windowStart: now,
        requestCount: 1,
        lastRequestAt: now,
      });
    } else if (existing.windowStart < windowStart) {
      // Window expired, reset
      await ctx.db.patch(existing._id, {
        windowStart: now,
        requestCount: 1,
        lastRequestAt: now,
      });
    } else {
      // Increment counter in current window
      await ctx.db.patch(existing._id, {
        requestCount: existing.requestCount + 1,
        lastRequestAt: now,
      });
    }

    return null;
  },
});

/**
 * Get rate limit status for the current user (public query)
 */
export const getRateLimitStatus = query({
  args: {},
  returns: v.union(rateLimitStatusValidator, v.null()),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const userId = identity.subject;
    const maxRequests = DEFAULT_REQUESTS_PER_MINUTE;
    const now = Date.now();
    const windowStart = now - WINDOW_SIZE_MS;

    // Get existing rate limit record
    const existing = await ctx.db
      .query("rate_limits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    // If no record exists or window has expired
    if (!existing || existing.windowStart < windowStart) {
      return {
        allowed: true,
        remaining: maxRequests,
        resetAt: now + WINDOW_SIZE_MS,
        retryAfterMs: null,
      };
    }

    // Calculate status
    const remaining = Math.max(0, maxRequests - existing.requestCount);
    const resetAt = existing.windowStart + WINDOW_SIZE_MS;

    if (remaining > 0) {
      return {
        allowed: true,
        remaining,
        resetAt,
        retryAfterMs: null,
      };
    }

    // Rate limited
    const retryAfterMs = Math.max(0, resetAt - now);
    return {
      allowed: false,
      remaining: 0,
      resetAt,
      retryAfterMs,
    };
  },
});

/**
 * Clean up old rate limit records (for maintenance)
 * Removes records older than 1 hour
 */
export const cleanupOldRecords = internalMutation({
  args: {},
  returns: v.number(), // Number of deleted records
  handler: async (ctx) => {
    const cutoffTime = Date.now() - 60 * 60 * 1000; // 1 hour ago

    const oldRecords = await ctx.db
      .query("rate_limits")
      .filter((q) => q.lt(q.field("lastRequestAt"), cutoffTime))
      .take(100); // Process in batches

    let deletedCount = 0;
    for (const record of oldRecords) {
      await ctx.db.delete(record._id);
      deletedCount++;
    }

    return deletedCount;
  },
});
