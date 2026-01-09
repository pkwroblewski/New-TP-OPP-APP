"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useExtraction } from "@/hooks/useExtraction";
import AuthHeader from "@/components/auth-header";
import ExportButtons from "@/components/export-buttons";
import RawJsonViewer from "@/components/data-tables/raw-json-viewer";
import { Loader2, AlertCircle, ChevronLeft, Download, FileJson, Mail, Copy, Check } from "lucide-react";
import { useState } from "react";

export default function ExportPage() {
  const params = useParams();
  const id = params.id as string;
  const { extraction, extractionResult, isLoading, error } = useExtraction(id);
  const [copied, setCopied] = useState(false);

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

  const { metadata, tp_analysis, balance_sheet } = extractionResult;

  // Generate email template
  const generateEmailTemplate = () => {
    const score = tp_analysis.overall_tp_opportunity_score;
    const flags = tp_analysis.priority_flags;
    const highFlags = flags.filter((f) => f.priority === "high").length;

    return `Subject: Transfer Pricing Review - ${metadata.company_name || "Company"} (FY ${metadata.financial_year_end ? new Date(metadata.financial_year_end).getFullYear() : "N/A"})

Dear Team,

I have completed a preliminary transfer pricing review for ${metadata.company_name || "the company"} based on their Luxembourg annual accounts.

**Key Findings:**

- **TP Opportunity Score:** ${score} (${score === "A" ? "High" : score === "B" ? "Medium" : "Low"} opportunity)
- **Total Assets:** EUR ${balance_sheet.total_assets?.toLocaleString() || "N/A"}
- **IC Exposure:** EUR ${((tp_analysis.ic_financing.total_loans_granted || 0) + (tp_analysis.ic_financing.total_loans_received || 0)).toLocaleString()}
- **Identified Flags:** ${flags.length} (${highFlags} high priority)

**Score Rationale:**
${tp_analysis.score_rationale}

${tp_analysis.recommended_focus_areas.length > 0 ? `**Recommended Focus Areas:**
${tp_analysis.recommended_focus_areas.map((area) => `- ${area}`).join("\n")}` : ""}

${highFlags > 0 ? `**High Priority Items:**
${flags.filter((f) => f.priority === "high").map((f) => `- ${f.category}: ${f.description}`).join("\n")}` : ""}

Please let me know if you would like to discuss these findings or if you need any additional analysis.

Best regards`;
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(generateEmailTemplate());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          <span className="text-slate-300">Export</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Export & Share</h1>
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
          {/* Export Options */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <Download className="w-5 h-5 text-blue-400" />
              Export Data
            </h2>
            <p className="text-sm text-slate-400 mb-4">
              Download the extraction data in various formats for further analysis.
            </p>
            <ExportButtons result={extractionResult} />
          </div>

          {/* Email Template */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                <Mail className="w-5 h-5 text-purple-400" />
                Email Template
              </h2>
              <button
                onClick={handleCopyEmail}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy to Clipboard
                  </>
                )}
              </button>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              Use this pre-formatted email template to share findings with your team.
            </p>
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 max-h-96 overflow-y-auto">
              <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono">
                {generateEmailTemplate()}
              </pre>
            </div>
          </div>

          {/* Raw JSON */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <FileJson className="w-5 h-5 text-emerald-400" />
              Raw JSON Data
            </h2>
            <p className="text-sm text-slate-400 mb-4">
              View and copy the complete extraction data in JSON format.
            </p>
            <RawJsonViewer data={extractionResult} />
          </div>
        </div>
      </main>
    </div>
  );
}
