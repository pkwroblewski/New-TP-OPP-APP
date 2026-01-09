"use client";

import { useState, useCallback } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  ExtractionResult,
  Metadata,
  BalanceSheet,
  ProfitAndLoss,
  NotesExtraction,
  EntityClassification,
  EntityGovernance,
  TPAnalysis,
} from "@/types/extraction";

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

export function useStreamingExtraction() {
  const [state, setState] = useState<StreamingState>(initialState);
  const [isExtracting, setIsExtracting] = useState(false);

  // Call Convex action directly (bypasses Vercel timeout)
  const extractPdf = useAction(api.actions.extractPdf.extractPdf);

  const reset = useCallback(() => {
    setState(initialState);
    setIsExtracting(false);
  }, []);

  const startExtraction = useCallback(async (file: File) => {
    setState({ ...initialState, stage: "connecting" });
    setIsExtracting(true);

    try {
      // Convert file to base64
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );

      // Call Convex action directly (has 10-minute timeout)
      const response = await extractPdf({ pdfBase64: base64 });

      // Extract the result
      const result = response.result as ExtractionResult;
      const cost = response.cost_usd;

      // Simulate streaming by updating state progressively
      // This gives the user visual feedback of progress

      await delay(50);
      setState((prev) => ({
        ...prev,
        stage: "metadata",
        metadata: result.metadata,
      }));

      await delay(50);
      setState((prev) => ({
        ...prev,
        stage: "governance",
        entity_governance: result.entity_governance || null,
      }));

      await delay(50);
      setState((prev) => ({
        ...prev,
        stage: "entity",
        entity_classification: result.entity_classification,
      }));

      await delay(50);
      setState((prev) => ({
        ...prev,
        stage: "balance_sheet",
        balance_sheet: result.balance_sheet,
      }));

      await delay(50);
      setState((prev) => ({
        ...prev,
        stage: "profit_and_loss",
        profit_and_loss: result.profit_and_loss,
      }));

      await delay(50);
      setState((prev) => ({
        ...prev,
        stage: "notes",
        notes_extraction: result.notes_extraction,
      }));

      await delay(50);
      setState((prev) => ({
        ...prev,
        stage: "tp_analysis",
        tp_analysis: result.tp_analysis,
        extraction_cost_usd: cost,
      }));

      await delay(50);
      setState((prev) => ({
        ...prev,
        stage: "complete",
      }));

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
  }, [extractPdf]);

  // Build the complete result if all data is available
  const getCompleteResult = (): ExtractionResult | null => {
    if (
      state.metadata &&
      state.entity_classification &&
      state.balance_sheet &&
      state.profit_and_loss &&
      state.notes_extraction &&
      state.tp_analysis
    ) {
      return {
        metadata: state.metadata,
        entity_classification: state.entity_classification,
        entity_governance: state.entity_governance || undefined,
        balance_sheet: state.balance_sheet,
        profit_and_loss: state.profit_and_loss,
        notes_extraction: state.notes_extraction,
        tp_analysis: state.tp_analysis,
        extraction_cost_usd: state.extraction_cost_usd || undefined,
      };
    }
    return null;
  };

  return {
    state,
    isExtracting,
    startExtraction,
    reset,
    getCompleteResult,
  };
}

// Helper function
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
