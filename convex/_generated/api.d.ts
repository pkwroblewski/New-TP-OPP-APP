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
};

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: {};

export declare const components: {};
