"use client";

import { useState } from "react";
import { TPFlag } from "@/types/extraction";
import { formatEUR, getPriorityClasses } from "@/lib/utils";
import { ChevronDown, ChevronUp, AlertTriangle, Info, Filter, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface TPFlagsProps {
  flags: TPFlag[];
}

export default function TPFlags({ flags }: TPFlagsProps) {
  const [expandedFlags, setExpandedFlags] = useState<Set<number>>(new Set());
  const [filterPriority, setFilterPriority] = useState<"all" | "high" | "medium" | "low">("all");
  const [sortBy, setSortBy] = useState<"priority" | "amount">("priority");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const toggleFlag = (index: number) => {
    setExpandedFlags((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  // Filter flags
  const filteredFlags = flags.filter((flag) =>
    filterPriority === "all" ? true : flag.priority === filterPriority
  );

  // Sort flags
  const sortedFlags = [...filteredFlags].sort((a, b) => {
    if (sortBy === "priority") {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const result = priorityOrder[a.priority] - priorityOrder[b.priority];
      return sortDirection === "asc" ? -result : result;
    } else {
      // Sort by amount
      const amountA = a.affected_amount || 0;
      const amountB = b.affected_amount || 0;
      const result = amountB - amountA;
      return sortDirection === "asc" ? -result : result;
    }
  });

  // Count by priority
  const highCount = flags.filter((f) => f.priority === "high").length;
  const mediumCount = flags.filter((f) => f.priority === "medium").length;
  const lowCount = flags.filter((f) => f.priority === "low").length;

  if (flags.length === 0) {
    return (
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center gap-3 text-slate-400">
          <Info className="w-5 h-5" />
          <p>No transfer pricing flags identified</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-slate-100">
              TP Flags ({flags.length})
            </h2>
            <div className="flex items-center gap-2 ml-4">
              {highCount > 0 && (
                <span className="px-2 py-0.5 text-xs rounded bg-red-500/10 text-red-400 border border-red-500/20">
                  {highCount} High
                </span>
              )}
              {mediumCount > 0 && (
                <span className="px-2 py-0.5 text-xs rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {mediumCount} Medium
                </span>
              )}
              {lowCount > 0 && (
                <span className="px-2 py-0.5 text-xs rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {lowCount} Low
                </span>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as typeof filterPriority)}
                className="bg-slate-700 border-0 rounded-lg px-3 py-1.5 text-sm text-slate-300 focus:ring-2 focus:ring-blue-500"
                aria-label="Filter by priority"
              >
                <option value="all">All Priorities</option>
                <option value="high">High Only</option>
                <option value="medium">Medium Only</option>
                <option value="low">Low Only</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="bg-slate-700 border-0 rounded-lg px-3 py-1.5 text-sm text-slate-300 focus:ring-2 focus:ring-blue-500"
                aria-label="Sort by"
              >
                <option value="priority">Sort by Priority</option>
                <option value="amount">Sort by Amount</option>
              </select>
              <button
                onClick={toggleSortDirection}
                className="p-1.5 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                aria-label={`Sort ${sortDirection === "desc" ? "descending" : "ascending"}, click to toggle`}
                title={sortDirection === "desc" ? "Descending (highest first)" : "Ascending (lowest first)"}
              >
                {sortDirection === "desc" ? (
                  <ArrowDown className="w-4 h-4 text-slate-300" />
                ) : (
                  <ArrowUp className="w-4 h-4 text-slate-300" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Flags list */}
      <div className="divide-y divide-slate-700">
        {sortedFlags.map((flag, index) => {
          const isExpanded = expandedFlags.has(index);
          const originalIndex = flags.indexOf(flag);

          return (
            <div key={originalIndex} className="hover:bg-slate-700/30 transition-colors">
              <button
                onClick={() => toggleFlag(originalIndex)}
                className="w-full p-4 text-left flex items-center justify-between"
                aria-expanded={isExpanded}
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded border ${getPriorityClasses(
                      flag.priority
                    )}`}
                  >
                    {flag.priority.toUpperCase()}
                  </span>
                  <span className="px-2 py-1 text-xs bg-slate-700 rounded text-slate-300">
                    {flag.category}
                  </span>
                  <span className="text-slate-200">{flag.description}</span>
                </div>

                <div className="flex items-center gap-4">
                  {flag.affected_amount && (
                    <span className="font-mono text-slate-300">
                      {formatEUR(flag.affected_amount)}
                    </span>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 pt-0 ml-24">
                  <div className="bg-slate-700/30 rounded-lg p-4 space-y-2">
                    <div>
                      <span className="text-xs text-slate-500">Source:</span>
                      <p className="text-sm text-slate-300">{flag.source}</p>
                    </div>
                    {flag.caveats && (
                      <div>
                        <span className="text-xs text-slate-500">Caveats:</span>
                        <p className="text-sm text-slate-400">{flag.caveats}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
