"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { StreamingState } from "@/hooks/useStreamingExtraction";
import SummaryCards from "./summary-cards";
import TPFlags from "./tp-flags";
import BalanceSheetTable from "./data-tables/balance-sheet-table";
import PnlTable from "./data-tables/pnl-table";
import ICDetailsTable from "./data-tables/ic-details-table";
import RawJsonViewer from "./data-tables/raw-json-viewer";
import ExportButtons from "./export-buttons";
import StickyScore from "./sticky-score";
import { CapitalizationGauge } from "./capitalization-gauge";
import { SpreadAnalysisSection } from "./spread-analysis-section";
import { BoardManagersCard } from "./board-managers-card";
import { DetailedLoansTable } from "./data-tables/detailed-loans-table";
import { formatDate } from "@/lib/utils";
import { FileUp, AlertTriangle } from "lucide-react";
import {
  HeaderSkeleton,
  SummaryCardsSkeleton,
  TPFlagsSkeleton,
  DataTableSkeleton,
  ProgressIndicator,
} from "./loading-skeletons";
import { ExtractionResult } from "@/types/extraction";

interface StreamingResultsDashboardProps {
  state: StreamingState;
  pdfData: string | null;
  onNewExtraction: () => void;
}

type TabType = "balance-sheet" | "pnl" | "ic-details" | "analysis" | "raw-json";

export default function StreamingResultsDashboard({
  state,
  pdfData,
  onNewExtraction,
}: StreamingResultsDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("balance-sheet");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const { metadata, entity_governance, entity_classification, balance_sheet, profit_and_loss, notes_extraction, tp_analysis, extraction_cost_usd, stage } = state;
  const isLowConfidence = metadata?.extraction_confidence === "low";
  const isComplete = stage === "complete";

  const tabs = useMemo<{ id: TabType; label: string }[]>(() => [
    { id: "balance-sheet", label: "Balance Sheet" },
    { id: "pnl", label: "P&L" },
    { id: "ic-details", label: "IC Details" },
    { id: "analysis", label: "Analysis" },
    { id: "raw-json", label: "Raw JSON" },
  ], []);

  const handleTabKeyDown = useCallback(
    (e: React.KeyboardEvent, currentIndex: number) => {
      let newIndex: number | null = null;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
          break;
        case "ArrowRight":
          e.preventDefault();
          newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
          break;
        case "Home":
          e.preventDefault();
          newIndex = 0;
          break;
        case "End":
          e.preventDefault();
          newIndex = tabs.length - 1;
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          setActiveTab(tabs[currentIndex].id);
          break;
      }

      if (newIndex !== null) {
        tabRefs.current[newIndex]?.focus();
      }
    },
    [tabs]
  );

  // Build the complete result for export buttons and raw JSON viewer
  const completeResult: ExtractionResult | null =
    metadata && entity_classification && balance_sheet && profit_and_loss && notes_extraction && tp_analysis
      ? {
          metadata,
          entity_classification,
          entity_governance: entity_governance || undefined,
          balance_sheet,
          profit_and_loss,
          notes_extraction,
          tp_analysis,
          extraction_cost_usd: extraction_cost_usd || undefined,
        }
      : null;

  // Show progress indicator when still extracting
  const showProgress = !isComplete && stage !== "idle" && stage !== "error";

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header - show skeleton until metadata arrives */}
      {metadata ? (
        <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl font-semibold text-slate-100">
                  {metadata.company_name || "Unknown Company"}
                </h1>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <span>
                    {metadata.rcs_number && `RCS ${metadata.rcs_number} · `}
                    {formatDate(metadata.financial_year_end)}
                  </span>
                  {/* Currency badge */}
                  <span className="px-2 py-0.5 bg-slate-700 rounded text-slate-300 text-xs font-medium">
                    {metadata.currency}
                  </span>
                  {/* Account type badge */}
                  {metadata.account_type && (
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs font-medium capitalize">
                      {metadata.account_type}
                    </span>
                  )}
                  {/* Confidence indicator */}
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
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
            </div>

            <div className="flex items-center gap-3">
              {tp_analysis && (
                <StickyScore score={tp_analysis.overall_tp_opportunity_score} />
              )}
              {completeResult && <ExportButtons result={completeResult} />}
              <button
                onClick={onNewExtraction}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
              >
                <FileUp className="w-4 h-4" />
                New Extraction
              </button>
            </div>
          </div>
        </header>
      ) : (
        <HeaderSkeleton />
      )}

      {/* Low confidence warning */}
      {isLowConfidence && metadata && (
        <div className="bg-amber-500/10 border-b border-amber-500/20">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3 text-amber-400">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-medium">Low confidence extraction</p>
              <p className="text-sm text-amber-400/80">
                Some data may be incomplete or inaccurate. Please verify against
                source document.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Progress indicator */}
        {showProgress && <ProgressIndicator stage={stage} />}

        {/* Summary cards - show skeleton until data arrives */}
        <section className="mb-8 animate-fade-in">
          {entity_classification && balance_sheet && tp_analysis ? (
            <SummaryCards
              result={{
                metadata: metadata!,
                entity_classification,
                balance_sheet,
                profit_and_loss: profit_and_loss!,
                notes_extraction: notes_extraction!,
                tp_analysis,
              }}
            />
          ) : (
            <SummaryCardsSkeleton />
          )}
        </section>

        {/* TP Flags - show skeleton until tp_analysis arrives */}
        <section className="mb-8 animate-fade-in" style={{ animationDelay: "100ms" }}>
          {tp_analysis ? (
            <TPFlags flags={tp_analysis.priority_flags} />
          ) : (
            <TPFlagsSkeleton />
          )}
        </section>

        {/* Data tables - show skeleton until balance_sheet arrives */}
        <section className="animate-fade-in" style={{ animationDelay: "200ms" }}>
          {balance_sheet ? (
            <div className="bg-slate-800 rounded-xl border border-slate-700">
              {/* Tab navigation */}
              <div className="flex border-b border-slate-700" role="tablist" aria-label="Data sections">
                {tabs.map((tab, index) => (
                  <button
                    key={tab.id}
                    ref={(el) => { tabRefs.current[index] = el; }}
                    onClick={() => setActiveTab(tab.id)}
                    onKeyDown={(e) => handleTabKeyDown(e, index)}
                    className={`px-6 py-3 text-sm font-medium transition-colors relative focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${
                      activeTab === tab.id
                        ? "text-blue-400"
                        : "text-slate-400 hover:text-slate-300"
                    }`}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    aria-controls={`tabpanel-${tab.id}`}
                    tabIndex={activeTab === tab.id ? 0 : -1}
                    id={`tab-${tab.id}`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />
                    )}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div
                className="p-6"
                role="tabpanel"
                id={`tabpanel-${activeTab}`}
                aria-labelledby={`tab-${activeTab}`}
              >
                {activeTab === "balance-sheet" && (
                  <BalanceSheetTable balanceSheet={balance_sheet} />
                )}
                {activeTab === "pnl" && profit_and_loss && (
                  <PnlTable profitAndLoss={profit_and_loss} />
                )}
                {activeTab === "ic-details" && notes_extraction && tp_analysis && (
                  <div className="space-y-6">
                    <ICDetailsTable
                      notes={notes_extraction}
                      icFinancing={tp_analysis.ic_financing}
                    />
                    {/* Detailed loan tables */}
                    {notes_extraction.detailed_loans_granted && notes_extraction.detailed_loans_granted.length > 0 && (
                      <DetailedLoansTable
                        loans={notes_extraction.detailed_loans_granted}
                        title="Detailed Loans Granted (Loan-by-Loan)"
                        direction="granted"
                      />
                    )}
                    {notes_extraction.detailed_loans_received && notes_extraction.detailed_loans_received.length > 0 && (
                      <DetailedLoansTable
                        loans={notes_extraction.detailed_loans_received}
                        title="Detailed Loans Received (Loan-by-Loan)"
                        direction="received"
                      />
                    )}
                    {notes_extraction.shareholder_loans && notes_extraction.shareholder_loans.length > 0 && (
                      <DetailedLoansTable
                        loans={notes_extraction.shareholder_loans}
                        title="Shareholder Loans"
                        direction="received"
                      />
                    )}
                  </div>
                )}
                {activeTab === "analysis" && tp_analysis && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Spread Analysis */}
                      <SpreadAnalysisSection icFinancing={tp_analysis.ic_financing} />
                      {/* Capitalization Gauge */}
                      <CapitalizationGauge capitalization={tp_analysis.capitalization} />
                    </div>
                    {/* Board of Managers */}
                    {entity_governance && (
                      <BoardManagersCard governance={entity_governance} />
                    )}
                    {/* Focus Areas and Rationale */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                        <h3 className="text-sm font-medium text-slate-300 mb-3">
                          Score Rationale
                        </h3>
                        <p className="text-sm text-slate-400">
                          {tp_analysis.score_rationale}
                        </p>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                        <h3 className="text-sm font-medium text-slate-300 mb-3">
                          Recommended Focus Areas
                        </h3>
                        <ul className="text-sm text-slate-400 space-y-2">
                          {tp_analysis.recommended_focus_areas.map((area, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-blue-400">•</span>
                              {area}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === "raw-json" && completeResult && (
                  <RawJsonViewer data={completeResult} />
                )}
              </div>
            </div>
          ) : (
            <DataTableSkeleton />
          )}
        </section>

        {/* Extraction notes */}
        {metadata && metadata.extraction_notes.length > 0 && (
          <section className="mt-8 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <h3 className="text-sm font-medium text-slate-300 mb-2">
              Extraction Notes
            </h3>
            <ul className="text-sm text-slate-400 space-y-1">
              {metadata.extraction_notes.map((note, index) => (
                <li key={index}>• {note}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Cost display */}
        {extraction_cost_usd && (
          <div className="mt-4 text-center text-sm text-slate-500">
            Extraction cost: ${extraction_cost_usd.toFixed(3)}
          </div>
        )}
      </main>
    </div>
  );
}
