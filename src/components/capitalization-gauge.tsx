"use client";

import { cn, formatDERatio, getDERatioStatus } from "@/lib/utils";
import { Capitalization } from "@/types/extraction";

interface CapitalizationGaugeProps {
  capitalization: Capitalization;
  className?: string;
}

export function CapitalizationGauge({
  capitalization,
  className,
}: CapitalizationGaugeProps) {
  const { debt_to_equity_ratio, total_equity, total_debt_funding_participations } =
    capitalization;

  const status = getDERatioStatus(debt_to_equity_ratio);

  // Calculate needle position (0-100%)
  // Map D/E ratio to position: 0 at left, 15+ at right
  const getNeedlePosition = () => {
    if (debt_to_equity_ratio === null) return 50;
    // Cap at 15x for visual purposes
    const capped = Math.min(debt_to_equity_ratio, 15);
    return (capped / 15) * 100;
  };

  const needlePosition = getNeedlePosition();

  // Threshold positions on the gauge
  const thresholds = [
    { value: 1.5, label: "1.5x", position: (1.5 / 15) * 100 },
    { value: 5.67, label: "5.67x", position: (5.67 / 15) * 100 },
    { value: 10, label: "10x", position: (10 / 15) * 100 },
  ];

  return (
    <div className={cn("bg-slate-800/50 rounded-lg p-4 border border-slate-700", className)}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-slate-300">
          Debt-to-Equity Ratio
        </h3>
        <div className="flex items-center gap-2">
          <span className={cn("text-lg font-semibold", status.color)}>
            {formatDERatio(debt_to_equity_ratio)}
          </span>
          <span
            className={cn(
              "text-xs px-2 py-0.5 rounded-full",
              status.risk === "none" && "bg-emerald-500/20 text-emerald-400",
              status.risk === "low" && "bg-amber-500/20 text-amber-400",
              status.risk === "medium" && "bg-orange-500/20 text-orange-400",
              status.risk === "high" && "bg-red-500/20 text-red-400"
            )}
          >
            {status.label}
          </span>
        </div>
      </div>

      {/* Gauge bar */}
      <div className="relative h-6 mb-2">
        {/* Gradient background */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div
            className="h-full w-full"
            style={{
              background:
                "linear-gradient(to right, #10b981 0%, #10b981 10%, #fbbf24 25%, #f97316 55%, #ef4444 67%, #dc2626 100%)",
            }}
          />
        </div>

        {/* Threshold markers */}
        {thresholds.map((threshold) => (
          <div
            key={threshold.value}
            className="absolute top-0 bottom-0 w-0.5 bg-slate-900/50"
            style={{ left: `${threshold.position}%` }}
          />
        ))}

        {/* Needle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg rounded-full transition-all duration-500"
          style={{
            left: `${needlePosition}%`,
            transform: "translateX(-50%)",
          }}
        />
      </div>

      {/* Threshold labels */}
      <div className="relative h-4 text-xs text-slate-500">
        <span className="absolute left-0">0x</span>
        {thresholds.map((threshold) => (
          <span
            key={threshold.value}
            className="absolute transform -translate-x-1/2"
            style={{ left: `${threshold.position}%` }}
          >
            {threshold.label}
          </span>
        ))}
        <span className="absolute right-0">15x+</span>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-700">
        <div>
          <p className="text-xs text-slate-500 mb-1">Total Equity</p>
          <p className="text-sm font-medium text-slate-200">
            {total_equity !== null
              ? `EUR ${(total_equity / 1_000_000).toFixed(1)}M`
              : "-"}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Debt Funding Participations</p>
          <p className="text-sm font-medium text-slate-200">
            {total_debt_funding_participations !== null
              ? `EUR ${(total_debt_funding_participations / 1_000_000).toFixed(1)}M`
              : "-"}
          </p>
        </div>
      </div>

      {/* Debt percentage bar */}
      {status.percentage > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-500">Debt %</span>
            <span className={status.color}>{status.percentage.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                status.risk === "none" && "bg-emerald-500",
                status.risk === "low" && "bg-amber-400",
                status.risk === "medium" && "bg-orange-500",
                status.risk === "high" && "bg-red-500"
              )}
              style={{ width: `${Math.min(status.percentage, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
