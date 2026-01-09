"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useExtraction } from "@/hooks/useExtraction";
import AuthHeader from "@/components/auth-header";
import TPFlags from "@/components/tp-flags";
import { Loader2, AlertCircle, ChevronLeft } from "lucide-react";
import { getTPScoreClasses } from "@/lib/utils";

export default function FlagsPage() {
  const params = useParams();
  const id = params.id as string;
  const { extraction, extractionResult, isLoading, error } = useExtraction(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <AuthHeader />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] pt-16">
          <div className="flex items-center gap-3 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !extraction || !extractionResult) {
    return (
      <div className="min-h-screen bg-slate-950">
        <AuthHeader />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] pt-16">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-200 mb-2">
              Extraction not found
            </h2>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { metadata, tp_analysis } = extractionResult;

  return (
    <div className="min-h-screen bg-slate-950">
      <AuthHeader />

      <main className="max-w-5xl mx-auto px-4 py-6 pt-24">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
          <Link href="/dashboard" className="hover:text-slate-300">
            Dashboard
          </Link>
          <span>/</span>
          <Link href={`/extraction/${id}/summary`} className="hover:text-slate-300">
            {metadata.company_name || "Extraction"}
          </Link>
          <span>/</span>
          <span className="text-slate-300">TP Flags</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Transfer Pricing Flags</h1>
            <p className="text-sm text-slate-400 mt-1">
              {metadata.company_name} - FY {metadata.financial_year_end ? new Date(metadata.financial_year_end).getFullYear() : "N/A"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`px-3 py-1.5 rounded-lg border font-bold ${getTPScoreClasses(tp_analysis.overall_tp_opportunity_score)}`}>
              Score {tp_analysis.overall_tp_opportunity_score}
            </div>
            <Link
              href={`/extraction/${id}/summary`}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Summary
            </Link>
          </div>
        </div>

        {/* Flags Summary */}
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-slate-500">Total Flags</p>
                <p className="text-2xl font-bold text-slate-100">
                  {tp_analysis.priority_flags.length}
                </p>
              </div>
              <div className="h-10 w-px bg-slate-700" />
              <div>
                <p className="text-xs text-slate-500">High Priority</p>
                <p className="text-2xl font-bold text-red-400">
                  {tp_analysis.priority_flags.filter((f) => f.priority === "high").length}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Medium Priority</p>
                <p className="text-2xl font-bold text-amber-400">
                  {tp_analysis.priority_flags.filter((f) => f.priority === "medium").length}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Low Priority</p>
                <p className="text-2xl font-bold text-blue-400">
                  {tp_analysis.priority_flags.filter((f) => f.priority === "low").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Flags List */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <TPFlags flags={tp_analysis.priority_flags} />
        </div>
      </main>
    </div>
  );
}
