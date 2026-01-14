"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import Link from "next/link";
import UploadZone from "@/components/upload-zone";
import AuthHeader from "@/components/auth-header";
import ProgressGrid, { HeartbeatIndicator } from "@/components/progress-grid";
import { useStreamingExtraction } from "@/hooks/useStreamingExtraction";
import { useToast } from "@/components/ui/toast";
import { AlertCircle, ArrowRight } from "lucide-react";

export default function AnalyzePage() {
  const router = useRouter();
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [lastFile, setLastFile] = useState<File | null>(null);
  const [savedExtractionId, setSavedExtractionId] = useState<Id<"extractions"> | null>(null);
  const { state, isExtracting, elapsedSeconds, startExtraction, reset, getCompleteResult, lastStorageId } =
    useStreamingExtraction();
  const { addToast } = useToast();
  const saveExtraction = useMutation(api.extractions.save);
  const hasSavedRef = useRef(false);

  const handleExtraction = async (file: File) => {
    // Reset saved state
    hasSavedRef.current = false;
    setSavedExtractionId(null);

    // Store the file for potential retry
    setLastFile(file);

    // Convert file to base64 for PDF viewer
    const reader = new FileReader();
    reader.onload = (e) => {
      setPdfData(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Start streaming extraction
    await startExtraction(file);
  };

  const handleRetry = () => {
    if (lastFile) {
      handleExtraction(lastFile);
    }
  };

  const handleNewExtraction = () => {
    reset();
    setPdfData(null);
    setLastFile(null);
    hasSavedRef.current = false;
    setSavedExtractionId(null);
  };

  // Check if we're in streaming mode (any data has started arriving)
  const hasData = state.metadata !== null;
  const isComplete = state.stage === "complete";
  const completeResult = getCompleteResult();

  // Save extraction to database when complete
  useEffect(() => {
    if (isComplete && completeResult && !hasSavedRef.current) {
      hasSavedRef.current = true;

      const saveExtraction_ = async () => {
        try {
          // Use the storage ID from the extraction hook (PDF already uploaded during extraction)
          const pdfStorageId = lastStorageId || undefined;

          // Calculate total IC exposure
          const icLoansGranted = completeResult.tp_analysis.ic_financing.total_loans_granted || 0;
          const icLoansReceived = completeResult.tp_analysis.ic_financing.total_loans_received || 0;
          const totalICExposure = icLoansGranted + icLoansReceived;

          // Count flags
          const flagsCount = completeResult.tp_analysis.priority_flags.length;

          // Save to Convex
          const id = await saveExtraction({
            companyName: completeResult.metadata.company_name || undefined,
            rcsNumber: completeResult.metadata.rcs_number || undefined,
            financialYearStart: completeResult.metadata.financial_year_start || undefined,
            financialYearEnd: completeResult.metadata.financial_year_end || undefined,
            currency: completeResult.metadata.currency,
            tpScore: completeResult.tp_analysis.overall_tp_opportunity_score,
            totalAssets: completeResult.balance_sheet.total_assets || undefined,
            totalIcExposure: totalICExposure || undefined,
            flagsCount,
            extractionData: completeResult,
            extractionCostUsd: completeResult.extraction_cost_usd || undefined,
            pdfStorageId,
          });

          setSavedExtractionId(id);
          addToast("success", "Extraction saved successfully");
        } catch (err: unknown) {
          console.error("Failed to save extraction:", err);
          const errorMessage = err instanceof Error ? err.message : "Unknown error";
          if (!errorMessage.includes("Not authenticated")) {
            addToast("error", "Failed to save extraction");
          }
        }
      };

      saveExtraction_();
    }
  }, [isComplete, completeResult, saveExtraction, lastStorageId, addToast]);

  // Show upload zone when idle
  if (state.stage === "idle" || (state.stage === "error" && !hasData)) {
    return (
      <main className="min-h-screen bg-slate-950">
        <AuthHeader />
        <div className="flex flex-col items-center justify-center min-h-screen p-8 pt-20">
          <div className="w-full max-w-2xl">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-slate-100 mb-2">
                New Extraction
              </h1>
              <p className="text-slate-400 mb-4">
                Upload a Luxembourg annual accounts PDF to extract transfer pricing data
              </p>
            </div>

            <UploadZone
              onUpload={handleExtraction}
              isProcessing={isExtracting}
              error={state.error}
              onRetry={handleRetry}
              lastFile={lastFile}
            />

            {isExtracting && (
              <div className="mt-6 text-center">
                <div className="inline-flex items-center gap-2 text-blue-400">
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  <span>Connecting to extraction service...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }

  // Show progress grid during extraction or when complete
  return (
    <main className="min-h-screen bg-slate-950">
      <AuthHeader />
      <div className="flex flex-col items-center justify-center min-h-screen p-8 pt-20">
        <div className="w-full max-w-3xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-100 mb-2">
              {isComplete ? "Extraction Complete" : "Extracting Data..."}
            </h1>
            {state.metadata?.company_name && (
              <p className="text-slate-400">
                {state.metadata.company_name}
              </p>
            )}
          </div>

          {/* Heartbeat Indicator */}
          <HeartbeatIndicator
            isActive={isExtracting}
            elapsedSeconds={elapsedSeconds}
            hasError={state.stage === "error"}
            isComplete={isComplete}
          />

          {/* Progress Grid */}
          <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 mb-6">
            <ProgressGrid currentStage={state.stage} />
          </div>

          {/* Error display */}
          {state.stage === "error" && state.error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-400">Extraction Failed</p>
                  <p className="text-sm text-red-400/80 mt-1">{state.error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Completion Actions */}
          {isComplete && savedExtractionId && (
            <div className="flex flex-col items-center gap-4">
              <Link
                href={`/extraction/${savedExtractionId}/summary`}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
              >
                View Results
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button
                onClick={handleNewExtraction}
                className="text-sm text-slate-400 hover:text-slate-300 transition-colors"
              >
                Start New Extraction
              </button>
            </div>
          )}

          {/* Waiting for save */}
          {isComplete && !savedExtractionId && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-slate-400">
                <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                <span>Saving extraction...</span>
              </div>
            </div>
          )}

          {/* Retry/Cancel during extraction */}
          {!isComplete && state.stage !== "error" && (
            <div className="text-center">
              <button
                onClick={handleNewExtraction}
                className="text-sm text-slate-500 hover:text-slate-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Retry on error */}
          {state.stage === "error" && (
            <div className="flex justify-center gap-4">
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
              >
                Retry
              </button>
              <button
                onClick={handleNewExtraction}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-medium transition-colors"
              >
                Try Different File
              </button>
            </div>
          )}

          {/* Extraction cost */}
          {state.extraction_cost_usd && (
            <div className="mt-6 text-center text-sm text-slate-500">
              Extraction cost: ${state.extraction_cost_usd.toFixed(3)}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
