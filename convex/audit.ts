import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

/**
 * Audit event action types
 */
const auditActionValidator = v.union(
  v.literal("extraction_started"),
  v.literal("extraction_completed"),
  v.literal("extraction_failed"),
  v.literal("extraction_deleted")
);

/**
 * Log an audit event (internal use)
 * Called by extractPdf action and other internal functions
 */
export const logEvent = internalMutation({
  args: {
    userId: v.string(),
    action: auditActionValidator,
    extractionId: v.optional(v.id("extractions")),
    pdfStorageId: v.optional(v.id("_storage")),
    metadata: v.optional(v.any()),
    errorMessage: v.optional(v.string()),
  },
  returns: v.id("audit_trail"),
  handler: async (ctx, args) => {
    const auditId = await ctx.db.insert("audit_trail", {
      userId: args.userId,
      action: args.action,
      extractionId: args.extractionId,
      pdfStorageId: args.pdfStorageId,
      metadata: args.metadata,
      errorMessage: args.errorMessage,
    });

    return auditId;
  },
});

/**
 * Get audit trail for a specific extraction
 */
export const getExtractionHistory = query({
  args: {
    extractionId: v.id("extractions"),
  },
  returns: v.array(
    v.object({
      _id: v.id("audit_trail"),
      _creationTime: v.number(),
      action: auditActionValidator,
      metadata: v.optional(v.any()),
      errorMessage: v.optional(v.string()),
    })
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const events = await ctx.db
      .query("audit_trail")
      .withIndex("by_extraction", (q) => q.eq("extractionId", args.extractionId))
      .order("asc")
      .collect();

    // Only return events for the current user's extractions
    const userEvents = events.filter((e) => e.userId === identity.subject);

    return userEvents.map((e) => ({
      _id: e._id,
      _creationTime: e._creationTime,
      action: e.action,
      metadata: e.metadata,
      errorMessage: e.errorMessage,
    }));
  },
});

/**
 * Get user's recent activity
 */
export const getUserActivity = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("audit_trail"),
      _creationTime: v.number(),
      action: auditActionValidator,
      extractionId: v.optional(v.id("extractions")),
      pdfStorageId: v.optional(v.id("_storage")),
      metadata: v.optional(v.any()),
      errorMessage: v.optional(v.string()),
    })
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const userId = identity.subject;
    const limit = args.limit ?? 50;

    const events = await ctx.db
      .query("audit_trail")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);

    return events.map((e) => ({
      _id: e._id,
      _creationTime: e._creationTime,
      action: e.action,
      extractionId: e.extractionId,
      pdfStorageId: e.pdfStorageId,
      metadata: e.metadata,
      errorMessage: e.errorMessage,
    }));
  },
});

/**
 * Delete old audit events (for maintenance)
 * Keeps last 90 days of events
 */
export const cleanupOldEvents = internalMutation({
  args: {
    retentionDays: v.optional(v.number()),
  },
  returns: v.number(), // Number of deleted events
  handler: async (ctx, args) => {
    const retentionDays = args.retentionDays ?? 90;
    const cutoffTime = Date.now() - retentionDays * 24 * 60 * 60 * 1000;

    // Get old events (created before cutoff)
    // Note: We query without index since _creationTime is a system field
    const oldEvents = await ctx.db
      .query("audit_trail")
      .filter((q) => q.lt(q.field("_creationTime"), cutoffTime))
      .take(1000); // Process in batches

    let deletedCount = 0;
    for (const event of oldEvents) {
      await ctx.db.delete(event._id);
      deletedCount++;
    }

    return deletedCount;
  },
});
