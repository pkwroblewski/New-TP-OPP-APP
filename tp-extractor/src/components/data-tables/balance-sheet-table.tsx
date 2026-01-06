"use client";

import { useState } from "react";
import { BalanceSheet } from "@/types/extraction";
import {
  formatEUR,
  calculateYoYChange,
  formatYoYChange,
  getYoYChangeColor,
  cn,
} from "@/lib/utils";
import { ChevronDown, ChevronRight, Search } from "lucide-react";

interface BalanceSheetTableProps {
  balanceSheet: BalanceSheet;
}

interface SectionProps {
  title: string;
  items: Array<{
    name: string;
    current_year: number | null;
    previous_year: number | null;
    is_ic: boolean;
    note_reference?: string;
  }>;
  total: number | null;
  previousYearTotal: number | null;
  searchTerm: string;
}

function Section({
  title,
  items,
  total,
  previousYearTotal,
  searchTerm,
}: SectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const filteredItems = items.filter(
    (item) =>
      !searchTerm ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const yoyChange = calculateYoYChange(total, previousYearTotal);

  if (searchTerm && filteredItems.length === 0) {
    return null;
  }

  return (
    <>
      <tr
        className="bg-slate-700/50 cursor-pointer hover:bg-slate-700"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <td className="px-4 py-3 font-medium text-slate-200" colSpan={2}>
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400" />
            )}
            {title}
          </div>
        </td>
        <td className="px-4 py-3 text-right font-mono font-medium text-slate-200">
          {formatEUR(total)}
        </td>
        <td className="px-4 py-3 text-right font-mono text-slate-400">
          {formatEUR(previousYearTotal)}
        </td>
        <td className={cn("px-4 py-3 text-right font-mono", getYoYChangeColor(yoyChange))}>
          {formatYoYChange(yoyChange)}
        </td>
      </tr>
      {isExpanded &&
        filteredItems.map((item, index) => {
          const itemYoY = calculateYoYChange(item.current_year, item.previous_year);
          return (
            <tr
              key={index}
              className={cn(
                "hover:bg-slate-700/30",
                item.is_ic && "bg-blue-500/5 border-l-2 border-blue-500"
              )}
            >
              <td className="px-4 py-2 pl-10 text-slate-300">
                {item.name}
                {item.is_ic && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded">
                    IC
                  </span>
                )}
              </td>
              <td className="px-4 py-2 text-xs text-slate-500">
                {item.note_reference}
              </td>
              <td className="px-4 py-2 text-right font-mono text-slate-300">
                {formatEUR(item.current_year)}
              </td>
              <td className="px-4 py-2 text-right font-mono text-slate-500">
                {formatEUR(item.previous_year)}
              </td>
              <td className={cn("px-4 py-2 text-right font-mono text-sm", getYoYChangeColor(itemYoY))}>
                {formatYoYChange(itemYoY)}
              </td>
            </tr>
          );
        })}
    </>
  );
}

export default function BalanceSheetTable({
  balanceSheet,
}: BalanceSheetTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const totalAssetsYoY = calculateYoYChange(
    balanceSheet.total_assets,
    balanceSheet.previous_year_total_assets
  );

  const totalLiabilitiesYoY = calculateYoYChange(
    balanceSheet.total_liabilities,
    balanceSheet.previous_year_total_liabilities
  );

  return (
    <div>
      {/* Search */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-slate-800 z-10">
            <tr className="border-b border-slate-700">
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">
                Item
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-400 w-20">
                Note
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-slate-400 w-32">
                Current Year
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-slate-400 w-32">
                Previous Year
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-slate-400 w-24">
                YoY
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {/* Assets header */}
            <tr className="bg-slate-900">
              <td
                colSpan={5}
                className="px-4 py-2 text-sm font-bold text-slate-200 uppercase tracking-wider"
              >
                Assets
              </td>
            </tr>

            <Section
              title="Fixed Assets"
              items={balanceSheet.fixed_assets.items}
              total={balanceSheet.fixed_assets.total}
              previousYearTotal={balanceSheet.fixed_assets.previous_year_total}
              searchTerm={searchTerm}
            />

            <Section
              title="Current Assets"
              items={balanceSheet.current_assets.items}
              total={balanceSheet.current_assets.total}
              previousYearTotal={balanceSheet.current_assets.previous_year_total}
              searchTerm={searchTerm}
            />

            <Section
              title="Prepayments"
              items={balanceSheet.prepayments.items}
              total={balanceSheet.prepayments.total}
              previousYearTotal={balanceSheet.prepayments.previous_year_total}
              searchTerm={searchTerm}
            />

            {/* Total Assets */}
            <tr className="bg-slate-900 font-bold">
              <td colSpan={2} className="px-4 py-3 text-slate-100">
                TOTAL ASSETS
              </td>
              <td className="px-4 py-3 text-right font-mono text-slate-100">
                {formatEUR(balanceSheet.total_assets)}
              </td>
              <td className="px-4 py-3 text-right font-mono text-slate-400">
                {formatEUR(balanceSheet.previous_year_total_assets)}
              </td>
              <td className={cn("px-4 py-3 text-right font-mono", getYoYChangeColor(totalAssetsYoY))}>
                {formatYoYChange(totalAssetsYoY)}
              </td>
            </tr>

            {/* Liabilities header */}
            <tr className="bg-slate-900">
              <td
                colSpan={5}
                className="px-4 py-2 text-sm font-bold text-slate-200 uppercase tracking-wider"
              >
                Liabilities
              </td>
            </tr>

            <Section
              title="Capital & Reserves"
              items={balanceSheet.capital_and_reserves.items}
              total={balanceSheet.capital_and_reserves.total}
              previousYearTotal={balanceSheet.capital_and_reserves.previous_year_total}
              searchTerm={searchTerm}
            />

            <Section
              title="Provisions"
              items={balanceSheet.provisions.items}
              total={balanceSheet.provisions.total}
              previousYearTotal={balanceSheet.provisions.previous_year_total}
              searchTerm={searchTerm}
            />

            <Section
              title="Creditors"
              items={balanceSheet.creditors.items}
              total={balanceSheet.creditors.total}
              previousYearTotal={balanceSheet.creditors.previous_year_total}
              searchTerm={searchTerm}
            />

            {/* Total Liabilities */}
            <tr className="bg-slate-900 font-bold">
              <td colSpan={2} className="px-4 py-3 text-slate-100">
                TOTAL LIABILITIES
              </td>
              <td className="px-4 py-3 text-right font-mono text-slate-100">
                {formatEUR(balanceSheet.total_liabilities)}
              </td>
              <td className="px-4 py-3 text-right font-mono text-slate-400">
                {formatEUR(balanceSheet.previous_year_total_liabilities)}
              </td>
              <td className={cn("px-4 py-3 text-right font-mono", getYoYChangeColor(totalLiabilitiesYoY))}>
                {formatYoYChange(totalLiabilitiesYoY)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
