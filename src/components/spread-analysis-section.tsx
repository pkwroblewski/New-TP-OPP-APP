"use client";

import { cn, formatPercentage, formatBps, getSpreadColor } from "@/lib/utils";
import { ICFinancing } from "@/types/extraction";

interface SpreadAnalysisSectionProps {
  icFinancing: ICFinancing;
  className?: string;
}

export function SpreadAnalysisSection({
  icFinancing,
  className,
}: SpreadAnalysisSectionProps) {
  const {
    implied_lending_rate,
    implied_borrowing_rate,
    spread_bps,
    ic_interest_income,
    ic_interest_expense,
    total_loans_granted,
    total_loans_received,
  } = icFinancing;

  const spreadColor = getSpreadColor(spread_bps);

  // Calculate bar widths for visualization (max 10%)
  const maxRate = 10;
  const lendingWidth = implied_lending_rate
    ? Math.min((implied_lending_rate / maxRate) * 100, 100)
    : 0;
  const borrowingWidth = implied_borrowing_rate
    ? Math.min((implied_borrowing_rate / maxRate) * 100, 100)
    : 0;

  return (
    <div
      className={cn(
        "bg-slate-800/50 rounded-lg p-4 border border-slate-700",
        className
      )}
    >
      <h3 className="text-sm font-medium text-slate-300 mb-4">
        Interest Rate Spread Analysis
      </h3>

      {/* Spread indicator */}
      <div className="flex items-center justify-center mb-6">
        <div className="text-center">
          <p className="text-xs text-slate-500 mb-1">Net Spread</p>
          <p className={cn("text-3xl font-bold", spreadColor)}>
            {formatBps(spread_bps)}
          </p>
          {spread_bps !== null && (
            <p className="text-xs text-slate-500 mt-1">
              {spread_bps < 10
                ? "High Risk - Zero/Negative Spread"
                : spread_bps < 50
                ? "Low Spread - Monitor"
                : spread_bps < 100
                ? "Moderate Spread"
                : "Healthy Spread"}
            </p>
          )}
        </div>
      </div>

      {/* Rate comparison */}
      <div className="space-y-4">
        {/* Lending Rate */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400">Implied Lending Rate</span>
            <span className="text-sm font-medium text-emerald-400">
              {formatPercentage(implied_lending_rate)}
            </span>
          </div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${lendingWidth}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1 text-xs text-slate-500">
            <span>
              Income:{" "}
              {ic_interest_income !== null
                ? `EUR ${(ic_interest_income / 1_000_000).toFixed(2)}M`
                : "-"}
            </span>
            <span>
              Loans Granted:{" "}
              {total_loans_granted !== null
                ? `EUR ${(total_loans_granted / 1_000_000).toFixed(1)}M`
                : "-"}
            </span>
          </div>
        </div>

        {/* Borrowing Rate */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400">Implied Borrowing Rate</span>
            <span className="text-sm font-medium text-orange-400">
              {formatPercentage(implied_borrowing_rate)}
            </span>
          </div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${borrowingWidth}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1 text-xs text-slate-500">
            <span>
              Expense:{" "}
              {ic_interest_expense !== null
                ? `EUR ${(ic_interest_expense / 1_000_000).toFixed(2)}M`
                : "-"}
            </span>
            <span>
              Loans Received:{" "}
              {total_loans_received !== null
                ? `EUR ${(total_loans_received / 1_000_000).toFixed(1)}M`
                : "-"}
            </span>
          </div>
        </div>
      </div>

      {/* Spread calculation breakdown */}
      {implied_lending_rate !== null && implied_borrowing_rate !== null && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <p className="text-xs text-slate-500 mb-2">Calculation</p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-emerald-400">
              {formatPercentage(implied_lending_rate)}
            </span>
            <span className="text-slate-500">-</span>
            <span className="text-orange-400">
              {formatPercentage(implied_borrowing_rate)}
            </span>
            <span className="text-slate-500">=</span>
            <span className={spreadColor}>{formatBps(spread_bps)}</span>
          </div>
        </div>
      )}

      {/* Risk indicator */}
      {spread_bps !== null && spread_bps < 10 && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-sm text-red-400">
            <span className="font-medium">Warning:</span> Zero or negative spread
            indicates potential transfer pricing risk. The entity is lending at a
            lower rate than it borrows, which may attract tax authority scrutiny.
          </p>
        </div>
      )}
    </div>
  );
}
