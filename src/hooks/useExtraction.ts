"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { ExtractionResult } from "@/types/extraction";

interface ExtractionData {
  _id: Id<"extractions">;
  _creationTime: number;
  companyName?: string;
  rcsNumber?: string;
  financialYearStart?: string;
  financialYearEnd?: string;
  currency: string;
  tpScore: "A" | "B" | "C";
  totalAssets?: number;
  totalIcExposure?: number;
  flagsCount: number;
  extractionData: ExtractionResult;
  extractionCostUsd?: number;
}

interface UseExtractionReturn {
  extraction: ExtractionData | null;
  extractionResult: ExtractionResult | null;
  isLoading: boolean;
  error: string | null;
}

export function useExtraction(id: string | null): UseExtractionReturn {
  // Convert string to Id type if valid
  const extractionId = id as Id<"extractions"> | null;

  // Query the extraction from Convex
  const extraction = useQuery(
    api.extractions.get,
    extractionId ? { id: extractionId } : "skip"
  );

  // Determine loading state
  const isLoading = extractionId !== null && extraction === undefined;

  // Determine error state
  const error =
    extractionId && extraction === null ? "Extraction not found" : null;

  // Extract the result data if available
  const extractionResult = extraction?.extractionData as ExtractionResult | null;

  return {
    extraction: extraction as ExtractionData | null,
    extractionResult,
    isLoading,
    error,
  };
}

// Helper hook to get just the extraction result
export function useExtractionResult(id: string | null): {
  result: ExtractionResult | null;
  isLoading: boolean;
  error: string | null;
} {
  const { extractionResult, isLoading, error } = useExtraction(id);
  return { result: extractionResult, isLoading, error };
}
