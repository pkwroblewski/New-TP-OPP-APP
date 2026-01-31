/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type { FunctionReference } from "convex/server";
import type { GenericId as Id } from "convex/values";

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: {
  actions: {
    extractPdf: {
      extractPdf: FunctionReference<
        "action",
        "public",
        { pdfStorageId: Id<"_storage"> },
        {
          cost_usd: number;
          input_tokens: number;
          output_tokens: number;
          result: any;
        }
      >;
    };
  };
  audit: {
    getExtractionHistory: FunctionReference<
      "query",
      "public",
      { extractionId: Id<"extractions"> },
      Array<{
        _creationTime: number;
        _id: Id<"audit_trail">;
        action:
          | "extraction_started"
          | "extraction_completed"
          | "extraction_failed"
          | "extraction_deleted";
        errorMessage?: string;
        metadata?: any;
      }>
    >;
    getUserActivity: FunctionReference<
      "query",
      "public",
      { limit?: number },
      Array<{
        _creationTime: number;
        _id: Id<"audit_trail">;
        action:
          | "extraction_started"
          | "extraction_completed"
          | "extraction_failed"
          | "extraction_deleted";
        errorMessage?: string;
        extractionId?: Id<"extractions">;
        metadata?: any;
        pdfStorageId?: Id<"_storage">;
      }>
    >;
  };
  extractions: {
    generateUploadUrl: FunctionReference<"mutation", "public", {}, string>;
    get: FunctionReference<
      "query",
      "public",
      { id: Id<"extractions"> },
      {
        _creationTime: number;
        _id: Id<"extractions">;
        companyName?: string;
        currency: string;
        extractionCostUsd?: number;
        extractionData: any;
        financialYearEnd?: string;
        financialYearStart?: string;
        flagsCount: number;
        pdfStorageId?: Id<"_storage">;
        rcsNumber?: string;
        totalAssets?: number;
        totalIcExposure?: number;
        tpScore: "A" | "B" | "C";
        userId: string;
      } | null
    >;
    getPdfUrl: FunctionReference<
      "query",
      "public",
      { id: Id<"extractions"> },
      string | null
    >;
    list: FunctionReference<
      "query",
      "public",
      {},
      Array<{
        _creationTime: number;
        _id: Id<"extractions">;
        companyName?: string;
        currency: string;
        extractionCostUsd?: number;
        extractionData: any;
        financialYearEnd?: string;
        financialYearStart?: string;
        flagsCount: number;
        pdfStorageId?: Id<"_storage">;
        rcsNumber?: string;
        totalAssets?: number;
        totalIcExposure?: number;
        tpScore: "A" | "B" | "C";
        userId: string;
      }>
    >;
    listAll: FunctionReference<
      "query",
      "public",
      {},
      Array<{
        _creationTime: number;
        _id: Id<"extractions">;
        companyName?: string;
        currency: string;
        extractionCostUsd?: number;
        extractionData: any;
        financialYearEnd?: string;
        financialYearStart?: string;
        flagsCount: number;
        pdfStorageId?: Id<"_storage">;
        rcsNumber?: string;
        totalAssets?: number;
        totalIcExposure?: number;
        tpScore: "A" | "B" | "C";
        userId: string;
      }>
    >;
    remove: FunctionReference<
      "mutation",
      "public",
      { id: Id<"extractions"> },
      null
    >;
    save: FunctionReference<
      "mutation",
      "public",
      {
        companyName?: string;
        currency: string;
        extractionCostUsd?: number;
        extractionData: any;
        financialYearEnd?: string;
        financialYearStart?: string;
        flagsCount: number;
        pdfStorageId?: Id<"_storage">;
        rcsNumber?: string;
        totalAssets?: number;
        totalIcExposure?: number;
        tpScore: "A" | "B" | "C";
      },
      Id<"extractions">
    >;
  };
  rateLimit: {
    getRateLimitStatus: FunctionReference<
      "query",
      "public",
      {},
      {
        allowed: boolean;
        remaining: number;
        resetAt: number;
        retryAfterMs: number | null;
      } | null
    >;
  };
  usage: {
    checkUsageLimit: FunctionReference<
      "query",
      "public",
      { monthlyLimit?: number },
      {
        allowed: boolean;
        currentCount: number;
        limit: number | null;
        remaining: number | null;
      }
    >;
    getMonthlyUsage: FunctionReference<
      "query",
      "public",
      {},
      {
        extractionCount: number;
        inputTokensTotal: number;
        month: number;
        outputTokensTotal: number;
        totalCostUsd: number;
        userId: string;
        year: number;
      } | null
    >;
    getUserUsage: FunctionReference<
      "query",
      "public",
      {
        endMonth?: number;
        endYear?: number;
        startMonth?: number;
        startYear?: number;
      },
      Array<{
        extractionCount: number;
        inputTokensTotal: number;
        month: number;
        outputTokensTotal: number;
        totalCostUsd: number;
        year: number;
      }>
    >;
  };
};

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: {
  audit: {
    cleanupOldEvents: FunctionReference<
      "mutation",
      "internal",
      { retentionDays?: number },
      number
    >;
    logEvent: FunctionReference<
      "mutation",
      "internal",
      {
        action:
          | "extraction_started"
          | "extraction_completed"
          | "extraction_failed"
          | "extraction_deleted";
        errorMessage?: string;
        extractionId?: Id<"extractions">;
        metadata?: any;
        pdfStorageId?: Id<"_storage">;
        userId: string;
      },
      Id<"audit_trail">
    >;
  };
  rateLimit: {
    checkRateLimit: FunctionReference<
      "query",
      "internal",
      { maxRequests?: number; userId: string },
      {
        allowed: boolean;
        remaining: number;
        resetAt: number;
        retryAfterMs: number | null;
      }
    >;
    cleanupOldRecords: FunctionReference<"mutation", "internal", {}, number>;
    recordRequest: FunctionReference<
      "mutation",
      "internal",
      { userId: string },
      null
    >;
  };
  usage: {
    recordUsage: FunctionReference<
      "mutation",
      "internal",
      {
        costUsd: number;
        inputTokens: number;
        outputTokens: number;
        userId: string;
      },
      null
    >;
  };
};

export declare const components: {};
