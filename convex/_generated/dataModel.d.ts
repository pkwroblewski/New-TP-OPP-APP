/* eslint-disable */
/**
 * Generated data model types.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  DocumentByName,
  TableNamesInDataModel,
  SystemTableNames,
  AnyDataModel,
} from "convex/server";
import type { GenericId } from "convex/values";

/**
 * A type describing your Convex data model.
 *
 * This type includes information about what tables you have, the type of
 * documents stored in those tables, and the indexes defined on them.
 *
 * This type is used to parameterize methods like `queryGeneric` and
 * `mutationGeneric` to make them type-safe.
 */

export type DataModel = {
  audit_trail: {
    document: {
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
      _id: Id<"audit_trail">;
      _creationTime: number;
    };
    fieldPaths:
      | "_creationTime"
      | "_id"
      | "action"
      | "errorMessage"
      | "extractionId"
      | "metadata"
      | "pdfStorageId"
      | "userId";
    indexes: {
      by_id: ["_id"];
      by_creation_time: ["_creationTime"];
      by_extraction: ["extractionId", "_creationTime"];
      by_user: ["userId", "_creationTime"];
    };
    searchIndexes: {};
    vectorIndexes: {};
  };
  extractions: {
    document: {
      companyName?: string;
      currency: string;
      extractionCostUsd?: number;
      extractionData: any;
      financialYearEnd?: string;
      financialYearStart?: string;
      flagsCount: number;
      pdfStorageId?: Id<"_storage">;
      rcsNumber?: string;
      schemaVersion?: string;
      totalAssets?: number;
      totalIcExposure?: number;
      tpScore: "A" | "B" | "C";
      userId: string;
      _id: Id<"extractions">;
      _creationTime: number;
    };
    fieldPaths:
      | "_creationTime"
      | "_id"
      | "companyName"
      | "currency"
      | "extractionCostUsd"
      | "extractionData"
      | "financialYearEnd"
      | "financialYearStart"
      | "flagsCount"
      | "pdfStorageId"
      | "rcsNumber"
      | "schemaVersion"
      | "totalAssets"
      | "totalIcExposure"
      | "tpScore"
      | "userId";
    indexes: {
      by_id: ["_id"];
      by_creation_time: ["_creationTime"];
      by_user: ["userId", "_creationTime"];
    };
    searchIndexes: {};
    vectorIndexes: {};
  };
  rate_limits: {
    document: {
      lastRequestAt: number;
      requestCount: number;
      userId: string;
      windowStart: number;
      _id: Id<"rate_limits">;
      _creationTime: number;
    };
    fieldPaths:
      | "_creationTime"
      | "_id"
      | "lastRequestAt"
      | "requestCount"
      | "userId"
      | "windowStart";
    indexes: {
      by_id: ["_id"];
      by_creation_time: ["_creationTime"];
      by_user: ["userId", "_creationTime"];
    };
    searchIndexes: {};
    vectorIndexes: {};
  };
  usage_tracking: {
    document: {
      extractionCount: number;
      inputTokensTotal: number;
      month: number;
      outputTokensTotal: number;
      totalCostUsd: number;
      userId: string;
      year: number;
      _id: Id<"usage_tracking">;
      _creationTime: number;
    };
    fieldPaths:
      | "_creationTime"
      | "_id"
      | "extractionCount"
      | "inputTokensTotal"
      | "month"
      | "outputTokensTotal"
      | "totalCostUsd"
      | "userId"
      | "year";
    indexes: {
      by_id: ["_id"];
      by_creation_time: ["_creationTime"];
      by_user_year_month: ["userId", "year", "month", "_creationTime"];
    };
    searchIndexes: {};
    vectorIndexes: {};
  };
};

/**
 * The names of all of your Convex tables.
 */
export type TableNames = TableNamesInDataModel<DataModel>;

/**
 * The type of a document stored in Convex.
 *
 * @typeParam TableName - A string literal type of the table name (like "users").
 */
export type Doc<TableName extends TableNames> = DocumentByName<
  DataModel,
  TableName
>;

/**
 * An identifier for a document in Convex.
 *
 * Convex documents are uniquely identified by their `Id`, which is accessible
 * on the `_id` field. To learn more, see [Document IDs](https://docs.convex.dev/using/document-ids).
 *
 * Documents can be loaded using `db.get(tableName, id)` in query and mutation functions.
 *
 * IDs are just strings at runtime, but this type can be used to distinguish them from other
 * strings when type checking.
 *
 * @typeParam TableName - A string literal type of the table name (like "users").
 */
export type Id<TableName extends TableNames | SystemTableNames> =
  GenericId<TableName>;
