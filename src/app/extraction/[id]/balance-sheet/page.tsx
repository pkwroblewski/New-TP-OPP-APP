"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useExtraction } from "@/hooks/useExtraction";
import AuthHeader from "@/components/auth-header";
import BalanceSheetTable from "@/components/data-tables/balance-sheet-table";
import { Loader2, AlertCircle, ChevronLeft } from "lucide-react";

export default function BalanceSheetPage() {
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

  const { metadata, balance_sheet } = extractionResult;

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
          <span className="text-slate-300">Balance Sheet</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Balance Sheet</h1>
            <p className="text-sm text-slate-400 mt-1">
              {metadata.company_name} - FY {metadata.financial_year_end ? new Date(metadata.financial_year_end).getFullYear() : "N/A"}
            </p>
          </div>
          <Link
            href={`/extraction/${id}/summary`}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Summary
          </Link>
        </div>

        {/* Balance Sheet Table */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <BalanceSheetTable balanceSheet={balance_sheet} />
        </div>
      </main>
    </div>
  );
}
