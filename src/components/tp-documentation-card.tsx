"use client";

import { cn } from "@/lib/utils";
import { TPDocumentation } from "@/types/extraction";
import { FileCheck, Check, X, FileText } from "lucide-react";

interface TPDocumentationCardProps {
  tpDocumentation: TPDocumentation;
  className?: string;
}

export function TPDocumentationCard({
  tpDocumentation,
  className,
}: TPDocumentationCardProps) {
  const {
    master_file_referenced,
    local_file_referenced,
    benchmarking_study_mentioned,
    tp_policy_disclosed,
    pricing_method_stated,
    intercompany_agreements_mentioned,
    documentation_notes,
  } = tpDocumentation;

  // Check if any documentation is present
  const hasAnyDocumentation =
    master_file_referenced ||
    local_file_referenced ||
    benchmarking_study_mentioned ||
    tp_policy_disclosed ||
    intercompany_agreements_mentioned ||
    (pricing_method_stated && pricing_method_stated !== "not_disclosed") ||
    documentation_notes.length > 0;

  if (!hasAnyDocumentation) {
    return null;
  }

  // Format pricing method for display
  const formatPricingMethod = (method: string | null | undefined): string => {
    if (!method || method === "not_disclosed") return "Not Disclosed";
    switch (method) {
      case "CUP":
        return "CUP (Comparable Uncontrolled Price)";
      case "cost_plus":
        return "Cost Plus";
      case "resale_minus":
        return "Resale Minus";
      case "TNMM":
        return "TNMM (Transactional Net Margin Method)";
      case "profit_split":
        return "Profit Split";
      default:
        return method;
    }
  };

  // Status check item component
  const StatusItem = ({
    label,
    checked,
  }: {
    label: string;
    checked: boolean;
  }) => (
    <div className="flex items-center gap-2 p-2 bg-slate-900/50 rounded-lg">
      {checked ? (
        <div className="p-1 bg-emerald-500/20 rounded-full">
          <Check className="h-3.5 w-3.5 text-emerald-400" />
        </div>
      ) : (
        <div className="p-1 bg-slate-700 rounded-full">
          <X className="h-3.5 w-3.5 text-slate-500" />
        </div>
      )}
      <span
        className={cn(
          "text-sm",
          checked ? "text-slate-200" : "text-slate-500"
        )}
      >
        {label}
      </span>
    </div>
  );

  return (
    <div
      className={cn(
        "bg-slate-800/50 rounded-lg border border-slate-700 p-5",
        className
      )}
    >
      <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
        <FileCheck className="h-5 w-5 text-blue-400" />
        TP Documentation Status
      </h3>

      <div className="space-y-5">
        {/* Documentation Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <StatusItem
            label="Master File Referenced"
            checked={master_file_referenced}
          />
          <StatusItem
            label="Local File Referenced"
            checked={local_file_referenced}
          />
          <StatusItem
            label="Benchmarking Study Mentioned"
            checked={benchmarking_study_mentioned}
          />
          <StatusItem
            label="TP Policy Disclosed"
            checked={tp_policy_disclosed}
          />
          <StatusItem
            label="IC Agreements Mentioned"
            checked={intercompany_agreements_mentioned}
          />
        </div>

        {/* Pricing Method */}
        {pricing_method_stated && pricing_method_stated !== "not_disclosed" && (
          <div>
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">
              Pricing Method
            </p>
            <span className="inline-flex px-2 py-1 text-xs rounded border bg-blue-500/10 text-blue-400 border-blue-500/20 font-medium">
              {formatPricingMethod(pricing_method_stated)}
            </span>
          </div>
        )}

        {/* Documentation Notes */}
        {documentation_notes.length > 0 && (
          <div>
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              Documentation Notes
            </p>
            <ul className="space-y-1.5">
              {documentation_notes.map((note, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-slate-400"
                >
                  <span className="text-slate-500 mt-0.5">-</span>
                  {note}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
