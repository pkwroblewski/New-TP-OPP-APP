"use client";

import { cn, formatEUR, formatPercentage } from "@/lib/utils";
import { ServiceArrangements } from "@/types/extraction";
import { Briefcase, ArrowDownLeft, ArrowUpRight, Check } from "lucide-react";

interface ServiceArrangementsCardProps {
  serviceArrangements: ServiceArrangements;
  className?: string;
}

export function ServiceArrangementsCard({
  serviceArrangements,
  className,
}: ServiceArrangementsCardProps) {
  const { management_fees_detected, arrangements } = serviceArrangements;

  // Check if there's meaningful content
  const hasContent = management_fees_detected || arrangements.length > 0;

  if (!hasContent) {
    return null;
  }

  // Format service type for display
  const formatServiceType = (type: string): string => {
    switch (type) {
      case "management":
        return "Management";
      case "administrative":
        return "Administrative";
      case "technical":
        return "Technical";
      case "treasury":
        return "Treasury";
      case "accounting":
        return "Accounting";
      case "other":
        return "Other";
      default:
        return type;
    }
  };

  // Format pricing method for display
  const formatPricingMethod = (method: string | null | undefined): string => {
    if (!method || method === "not_disclosed") return "-";
    switch (method) {
      case "cost_plus":
        return "Cost Plus";
      case "fixed_fee":
        return "Fixed Fee";
      case "percentage":
        return "Percentage";
      default:
        return method;
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
        <Briefcase className="h-5 w-5 text-blue-400" />
        Service Arrangements
      </h3>

      <div className="space-y-5">
        {/* Management Fees Badge */}
        {management_fees_detected && (
          <div>
            <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded border bg-blue-500/10 text-blue-400 border-blue-500/20 font-medium">
              <Check className="h-3 w-3" />
              Management Fees Detected
            </span>
          </div>
        )}

        {/* Arrangements Table */}
        {arrangements.length > 0 && (
          <div>
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">
              Service Arrangements
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-500 border-b border-slate-700">
                    <th className="pb-2 pr-4 font-medium">Service Type</th>
                    <th className="pb-2 pr-4 font-medium">Provider</th>
                    <th className="pb-2 pr-4 font-medium">Recipient</th>
                    <th className="pb-2 pr-4 font-medium">Direction</th>
                    <th className="pb-2 pr-4 font-medium text-right">Amount</th>
                    <th className="pb-2 pr-4 font-medium">Pricing</th>
                    <th className="pb-2 font-medium text-right">Markup</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {arrangements.map((arr, index) => (
                    <tr key={index}>
                      <td className="py-2 pr-4">
                        <span className="px-1.5 py-0.5 text-xs bg-slate-700 rounded text-slate-300">
                          {formatServiceType(arr.service_type)}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-slate-300 max-w-[120px] truncate">
                        {arr.provider}
                      </td>
                      <td className="py-2 pr-4 text-slate-400 max-w-[120px] truncate">
                        {arr.recipient}
                      </td>
                      <td className="py-2 pr-4">
                        {arr.direction === "inbound" ? (
                          <div className="flex items-center gap-1 text-amber-400">
                            <ArrowDownLeft className="h-3.5 w-3.5" />
                            <span className="text-xs">Inbound</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-emerald-400">
                            <ArrowUpRight className="h-3.5 w-3.5" />
                            <span className="text-xs">Outbound</span>
                          </div>
                        )}
                      </td>
                      <td className="py-2 pr-4 text-right text-slate-300 font-mono text-xs">
                        {arr.annual_amount != null
                          ? formatEUR(arr.annual_amount)
                          : "-"}
                      </td>
                      <td className="py-2 pr-4 text-slate-400 text-xs">
                        {formatPricingMethod(arr.pricing_method)}
                      </td>
                      <td className="py-2 text-right text-slate-300 font-mono text-xs">
                        {arr.markup_percentage != null
                          ? formatPercentage(arr.markup_percentage)
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
