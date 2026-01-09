"use client";

import { useState, useCallback } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import type {
  ExtractionResult,
  Metadata,
  BalanceSheet,
  ProfitAndLoss,
  NotesExtraction,
  EntityClassification,
  EntityGovernance,
  TPAnalysis,
} from "@/types/extraction";
import { ExtractionResultSchema } from "@/lib/schema";

export type StreamingStage =
  | "idle"
  | "connecting"
  | "metadata"
  | "governance"
  | "entity"
  | "balance_sheet"
  | "profit_and_loss"
  | "notes"
  | "tp_analysis"
  | "complete"
  | "error";

export interface StreamingState {
  stage: StreamingStage;
  metadata: Metadata | null;
  entity_governance: EntityGovernance | null;
  entity_classification: EntityClassification | null;
  balance_sheet: BalanceSheet | null;
  profit_and_loss: ProfitAndLoss | null;
  notes_extraction: NotesExtraction | null;
  tp_analysis: TPAnalysis | null;
  extraction_cost_usd: number | null;
  error: string | null;
}

const initialState: StreamingState = {
  stage: "idle",
  metadata: null,
  entity_governance: null,
  entity_classification: null,
  balance_sheet: null,
  profit_and_loss: null,
  notes_extraction: null,
  tp_analysis: null,
  extraction_cost_usd: null,
  error: null,
};

/**
 * Stage transition configuration for simulated streaming
 * Each entry maps a stage to the state field it populates
 */
const STAGE_TRANSITIONS: Array<{
  stage: StreamingStage;
  field: keyof ExtractionResult;
}> = [
  { stage: "metadata", field: "metadata" },
  { stage: "governance", field: "entity_governance" },
  { stage: "entity", field: "entity_classification" },
  { stage: "balance_sheet", field: "balance_sheet" },
  { stage: "profit_and_loss", field: "profit_and_loss" },
  { stage: "notes", field: "notes_extraction" },
  { stage: "tp_analysis", field: "tp_analysis" },
];

const TRANSITION_DELAY_MS = 50;

// File size limits
const MAX_FILE_SIZE_MB = 50;
const RECOMMENDED_FILE_SIZE_MB = 20;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const RECOMMENDED_FILE_SIZE_BYTES = RECOMMENDED_FILE_SIZE_MB * 1024 * 1024;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Validate file before processing
 * Note: Large PDFs (>20MB) may cause memory pressure when converted to base64
 * Future improvement: Consider chunked upload via Convex file storage for large files
 */
function validateFile(file: File): { valid: boolean; error?: string; warning?: string } {
  if (file.type !== "application/pdf") {
    return { valid: false, error: "Invalid file type. Please upload a PDF file." };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: `File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.` };
  }

  if (file.size > RECOMMENDED_FILE_SIZE_BYTES) {
    return {
      valid: true,
      warning: `Large file (${Math.round(file.size / 1024 / 1024)}MB). Processing may be slow.`,
    };
  }

  return { valid: true };
}

/**
 * Convert a File to base64 string
 * Note: This loads the entire file into memory. For very large files (>20MB),
 * consider using Convex file storage with chunked uploads instead.
 */
async function fileToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  return btoa(
    new Uint8Array(arrayBuffer).reduce(
      (data, byte) => data + String.fromCharCode(byte),
      ""
    )
  );
}

export function useStreamingExtraction() {
  const [state, setState] = useState<StreamingState>(initialState);
  const [isExtracting, setIsExtracting] = useState(false);
  const extractPdf = useAction(api.actions.extractPdf.extractPdf);

  const reset = useCallback(function reset(): void {
    setState(initialState);
    setIsExtracting(false);
  }, []);

  const startExtraction = useCallback(
    async function startExtraction(file: File): Promise<void> {
      // Guard against concurrent extractions
      if (isExtracting) {
        console.warn("Extraction already in progress, ignoring request");
        return;
      }

      // Validate file before processing
      const validation = validateFile(file);
      if (!validation.valid) {
        setState({
          ...initialState,
          stage: "error",
          error: validation.error || "Invalid file",
        });
        return;
      }

      // Log warning for large files
      if (validation.warning) {
        console.warn(validation.warning);
      }

      setState({ ...initialState, stage: "connecting" });
      setIsExtracting(true);

      try {
        const base64 = await fileToBase64(file);
        const response = await extractPdf({ pdfBase64: base64 });

        // Validate response with Zod schema
        const parseResult = ExtractionResultSchema.safeParse(response.result);
        if (!parseResult.success) {
          const errors = parseResult.error.errors
            .slice(0, 3)
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join("; ");
          throw new Error(`Invalid extraction response: ${errors}`);
        }
        const result = parseResult.data as ExtractionResult;

        // Simulate streaming by updating state progressively
        for (const { stage, field } of STAGE_TRANSITIONS) {
          await delay(TRANSITION_DELAY_MS);
          setState((prev) => ({
            ...prev,
            stage,
            [field]: result[field] ?? null,
            ...(stage === "tp_analysis" && { extraction_cost_usd: response.cost_usd }),
          }));
        }

        await delay(TRANSITION_DELAY_MS);
        setState((prev) => ({ ...prev, stage: "complete" }));
      } catch (err) {
        console.error("Extraction error:", err);
        setState((prev) => ({
          ...prev,
          stage: "error",
          error: err instanceof Error ? err.message : "An error occurred during extraction",
        }));
      } finally {
        setIsExtracting(false);
      }
    },
    [extractPdf, isExtracting]
  );

  const getCompleteResult = useCallback(function getCompleteResult(): ExtractionResult | null {
    const { metadata, entity_classification, balance_sheet, profit_and_loss, notes_extraction, tp_analysis } = state;

    if (!metadata || !entity_classification || !balance_sheet || !profit_and_loss || !notes_extraction || !tp_analysis) {
      return null;
    }

    return {
      metadata,
      entity_classification,
      entity_governance: state.entity_governance ?? undefined,
      balance_sheet,
      profit_and_loss,
      notes_extraction,
      tp_analysis,
      extraction_cost_usd: state.extraction_cost_usd ?? undefined,
    };
  }, [state]);

  return {
    state,
    isExtracting,
    startExtraction,
    reset,
    getCompleteResult,
  };
}
