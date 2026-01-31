"use client";

import {
  cn,
  getICLoansStatusClasses,
  getRateComparisonClasses,
  getCreditQualityClasses,
} from "@/lib/utils";
import { ArmsLengthAssessment } from "@/types/extraction";
import { Scale, TrendingUp, ShieldCheck, FileText, AlertTriangle } from "lucide-react";

interface ArmsLengthAssessmentCardProps {
  assessment: ArmsLengthAssessment;
  className?: string;
}

export function ArmsLengthAssessmentCard({
  assessment,
  className,
}: ArmsLengthAssessmentCardProps) {
  const {
    ic_loans_status,
    rate_comparison_to_market,
    assessment_rationale,
    credit_quality_indicator,
    benchmark_reference,
    flags,
  } = assessment;

  // Check if there's meaningful content
  const hasContent =
    ic_loans_status !== "insufficient_data" ||
    rate_comparison_to_market !== "undetermined" ||
    credit_quality_indicator !== "not_determinable" ||
    assessment_rationale ||
    benchmark_reference ||
    flags.length > 0;

  if (!hasContent) {
    return null;
  }

  // Format status labels for display
  const formatICLoansStatus = (status: string): string => {
    switch (status) {
      case "compliant":
        return "Compliant";
      case "needs_review":
        return "Needs Review";
      case "potentially_non_compliant":
        return "Potentially Non-Compliant";
      case "insufficient_data":
        return "Insufficient Data";
      default:
        return status;
    }
  };

  const formatRateComparison = (comparison: string): string => {
    switch (comparison) {
      case "above_market":
        return "Above Market";
      case "at_market":
        return "At Market";
      case "below_market":
        return "Below Market";
      case "undetermined":
        return "Undetermined";
      default:
        return comparison;
    }
  };

  const formatCreditQuality = (quality: string): string => {
    switch (quality) {
      case "investment_grade":
        return "Investment Grade";
      case "sub_investment":
        return "Sub-Investment";
      case "distressed":
        return "Distressed";
      case "not_determinable":
        return "Not Determinable";
      default:
        return quality;
    }
  };

  return (
    <div
      className={cn(
        "bg-slate-800/50 rounded-lg border border-slate-700 p-5",
        className
      )}
    >
      <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
        <Scale className="h-5 w-5 text-emerald-400" />
        Arm&apos;s Length Assessment
      </h3>

      <div className="space-y-5">
        {/* Status Badges Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* IC Loans Status */}
          <div>
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">
              IC Loans Status
            </p>
            <span
              className={cn(
                "inline-flex px-2 py-1 text-xs rounded border font-medium",
                getICLoansStatusClasses(ic_loans_status)
              )}
            >
              {formatICLoansStatus(ic_loans_status)}
            </span>
          </div>

          {/* Rate Comparison */}
          <div>
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">
              Rate vs Market
            </p>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-slate-400" />
              <span
                className={cn(
                  "inline-flex px-2 py-1 text-xs rounded border font-medium",
                  getRateComparisonClasses(rate_comparison_to_market)
                )}
              >
                {formatRateComparison(rate_comparison_to_market)}
              </span>
            </div>
          </div>

          {/* Credit Quality */}
          <div>
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">
              Credit Quality
            </p>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-slate-400" />
              <span
                className={cn(
                  "inline-flex px-2 py-1 text-xs rounded border font-medium",
                  getCreditQualityClasses(credit_quality_indicator)
                )}
              >
                {formatCreditQuality(credit_quality_indicator)}
              </span>
            </div>
          </div>
        </div>

        {/* Benchmark Reference */}
        {benchmark_reference && (
          <div>
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">
              Benchmark Reference
            </p>
            <span className="inline-flex px-2 py-1 text-sm bg-slate-700 rounded text-slate-300">
              {benchmark_reference}
            </span>
          </div>
        )}

        {/* Assessment Rationale */}
        {assessment_rationale && (
          <div>
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              Assessment Rationale
            </p>
            <p className="text-sm text-slate-400 leading-relaxed">
              {assessment_rationale}
            </p>
          </div>
        )}

        {/* Flags */}
        {flags.length > 0 && (
          <div>
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" />
              Flags
            </p>
            <ul className="space-y-1.5">
              {flags.map((flag, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-amber-400"
                >
                  <span className="text-amber-500 mt-0.5">!</span>
                  {flag}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
