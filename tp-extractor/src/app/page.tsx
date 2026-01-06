"use client";

import { useState } from "react";
import UploadZone from "@/components/upload-zone";
import ResultsDashboard from "@/components/results-dashboard";
import StreamingResultsDashboard from "@/components/streaming-results-dashboard";
import { useStreamingExtraction } from "@/hooks/useStreamingExtraction";

export default function Home() {
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [lastFile, setLastFile] = useState<File | null>(null);
  const { state, isExtracting, startExtraction, reset, getCompleteResult } =
    useStreamingExtraction();

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
  };

  // Check if we're in streaming mode (any data has started arriving)
  const hasData = state.metadata !== null;
  const isComplete = state.stage === "complete";
  const completeResult = getCompleteResult();

  return (
    <main className="min-h-screen">
      {/* Show upload zone when idle or error with no data */}
      {state.stage === "idle" || (state.stage === "error" && !hasData) ? (
        <div className="flex flex-col items-center justify-center min-h-screen p-8">
          <div className="w-full max-w-2xl">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-slate-100 mb-2">
                TP Extractor
              </h1>
              <p className="text-slate-400">
                Luxembourg Transfer Pricing Analysis Tool
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
