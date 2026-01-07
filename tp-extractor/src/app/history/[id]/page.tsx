"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import Link from "next/link";
import ResultsDashboard from "@/components/results-dashboard";
import { ExtractionResult } from "@/types/extraction";
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react";

export default function ExtractionDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const extraction = useQuery(api.extractions.get, {
    id: id as Id<"extractions">,
  });

  // Loading state
  if (extraction === undefined) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading extraction...</span>
        </div>
      </div>
    );
  }

  // Not found state
  if (extraction === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-slate-200 mb-2">Extraction not found</h1>
          <p className="text-slate-400 mb-6">
            This extraction may have been deleted or doesn't exist.
          </p>
          <Link
            href="/history"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to History
          </Link>
        </div>
      </div>
    );
  }

  // Cast extractionData back to ExtractionResult
  const result = extraction.extractionData as ExtractionResult;

  // Custom handler to go back to history
  const handleNewExtraction = () => {
    window.location.href = "/history";
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Back navigation bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/history"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to History
          </Link>
        </div>
      </div>

      {/* Reuse ResultsDashboard but without PDF */}
      <ResultsDashboard
        result={result}
        pdfData={null}
        onNewExtraction={handleNewExtraction}
      />
    </div>
  );
}
