"use client";

import { useState, useCallback } from "react";
import {
  ExtractionResult,
  Metadata,
  BalanceSheet,
  ProfitAndLoss,
  NotesExtraction,
  EntityClassification,
  TPAnalysis,
} from "@/types/extraction";

export type StreamingStage =
  | "idle"
  | "connecting"
  | "metadata"
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

  const reset = useCallback(() => {
    setState(initialState);
    setIsExtracting(false);
  }, []);

  const startExtraction = useCallback(async (file: File) => {
    setState({ ...initialState, stage: "connecting" });
    setIsExtracting(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/extract/stream", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Extraction failed");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("Failed to read response stream");
      }

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE events
        const events = buffer.split("\n\n");
        buffer = events.pop() || ""; // Keep incomplete event in buffer

        for (const event of events) {
          if (!event.trim()) continue;

          const lines = event.split("\n");
          let eventType = "";
          let eventData = "";

          for (const line of lines) {
            if (line.startsWith("event: ")) {
              eventType = line.slice(7);
            } else if (line.startsWith("data: ")) {
              eventData = line.slice(6);
            }
          }

          if (eventType && eventData) {
            try {
              const data = JSON.parse(eventData);
              handleEvent(eventType, data);
            } catch {
              console.error("Failed to parse SSE data:", eventData);
            }
          }
        }
      }
    } catch (err) {
      setState((prev) => ({
        ...prev,
        stage: "error",
        error: err instanceof Error ? err.message : "An error occurred",
      }));
    } finally {
      setIsExtracting(false);
    }
  }, []);

  const handleEvent = (eventType: string, data: Record<string, unknown>) => {
    setState((prev) => {
      switch (eventType) {
        case "connected":
          return { ...prev, stage: "connecting" };

        case "metadata":
          return {
            ...prev,
            stage: "metadata",
            metadata: data.metadata as Metadata,
          };

        case "entity":
          return {
            ...prev,
            stage: "entity",
            entity_classification:
              data.entity_classification as EntityClassification,
          };

        case "balance_sheet":
          return {
            ...prev,
            stage: "balance_sheet",
            balance_sheet: data.balance_sheet as BalanceSheet,
          };

        case "profit_and_loss":
          return {
            ...prev,
            stage: "profit_and_loss",
            profit_and_loss: data.profit_and_loss as ProfitAndLoss,
          };

        case "notes":
          return {
            ...prev,
            stage: "notes",
            notes_extraction: data.notes_extraction as NotesExtraction,
          };

        case "tp_analysis":
          return {
            ...prev,
            stage: "tp_analysis",
            tp_analysis: data.tp_analysis as TPAnalysis,
            extraction_cost_usd: data.extraction_cost_usd as number | null,
          };

        case "complete":
          return { ...prev, stage: "complete" };

        case "error":
          return { ...prev, stage: "error", error: data.error as string };

        default:
          return prev;
      }
    });
  };

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
