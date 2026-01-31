"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useExtraction } from "@/hooks/useExtraction";
import AuthHeader from "@/components/auth-header";
import { BoardManagersCard } from "@/components/board-managers-card";
import { FunctionalAnalysisCard } from "@/components/functional-analysis-card";
import { Loader2, AlertCircle, ChevronLeft, Building2, Users, MapPin, Briefcase } from "lucide-react";

export default function EntityPage() {
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

  const { metadata, entity_classification, entity_governance, notes_extraction, functional_analysis } = extractionResult;

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
          <span className="text-slate-300">Entity</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Entity Details</h1>
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

        <div className="space-y-6">
          {/* Company Info */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              Company Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-slate-500 mb-1">Company Name</p>
                <p className="text-slate-200">{metadata.company_name || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">RCS Number</p>
                <p className="text-slate-200">{metadata.rcs_number || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Address</p>
                <p className="text-slate-200">{metadata.address || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Financial Year</p>
                <p className="text-slate-200">
                  {metadata.financial_year_start && metadata.financial_year_end
                    ? `${metadata.financial_year_start} to ${metadata.financial_year_end}`
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Entity Classification */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-purple-400" />
              Entity Classification
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Primary Type</p>
                <span className="inline-block px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg font-medium capitalize">
                  {entity_classification.primary_type || "Unknown"}
                </span>
              </div>
              {entity_classification.activities_description && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Activities Description</p>
                  <p className="text-slate-300">{entity_classification.activities_description}</p>
                </div>
              )}
              {entity_classification.substance_indicators.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 mb-2">Substance Indicators</p>
                  <div className="flex flex-wrap gap-2">
                    {entity_classification.substance_indicators.map((indicator, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-slate-700 rounded text-slate-300"
                      >
                        {indicator}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Employees */}
          {notes_extraction.employees_fte !== null && (
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                Workforce
              </h2>
              <div>
                <p className="text-xs text-slate-500 mb-1">Full-Time Employees (FTE)</p>
                <p className="text-2xl font-bold text-slate-200">{notes_extraction.employees_fte}</p>
              </div>
            </div>
          )}

          {/* Functional Analysis */}
          {functional_analysis && (
            <FunctionalAnalysisCard functionalAnalysis={functional_analysis} />
          )}

          {/* Governance */}
          {entity_governance && (
            <BoardManagersCard governance={entity_governance} />
          )}

          {/* Shareholder Info */}
          {entity_governance?.shareholder_name && (
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-400" />
                Shareholder Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Shareholder Name</p>
                  <p className="text-slate-200">{entity_governance.shareholder_name}</p>
                </div>
                {entity_governance.shareholder_jurisdiction && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Jurisdiction</p>
                    <p className="text-slate-200">{entity_governance.shareholder_jurisdiction}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
