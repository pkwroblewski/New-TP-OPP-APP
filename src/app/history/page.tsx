"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";
import {
  FileUp,
  Trash2,
  Eye,
  Calendar,
  Building2,
  TrendingUp,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { formatEUR, getTPScoreClasses } from "@/lib/utils";

export default function HistoryPage() {
  const extractions = useQuery(api.extractions.listAll);
  const removeExtraction = useMutation(api.extractions.remove);
  const { addToast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewingExtraction, setViewingExtraction] = useState<Id<"extractions"> | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleDelete = async (id: Id<"extractions">, companyName?: string) => {
    if (!confirm(`Delete extraction for "${companyName || "Unknown Company"}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      await removeExtraction({ id });
      addToast("success", "Extraction deleted");
    } catch (err) {
      console.error("Failed to delete:", err);
      addToast("error", "Failed to delete extraction");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Loading state
  if (extractions === undefined) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading extractions...</span>
        </div>
      </div>
    );
  }

  // Pagination calculations
  const totalPages = Math.ceil(extractions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedExtractions = extractions.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Extraction History</h1>
            <p className="text-sm text-slate-400">
              {extractions.length} extraction{extractions.length !== 1 ? "s" : ""} in the last 30 days
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/analyze"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
            >
              <FileUp className="w-4 h-4" />
              New Extraction
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {extractions.length === 0 ? (
          /* Empty state */
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-800 rounded-full flex items-center justify-center">
              <Building2 className="w-8 h-8 text-slate-500" />
            </div>
            <h2 className="text-xl font-semibold text-slate-200 mb-2">No extractions yet</h2>
            <p className="text-slate-400 mb-6">
              Upload a PDF to extract transfer pricing data
            </p>
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
            >
              <FileUp className="w-5 h-5" />
              Start Extraction
            </Link>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-900/50 border-b border-slate-700">
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-300">Company</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-300">Year</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-300">Score</th>
                      <th className="text-right px-4 py-3 text-sm font-medium text-slate-300">Total Assets</th>
                      <th className="text-right px-4 py-3 text-sm font-medium text-slate-300">IC Exposure</th>
                      <th className="text-center px-4 py-3 text-sm font-medium text-slate-300">Flags</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-300">Extracted</th>
                      <th className="text-center px-4 py-3 text-sm font-medium text-slate-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {paginatedExtractions.map((extraction) => (
                      <tr
                        key={extraction._id}
                        className="hover:bg-slate-700/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-slate-500" />
                            <div>
                              <p className="text-sm font-medium text-slate-200">
                                {extraction.companyName || "Unknown Company"}
                              </p>
                              {extraction.rcsNumber && (
                                <p className="text-xs text-slate-500">RCS {extraction.rcsNumber}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-sm text-slate-300">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            {extraction.financialYearEnd
                              ? new Date(extraction.financialYearEnd).getFullYear()
                              : "N/A"}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded text-sm font-bold ${getTPScoreClasses(
                              extraction.tpScore
                            )}`}
                          >
                            {extraction.tpScore}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm text-slate-300 font-mono">
                            {extraction.totalAssets ? formatEUR(extraction.totalAssets) : "N/A"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm text-slate-300 font-mono">
                            {extraction.totalIcExposure ? formatEUR(extraction.totalIcExposure) : "N/A"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {extraction.flagsCount > 0 && (
                              <AlertTriangle className="w-3 h-3 text-amber-400" />
                            )}
                            <span className="text-sm text-slate-300">{extraction.flagsCount}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-slate-400">
                            {formatDate(extraction._creationTime)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              href={`/history/${extraction._id}`}
                              className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded transition-colors"
                              title="View details"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(extraction._id, extraction.companyName)}
                              disabled={deletingId === extraction._id}
                              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition-colors disabled:opacity-50"
                              title="Delete extraction"
                            >
                              {deletingId === extraction._id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700 bg-slate-900/30">
                  <p className="text-sm text-slate-400">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, extractions.length)} of{" "}
                    {extractions.length} extractions
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-slate-300">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Cost summary */}
            {extractions.some((e) => e.extractionCostUsd) && (
              <div className="mt-4 text-center text-sm text-slate-500">
                Total extraction cost:{" "}
                ${extractions.reduce((sum, e) => sum + (e.extractionCostUsd || 0), 0).toFixed(2)}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
