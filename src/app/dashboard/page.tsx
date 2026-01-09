"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import AuthHeader from "@/components/auth-header";
import {
  FileUp,
  Building2,
  Calendar,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  Loader2,
  FolderOpen,
} from "lucide-react";
import { formatEUR, getTPScoreClasses } from "@/lib/utils";

export default function DashboardPage() {
  const extractions = useQuery(api.extractions.listAll);

  // Loading state
  if (extractions === undefined) {
    return (
      <div className="min-h-screen bg-slate-950">
        <AuthHeader />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] pt-16">
          <div className="flex items-center gap-3 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading extractions...</span>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <AuthHeader />

      <main className="max-w-6xl mx-auto px-4 py-6 pt-24">
        {/* Welcome Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
            <p className="text-sm text-slate-400 mt-1">
              Select an extraction to view details or start a new analysis
            </p>
          </div>
          <Link
            href="/analyze"
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium"
          >
            <FileUp className="w-5 h-5" />
            New Extraction
          </Link>
        </div>

        {extractions.length === 0 ? (
          /* Empty state */
          <div className="text-center py-20 bg-slate-900/50 rounded-xl border border-slate-800">
            <div className="w-20 h-20 mx-auto mb-6 bg-slate-800 rounded-2xl flex items-center justify-center">
              <FolderOpen className="w-10 h-10 text-slate-500" />
            </div>
            <h2 className="text-xl font-semibold text-slate-200 mb-2">
              No extractions yet
            </h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Upload your first PDF to extract transfer pricing data from
              Luxembourg annual accounts
            </p>
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium"
            >
              <FileUp className="w-5 h-5" />
              Start First Extraction
            </Link>
          </div>
        ) : (
          /* Extractions Grid */
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-slate-400 px-1 mb-4">
              <span>{extractions.length} extraction{extractions.length !== 1 ? "s" : ""}</span>
              <span>Last 30 days</span>
            </div>

            {extractions.map((extraction) => (
              <Link
                key={extraction._id}
                href={`/extraction/${extraction._id}/summary`}
                className="block bg-slate-900/50 hover:bg-slate-800/50 rounded-xl border border-slate-800 hover:border-slate-700 p-4 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Company Icon */}
                    <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-slate-400" />
                    </div>

                    {/* Company Info */}
                    <div>
                      <h3 className="text-lg font-medium text-slate-100 group-hover:text-white transition-colors">
                        {extraction.companyName || "Unknown Company"}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-slate-400">
                        {extraction.rcsNumber && (
                          <span>RCS {extraction.rcsNumber}</span>
                        )}
                        {extraction.financialYearEnd && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(extraction.financialYearEnd).getFullYear()}
                          </span>
                        )}
                        <span className="text-slate-500">
                          {formatDate(extraction._creationTime)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="flex items-center gap-6">
                    {/* TP Score */}
                    <div className="text-center">
                      <span
                        className={`px-3 py-1.5 rounded-lg text-sm font-bold ${getTPScoreClasses(
                          extraction.tpScore
                        )}`}
                      >
                        {extraction.tpScore}
                      </span>
                    </div>

                    {/* Total Assets */}
                    {extraction.totalAssets && (
                      <div className="text-right hidden md:block">
                        <p className="text-xs text-slate-500 mb-0.5">Assets</p>
                        <p className="text-sm font-mono text-slate-300">
                          {formatEUR(extraction.totalAssets)}
                        </p>
                      </div>
                    )}

                    {/* IC Exposure */}
                    {extraction.totalIcExposure && (
                      <div className="text-right hidden lg:block">
                        <p className="text-xs text-slate-500 mb-0.5">IC Exposure</p>
                        <p className="text-sm font-mono text-slate-300">
                          {formatEUR(extraction.totalIcExposure)}
                        </p>
                      </div>
                    )}

                    {/* Flags */}
                    <div className="text-center hidden sm:block">
                      <p className="text-xs text-slate-500 mb-0.5">Flags</p>
                      <div className="flex items-center justify-center gap-1">
                        {extraction.flagsCount > 0 && (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        )}
                        <span className="text-sm text-slate-300">
                          {extraction.flagsCount}
                        </span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-slate-300 transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
