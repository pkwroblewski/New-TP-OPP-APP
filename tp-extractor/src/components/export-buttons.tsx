"use client";

import { useState } from "react";
import { ExtractionResult } from "@/types/extraction";
import { copyToClipboard, formatEUR } from "@/lib/utils";
import { Download, Copy, FileSpreadsheet, FileJson, Check } from "lucide-react";

interface ExportButtonsProps {
  result: ExtractionResult;
}

export default function ExportButtons({ result }: ExportButtonsProps) {
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleCopySummary = async () => {
    const { metadata, tp_analysis, balance_sheet } = result;

    const summary = `
Transfer Pricing Analysis Summary
=================================
Company: ${metadata.company_name || "Unknown"}
RCS: ${metadata.rcs_number || "N/A"}
Financial Year: ${metadata.financial_year_end || "N/A"}

TP Score: ${tp_analysis.overall_tp_opportunity_score} (${
      tp_analysis.overall_tp_opportunity_score === "A"
        ? "High Priority"
        : tp_analysis.overall_tp_opportunity_score === "B"
          ? "Medium Priority"
          : "Low Priority"
    })

Rationale: ${tp_analysis.score_rationale}

Key Metrics:
- Total Assets: ${formatEUR(balance_sheet.total_assets)}
- D/E Ratio: ${tp_analysis.capitalization.debt_to_equity_ratio?.toFixed(2) || "N/A"}x
- Total IC Exposure: ${formatEUR((tp_analysis.ic_financing.total_loans_granted || 0) + (tp_analysis.ic_financing.total_loans_received || 0))}

Priority Flags (${tp_analysis.priority_flags.length}):
${tp_analysis.priority_flags.map((f) => `- [${f.priority.toUpperCase()}] ${f.description}`).join("\n")}

Focus Areas: ${tp_analysis.recommended_focus_areas.join(", ") || "None identified"}
    `.trim();

    const success = await copyToClipboard(summary);
    if (success) {
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    }
  };

  const handleExportJSON = () => {
    const json = JSON.stringify(result, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.metadata.company_name?.replace(/\s+/g, "_") || "extraction"}_${result.metadata.financial_year_end || "data"}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      // Dynamic import to reduce bundle size
      const XLSX = await import("xlsx");

      const workbook = XLSX.utils.book_new();

      // Metadata sheet
      const metadataData = [
        ["Company Name", result.metadata.company_name],
        ["RCS Number", result.metadata.rcs_number],
        ["Address", result.metadata.address],
        ["Financial Year Start", result.metadata.financial_year_start],
        ["Financial Year End", result.metadata.financial_year_end],
        ["Currency", result.metadata.currency],
        ["Account Type", result.metadata.account_type],
        ["Extraction Confidence", result.metadata.extraction_confidence],
        [],
        ["TP Score", result.tp_analysis.overall_tp_opportunity_score],
        ["Score Rationale", result.tp_analysis.score_rationale],
      ];
      const metadataSheet = XLSX.utils.aoa_to_sheet(metadataData);
      XLSX.utils.book_append_sheet(workbook, metadataSheet, "Metadata");

      // Balance Sheet
      const bsData = [
        ["Balance Sheet", "", "Current Year", "Previous Year"],
        [],
        ["ASSETS", "", "", ""],
        ["Fixed Assets", "", "", ""],
        ...result.balance_sheet.fixed_assets.items.map((item) => [
          item.is_ic ? `${item.name} (IC)` : item.name,
          item.note_reference || "",
          item.current_year,
          item.previous_year,
        ]),
        ["Total Fixed Assets", "", result.balance_sheet.fixed_assets.total, result.balance_sheet.fixed_assets.previous_year_total],
        [],
        ["Current Assets", "", "", ""],
        ...result.balance_sheet.current_assets.items.map((item) => [
          item.is_ic ? `${item.name} (IC)` : item.name,
          item.note_reference || "",
          item.current_year,
          item.previous_year,
        ]),
        ["Total Current Assets", "", result.balance_sheet.current_assets.total, result.balance_sheet.current_assets.previous_year_total],
        [],
        ["TOTAL ASSETS", "", result.balance_sheet.total_assets, result.balance_sheet.previous_year_total_assets],
        [],
        ["LIABILITIES", "", "", ""],
        ...result.balance_sheet.capital_and_reserves.items.map((item) => [
          item.name,
          "",
          item.current_year,
          item.previous_year,
        ]),
        ["Total Capital & Reserves", "", result.balance_sheet.capital_and_reserves.total, result.balance_sheet.capital_and_reserves.previous_year_total],
        [],
        ["TOTAL LIABILITIES", "", result.balance_sheet.total_liabilities, result.balance_sheet.previous_year_total_liabilities],
      ];
      const bsSheet = XLSX.utils.aoa_to_sheet(bsData);
      XLSX.utils.book_append_sheet(workbook, bsSheet, "Balance Sheet");

      // P&L
      const plData = [
        ["Profit & Loss", "", "Current Year", "Previous Year"],
        [],
        ["INCOME", "", "", ""],
        ...result.profit_and_loss.income_items.map((item) => [
          item.is_ic ? `${item.name} (IC)` : item.name,
          "",
          item.current_year,
          item.previous_year,
        ]),
        [],
        ["EXPENSES", "", "", ""],
        ...result.profit_and_loss.expense_items.map((item) => [
          item.is_ic ? `${item.name} (IC)` : item.name,
          "",
          item.current_year,
          item.previous_year,
        ]),
        [],
        ["Operating Result", "", result.profit_and_loss.operating_result, ""],
        ["Financial Result", "", result.profit_and_loss.financial_result, ""],
        ["Profit for Year", "", result.profit_and_loss.profit_for_year, result.profit_and_loss.previous_year_profit],
      ];
      const plSheet = XLSX.utils.aoa_to_sheet(plData);
      XLSX.utils.book_append_sheet(workbook, plSheet, "P&L");

      // IC Details
      const icData = [
        ["IC Details", "", "", "", ""],
        [],
        ["Loans to Affiliated", "", "", "", ""],
        ["Counterparty", "Currency", "Amount", "Interest Rate", "Maturity"],
        ...result.notes_extraction.loans_to_affiliated_details.map((loan) => [
          loan.counterparty,
          loan.currency,
          loan.amount,
          loan.interest_rate,
          loan.maturity_date,
        ]),
        [],
        ["Loans from Affiliated", "", "", "", ""],
        ["Counterparty", "Currency", "Amount", "Interest Rate", "Maturity"],
        ...result.notes_extraction.loans_from_affiliated_details.map((loan) => [
          loan.counterparty,
          loan.currency,
          loan.amount,
          loan.interest_rate,
          loan.maturity_date,
        ]),
      ];
      const icSheet = XLSX.utils.aoa_to_sheet(icData);
      XLSX.utils.book_append_sheet(workbook, icSheet, "IC Details");

      // TP Analysis
      const tpData = [
        ["TP Analysis", "", ""],
        [],
        ["Overall Score", result.tp_analysis.overall_tp_opportunity_score, ""],
        ["Score Rationale", result.tp_analysis.score_rationale, ""],
        [],
        ["IC Financing", "", ""],
        ["Total Loans Granted", result.tp_analysis.ic_financing.total_loans_granted, ""],
        ["Total Loans Received", result.tp_analysis.ic_financing.total_loans_received, ""],
        ["Implied Lending Rate", result.tp_analysis.ic_financing.implied_lending_rate, "%"],
        ["Implied Borrowing Rate", result.tp_analysis.ic_financing.implied_borrowing_rate, "%"],
        ["Spread (bps)", result.tp_analysis.ic_financing.spread_bps, ""],
        [],
        ["Capitalization", "", ""],
        ["Total Equity", result.tp_analysis.capitalization.total_equity, ""],
        ["D/E Ratio", result.tp_analysis.capitalization.debt_to_equity_ratio, "x"],
        [],
        ["Priority Flags", "", ""],
        ["Priority", "Category", "Description", "Amount"],
        ...result.tp_analysis.priority_flags.map((flag) => [
          flag.priority,
          flag.category,
          flag.description,
          flag.affected_amount,
        ]),
      ];
      const tpSheet = XLSX.utils.aoa_to_sheet(tpData);
      XLSX.utils.book_append_sheet(workbook, tpSheet, "TP Analysis");

      // Download
      XLSX.writeFile(
        workbook,
        `${result.metadata.company_name?.replace(/\s+/g, "_") || "extraction"}_${result.metadata.financial_year_end || "data"}.xlsx`
      );
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCopySummary}
        className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors text-sm"
        title="Copy summary to clipboard"
        aria-label="Copy summary to clipboard"
      >
        {copiedSummary ? (
          <Check className="w-4 h-4 text-emerald-400" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
        <span className="hidden sm:inline">
          {copiedSummary ? "Copied!" : "Copy Summary"}
        </span>
      </button>

      <button
        onClick={handleExportJSON}
        className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors text-sm"
        title="Download JSON"
        aria-label="Download JSON"
      >
        <FileJson className="w-4 h-4" />
        <span className="hidden sm:inline">JSON</span>
      </button>

      <button
        onClick={handleExportExcel}
        disabled={isExporting}
        className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors text-sm disabled:opacity-50"
        title="Download Excel"
        aria-label="Download Excel"
      >
        {isExporting ? (
          <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <FileSpreadsheet className="w-4 h-4" />
        )}
        <span className="hidden sm:inline">Excel</span>
      </button>
    </div>
  );
}
