"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { ExtractionResult } from "@/types/extraction";
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
import PdfViewer from "./pdf-viewer";
import { formatDate } from "@/lib/utils";
import { FileUp, AlertTriangle, PanelLeftClose, PanelLeft, GripVertical, History } from "lucide-react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

interface ResultsDashboardProps {
  result: ExtractionResult;
  pdfData: string | null;
  onNewExtraction: () => void;
}

type TabType = "balance-sheet" | "pnl" | "ic-details" | "analysis" | "raw-json";

export default function ResultsDashboard({
  result,
  pdfData,
  onNewExtraction,
}: ResultsDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("balance-sheet");
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [isPdfFullScreen, setIsPdfFullScreen] = useState(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [pdfPanelWidth, setPdfPanelWidth] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { metadata, tp_analysis } = result;
  const isLowConfidence = metadata.extraction_confidence === "low";

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

  const togglePdfViewer = useCallback(() => {
    setShowPdfViewer((prev) => !prev);
    // If closing the panel, also exit full screen mode
    if (showPdfViewer) {
      setIsPdfFullScreen(false);
    }
  }, [showPdfViewer]);

  const togglePdfFullScreen = useCallback(() => {
    setIsPdfFullScreen((prev) => !prev);
  }, []);

  const closePdfViewer = useCallback(() => {
    setShowPdfViewer(false);
    setIsPdfFullScreen(false);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      const clampedWidth = Math.min(Math.max(newWidth, 20), 80);
      setPdfPanelWidth(clampedWidth);
    },
    [isResizing]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Render full-screen PDF viewer overlay
  if (isPdfFullScreen && pdfData && showPdfViewer) {
    return (
      <PdfViewer
        pdfData={pdfData}
        isFullScreen={true}
        onToggleFullScreen={togglePdfFullScreen}
        onClose={closePdfViewer}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Sticky header */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* PDF toggle button */}
            {pdfData && (
              <button
                onClick={togglePdfViewer}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  showPdfViewer
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
                aria-label={showPdfViewer ? "Hide PDF viewer" : "Show PDF viewer"}
                title={showPdfViewer ? "Hide PDF viewer" : "Show PDF viewer"}
              >
                {showPdfViewer ? (
                  <PanelLeftClose className="w-4 h-4" />
                ) : (
                  <PanelLeft className="w-4 h-4" />
                )}
                <span className="text-sm font-medium hidden sm:inline">
                  {showPdfViewer ? "Hide PDF" : "View PDF"}
                </span>
              </button>
            )}
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
            <StickyScore score={tp_analysis.overall_tp_opportunity_score} />
            <ExportButtons result={result} />
            <Link
              href="/history"
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors"
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </Link>
            <button
              onClick={onNewExtraction}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
            >
              <FileUp className="w-4 h-4" />
              New Extraction
            </button>
            <UserButton afterSignOutUrl="/" />
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

      {/* Main content with optional PDF split */}
      <div ref={containerRef} className="flex relative">
        {/* PDF Viewer Panel */}
        {showPdfViewer && pdfData && (
          <>
            <aside className="h-[calc(100vh-73px)] sticky top-[73px] p-4 flex-shrink-0" style={{ width: `${pdfPanelWidth}%` }}>
              <PdfViewer
                pdfData={pdfData}
                isFullScreen={false}
                onToggleFullScreen={togglePdfFullScreen}
                onClose={closePdfViewer}
              />
            </aside>
            <div
              className="w-2 h-[calc(100vh-73px)] sticky top-[73px] flex-shrink-0 cursor-col-resize group flex items-center justify-center bg-slate-900 hover:bg-slate-700 transition-colors"
              onMouseDown={handleMouseDown}
              title="Drag to resize panels"
              role="separator"
              aria-label="Resize panels"
            >
              <div className={`flex flex-col gap-0.5 ${isResizing ? 'opacity-100' : 'opacity-50 group-hover:opacity-100'} transition-opacity`}>
                <GripVertical className="w-4 h-4 text-slate-400" />
              </div>
              {isResizing && (
                <div className="absolute inset-y-0 w-0.5 bg-blue-500" />
              )}
            </div>
          </>
        )}

        {/* Main content */}
        <main className={`${showPdfViewer ? "flex-1 min-w-0" : "max-w-7xl mx-auto w-full"} px-4 py-6`} style={showPdfViewer ? { width: `${100 - pdfPanelWidth}%` } : undefined}>
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
                  <BalanceSheetTable balanceSheet={result.balance_sheet} />
                )}
                {activeTab === "pnl" && (
                  <PnlTable profitAndLoss={result.profit_and_loss} />
                )}
                {activeTab === "ic-details" && (
                  <div className="space-y-6">
                    <ICDetailsTable
                      notes={result.notes_extraction}
                      icFinancing={result.tp_analysis.ic_financing}
                    />
                    {/* Detailed loan tables */}
                    {result.notes_extraction.detailed_loans_granted && result.notes_extraction.detailed_loans_granted.length > 0 && (
                      <DetailedLoansTable
                        loans={result.notes_extraction.detailed_loans_granted}
                        title="Detailed Loans Granted (Loan-by-Loan)"
                        direction="granted"
                      />
                    )}
                    {result.notes_extraction.detailed_loans_received && result.notes_extraction.detailed_loans_received.length > 0 && (
                      <DetailedLoansTable
                        loans={result.notes_extraction.detailed_loans_received}
                        title="Detailed Loans Received (Loan-by-Loan)"
                        direction="received"
                      />
                    )}
                    {result.notes_extraction.shareholder_loans && result.notes_extraction.shareholder_loans.length > 0 && (
                      <DetailedLoansTable
                        loans={result.notes_extraction.shareholder_loans}
                        title="Shareholder Loans"
                        direction="received"
                      />
                    )}
                  </div>
                )}
                {activeTab === "analysis" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Spread Analysis */}
                      <SpreadAnalysisSection icFinancing={result.tp_analysis.ic_financing} />
                      {/* Capitalization Gauge */}
                      <CapitalizationGauge capitalization={result.tp_analysis.capitalization} />
                    </div>
                    {/* Board of Managers */}
                    {result.entity_governance && (
                      <BoardManagersCard governance={result.entity_governance} />
                    )}
                    {/* Focus Areas and Rationale */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                        <h3 className="text-sm font-medium text-slate-300 mb-3">
                          Score Rationale
                        </h3>
                        <p className="text-sm text-slate-400">
                          {result.tp_analysis.score_rationale}
                        </p>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                        <h3 className="text-sm font-medium text-slate-300 mb-3">
                          Recommended Focus Areas
                        </h3>
                        <ul className="text-sm text-slate-400 space-y-2">
                          {result.tp_analysis.recommended_focus_areas.map((area, index) => (
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
    </div>
  );
}
