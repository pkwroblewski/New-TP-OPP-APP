"use client";

import { cn, getSubstanceLevelClasses } from "@/lib/utils";
import { FunctionalAnalysis } from "@/types/extraction";
import { Activity, MapPin, Cog, Package, AlertTriangle, FileText } from "lucide-react";

interface FunctionalAnalysisCardProps {
  functionalAnalysis: FunctionalAnalysis;
  className?: string;
}

export function FunctionalAnalysisCard({
  functionalAnalysis,
  className,
}: FunctionalAnalysisCardProps) {
  const {
    functions_performed,
    assets_controlled,
    risks_assumed,
    decision_making_location,
    substance_level,
    substance_notes,
  } = functionalAnalysis;

  // Check if there's meaningful content to display
  const hasAssets =
    assets_controlled.financial_assets.length > 0 ||
    assets_controlled.intangible_assets.length > 0 ||
    assets_controlled.tangible_assets.length > 0;

  const hasContent =
    functions_performed.length > 0 ||
    hasAssets ||
    risks_assumed.length > 0 ||
    decision_making_location !== "not_determinable" ||
    substance_notes.length > 0;

  if (!hasContent) {
    return null;
  }

  // Format decision making location for display
  const formatLocation = (location: string): string => {
    switch (location) {
      case "Luxembourg":
        return "Luxembourg";
      case "abroad":
        return "Abroad";
      case "mixed":
        return "Mixed";
      case "not_determinable":
        return "Not Determinable";
      default:
        return location;
    }
  };

  // Format substance level for display
  const formatSubstanceLevel = (level: string): string => {
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  return (
    <div
      className={cn(
        "bg-slate-800/50 rounded-lg border border-slate-700 p-5",
        className
      )}
    >
      <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
        <Activity className="h-5 w-5 text-purple-400" />
        Functional Analysis (FAR)
      </h3>

      <div className="space-y-5">
        {/* Substance Level & Decision Making Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">
              Substance Level
            </p>
            <span
              className={cn(
                "inline-flex px-2 py-1 text-xs rounded border font-medium",
                getSubstanceLevelClasses(substance_level)
              )}
            >
              {formatSubstanceLevel(substance_level)}
            </span>
          </div>

          {decision_making_location !== "not_determinable" && (
            <div>
              <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">
                Decision Making Location
              </p>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-slate-300">
                  {formatLocation(decision_making_location)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Functions Performed */}
        {functions_performed.length > 0 && (
          <div>
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide flex items-center gap-1.5">
              <Cog className="h-3.5 w-3.5" />
              Functions Performed
            </p>
            <div className="flex flex-wrap gap-2">
              {functions_performed.map((fn, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-slate-700 rounded text-slate-300"
                >
                  {fn}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Assets Controlled */}
        {hasAssets && (
          <div>
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5" />
              Assets Controlled
            </p>
            <div className="space-y-3">
              {assets_controlled.financial_assets.length > 0 && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">Financial Assets</p>
                  <div className="flex flex-wrap gap-2">
                    {assets_controlled.financial_assets.map((asset, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-blue-500/10 text-blue-400 rounded border border-blue-500/20"
                      >
                        {asset}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {assets_controlled.intangible_assets.length > 0 && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">Intangible Assets</p>
                  <div className="flex flex-wrap gap-2">
                    {assets_controlled.intangible_assets.map((asset, index) => (
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

              {assets_controlled.tangible_assets.length > 0 && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">Tangible Assets</p>
                  <div className="flex flex-wrap gap-2">
                    {assets_controlled.tangible_assets.map((asset, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20"
                      >
                        {asset}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Risks Assumed */}
        {risks_assumed.length > 0 && (
          <div>
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" />
              Risks Assumed
            </p>
            <div className="flex flex-wrap gap-2">
              {risks_assumed.map((risk, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-amber-500/10 text-amber-400 rounded border border-amber-500/20"
                >
                  {risk}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Substance Notes */}
        {substance_notes.length > 0 && (
          <div>
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              Substance Notes
            </p>
            <ul className="space-y-1.5">
              {substance_notes.map((note, index) => (
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
