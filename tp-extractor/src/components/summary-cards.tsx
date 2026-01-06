"use client";

import { ExtractionResult } from "@/types/extraction";
import {
  formatEUR,
  formatDERatio,
  formatPercentage,
  calculateYoYChange,
  formatYoYChange,
  getYoYChangeColor,
  getTPScoreClasses,
  getTPScoreLabel,
} from "@/lib/utils";
import {
  Building2,
  TrendingUp,
  Users,
  ArrowUpDown,
  Banknote,
  Info,
} from "lucide-react";

interface SummaryCardsProps {
  result: ExtractionResult;
}

interface CardProps {
  title: string;
  value: string;
  subtitle?: React.ReactNode;
  icon: React.ReactNode;
  className?: string;
  tooltip?: string;
}

function Card({ title, value, subtitle, icon, className, tooltip }: CardProps) {
  return (
    <div
      className={`bg-slate-800 rounded-xl p-5 border border-slate-700 ${className || ""}`}
      title={tooltip}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400 mb-1">{title}</p>
          <p className="text-2xl font-semibold text-slate-100 font-mono">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="p-2 bg-slate-700/50 rounded-lg">{icon}</div>
      </div>
    </div>
  );
}

export default function SummaryCards({ result }: SummaryCardsProps) {
  const { metadata, balance_sheet, tp_analysis, entity_classification, notes_extraction } =
    result;

  // Calculate total IC exposure
  const icLoansGranted = tp_analysis.ic_financing.total_loans_granted || 0;
  const icLoansReceived = tp_analysis.ic_financing.total_loans_received || 0;
  const totalICExposure = icLoansGranted + icLoansReceived;

  // Calculate total assets YoY change
  const assetsYoY = calculateYoYChange(
    balance_sheet.total_assets,
    balance_sheet.previous_year_total_assets
  );

  // D/E ratio
  const deRatio = tp_analysis.capitalization.debt_to_equity_ratio;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Company Info */}
      <Card
        title="Entity Type"
        value={entity_classification.primary_type.charAt(0).toUpperCase() + entity_classification.primary_type.slice(1)}
        subtitle={notes_extraction.employees_fte ? `${notes_extraction.employees_fte} FTE` : undefined}
        icon={<Building2 className="w-5 h-5 text-blue-400" />}
        tooltip={entity_classification.activities_description || undefined}
      />

      {/* Total Assets */}
      <Card
        title="Total Assets"
        value={formatEUR(balance_sheet.total_assets)}
        subtitle={
          assetsYoY !== null ? (
            <span className={getYoYChangeColor(assetsYoY)}>
              {formatYoYChange(assetsYoY)} YoY
            </span>
          ) : undefined
        }
        icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
        tooltip="Total assets from balance sheet"
      />

      {/* IC Exposure */}
      <Card
        title="Total IC Exposure"
        value={formatEUR(totalICExposure)}
        subtitle={`Loans: ${formatEUR(icLoansGranted)} / ${formatEUR(icLoansReceived)}`}
        icon={<ArrowUpDown className="w-5 h-5 text-amber-400" />}
        tooltip="Total intercompany loans granted and received"
      />

      {/* D/E Ratio */}
      <Card
        title="Debt-to-Equity"
        value={formatDERatio(deRatio)}
        subtitle={
          tp_analysis.capitalization.debt_percentage !== null
            ? `${formatPercentage(tp_analysis.capitalization.debt_percentage)} debt`
            : undefined
        }
        icon={<Banknote className="w-5 h-5 text-purple-400" />}
        tooltip="Debt funding participations / Total equity. Thresholds: <1.5x (no flag), 1.5-5.67x (low), 5.67-10x (medium), >10x (high)"
      />

      {/* TP Score - Full width on mobile, spans 2 on larger */}
      <div
        className={`lg:col-span-4 bg-slate-800 rounded-xl p-5 border border-slate-700`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`px-4 py-2 rounded-lg border font-bold text-xl ${getTPScoreClasses(
                tp_analysis.overall_tp_opportunity_score
              )}`}
            >
              Score {tp_analysis.overall_tp_opportunity_score}
            </div>
            <div>
              <p className="text-lg font-medium text-slate-100">
                {getTPScoreLabel(tp_analysis.overall_tp_opportunity_score)}
              </p>
              <p className="text-sm text-slate-400">
                {tp_analysis.score_rationale}
              </p>
            </div>
          </div>

          {tp_analysis.recommended_focus_areas.length > 0 && (
            <div className="hidden md:block">
              <p className="text-xs text-slate-500 mb-1">Focus Areas</p>
              <div className="flex flex-wrap gap-1">
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
      </div>
    </div>
  );
}
