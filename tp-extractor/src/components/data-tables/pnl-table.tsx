"use client";

import { useState } from "react";
import { ProfitAndLoss } from "@/types/extraction";
import {
  formatEUR,
  calculateYoYChange,
  formatYoYChange,
  getYoYChangeColor,
  cn,
} from "@/lib/utils";
import { Search } from "lucide-react";

interface PnlTableProps {
  profitAndLoss: ProfitAndLoss;
}

export default function PnlTable({ profitAndLoss }: PnlTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredIncome = profitAndLoss.income_items.filter(
    (item) =>
      !searchTerm ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredExpense = profitAndLoss.expense_items.filter(
    (item) =>
      !searchTerm ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const profitYoY = calculateYoYChange(
    profitAndLoss.profit_for_year,
    profitAndLoss.previous_year_profit
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
            {/* Income section */}
            <tr className="bg-slate-900">
              <td
                colSpan={5}
                className="px-4 py-2 text-sm font-bold text-slate-200 uppercase tracking-wider"
              >
                Income
              </td>
            </tr>

            {filteredIncome.map((item, index) => {
              const itemYoY = calculateYoYChange(
                item.current_year,
                item.previous_year
              );
              return (
                <tr
                  key={`income-${index}`}
                  className={cn(
                    "hover:bg-slate-700/30",
                    item.is_ic && "bg-blue-500/5 border-l-2 border-blue-500"
                  )}
                >
                  <td className="px-4 py-2 text-slate-300">
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
                  <td
                    className={cn(
                      "px-4 py-2 text-right font-mono text-sm",
                      getYoYChangeColor(itemYoY)
                    )}
                  >
                    {formatYoYChange(itemYoY)}
                  </td>
                </tr>
              );
            })}

            {/* Expense section */}
            <tr className="bg-slate-900">
              <td
                colSpan={5}
                className="px-4 py-2 text-sm font-bold text-slate-200 uppercase tracking-wider"
              >
                Expenses
              </td>
            </tr>

            {filteredExpense.map((item, index) => {
              const itemYoY = calculateYoYChange(
                item.current_year,
                item.previous_year
              );
              return (
                <tr
                  key={`expense-${index}`}
                  className={cn(
                    "hover:bg-slate-700/30",
                    item.is_ic && "bg-blue-500/5 border-l-2 border-blue-500"
                  )}
                >
                  <td className="px-4 py-2 text-slate-300">
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
                  <td
                    className={cn(
                      "px-4 py-2 text-right font-mono text-sm",
                      getYoYChangeColor(itemYoY)
                    )}
                  >
                    {formatYoYChange(itemYoY)}
                  </td>
                </tr>
              );
            })}

            {/* Results section */}
            <tr className="bg-slate-900">
              <td
                colSpan={5}
                className="px-4 py-2 text-sm font-bold text-slate-200 uppercase tracking-wider"
              >
                Results
              </td>
            </tr>

            <tr className="hover:bg-slate-700/30">
              <td colSpan={2} className="px-4 py-2 text-slate-300">
                Operating Result
              </td>
              <td className="px-4 py-2 text-right font-mono text-slate-300">
                {formatEUR(profitAndLoss.operating_result)}
              </td>
              <td className="px-4 py-2 text-right font-mono text-slate-500">
                -
              </td>
              <td className="px-4 py-2 text-right font-mono text-slate-500">
                -
              </td>
            </tr>

            <tr className="hover:bg-slate-700/30">
              <td colSpan={2} className="px-4 py-2 text-slate-300">
                Financial Result
              </td>
              <td className="px-4 py-2 text-right font-mono text-slate-300">
                {formatEUR(profitAndLoss.financial_result)}
              </td>
              <td className="px-4 py-2 text-right font-mono text-slate-500">
                -
              </td>
              <td className="px-4 py-2 text-right font-mono text-slate-500">
                -
              </td>
            </tr>

            <tr className="bg-slate-900 font-bold">
              <td colSpan={2} className="px-4 py-3 text-slate-100">
                PROFIT FOR THE YEAR
              </td>
              <td className="px-4 py-3 text-right font-mono text-slate-100">
                {formatEUR(profitAndLoss.profit_for_year)}
              </td>
              <td className="px-4 py-3 text-right font-mono text-slate-400">
                {formatEUR(profitAndLoss.previous_year_profit)}
              </td>
              <td
                className={cn(
                  "px-4 py-3 text-right font-mono",
                  getYoYChangeColor(profitYoY)
                )}
              >
                {formatYoYChange(profitYoY)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
