"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import UploadZone from "@/components/upload-zone";
import AuthHeader from "@/components/auth-header";
import ResultsDashboard from "@/components/results-dashboard";
import StreamingResultsDashboard from "@/components/streaming-results-dashboard";
import { useStreamingExtraction } from "@/hooks/useStreamingExtraction";
import { useToast } from "@/components/ui/toast";

export default function AnalyzePage() {
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [lastFile, setLastFile] = useState<File | null>(null);
  const { state, isExtracting, startExtraction, reset, getCompleteResult } =
    useStreamingExtraction();
  const { addToast } = useToast();
  const saveExtraction = useMutation(api.extractions.save);
  const hasSavedRef = useRef(false);

  const handleExtraction = async (file: File) => {
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
  };

  // Check if we're in streaming mode (any data has started arriving)
  const hasData = state.metadata !== null;
  const isComplete = state.stage === "complete";
  const completeResult = getCompleteResult();

  // Save extraction to database when complete
  useEffect(() => {
    if (isComplete && completeResult && !hasSavedRef.current) {
      hasSavedRef.current = true;

      // Calculate total IC exposure
      const icLoansGranted = completeResult.tp_analysis.ic_financing.total_loans_granted || 0;
      const icLoansReceived = completeResult.tp_analysis.ic_financing.total_loans_received || 0;
      const totalICExposure = icLoansGranted + icLoansReceived;

      // Count flags
      const flagsCount = completeResult.tp_analysis.priority_flags.length;

      // Save to Convex
      saveExtraction({
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
      })
        .then(() => {
          addToast("success", "Extraction saved to database");
        })
        .catch((err) => {
          console.error("Failed to save extraction:", err);
          // Don't show error toast if user is not authenticated (expected before Clerk setup)
          if (!err.message?.includes("Not authenticated")) {
            addToast("error", "Failed to save extraction");
          }
        });
    }
  }, [isComplete, completeResult, saveExtraction, addToast]);

  return (
    <main className="min-h-screen">
      <AuthHeader />
      {/* Show upload zone when idle or error with no data */}
      {state.stage === "idle" || (state.stage === "error" && !hasData) ? (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 pt-20">
          <div className="w-full max-w-2xl">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-slate-100 mb-2">
                TP Extractor
              </h1>
              <p className="text-slate-400 mb-4">
                Luxembourg Transfer Pricing Analysis Tool
              </p>
              <Link
                href="/history"
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                View extraction history
              </Link>
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
      ) : isComplete && completeResult ? (
        /* Show normal dashboard when extraction is complete */
        <ResultsDashboard
          result={completeResult}
          pdfData={pdfData}
          onNewExtraction={handleNewExtraction}
        />
      ) : (
        /* Show streaming dashboard during extraction */
        <StreamingResultsDashboard
          state={state}
          pdfData={pdfData}
          onNewExtraction={handleNewExtraction}
        />
      )}
    </main>
  );
}
