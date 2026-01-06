"use client";

import { useState } from "react";
import UploadZone from "@/components/upload-zone";
import ResultsDashboard from "@/components/results-dashboard";
import { ExtractionResult } from "@/types/extraction";

export default function Home() {
  const [extractionResult, setExtractionResult] =
    useState<ExtractionResult | null>(null);
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExtraction = async (file: File) => {
    setIsExtracting(true);
    setError(null);

    try {
      // Convert file to base64 for PDF viewer
      const reader = new FileReader();
      reader.onload = (e) => {
        setPdfData(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Prepare form data
      const formData = new FormData();
      formData.append("file", file);

      // Call extraction API
      const response = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Extraction failed");
      }

      // Handle streaming response
      const reader2 = response.body?.getReader();
      const decoder = new TextDecoder();
      let result = "";

      if (reader2) {
        while (true) {
          const { done, value } = await reader2.read();
          if (done) break;
          result += decoder.decode(value, { stream: true });
        }
      }

      const extractedData = JSON.parse(result) as ExtractionResult;
      setExtractionResult(extractedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleNewExtraction = () => {
    setExtractionResult(null);
    setPdfData(null);
    setError(null);
  };

  return (
    <main className="min-h-screen">
      {!extractionResult ? (
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
              error={error}
            />

            {isExtracting && (
              <div className="mt-6 text-center">
                <div className="inline-flex items-center gap-2 text-blue-400">
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  <span>Extracting financial data...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <ResultsDashboard
          result={extractionResult}
          pdfData={pdfData}
          onNewExtraction={handleNewExtraction}
        />
      )}
    </main>
  );
}
