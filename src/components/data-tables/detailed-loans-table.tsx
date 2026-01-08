"use client";

import { useState } from "react";
import { cn, formatEUR, formatPercentage, formatDate } from "@/lib/utils";
import { DetailedLoan } from "@/types/extraction";
import { ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import CopyableCell from "@/components/ui/copyable-cell";

interface DetailedLoansTableProps {
  loans: DetailedLoan[];
  title: string;
  direction: "granted" | "received";
  className?: string;
}

export function DetailedLoansTable({
  loans,
  title,
  direction,
  className,
}: DetailedLoansTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  if (!loans || loans.length === 0) {
    return null;
  }

  const toggleRow = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  const getInstrumentTypeBadge = (type: DetailedLoan["instrument_type"]) => {
    const styles = {
      interest_bearing: "bg-blue-500/20 text-blue-400",
      profit_participating: "bg-purple-500/20 text-purple-400",
      convertible: "bg-amber-500/20 text-amber-400",
      interest_free: "bg-slate-500/20 text-slate-400",
    };
    const labels = {
      interest_bearing: "Interest Bearing",
      profit_participating: "Profit Participating",
      convertible: "Convertible",
      interest_free: "Interest Free",
    };
    return (
      <span className={cn("text-xs px-2 py-0.5 rounded-full", styles[type])}>
        {labels[type]}
      </span>
    );
  };

  // Calculate totals
  const totalCurrentYear = loans.reduce(
    (sum, loan) => sum + (loan.current_year_total || 0),
    0
  );
  const totalPreviousYear = loans.reduce(
    (sum, loan) => sum + (loan.previous_year_total || 0),
    0
  );

  return (
    <div
      className={cn(
        "bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden",
        className
      )}
    >
      <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-300">{title}</h3>
        <span className="text-xs text-slate-500">
          {loans.length} loan{loans.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-900/50">
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 w-8" />
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-400">
                Counterparty
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-400">
                Type
              </th>
              <th className="px-4 py-2 text-right text-xs font-medium text-slate-400">
                Rate
              </th>
              <th className="px-4 py-2 text-right text-xs font-medium text-slate-400">
                Current Year
              </th>
              <th className="px-4 py-2 text-right text-xs font-medium text-slate-400">
                Previous Year
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-400">
                Maturity
              </th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan, index) => (
              <>
                <tr
                  key={index}
                  className={cn(
                    "border-b border-slate-700/50 hover:bg-slate-700/30 cursor-pointer transition-colors",
                    expandedRows.has(index) && "bg-slate-700/20"
                  )}
                  onClick={() => toggleRow(index)}
                >
                  <td className="px-4 py-2">
                    {expandedRows.has(index) ? (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex flex-col">
                      <CopyableCell
                        value={loan.counterparty_name}
                        className="font-medium text-slate-200"
                      />
                      {loan.jurisdiction && (
                        <span className="text-xs text-slate-500">
                          {loan.jurisdiction}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    {getInstrumentTypeBadge(loan.instrument_type)}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <span className="text-slate-200">
                      {formatPercentage(loan.interest_rate)}
                    </span>
                    {loan.rate_adjustments && (
                      <span className="block text-xs text-amber-400">
                        {loan.rate_adjustments}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <CopyableCell
                      value={formatEUR(loan.current_year_total)}
                      className="text-slate-200"
                    />
                  </td>
                  <td className="px-4 py-2 text-right text-slate-400">
                    {formatEUR(loan.previous_year_total)}
                  </td>
                  <td className="px-4 py-2 text-slate-400">
                    {formatDate(loan.maturity_date)}
                  </td>
                </tr>
                {/* Expanded details row */}
                {expandedRows.has(index) && (
                  <tr className="bg-slate-900/30">
                    <td colSpan={7} className="px-8 py-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                        <div>
                          <p className="text-slate-500 mb-1">Original Principal</p>
                          <p className="text-slate-300">
                            {formatEUR(loan.original_principal)}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500 mb-1">Current Principal</p>
                          <p className="text-slate-300">
                            {formatEUR(loan.current_principal)}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500 mb-1">Capitalised Interest</p>
                          <p className="text-slate-300">
                            {formatEUR(loan.capitalised_interest)}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500 mb-1">Accrued Interest</p>
                          <p className="text-slate-300">
                            {formatEUR(loan.accrued_interest)}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500 mb-1">Execution Date</p>
                          <p className="text-slate-300">
                            {formatDate(loan.execution_date)}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500 mb-1">Account Caption</p>
                          <p className="text-slate-300">
                            {loan.account_caption || "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500 mb-1">Note Reference</p>
                          <p className="text-slate-300">
                            {loan.note_reference || "-"}
                          </p>
                        </div>
                        {loan.is_from_shareholder && (
                          <div>
                            <p className="text-slate-500 mb-1">Source</p>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                              Shareholder Loan
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-900/50 border-t border-slate-700">
              <td colSpan={4} className="px-4 py-2 text-right font-medium text-slate-300">
                Total
              </td>
              <td className="px-4 py-2 text-right font-medium text-slate-200">
                {formatEUR(totalCurrentYear)}
              </td>
              <td className="px-4 py-2 text-right font-medium text-slate-400">
                {formatEUR(totalPreviousYear)}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
