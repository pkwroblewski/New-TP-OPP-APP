"use client";

import { cn, formatEUR, formatPercentage } from "@/lib/utils";
import { IPTransactions } from "@/types/extraction";
import { Lightbulb, ArrowDownLeft, ArrowUpRight, Tag } from "lucide-react";

interface IPTransactionsCardProps {
  ipTransactions: IPTransactions;
  className?: string;
}

export function IPTransactionsCard({
  ipTransactions,
  className,
}: IPTransactionsCardProps) {
  const {
    royalty_income_detected,
    royalty_expense_detected,
    ip_assets_held,
    transactions,
  } = ipTransactions;

  // Check if there's meaningful content
  const hasContent =
    royalty_income_detected ||
    royalty_expense_detected ||
    ip_assets_held.length > 0 ||
    transactions.length > 0;

  if (!hasContent) {
    return null;
  }

  // Format transaction type for display
  const formatTransactionType = (type: string): string => {
    switch (type) {
      case "license_in":
        return "License In";
      case "license_out":
        return "License Out";
      case "sale":
        return "Sale";
      case "purchase":
        return "Purchase";
      default:
        return type;
    }
  };

  // Format IP type for display
  const formatIPType = (type: string | null | undefined): string => {
    if (!type) return "-";
    switch (type) {
      case "patent":
        return "Patent";
      case "trademark":
        return "Trademark";
      case "software":
        return "Software";
      case "other":
        return "Other";
      default:
        return type;
    }
  };

  // Get direction icon based on transaction type
  const getDirectionIcon = (type: string) => {
    switch (type) {
      case "license_in":
      case "purchase":
        return <ArrowDownLeft className="h-3.5 w-3.5 text-amber-400" />;
      case "license_out":
      case "sale":
        return <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />;
      default:
        return null;
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
        <Lightbulb className="h-5 w-5 text-purple-400" />
        IP Transactions
      </h3>

      <div className="space-y-5">
        {/* Detection Badges */}
        <div className="flex flex-wrap gap-3">
          {royalty_income_detected && (
            <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-medium">
              <ArrowUpRight className="h-3 w-3" />
              Royalty Income Detected
            </span>
          )}
          {royalty_expense_detected && (
            <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded border bg-amber-500/10 text-amber-400 border-amber-500/20 font-medium">
              <ArrowDownLeft className="h-3 w-3" />
              Royalty Expense Detected
            </span>
          )}
        </div>

        {/* IP Assets Held */}
        {ip_assets_held.length > 0 && (
          <div>
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" />
              IP Assets Held
            </p>
            <div className="flex flex-wrap gap-2">
              {ip_assets_held.map((asset, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-purple-500/10 text-purple-400 rounded border border-purple-500/20"
                >
                  {asset}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Transactions Table */}
        {transactions.length > 0 && (
          <div>
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">
              Transactions
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-500 border-b border-slate-700">
                    <th className="pb-2 pr-4 font-medium">Type</th>
                    <th className="pb-2 pr-4 font-medium">Counterparty</th>
                    <th className="pb-2 pr-4 font-medium text-right">Amount</th>
                    <th className="pb-2 pr-4 font-medium text-right">Royalty Rate</th>
                    <th className="pb-2 font-medium">IP Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {transactions.map((tx, index) => (
                    <tr key={index}>
                      <td className="py-2 pr-4">
                        <div className="flex items-center gap-1.5">
                          {getDirectionIcon(tx.type)}
                          <span className="text-slate-300">
                            {formatTransactionType(tx.type)}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 pr-4 text-slate-400">
                        {tx.counterparty || "-"}
                      </td>
                      <td className="py-2 pr-4 text-right text-slate-300 font-mono text-xs">
                        {tx.amount != null ? formatEUR(tx.amount) : "-"}
                      </td>
                      <td className="py-2 pr-4 text-right text-slate-300 font-mono text-xs">
                        {tx.royalty_rate != null
                          ? formatPercentage(tx.royalty_rate)
                          : "-"}
                      </td>
                      <td className="py-2 text-slate-400">
                        {formatIPType(tx.ip_type)}
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
