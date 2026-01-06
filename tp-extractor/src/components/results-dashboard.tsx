"use client";

import { useState } from "react";
import { ExtractionResult } from "@/types/extraction";
import SummaryCards from "./summary-cards";
import TPFlags from "./tp-flags";
import BalanceSheetTable from "./data-tables/balance-sheet-table";
import PnlTable from "./data-tables/pnl-table";
import ICDetailsTable from "./data-tables/ic-details-table";
import RawJsonViewer from "./data-tables/raw-json-viewer";
import ExportButtons from "./export-buttons";
import StickyScore from "./sticky-score";
import { formatDate } from "@/lib/utils";
import { FileUp, AlertTriangle } from "lucide-react";

interface ResultsDashboardProps {
  result: ExtractionResult;
  pdfData: string | null;
  onNewExtraction: () => void;
}

type TabType = "balance-sheet" | "pnl" | "ic-details" | "raw-json";

export default function ResultsDashboard({
  result,
  pdfData,
  onNewExtraction,
}: ResultsDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("balance-sheet");
  const [showPdfViewer, setShowPdfViewer] = useState(false);

  const { metadata, tp_analysis } = result;
  const isLowConfidence = metadata.extraction_confidence === "low";

  const tabs: { id: TabType; label: string }[] = [
    { id: "balance-sheet", label: "Balance Sheet" },
    { id: "pnl", label: "P&L" },
    { id: "ic-details", label: "IC Details" },
    { id: "raw-json", label: "Raw JSON" },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Sticky header */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-semibold text-slate-100">
                {metadata.company_name || "Unknown Company"}
              </h1>
              <p className="text-sm text-slate-400">
                {metadata.rcs_number && `RCS ${metadata.rcs_number} · `}
                {formatDate(metadata.financial_year_end)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <StickyScore score={tp_analysis.overall_tp_opportunity_score} />
            <ExportButtons result={result} />
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

      {/* Low confidence warning */}
      {isLowConfidence && (
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
        {/* Summary cards */}
        <section className="mb-8 animate-fade-in">
          <SummaryCards result={result} />
        </section>

        {/* TP Flags */}
        <section className="mb-8 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <TPFlags flags={tp_analysis.priority_flags} />
        </section>

        {/* Data tables */}
        <section className="animate-fade-in" style={{ animationDelay: "200ms" }}>
          <div className="bg-slate-800 rounded-xl border border-slate-700">
            {/* Tab navigation */}
            <div className="flex border-b border-slate-700">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                    activeTab === tab.id
                      ? "text-blue-400"
                      : "text-slate-400 hover:text-slate-300"
                  }`}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="p-6">
              {activeTab === "balance-sheet" && (
                <BalanceSheetTable balanceSheet={result.balance_sheet} />
              )}
              {activeTab === "pnl" && (
                <PnlTable profitAndLoss={result.profit_and_loss} />
              )}
              {activeTab === "ic-details" && (
                <ICDetailsTable
                  notes={result.notes_extraction}
                  icFinancing={result.tp_analysis.ic_financing}
                />
              )}
              {activeTab === "raw-json" && <RawJsonViewer data={result} />}
            </div>
          </div>
        </section>

        {/* Extraction notes */}
        {metadata.extraction_notes.length > 0 && (
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
        {result.extraction_cost_usd && (
          <div className="mt-4 text-center text-sm text-slate-500">
            Extraction cost: ${result.extraction_cost_usd.toFixed(3)}
          </div>
        )}
      </main>
    </div>
  );
}
