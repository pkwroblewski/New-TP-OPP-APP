"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useExtraction } from "@/hooks/useExtraction";
import AuthHeader from "@/components/auth-header";
import {
  Loader2,
  AlertCircle,
  Building2,
  TrendingUp,
  ArrowUpDown,
  Banknote,
  AlertTriangle,
  Table,
  FileText,
  PieChart,
  Download,
  ChevronRight,
  Target,
  ScrollText,
} from "lucide-react";
import {
  formatEUR,
  formatDERatio,
  formatPercentage,
  getTPScoreClasses,
  getTPScoreLabel,
} from "@/lib/utils";

interface NavCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

function NavCard({ title, description, href, icon, badge }: NavCardProps) {
  return (
    <Link
      href={href}
      className="block bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl p-4 transition-all group"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-slate-700/50 rounded-lg text-slate-400 group-hover:text-blue-400 transition-colors">
            {icon}
          </div>
          <div>
            <h3 className="font-medium text-slate-200 group-hover:text-white transition-colors">
              {title}
            </h3>
            <p className="text-sm text-slate-400 mt-0.5">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {badge && (
            <span className="px-2 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded">
              {badge}
            </span>
          )}
          <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-slate-300 transition-colors" />
        </div>
      </div>
    </Link>
  );
}

export default function ExtractionSummaryPage() {
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
            <span>Loading extraction...</span>
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
            <p className="text-slate-400 mb-6">
              {error || "The extraction you're looking for doesn't exist or you don't have access."}
            </p>
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

  const { metadata, entity_classification, balance_sheet, tp_analysis } = extractionResult;

  // Calculate metrics
  const icLoansGranted = tp_analysis.ic_financing.total_loans_granted || 0;
  const icLoansReceived = tp_analysis.ic_financing.total_loans_received || 0;
  const totalICExposure = icLoansGranted + icLoansReceived;
  const deRatio = tp_analysis.capitalization.debt_to_equity_ratio;

  return (
    <div className="min-h-screen bg-slate-950">
      <AuthHeader />

      <main className="max-w-6xl mx-auto px-4 py-6 pt-24">
        {/* Company Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
            <Link href="/dashboard" className="hover:text-slate-300">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-300">{metadata.company_name || "Extraction"}</span>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-100">
                {metadata.company_name || "Unknown Company"}
              </h1>
              <div className="flex items-center gap-3 mt-2 text-sm text-slate-400">
                {metadata.rcs_number && <span>RCS {metadata.rcs_number}</span>}
                {metadata.financial_year_end && (
                  <span>FY {new Date(metadata.financial_year_end).getFullYear()}</span>
                )}
                <span className="px-2 py-0.5 bg-slate-700 rounded text-slate-300 text-xs">
                  {metadata.currency}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-xs ${
                    metadata.extraction_confidence === "high"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : metadata.extraction_confidence === "medium"
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {metadata.extraction_confidence} confidence
                </span>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-lg border font-bold text-xl ${getTPScoreClasses(tp_analysis.overall_tp_opportunity_score)}`}>
              Score {tp_analysis.overall_tp_opportunity_score}
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Entity Type */}
          <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Entity Type</p>
                <p className="text-xl font-semibold text-slate-100 capitalize">
                  {entity_classification.primary_type || "Unknown"}
                </p>
                {entity_classification.activities_description && (
                  <p className="text-sm text-slate-400 mt-1 line-clamp-1">
                    {entity_classification.activities_description}
                  </p>
                )}
              </div>
              <div className="p-2 bg-slate-700/50 rounded-lg">
                <Building2 className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </div>

          {/* Total Assets */}
          <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Total Assets</p>
                <p className="text-xl font-semibold text-slate-100 font-mono">
                  {formatEUR(balance_sheet.total_assets)}
                </p>
              </div>
              <div className="p-2 bg-slate-700/50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* IC Exposure */}
          <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Total IC Exposure</p>
                <p className="text-xl font-semibold text-slate-100 font-mono">
                  {formatEUR(totalICExposure)}
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  {formatEUR(icLoansGranted)} / {formatEUR(icLoansReceived)}
                </p>
              </div>
              <div className="p-2 bg-slate-700/50 rounded-lg">
                <ArrowUpDown className="w-5 h-5 text-amber-400" />
              </div>
            </div>
          </div>

          {/* D/E Ratio */}
          <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Debt-to-Equity</p>
                <p className="text-xl font-semibold text-slate-100 font-mono">
                  {formatDERatio(deRatio)}
                </p>
                {tp_analysis.capitalization.debt_percentage !== null && (
                  <p className="text-sm text-slate-400 mt-1">
                    {formatPercentage(tp_analysis.capitalization.debt_percentage)} debt
                  </p>
                )}
              </div>
              <div className="p-2 bg-slate-700/50 rounded-lg">
                <Banknote className="w-5 h-5 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* TP Score Card */}
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={`px-4 py-2 rounded-lg border font-bold text-xl ${getTPScoreClasses(tp_analysis.overall_tp_opportunity_score)}`}>
                Score {tp_analysis.overall_tp_opportunity_score}
              </div>
              <div>
                <p className="text-lg font-medium text-slate-100">
                  {getTPScoreLabel(tp_analysis.overall_tp_opportunity_score)}
                </p>
                <p className="text-sm text-slate-400 max-w-xl">
                  {tp_analysis.score_rationale}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-slate-300">
                {tp_analysis.priority_flags.length} flag{tp_analysis.priority_flags.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
          {tp_analysis.recommended_focus_areas.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-700">
              <p className="text-xs text-slate-500 mb-2">Focus Areas</p>
              <div className="flex flex-wrap gap-2">
                {tp_analysis.recommended_focus_areas.map((area, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-slate-700 rounded text-slate-300"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Cards - 4 rows × 2 columns */}
        <h2 className="text-lg font-semibold text-slate-200 mb-4">Sections</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Row 1 */}
          <NavCard
            title="Company Profile"
            description="AI-generated company overview and TP info"
            href={`/extraction/${id}/profile`}
            icon={<ScrollText className="w-5 h-5" />}
          />
          <NavCard
            title="IC Details"
            description="Intercompany loans and transactions"
            href={`/extraction/${id}/ic-details`}
            icon={<ArrowUpDown className="w-5 h-5" />}
          />
          {/* Row 2 */}
          <NavCard
            title="Company Details"
            description="Classification and governance details"
            href={`/extraction/${id}/entity`}
            icon={<Building2 className="w-5 h-5" />}
          />
          <NavCard
            title="Analysis"
            description="Spread analysis, capitalization, governance"
            href={`/extraction/${id}/analysis`}
            icon={<PieChart className="w-5 h-5" />}
          />
          {/* Row 3 */}
          <NavCard
            title="Balance Sheet"
            description="Assets, liabilities and equity breakdown"
            href={`/extraction/${id}/balance-sheet`}
            icon={<Table className="w-5 h-5" />}
          />
          <NavCard
            title="TP Flags"
            description="Priority flags and recommendations"
            href={`/extraction/${id}/flags`}
            icon={<AlertTriangle className="w-5 h-5" />}
            badge={tp_analysis.priority_flags.length > 0 ? `${tp_analysis.priority_flags.length}` : undefined}
          />
          {/* Row 4 */}
          <NavCard
            title="Profit & Loss"
            description="Income statement and financial performance"
            href={`/extraction/${id}/pnl`}
            icon={<FileText className="w-5 h-5" />}
          />
          <NavCard
            title="Export"
            description="Download data and generate reports"
            href={`/extraction/${id}/export`}
            icon={<Download className="w-5 h-5" />}
          />
        </div>
      </main>
    </div>
  );
}
